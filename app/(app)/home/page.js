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
} from "lucide-react";
import { Image as PhotoIcon, X as XMarkIcon } from "lucide-react";
import defaultPic from "../../assets/avatar.png";
import { debounce } from "lodash";
import { API_ENDPOINTS } from "../../utils/config";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getProfilePicture } from "@/app/utils/fallbackImage";
import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef, useCallback } from "react";
import PostCard from "../../components/ui/PostCard";
import EmptyFeed from "@/app/components/Home/EmptyFeed";
import CommentModal from "@/app/components/ui/CommentModal";
import AmplifyModal from "@/app/components/ui/AmplifyModal";
import CustomModal from "@/app/components/ui/Modal";
import ReportModal from "@/app/components/ui/ReportModal";
import Image from "next/image";
// import toast from "react-hot-toast";

// import {
//   Plus as PlusIcon,
//   Image as PhotoIcon,
//   MessageCircle as ChatBubbleOvalLeftIcon,
//   RefreshCcw as ArrowPathIcon,
//   Bookmark as BookmarkIcon,
//   MoreHorizontal as EllipsisHorizontalIcon,
//   UserPlus as UserPlusIcon,
//   UserMinus as UserMinusIcon,
//   Info as InformationCircleIcon,
//   Flag as FlagIcon,
//   EyeOff as EyeSlashIcon,
//   X as XMarkIcon,
//   Trash2 as TrashIcon,
//   Link as LinkIcon
// } from 'lucide-react';

// import {
//   Heart as HeartIconSolid,
//   Bookmark as BookmarkIconSolid
// } from 'lucide-react';
import {
  createPostHandlers,
  formatPostFromApi,
} from "../../utils/postFunctions";

const MAX_CHAR_LIMIT = 1000;
const MEDIA_LIMIT = 4;
// --- FIX: Define the page limit as a constant ---
const POST_LIMIT = 10;

// Constants
const REFRESH_INTERVAL = 60000; // 1 minute
const MIN_FETCH_INTERVAL = 5000; // 5 seconds

// Feed types configuration
const FEED_TYPES = [
  { key: "home", title: "Home", endpoint: "home", requiresAuth: true },
  {
    key: "trending",
    title: "Trending",
    endpoint: "trending",
    requiresAuth: false,
  },
  { key: "latest", title: "Latest", endpoint: "latest", requiresAuth: false },
  { key: "hot", title: "Hot", endpoint: "hot", requiresAuth: false },
  {
    key: "popular",
    title: "Popular",
    endpoint: "popular",
    requiresAuth: false,
  },
];

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
  });

  const [refreshing, setRefreshing] = useState(false);
  const [showComposeButton, setShowComposeButton] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

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

  // Helper function to update tab data
  const updateTabData = (tabKey, updates) => {
    setTabData((prev) => ({
      ...prev,
      [tabKey]: { ...prev[tabKey], ...updates },
    }));
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
    if (currentScrollY > 100) {
      setShowComposeButton(true);
    } else {
      setShowComposeButton(false);
    }
  }, []);

  // Fetch feed for specific tab
  const fetchFeed = useCallback(
    async (feedType, pageNum = 1, refresh = false) => {
      const feedConfig = FEED_TYPES.find((feed) => feed.key === feedType);
      if (!feedConfig) return;

      // Get current state synchronously
      const currentTabData = tabData[feedType];

      // Validation checks
      if (currentTabData.loading) return;
      if (!currentTabData.hasMore && !refresh && pageNum > 1) return;

      // Check authentication requirement
      if (feedConfig.requiresAuth && !isAuthenticated) {
        setTabData((prev) => ({
          ...prev,
          [feedType]: {
            ...prev[feedType],
            error: "Please log in to view this feed",
            posts: [],
            hasMore: false,
            loading: false, // Ensure loading is false
          },
        }));
        return;
      }

      // Set loading state BEFORE async operations
      setTabData((prev) => ({
        ...prev,
        [feedType]: {
          ...prev[feedType],
          loading: true,
          error: refresh ? null : prev[feedType].error,
        },
      }));

      // Move the actual fetch logic here instead of separate function
      try {
        // API call throttling
        const now = Date.now();
        const lastFetch = lastFetchTime[feedType] || 0;
        if (now - lastFetch < MIN_FETCH_INTERVAL && !refresh) {
          setTabData((prev) => ({
            ...prev,
            [feedType]: { ...prev[feedType], loading: false },
          }));
          return;
        }

        setLastFetchTime((prev) => ({ ...prev, [feedType]: now }));

        // Set request headers
        const headers = {
          "Content-Type": "application/json",
        };
        if (token && feedConfig.requiresAuth) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const url = `${API_ENDPOINTS.SOCIAL}/posts/feed/${feedConfig.endpoint}?page=${pageNum}&limit=${POST_LIMIT}`;

        const response = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(15000),
        });

        // Handle auth errors
        if (response.status === 401 || response.status === 403) {
          if (feedConfig.requiresAuth) {
            setTabData((prev) => ({
              ...prev,
              [feedType]: {
                ...prev[feedType],
                error: "Your session has expired. Please log in again.",
                posts: [],
                hasMore: false,
                loading: false,
              },
            }));
            await logout();
            return;
          }
        }

        // Handle rate limiting
        if (response.status === 429) {
          setTabData((prev) => ({
            ...prev,
            [feedType]: {
              ...prev[feedType],
              error: "Rate limited. Please wait a moment before refreshing.",
              loading: false,
            },
          }));
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${feedType} feed: ${response.status}`
          );
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

        const hasMore = formattedPosts.length === POST_LIMIT;

        // Update state
        setTabData((prev) => {
          const prevTabData = prev[feedType];

          if (refresh) {
            return {
              ...prev,
              [feedType]: {
                posts: formattedPosts,
                page: 1,
                hasMore,
                error: null,
                loading: false, // Always set loading to false
              },
            };
          } else {
            const existingIds = new Set(prevTabData.posts.map((p) => p.id));
            const uniqueNewPosts = formattedPosts.filter(
              (p) => !existingIds.has(p.id)
            );

            return {
              ...prev,
              [feedType]: {
                ...prevTabData,
                posts: [...prevTabData.posts, ...uniqueNewPosts],
                page: pageNum,
                hasMore,
                loading: false, // Always set loading to false
              },
            };
          }
        });
      } catch (error) {
        console.error(`Error fetching ${feedType} feed:`, error);

        setTabData((prev) => ({
          ...prev,
          [feedType]: {
            ...prev[feedType],
            error: `Failed to load posts: ${error.message}`,
            posts: refresh ? [] : prev[feedType].posts,
            loading: false, // Always set loading to false on error
          },
        }));

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
        // Ensure loading is always set to false
        setRefreshing(false);
        setTabData((prev) => ({
          ...prev,
          [feedType]: {
            ...prev[feedType],
            loading: false,
          },
        }));
      }
    },
    [isAuthenticated, token, logout, tabData, lastFetchTime]
  );
  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };
  const performFetch = async (
    feedType,
    pageNum,
    refresh,
    feedConfig,
    currentTabData
  ) => {
    // API call throttling
    const now = Date.now();
    const lastFetch = lastFetchTime[feedType] || 0;
    if (now - lastFetch < MIN_FETCH_INTERVAL && !refresh) {
      setTabData((prev) => ({
        ...prev,
        [feedType]: { ...prev[feedType], loading: false },
      }));
      return;
    }

    setLastFetchTime((prev) => ({ ...prev, [feedType]: now }));

    try {
      // Set request headers
      const headers = {
        "Content-Type": "application/json",
      };
      if (token && feedConfig.requiresAuth) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = `${API_ENDPOINTS.SOCIAL}/posts/feed/${feedConfig.endpoint}?page=${pageNum}&limit=${POST_LIMIT}`;

      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(15000),
      });

      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        if (feedConfig.requiresAuth) {
          setTabData((prev) => ({
            ...prev,
            [feedType]: {
              ...prev[feedType],
              error: "Your session has expired. Please log in again.",
              posts: [],
              hasMore: false,
              loading: false,
            },
          }));
          await logout();
          return;
        }
      }

      // Handle rate limiting
      if (response.status === 429) {
        setTabData((prev) => ({
          ...prev,
          [feedType]: {
            ...prev[feedType],
            error: "Rate limited. Please wait a moment before refreshing.",
            loading: false,
          },
        }));
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${feedType} feed: ${response.status}`);
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

      const hasMore = formattedPosts.length === POST_LIMIT;

      // Update state with functional update
      setTabData((prev) => {
        const prevTabData = prev[feedType];

        if (refresh) {
          return {
            ...prev,
            [feedType]: {
              ...prevTabData,
              posts: formattedPosts,
              page: 1,
              hasMore,
              error: null,
              loading: false,
            },
          };
        } else {
          const existingIds = new Set(prevTabData.posts.map((p) => p.id));
          const uniqueNewPosts = formattedPosts.filter(
            (p) => !existingIds.has(p.id)
          );

          return {
            ...prev,
            [feedType]: {
              ...prevTabData,
              posts: [...prevTabData.posts, ...uniqueNewPosts],
              page: pageNum,
              hasMore,
              loading: false,
            },
          };
        }
      });
    } catch (error) {
      console.error(`Error fetching ${feedType} feed:`, error);

      setTabData((prev) => ({
        ...prev,
        [feedType]: {
          ...prev[feedType],
          error: `Failed to load posts: ${error.message}`,
          posts: refresh ? [] : prev[feedType].posts,
          loading: false,
        },
      }));

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
    }
  };

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
        <button onClick={onCancel} className="px-4 cursor-pointer py-2 bg-gray-300 rounded">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded">
          Delete
        </button>
      </div>
    </div>
  </div>
);


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
        postHandlers.handleInitiateReport(selectedPost);
        break;
      case "Hide":
        handleHidePost(selectedPost.id);
        break;
      case "Block":
        handleBlockUser(userId);
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
      <div className="flex justify-center scrollbar-hide truncate overflow-x-auto px-4 py-2 space-x-2 min-w-max ">
        {FEED_TYPES.map((feedType) => {
          const isActive = activeTab === feedType.key;
          const canAccess = !feedType.requiresAuth || isAuthenticated;

          return (
            <button
              key={feedType.key}
              onClick={() => canAccess && handleTabChange(feedType.key)}
              className={`px-3 py-2 rounded-full cursor-pointer text-sm font-medium transition-colors
    ${isActive
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
    ${!canAccess ? "opacity-50 cursor-not-allowed" : ""}
    max-w-[100px] truncate overflow-hidden whitespace-nowrap`}
              disabled={!canAccess}
              title={feedType.title}
            >
              <span className="block truncate">{feedType.title}</span>
              {feedType.requiresAuth && !isAuthenticated && " 🔒"}
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

  return (
    <div className="flex-1 overflow-y-auto h-screen custom-scrollbar p-4 ">
      {/* --- Block 1: Create Post & Tabs --- */}
        {renderTabBar()}

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
            <div className="p-4  bg-white cursor-pointer rounded-xl relative z-10">
              <div className="flex items-center mb-2 space-x-3">
                <Image
                  src={user?.profilePicture || defaultPic}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full w-[40] h-[40]"
                />
                <span className="text-gray-700 cursor-pointer">
                  @{user.username}
                </span>
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
                    className={`p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors ${images.length >= MEDIA_LIMIT
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
                      className={`text-xs font-medium ${isOverLimit
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
          <div className="flex flex-col items-center justify-center p-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-lg text-gray-600">Loading posts...</p>
          </div>
        ) : (
          <div
            className={`transition-all duration-300 ${isInputFocused || images.length > 0
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
              </div>
            )}

            {/* Posts or Empty Feed */}
            {currentTabData.posts.length > 0 ? (
              <div>
                {currentTabData.posts.map((post, index) => {
                  const isLastPost = currentTabData.posts.length === index + 1;
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
                        handleUnbookmarkPost={postHandlers.handleUnbookmarkPost}
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
      {showComposeButton && activeTab === "home" && (
        <div className="fixed bottom-36 right-4 z-50">
          <button
            onClick={handleCreatePost}
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 transition-colors"
          >
            <Plus size={24} className="text-white" />
          </button>
        </div>
      )}

      <CustomModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="Post Options"
      >
        <div className="p-4">
          {selectedPost && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
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
                <p className="text-sm text-gray-500 truncate  ">
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
                className={`w-full flex items-center p-3 rounded-xl text-left transition-colors cursor-pointer ${option.text === "Delete Post" ||
                    option.text === "Block" ||
                    option.text === "Report"
                    ? "hover:bg-red-50 text-red-600"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete this post?</h3>
            <p className="text-gray-600 text-sm">This action cannot be undone.</p>
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
    </div>
  );
};

export default HomePage;
