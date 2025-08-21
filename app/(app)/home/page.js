"use client";

import {
  Search,
  X,
  Clock,
  Hash,
  Users,
  TrendingUp,
  MapPin,
  ChevronRight,
  Verified,
  XCircle,
  Plus,
  Image as ImageIcon,
  MoreVertical,
  Flag,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Info,
  Trash2,
  Ban,
  Loader2,
  Home,
  Flame,
  BarChart,
  LocateIcon,
} from "lucide-react";
import { Image as PhotoIcon, X as XMarkIcon } from "lucide-react";
import defaultPic from "../../assets/avatar.png";
import { debounce } from "lodash";
import { API_ENDPOINTS } from "../../utils/config";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getProfilePicture } from "@/app/utils/fallbackImage";
import toast from "react-hot-toast";
import React, { useState, useEffect, useRef, useCallback } from "react";
import PostCard from "../../components/ui/PostCard";
import EmptyFeed from "@/app/components/Home/EmptyFeed";
import CommentModal from "@/app/components/ui/CommentModal";
import AmplifyModal from "@/app/components/ui/AmplifyModal";
import CustomModal from "@/app/components/ui/Modal";
import ReportModal from "@/app/components/ui/ReportModal";
import Image from "next/image";
import {
  createPostHandlers,
  formatPostFromApi,
} from "../../utils/postFunctions";

const MAX_CHAR_LIMIT = 1000;
const MEDIA_LIMIT = 4;
const POST_LIMIT = 10;

// Constants
const REFRESH_INTERVAL = 60000; // 1 minute
const MIN_FETCH_INTERVAL = 5000; // 5 seconds

// Feed types configuration
const FEED_TYPES = [
  {
    key: "home",
    title: "Home",
    endpoint: "home",
    requiresAuth: true,
    icon: Home,
  },
  {
    key: "trending",
    title: "Trending",
    endpoint: "trending",
    requiresAuth: false,
    icon: TrendingUp,
  },
  {
    key: "latest",
    title: "Latest",
    endpoint: "latest",
    requiresAuth: false,
    icon: Clock,
  },
  {
    key: "hot",
    title: "Hot",
    endpoint: "hot",
    requiresAuth: false,
    icon: Flame,
  },
  {
    key: "popular",
    title: "Popular",
    endpoint: "popular",
    requiresAuth: false,
    icon: Users,
  },
  {
    key: "nearme",
    title: "Near me",
    endpoint: "nearme",
    requiresAuth: false,
    icon: LocateIcon,
    requiresLocation: true,
  },
];

const TabSkeleton = () => (
  <div className="flex justify-center scrollbar-hide truncate overflow-x-auto px-4 py-2 space-x-2 min-w-max max-sm:justify-evenly">
    {FEED_TYPES.map((_, index) => (
      <div
        key={index}
        className="px-3 py-2 rounded-full bg-gray-200 animate-pulse sm:max-w-[100px] max-w-[40px] sm:w-auto w-10 h-10 sm:h-auto"
      />
    ))}
  </div>
);

const PostsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="ml-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    ))}
  </div>
);

const HomePage = () => {
  const router = useRouter();
  const { user, token, isAuthenticated, error, logout } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState("home");
  const [tabData, setTabData] = useState({
    home: { posts: [], page: 1, hasMore: true, loading: false, error: null },
    trending: {
      posts: [],
      page: 1,
      hasMore: true,
      loading: false,
      error: null,
    },
    latest: { posts: [], page: 1, hasMore: true, loading: false, error: null },
    hot: { posts: [], page: 1, hasMore: true, loading: false, error: null },
    popular: { posts: [], page: 1, hasMore: true, loading: false, error: null },
    nearme: { posts: [], page: 1, hasMore: true, loading: false, error: null },
  });

  const [refreshing, setRefreshing] = useState(false);
  const [showComposeButton, setShowComposeButton] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(0);

  // Post composer
  const [text, setText] = useState("");

  // Modals
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);

  // Amplify modal
  const [isAmplifyModalVisible, setAmplifyModalVisible] = useState(false);
  const [postToAmplify, setPostToAmplify] = useState(null);

  // Comment modal
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [postToComment, setPostToComment] = useState(null);

  // Report modal
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [postToReport, setPostToReport] = useState(null);

  // API throttling
  const [lastFetchTime, setLastFetchTime] = useState({});

  // Scroll handling
  const [scrollY, setScrollY] = useState(0);

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFilters, setImageFilters] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null); // 'granted', 'denied', 'requesting', null
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Helper function to update tab data
  const updateTabData = (tabKey, updates) => {
    setTabData((prev) => {
      // Safety check - if tab doesn't exist, initialize it
      if (!prev[tabKey]) {
        console.warn(`Initializing missing tab data for '${tabKey}'`);
        return {
          ...prev,
          [tabKey]: {
            posts: [],
            page: 1,
            hasMore: true,
            loading: false,
            error: null,
            ...updates,
          },
        };
      }

      return {
        ...prev,
        [tabKey]: { ...prev[tabKey], ...updates },
      };
    });
  };

  // Get current tab data
  const getCurrentTabData = () => tabData[activeTab];

  // Create post handlers with updated setPosts function
  const postHandlers = createPostHandlers(
    user,
    token,
    (updater) => {
      if (typeof updater === "function") {
        updateTabData(activeTab, { posts: updater(getCurrentTabData().posts) });
      } else {
        updateTabData(activeTab, { posts: updater });
      }
    },
    setPostToComment,
    setCommentModalVisible,
    setPostToAmplify,
    setAmplifyModalVisible,
    setPostToReport,
    setReportModalVisible
  );
  const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      reject(new Error("Geolocation requires HTTPS or localhost"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Validate location data
        if (
          !location.latitude ||
          !location.longitude ||
          isNaN(location.latitude) ||
          isNaN(location.longitude) ||
          location.latitude < -90 ||
          location.latitude > 90 ||
          location.longitude < -180 ||
          location.longitude > 180
        ) {
          reject(new Error("Invalid location data received"));
          return;
        }

        resolve(location);
      },
      (error) => {
        let errorMessage = "Failed to get location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. This may be due to poor GPS signal, network issues, or browser restrictions.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = `Unknown location error (code: ${error.code}): ${error.message || 'No additional details'}`;
            break;
        }
        console.error('Geolocation error:', error);
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false, 
        timeout: 15000, 
        maximumAge: 600000,
      }
    );
  });
};


// Request location permission and get location
const requestLocationPermission = async () => {
  try {
    setLocationPermission('requesting');

    // Check for geolocation support
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      setShowLocationModal(true);
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    // Check for secure context
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setLocationPermission('denied');
      setShowLocationModal(true);
      toast.error("Location services require a secure connection (HTTPS)");
      return;
    }

    // Request permission and get location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const now = Date.now();
        if (now - lastLocationUpdate < 30000) {
          setLocationPermission('granted');
          return;
        }

        const roundedLat = Math.round(position.coords.latitude * 10000) / 10000;
        const roundedLng = Math.round(position.coords.longitude * 10000) / 10000;
        const newLocation = {
          latitude: roundedLat,
          longitude: roundedLng,
          accuracy: position.coords.accuracy,
        };

        setUserLocation(newLocation);
        setLocationPermission('granted');
        setLastLocationUpdate(now);
        toast.success("Location access granted!");
      },
      (error) => {
        let errorMessage = "Failed to get location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. This may be due to poor GPS signal, network issues, or browser restrictions.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = `Unknown location error (code: ${error.code}): ${error.message || 'No additional details'}`;
            break;
        }
        setLocationPermission('denied');
        setShowLocationModal(true);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 600000,
      }
    );
  } catch (error) {
    setLocationPermission('denied');
    setShowLocationModal(true);
    toast.error(`Location error: ${error.message}`);
  }
};

// Load menu options when modal is visible
useEffect(() => {
  const loadOptions = async () => {
    if (isModalVisible && selectedPost) {
      await loadMenuOptions();
      }
    };

    loadOptions();
  }, [isModalVisible, selectedPost]);

  // Load feed when tab changes or authentication changes
  useEffect(() => {
    const currentFeedType = FEED_TYPES.find((feed) => feed.key === activeTab);

    // Check if feed requires authentication
    if (currentFeedType?.requiresAuth && !isAuthenticated) {
      return;
    }

    // Load feed if not already loaded or if it's the home feed and user just authenticated
    const currentTabData = tabData[activeTab];
    if (
      currentTabData.posts.length === 0 ||
      (activeTab === "home" && isAuthenticated)
    ) {
      fetchFeed(activeTab, 1, true);
    }
  }, [activeTab, isAuthenticated]);

  // Scroll handler for showing/hiding compose button
  const handleScroll = useCallback((e) => {
    const currentScrollY = e.target.scrollTop;
    setScrollY(currentScrollY);

    // Show compose button when scrolling down
    if (currentScrollY > 50) {
      setShowComposeButton(true);
    } else {
      setShowComposeButton(false);
    }
  }, []);

  // Handle location permission changes for nearme tab
  useEffect(() => {
    if (
      activeTab === "nearme" &&
      locationPermission === "granted" &&
      userLocation
    ) {
      const currentTabData = tabData[activeTab];
      // Only fetch if we don't have posts yet
      if (currentTabData.posts.length === 0) {
        fetchFeed("nearme", 1, true);
      }
    }
  }, [activeTab, locationPermission, userLocation]);

  

  const handleNearMeTabPress = () => {
    if (locationPermission === "granted" && userLocation) {
      setActiveTab("nearme");
      fetchFeed("nearme", 1, true);
    } else if (locationPermission === "denied") {
      setShowLocationModal(true);
    } else {
      // Set the active tab first, then request permission
      setActiveTab("nearme");
      requestLocationPermission();
    }
  };

  // Fixed fetchFeed function
  const fetchFeed = useCallback(
  async (feedType, pageNum = 1, refresh = false) => {
    const feedConfig = FEED_TYPES.find((feed) => feed.key === feedType);

    if (!feedConfig) {
      console.warn(`Feed config not found for '${feedType}'`);
      return;
    }

    // SAFETY CHECK: Initialize tab data if it doesn't exist
    const currentTabData = tabData[feedType];
    if (!currentTabData) {
      console.warn(`Tab data for '${feedType}' not found, initializing...`);
      updateTabData(feedType, {
        posts: [],
        page: 1,
        hasMore: true,
        loading: false,
        error: null,
      });
      return;
    }

    // Validation checks
    if (currentTabData.loading) return;
    if (!currentTabData.hasMore && !refresh && pageNum > 1) return;

    // Check authentication requirement
    if (feedConfig.requiresAuth && !isAuthenticated) {
      updateTabData(feedType, {
        error: "Please log in to view this feed",
        posts: [],
        hasMore: false,
        loading: false
      });
      return;
    }

    // IMPROVED LOCATION REQUIREMENT HANDLING
    if (feedConfig.requiresLocation) {
      if (locationPermission === 'denied') {
        updateTabData(feedType, {
          error: "Location access denied. Please enable location services to view nearby posts.",
          posts: [],
          hasMore: false,
          loading: false
        });
        setShowLocationModal(true);
        return;
      }

      if (locationPermission === 'requesting') {
        updateTabData(feedType, {
          error: "Requesting location permission...",
          posts: [],
          hasMore: false,
          loading: false
        });
        return;
      }

      if (!userLocation) {
        updateTabData(feedType, {
          error: "Getting your location...",
          posts: [],
          hasMore: false,
          loading: true
        });
        
        try {
          await requestLocationPermission();
          // After getting location, retry the fetch
          if (locationPermission === 'granted' && userLocation) {
            // Recursive call to retry with location
            setTimeout(() => fetchFeed(feedType, pageNum, refresh), 100);
          }
          return;
        } catch (error) {
          updateTabData(feedType, {
            error: error.message || "Failed to get location",
            posts: [],
            hasMore: false,
            loading: false
          });
          return;
        }
      }

      // Validate location coordinates before using
      const lat = parseFloat(userLocation.latitude);
      const lng = parseFloat(userLocation.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        updateTabData(feedType, {
          error: 'Invalid location coordinates',
          posts: [],
          hasMore: false,
          loading: false
        });
        return;
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        updateTabData(feedType, {
          error: 'Location coordinates out of valid range',
          posts: [],
          hasMore: false,
          loading: false
        });
        return;
      }
    }

    // API call throttling - More aggressive for nearme feed
    const throttleInterval = feedType === 'nearme' ? 30000 : MIN_FETCH_INTERVAL; // 30 seconds for nearme
    const now = Date.now();
    const lastFetch = lastFetchTime[feedType] || 0;
    if (now - lastFetch < throttleInterval && !refresh && pageNum === 1) {
      console.log(`Throttling ${feedType} feed request`);
      return;
    }

    setLastFetchTime((prev) => ({ ...prev, [feedType]: now }));

    try {
      // Set loading state
      updateTabData(feedType, { loading: true });
      if (refresh) {
        updateTabData(feedType, { error: null });
      }

      // Set request headers
      const headers = {
        "Content-Type": "application/json",
      };
      if (token && feedConfig.requiresAuth) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Build URL with location parameters for nearme feed
      let url = `${API_ENDPOINTS.SOCIAL}/posts/feed/${feedConfig.endpoint}?page=${pageNum}&limit=10`;

      if (feedConfig.requiresLocation && userLocation) {
        // Validate location coordinates before adding to URL
        const lat = parseFloat(userLocation.latitude);
        const lng = parseFloat(userLocation.longitude);
        
        url += `&latitude=${lat}&longitude=${lng}`;
        console.log(`Near me request with location:`, {
          latitude: lat,
          longitude: lng,
          accuracy: userLocation.accuracy,
        });
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        if (feedConfig.requiresAuth) {
          updateTabData(feedType, {
            error: "Your session has expired. Please log in again.",
            posts: [],
            hasMore: false,
            loading: false,
          });
          await logout();
          return;
        }
      }

      // Handle rate limiting
      if (response.status === 429) {
        updateTabData(feedType, {
          error: "Rate limited. Please wait a moment before refreshing.",
          loading: false,
        });
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch ${feedType} feed: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          }
          if (errorData.error) {
            errorMessage += `: ${errorData.error}`;
          }
        } catch (parseError) {
          console.warn('Could not parse error response:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error("Invalid server response format");
      }

      // Process posts
      const formattedPosts = data.posts
        .map((post, index) => (post ? formatPostFromApi(post, index) : null))
        .filter(Boolean);

      // Log if any posts were filtered out
      const filteredCount = data.posts.length - formattedPosts.length;
      if (filteredCount > 0) {
        console.warn(`Filtered out ${filteredCount} posts with invalid data in ${feedType} feed`);
      }

      // Update pagination info
      const hasMore = data.currentPage ? data.currentPage < data.totalPages : formattedPosts.length === 10;

      // Update state
      if (refresh) {
        updateTabData(feedType, {
          posts: formattedPosts,
          page: 1,
          hasMore,
          error: null,
          loading: false,
        });
      } else {
        const existingIds = new Set(currentTabData.posts.map((p) => p.id));
        const uniqueNewPosts = formattedPosts.filter((p) => !existingIds.has(p.id));

        updateTabData(feedType, {
          posts: [...currentTabData.posts, ...uniqueNewPosts],
          page: pageNum,
          hasMore,
          error: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error(`Error fetching ${feedType} feed:`, error);

      // Handle specific error types
      let errorMessage = `Failed to load posts: ${error.message}`;

      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.message.includes("NetworkError") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message.includes("JSON")) {
        errorMessage = "Server returned invalid data. Please try again.";
      }

      updateTabData(feedType, {
        error: errorMessage,
        posts: refresh ? [] : currentTabData.posts,
        loading: false,
      });

      // Handle auth errors
      if (
        error.message &&
        (error.message.includes("unauthorized") ||
          error.message.includes("forbidden") ||
          error.message.includes("authentication")) &&
        feedConfig.requiresAuth
      ) {
        await logout();
      }
    } finally {
      setRefreshing(false);
      updateTabData(feedType, { loading: false });
    }
  },
  [
    isAuthenticated,
    token,
    logout,
    tabData,
    lastFetchTime,
    locationPermission,
    userLocation,
    lastLocationUpdate,
    updateTabData,
  ]
);
  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  // const performFetch = async (
  //   feedType,
  //   pageNum,
  //   refresh,
  //   feedConfig,
  //   currentTabData
  // ) => {
  //   // API call throttling
  //   const now = Date.now();
  //   const lastFetch = lastFetchTime[feedType] || 0;
  //   if (now - lastFetch < MIN_FETCH_INTERVAL && !refresh) {
  //     setTabData((prev) => ({
  //       ...prev,
  //       [feedType]: { ...prev[feedType], loading: false },
  //     }));
  //     return;
  //   }

  //   setLastFetchTime((prev) => ({ ...prev, [feedType]: now }));

  //   try {
  //     // Set request headers
  //     const headers = {
  //       "Content-Type": "application/json",
  //     };
  //     if (token && feedConfig.requiresAuth) {
  //       headers["Authorization"] = `Bearer ${token}`;
  //     }

  //     const url = `${API_ENDPOINTS.SOCIAL}/posts/feed/${feedConfig.endpoint}?page=${pageNum}&limit=${POST_LIMIT}`;

  //     const response = await fetch(url, {
  //       headers,
  //       signal: AbortSignal.timeout(15000),
  //     });

  //     // Handle auth errors
  //     if (response.status === 401 || response.status === 403) {
  //       if (feedConfig.requiresAuth) {
  //         setTabData((prev) => ({
  //           ...prev,
  //           [feedType]: {
  //             ...prev[feedType],
  //             error: "Your session has expired. Please log in again.",
  //             posts: [],
  //             hasMore: false,
  //             loading: false,
  //           },
  //         }));
  //         await logout();
  //         return;
  //       }
  //     }

  //     // Handle rate limiting
  //     if (response.status === 429) {
  //       setTabData((prev) => ({
  //         ...prev,
  //         [feedType]: {
  //           ...prev[feedType],
  //           error: "Rate limited. Please wait a moment before refreshing.",
  //           loading: false,
  //         },
  //       }));
  //       return;
  //     }

  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch ${feedType} feed: ${response.status}`);
  //     }

  //     const responseText = await response.text();
  //     const data = JSON.parse(responseText);

  //     if (!data.posts || !Array.isArray(data.posts)) {
  //       throw new Error("Invalid server response format");
  //     }

  //     // Process posts
  //     const formattedPosts = data.posts
  //       .map((post, index) => (post ? formatPostFromApi(post, index) : null))
  //       .filter(Boolean);

  //     const hasMore = formattedPosts.length === POST_LIMIT;

  //     // Update state with functional update
  //     setTabData((prev) => {
  //       const prevTabData = prev[feedType];

  //       if (refresh) {
  //         return {
  //           ...prev,
  //           [feedType]: {
  //             ...prevTabData,
  //             posts: formattedPosts,
  //             page: 1,
  //             hasMore,
  //             error: null,
  //             loading: false,
  //           },
  //         };
  //       } else {
  //         const existingIds = new Set(prevTabData.posts.map((p) => p.id));
  //         const uniqueNewPosts = formattedPosts.filter(
  //           (p) => !existingIds.has(p.id)
  //         );

  //         return {
  //           ...prev,
  //           [feedType]: {
  //             ...prevTabData,
  //             posts: [...prevTabData.posts, ...uniqueNewPosts],
  //             page: pageNum,
  //             hasMore,
  //             loading: false,
  //           },
  //         };
  //       }
  //     });
  //   } catch (error) {
  //     console.error(`Error fetching ${feedType} feed:`, error);

  //     setTabData((prev) => ({
  //       ...prev,
  //       [feedType]: {
  //         ...prev[feedType],
  //         error: `Failed to load posts: ${error.message}`,
  //         posts: refresh ? [] : prev[feedType].posts,
  //         loading: false,
  //       },
  //     }));

  //     if (
  //       error.message &&
  //       (error.message.includes("unauthorized") ||
  //         error.message.includes("forbidden") ||
  //         error.message.includes("authentication")) &&
  //       feedConfig.requiresAuth
  //     ) {
  //       await logout();
  //     }
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };

  // character count and media upload: create post
  const charCount = text.length;
  const isApproachingLimit = charCount > MAX_CHAR_LIMIT * 0.8;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;
  const gradientColors = isOverLimit
    ? ["#FF6B6B", "#FF0000"]
    : isApproachingLimit
    ? ["#FFD166", "#FF9F1C"]
    : ["#06D6A0", "#1B9AAA"];

  // media upload
  const uploadMedia = async () => {
    if (images.length === 0) return { urls: [], metadata: [] };

    try {
      setProgress(10); // Start

      const base64Images = await Promise.all(
        images.map(async (image, i) => {
          if (image.startsWith("data:image")) return image;

          const response = await fetch(image);
          const blob = await response.blob();

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              setProgress(20 + i * (50 / images.length)); // Simulate mid-progress
              resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );

      const metadata = images.map((_, index) => ({
        filter: imageFilters[index] || null,
        originalUri: images[index],
      }));

      setProgress(75); // Before upload

      const res = await fetch(`${API_ENDPOINTS.MEDIA}/post`, {
        // const res = await fetch(`${API_ENDPOINTS.MEDIA}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ images: base64Images, metadata }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to upload media");
      }

      const data = await res.json();
      setProgress(100); // Done
      return {
        urls: data.imageUrls || [],
        metadata: data.metadata || [],
      };
    } catch (error) {
      setProgress(0);
      throw new Error(error.message || "Upload failed");
    }
  };

  // create post handlers
  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to create posts");
      return;
    }

    if (!text.trim() && images.length === 0) {
      toast.error("Please add some text or images to your post");
      return;
    }

    if (isOverLimit) {
      toast.error(
        `Content Too Long: Your post exceeds the ${MAX_CHAR_LIMIT} character limit.`
      );
      return;
    }

    try {
      setProgress(5);

      let mediaUrls = [];
      let mediaIds = [];

      if (images.length > 0) {
        const uploadResults = await uploadMedia();
        if (!uploadResults || !uploadResults.urls || !uploadResults.metadata) {
          throw new Error("Invalid upload response");
        }
        mediaUrls = uploadResults.urls;
        mediaIds = uploadResults.metadata.map((item) => item.publicId);
      }

      setProgress(90); // Almost done

      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: text.trim() || "[media-only-post]",
          media: mediaUrls,
          mediaIds: mediaIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create post");
      }

      setProgress(100);
      toast.success("Post created successfully!");
      setText("");
      setImages([]);
      setImageFilters([]);
      setIsInputFocused(false);
      setProgress(0);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(`Failed to create post: ${error.message}`);
      setProgress(0);
    }
  };

  const handleMediaButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      if (images.length < MEDIA_LIMIT) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages((prev) => [...prev, e.target.result]);
          setImageFilters((prev) => [...prev, "none"]);
        };
        reader.readAsDataURL(file);
      }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleCreatePost();
    }
  };

  // User interaction handlers
  const handleFollowUser = async (userId) => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users");
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/followers/${userId}/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }

      toast.success("You are now following this user");

      // Update posts in current tab to reflect new following status
      const updatedPosts = getCurrentTabData().posts.map((post) =>
        post.userId === userId ? { ...post, isFollowing: true } : post
      );
      updateTabData(activeTab, { posts: updatedPosts });
    } catch (error) {
      console.error("Error following user:", error);
      toast.error(`Failed to follow user: ${error.message}`);
    }
  };

  const handleUnfollowUser = async (userId) => {
    if (!isAuthenticated) {
      toast.error("Please login to unfollow users");
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/followers/${userId}/unfollow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unfollow user");
      }

      toast.success("You have unfollowed this user");

      // Update posts in current tab to reflect new following status
      const updatedPosts = getCurrentTabData().posts.map((post) => {
        if (post.userId === userId) {
          return { ...post, isFollowing: false };
        }
        return post;
      });
      updateTabData(activeTab, { posts: updatedPosts });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error(`Failed to unfollow user: ${error.message}`);
    }
  };

  const handleViewProfile = (userId) => {
    router.push(`/UserProfile/${userId}`);
  };

  const handleHidePost = (postId) => {
    const updatedPosts = getCurrentTabData().posts.filter(
      (post) => post.id !== postId
    );
    updateTabData(activeTab, { posts: updatedPosts });
    toast.success("This post will no longer appear in your feed");
  };

  const handleBlockUser = async (userId) => {
    if (!isAuthenticated) {
      toast.error("Please login to block users");
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/users/block/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to block user");
      }

      // Remove all posts from this user in current tab
      const updatedPosts = getCurrentTabData().posts.filter(
        (post) => post.userId !== userId
      );
      updateTabData(activeTab, { posts: updatedPosts });
      toast.success("You will no longer see content from this user");
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error(`Failed to block user: ${error.message}`);
    }
  };

  const handleCommentSuccess = () => {
    // Update comment count without full refresh
    if (postToComment) {
      const updatedPosts = getCurrentTabData().posts.map((post) => {
        if (post.id === postToComment.id) {
          return { ...post, commentCount: post.commentCount + 1 };
        }
        return post;
      });
      updateTabData(activeTab, { posts: updatedPosts });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeed(activeTab, 1, true);
  }, [fetchFeed, activeTab]);
  const handleLoadMore = useCallback(() => {
    const currentTabData = tabData[activeTab];
    console.log("Load more triggered:", {
      loading: currentTabData.loading,
      hasMore: currentTabData.hasMore,
      page: currentTabData.page,
    });

    if (!currentTabData.loading && currentTabData.hasMore) {
      const nextPage = currentTabData.page + 1;
      console.log("Fetching page:", nextPage);
      fetchFeed(activeTab, nextPage);
    }
  }, [activeTab, tabData, fetchFeed]);

  // Check follow status for menu options
  const checkFollowStatus = async (userId) => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/followers/${userId}/status`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) return false;

      const data = await response.json();
      return data.isFollowing || false;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  };

  // Menu options configuration
  const menuOptions = [
    { icon: UserPlus, text: "Follow" },
    { icon: UserMinus, text: "Unfollow" },
    { icon: Info, text: "About this account" },
    { icon: Flag, text: "Report" },
    { icon: Ban, text: "Block" },
    { icon: Trash2, text: "Delete Post" },
  ];

  // Load menu options based on post and user context
  const loadMenuOptions = async () => {
    if (!selectedPost || !selectedPost.user) {
      console.log(selectedPost);
      console.log("Missing post data for menu options");
      setFilteredOptions([]);
      return;
    }

    try {
      // Determine if this is the user's own post
      const isOwnPost =
        isAuthenticated && user && selectedPost.user === user._id;

      // Check follow status if needed
      let isFollowing = selectedPost.isFollowing;
      if (isAuthenticated && !isOwnPost && isFollowing === undefined) {
        try {
          console.log("Checking follow status for:", selectedPost.user);
          isFollowing = await checkFollowStatus(selectedPost.user);

          // Update post with follow status in current tab
          const updatedPosts = getCurrentTabData().posts.map((post) => {
            if (post.id === selectedPost._id) {
              return { ...post, isFollowing };
            }
            return post;
          });
          updateTabData(activeTab, { posts: updatedPosts });
        } catch (error) {
          console.error("Error fetching follow status:", error);
          isFollowing = false;
        }
      }

      // Filter menu options based on conditions
      const filtered = menuOptions.filter((option) => {
        if (option.text === "Follow") {
          return !isOwnPost && !isFollowing;
        }
        if (option.text === "Unfollow") {
          return !isOwnPost && isFollowing;
        }
        if (option.text === "Block") {
          return !isOwnPost;
        }
        if (option.text === "Delete Post") {
          return isOwnPost;
        }
        return true;
      });

      console.log("Filtered options:", filtered.length);
      setFilteredOptions(filtered);
    } catch (error) {
      console.error("Error loading menu options:", error);
      // Set default options if there's an error
      setFilteredOptions([
        { icon: Flag, text: "Report" },
        { icon: EyeOff, text: "Hide" },
      ]);
    }
  };
  const [showConfirm, setShowConfirm] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);

  const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <p className="text-lg font-medium mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 cursor-pointer py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const LocationPermissionModal = () => {
    if (!showLocationModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">
            Location Permission Required
          </h3>
          <p className="text-gray-700 mb-6 text-center">
            To show you posts from nearby locations, we need access to your
            location.
          </p>

          <div className="flex justify-center space-x-3">
            <button
              onClick={() => {
                setShowLocationModal(false);
                requestLocationPermission();
              }}
              className="bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600"
            >
              Allow Location
            </button>

            <button
              onClick={() => setShowLocationModal(false)}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeletePost = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/posts/${postIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      const updatedPosts = getCurrentTabData().posts.filter(
        (post) => post.id !== postIdToDelete
      );
      updateTabData(activeTab, { posts: updatedPosts });
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete post: ${error.message}`);
    } finally {
      setShowConfirm(false);
      setPostIdToDelete(null);
    }
  };

  const handleReportSuccess = (reportedPostId) => {
    const updatedPosts = getCurrentTabData().posts.filter(
      (post) => post.id !== reportedPostId
    );
    updateTabData(activeTab, { posts: updatedPosts });
  };

  // Handle menu option selection
  const handleMenuOptionPress = (option) => {
    if (!selectedPost) return;

    const userId = selectedPost?.user;

    switch (option.text) {
      case "Follow":
        if (isAuthenticated) {
          handleFollowUser(userId);
        } else {
          toast.error("Please login to follow users");
        }
        break;
      case "Unfollow":
        handleUnfollowUser(userId);
        break;
      case "Report":
        // postHandlers.handleInitiateReport(selectedPost);
        break;
      case "Hide":
        handleHidePost(selectedPost.id);
        break;
      case "Block":
        // handleBlockUser(userId);
        break;
      case "About this account":
        handleViewProfile(userId);
        break;
      case "Delete Post":
        if (isAuthenticated) {
          setPostIdToDelete(selectedPost.id);
          setShowConfirm(true); // SHOW MODAL
          console.log("Deleting post with ID:", selectedPost.id);
        } else {
          toast.error("Please login to delete posts");
        }
        break;

      default:
    }

    setModalVisible(false);
  };

  // Render tab bar
  const renderTabBar = () => (
  <div className="sticky rounded-lg top-2 mb-2 z-50 bg-white border-b overflow-x-auto custom-scrollbar border-gray-200 truncate">
    <div className="flex justify-center scrollbar-hide truncate overflow-x-auto px-4 py-2 space-x-2 min-w-max max-sm:justify-evenly">
      {FEED_TYPES.map((feedType) => {
        const isActive = activeTab === feedType.key;
        const canAccess = !feedType.requiresAuth || isAuthenticated;
        const isNearMe = feedType.key === "nearme";
        
        // Show different states for nearme tab
        const getDisplayText = () => {
          if (!isNearMe) return feedType.title;
          
          if (locationPermission === 'requesting') return 'Near me ';
          if (locationPermission === 'denied') return 'Near me ';
          if (locationPermission === 'granted') return 'Near me ';
          return 'Near me ';
        };
        
        return (
          <button
            key={feedType.key}
            onClick={() => {
              if (isNearMe) {
                handleNearMeTabPress();
              } else if (canAccess) {
                handleTabChange(feedType.key);
              }
            }}
            className={`px-3 py-2 rounded-full cursor-pointer text-sm font-medium transition-colors flex items-center justify-center
${isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
${!canAccess ? "opacity-50 cursor-not-allowed" : ""}
${isNearMe && locationPermission === 'denied' ? "opacity-70" : ""}
sm:max-w-[100px] max-w-[40px] sm:w-auto w-10 h-10 sm:h-auto truncate overflow-hidden whitespace-nowrap`}
            disabled={!canAccess}
            title={getDisplayText()}
          >
            {/* Mobile: Show only icon */}
            <span className="sm:hidden">
              <feedType.icon className="w-5 h-5" />
            </span>
            {/* Desktop: Show text with status */}
            <span className="hidden sm:block truncate">
              {getDisplayText()}
              {feedType.requiresAuth && !isAuthenticated && " 🔒"}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);
  const currentTabData = getCurrentTabData();
  const currentFeedType = FEED_TYPES.find((feed) => feed.key === activeTab);

  // --- Intersection Observer for Infinite Scroll ---
  const observer = useRef(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Keep refs in sync with state
  useEffect(() => {
    loadingRef.current = getCurrentTabData().loading;
    hasMoreRef.current = getCurrentTabData().hasMore;
  }, [tabData, activeTab]);

  // Debounced load more to avoid rapid triggers
  const debouncedHandleLoadMore = useCallback(
    debounce(() => {
      const currentTabData = getCurrentTabData();
      if (!currentTabData.loading && currentTabData.hasMore) {
        fetchFeed(activeTab, currentTabData.page + 1);
      }
    }, 50),
    [activeTab, fetchFeed, tabData]
  );

  // Stable ref callback for last post
  const lastPostElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      if (!node) return;

      observer.current = new window.IntersectionObserver(
        (entries, obs) => {
          if (
            entries[0].isIntersecting &&
            hasMoreRef.current &&
            !loadingRef.current
          ) {
            obs.disconnect(); // Prevent multiple triggers
            loadingRef.current = true;
            fetchFeed(activeTab, getCurrentTabData().page + 1);
          }
        },
        {
          threshold: 0,
          rootMargin: "0px",
        }
      );
      observer.current.observe(node);
    },
    [activeTab, fetchFeed]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  // for floating leaderboard in mobile view
  const handleLeaderboardPage = () => {
    if (!isAuthenticated) {
      toast.error("Please login to view the leaderboard");
      return;
    }
    router.push("/leaderboard"); // Adjust path as needed
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to view your profile");
      return;
    }
    router.push(`profile`); // Navigate to user's profile
  };
  return (
    <div className="flex-1 h-screen max-sm:w-xl/5 min-w-full">
      {/* --- Block 1: Create Post & Tabs --- */}
      {renderTabBar()}
      <div
        className="flex-1 overflow-y-auto h-screen custom-scrollbar p-4 w-full min-w-full"
        onScroll={handleScroll}
      >
        {/* <div className="mt-4 sm:mt-2 w-full max-w-[512px] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 bg-white rounded-xl mb-4 shadow-sm min-h-[200px]"> */}
        <div className="mt-5 md:min-w-[410px] lg:w-[580px] max-w-2xl w-full mx-auto bg-white rounded-xl mb-4 shadow-sm">
          {showConfirm && (
            <ConfirmModal
              message="Are you sure you want to delete this post?"
              onConfirm={handleDeletePost}
              onCancel={() => {
                setShowConfirm(false);
                setPostIdToDelete(null);
              }}
            />
          )}
          {!isAuthenticated ? (
            <div className="min-h-[200px] bg-gray-50 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-4">
                  Please log in to create posts.
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 bg-primary cursor-pointer text-white rounded-full hover:bg-sky-600"
                >
                  Log In
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto ">
              <div className="p-4 min-w-full bg-white  rounded-xl relative z-10">
                <div className="flex items-center mb-2 space-x-3">
                  <Image
                    src={user?.profilePicture || defaultPic}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full w-[40] h-[40] cursor-pointer"
                    onClick={handleProfileClick}
                  />
                  <span className="text-gray-700">@{user.username}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <textarea
                    className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    placeholder="What's on your mind?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(text.trim().length > 0)}
                    onKeyDown={handleKeyPress}
                    rows={isInputFocused ? 5 : 2}
                  />
                  <div>
                    <button
                      onClick={handleMediaButtonClick}
                      disabled={images.length >= MEDIA_LIMIT}
                      className={`p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors ${
                        images.length >= MEDIA_LIMIT
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <PhotoIcon className="w-5 h-5 cursor-pointer text-gray-600" />
                    </button>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="mt-2 flex overflow-x-auto space-x-3 scrollbar-thin scrollbar-thumb-gray-300">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-20 h-20 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt="Uploaded"
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover"
                        />
                        <button
                          onClick={() => {
                            setImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                            setImageFilters((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                        >
                          <XMarkIcon className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${gradientColors.join(
                        ", "
                      )})`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                      <span
                        className={`text-xs font-medium ${
                          isOverLimit
                            ? "text-red-600"
                            : isApproachingLimit
                            ? "text-yellow-500"
                            : "text-cyan-600"
                        }`}
                      >
                        {MAX_CHAR_LIMIT - charCount}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={
                      (!text.trim() && images.length === 0) || isOverLimit
                    }
                    className="p-2 cursor-pointer flex items-center justify-center bg-primary text-white rounded-full hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Post
                  </button>
                </div>
                {progress > 0 && progress < 100 && (
                  <div className="w-full mt-2">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {Math.floor(progress)}% uploading...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- Block 2: Feed Content (Loading, Posts, or Empty) --- */}
        <div className="min-md:w-xl/2 md:max-w-xl max-w-2xl w-full mx-auto">
          {/* Initial loading indicator */}
          {currentTabData.loading && currentTabData.posts.length === 0 ? (
            <PostsSkeleton />
          ) : (
            <div
              className={`transition-all duration-300 ${
                isInputFocused || images.length > 0
                  ? "blur-sm pointer-events-none"
                  : "pointer-events-auto"
              }`}
            >
              {/* Error states */}
              {error && activeTab === "home" && (
                <div className="p-4 mx-4 mt-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-600 font-medium">
                    Authentication Error: {error}
                  </p>
                </div>
              )}
              {currentTabData.error && (
                <div className="p-4 mx-4 mt-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <p className="text-yellow-700 font-medium">
                    {currentTabData.error}
                  </p>
                  {activeTab === "nearme" &&
                    locationPermission === "denied" && (
                      <button
                        onClick={() => setShowLocationModal(true)}
                        className="mt-2 text-sky-600 hover:text-sky-800 underline"
                      >
                        Grant location permission
                      </button>
                    )}
                  {activeTab === "nearme" &&
                    currentTabData.error.includes(
                      "temporarily unavailable"
                    ) && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p>
                          Try switching to another feed like "Trending" or
                          "Latest" while we fix this.
                        </p>
                        <button
                          onClick={() => setActiveTab("trending")}
                          className="mt-2 text-sky-600 hover:text-sky-800 underline cursor-pointer"
                        >
                          Switch to Trending
                        </button>
                      </div>
                    )}
                </div>
              )}

              {/* Posts or Empty Feed */}
              {currentTabData.posts.length > 0 ? (
                <div>
                  {currentTabData.posts.map((post, index) => {
                    const isLastPost =
                      currentTabData.posts.length === index + 1;
                    return (
                      <div
                        key={`${post.id}-${activeTab}-${index}`}
                        ref={isLastPost ? lastPostElementRef : null}
                      >
                        <PostCard
                          post={post}
                          handleLikePost={postHandlers.handleLikePost}
                          handleUnlikePost={postHandlers.handleUnlikePost}
                          handleCommentPost={postHandlers.handleCommentPost}
                          handleAmplifyPost={postHandlers.handleAmplifyPost}
                          handleBookmarkPost={postHandlers.handleBookmarkPost}
                          handleUnbookmarkPost={
                            postHandlers.handleUnbookmarkPost
                          }
                          setSelectedPost={setSelectedPost}
                          setModalVisible={setModalVisible}
                          username={user}
                          handleDislikePost={postHandlers.handleDislikePost}
                          handleUndislikePost={postHandlers.handleUndislikePost}
                        />
                      </div>
                    );
                  })}
                  {currentTabData.loading && (
                    <div className="py-8 text-center mx-4">
                      <div className="inline-flex items-center space-x-3 px-6 py-4">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        <div>
                          <span className="text-primary font-medium block">
                            Loading more posts...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyFeed
                  isAuthenticated={isAuthenticated}
                  handleCreatePost={handleCreatePost}
                  error={currentTabData.error || error}
                  feedType={activeTab}
                  onLogin={() => {
                    if (!isAuthenticated) router.push("/login");
                  }}
                />
              )}

              {/* End of feed indicator */}
              {!currentTabData.loading &&
                currentTabData.posts.length > 5 &&
                !currentTabData.hasMore && (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center space-x-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">
                        You're all caught up!
                      </span>
                    </div>
                  </div>
                )}
              <div className="h-20" />
            </div>
          )}
        </div>

        {/* --- Block 3: Modals & Floating Button --- */}
        {/* Floating buttons - only show on home tab */}
        {showComposeButton && activeTab === "home" && (
          <div className="fixed bottom-28 right-4 z-40 flex flex-col space-y-3 md:hidden">
            {/* Leaderboard Button */}
            <button
              onClick={handleLeaderboardPage}
              className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 transition-colors"
              title="Leaderboard"
            >
              <BarChart size={24} className="text-white" />
            </button>

            {/* Create Post Button */}
            {/* <button
            onClick={handleCreatePost}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
            title="Create Post"
          >
            <Plus size={24} className="text-white" />
          </button> */}
          </div>
        )}

        <CustomModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title="Post Options"
        >
          <div className="p-4">
            {selectedPost && (
              <div className="flex items-center mb-4 p-3 truncate bg-gray-50 rounded-xl ">
                <Image
                  src={getProfilePicture(selectedPost?.profilePic)}
                  alt={selectedPost?.username || "Profile"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">
                    {selectedPost.username}
                  </p>
                  <p className="text-sm text-gray-500 truncate line-clamp-2 break-words overflow-hidden">
                    {selectedPost.content}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuOptionPress(option)}
                  className={`w-full flex items-center p-3 rounded-xl text-left transition-colors cursor-pointer ${
                    option.text === "Delete Post" ||
                    option.text === "Block" ||
                    option.text === "Report"
                      ? "hover:bg-red-50 text-gray-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <option.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        </CustomModal>

        <CommentModal
          visible={isCommentModalVisible}
          onClose={() => setCommentModalVisible(false)}
          title="Add Comment"
          post={postToComment}
          onSuccess={handleCommentSuccess}
          token={token}
        />

        <AmplifyModal
          visible={isAmplifyModalVisible}
          onClose={() => setAmplifyModalVisible(false)}
          post={postToAmplify}
          token={token}
          title="Amplify Post"
          onSuccess={(postId) => {
            const currentPosts = getCurrentTabData().posts;
            const updatedPosts = currentPosts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  amplifyCount: post.amplifyCount + 1,
                  hasAmplified: true,
                };
              }
              return post;
            });
            updateTabData(activeTab, { posts: updatedPosts });
          }}
        />

        <ReportModal
          visible={isReportModalVisible}
          onClose={() => setReportModalVisible(false)}
          title="Report Post"
          post={postToReport}
          onSuccess={handleReportSuccess}
          token={token}
        />
        <CustomModal
          visible={isDeleteModalVisible}
          onClose={() => {
            setDeleteModalVisible(false);
            setPostToDelete(null);
          }}
          title="Delete Post"
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete this post?
              </h3>
              <p className="text-gray-600 text-sm">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => {
                  setDeleteModalVisible(false);
                  setPostToDelete(null);
                }}
                className="px-6 py-2 text-gray-700 cursor-pointer bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(postToDelete)}
                className="px-6 py-2 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </CustomModal>
        <CustomModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          title="Location Permission Required"
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location Access Needed
              </h3>
              <p className="text-gray-600 text-sm">
                To show you posts from nearby locations, we need access to your
                location.
              </p>
            </div>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-6 py-2 text-gray-700 cursor-pointer bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  requestLocationPermission();
                }}
                className="px-6 py-2 bg-sky-500 text-white cursor-pointer rounded-lg hover:bg-sky-600 transition-colors font-medium"
              >
                Allow Location
              </button>
            </div>
          </div>
        </CustomModal>
      </div>
    </div>
  );
};

export default HomePage;
