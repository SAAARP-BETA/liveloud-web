"use client";
import defaultCover from "../../../assets/Profilepic1.png";
import defaultPic from "../../../assets/avatar.png";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  use,
} from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import CustomModal from "../../../components/ui/Modal";
import AmplifyModal from "../../../components/ui/AmplifyModal";
import CommentModal from "../../../components/ui/CommentModal";
import ReportModal from "../../../components/ui/ReportModal"; // ADDED: Import ReportModal
import toast from "react-hot-toast";
import { useActivityTracker } from '@/app/hooks/useActivityTracker';

import {
  createPostHandlers,
  formatPostFromApi,
} from "../../../utils/postFunctions";
import PostCard from "../../../components/ui/PostCard";
import { API_ENDPOINTS } from "../../../utils/config";
import { getProfilePicture } from "@/app/utils/fallbackImage";
import { usePostInteractions } from "../../../utils/postinteractions";

import {
  ArrowLeft,
  MoreHorizontal,
  Image as ImageIcon,
  Share2,
  MessageCircle,
  Bookmark,
  Flag,
  Flame,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Grid,
  Trophy,
  Star,
  Heart,
  Edit2,
  UserPlus,
  UserMinus,
  Users,
  Info,
  Ban,
  Trash2,
  CheckCircle as Verified,
  Loader2,
} from "lucide-react";

// Window dimensions
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;
const PROFILE_IMAGE_MAX_SIZE = 120;
const PROFILE_IMAGE_MIN_SIZE = 40;
const SCROLL_SENSITIVITY = 0.5;
const POST_LIMIT = 10;
// ADDED: Menu options for post interactions (same as in PostPage)
const menuOptions = [
  { icon: UserPlus, text: "Follow" },
  { icon: UserMinus, text: "Unfollow" },
  { icon: Info, text: "About this account" },
  { icon: Flag, text: "Report" },
  { icon: Ban, text: "Block" },
  { icon: Trash2, text: "Delete Post" },
];

// Points Display Component (unchanged)
const PointsDisplay = ({ points, loading }) => {
  const router = useRouter();

  if (loading || !points) {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-xl">
        <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  const levelInfo = [
    { level: 1, title: "Newcomer", minPoints: 0, pointsToNext: 100 },
    { level: 2, title: "Active Member", minPoints: 100, pointsToNext: 400 },
    { level: 3, title: "Contributor", minPoints: 500, pointsToNext: 500 },
    { level: 4, title: "Influencer", minPoints: 1000, pointsToNext: 1500 },
    { level: 5, title: "Star", minPoints: 2500, pointsToNext: 2500 },
    { level: 6, title: "Superstar", minPoints: 5000, pointsToNext: 5000 },
    { level: 7, title: "Icon", minPoints: 10000, pointsToNext: 15000 },
    { level: 8, title: "Legend", minPoints: 25000, pointsToNext: 25000 },
    { level: 9, title: "Master", minPoints: 50000, pointsToNext: 50000 },
    {
      level: 10,
      title: "Grandmaster",
      minPoints: 100000,
      pointsToNext: Infinity,
    },
  ];

  const currentLevel =
    levelInfo.find(
      (level) =>
        points.totalPoints >= level.minPoints &&
        points.totalPoints < level.minPoints + level.pointsToNext
    ) || levelInfo[0];

  const progressPercentage = Math.min(
    ((points.totalPoints - currentLevel.minPoints) /
      currentLevel.pointsToNext) *
      100,
    100
  );

  const handleLeaderboardPress = () => {
    try {
      router.push("/leaderboard");
    } catch (error) {
      toast.error("Unable to navigate to leaderboard. Please try again.");
    }
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-sky-100 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div className="ml-3 cursor-pointer">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {points.totalPoints.toLocaleString() || 0}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Total Points
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Level {currentLevel.level}
            </span>
            <div className="ml-2 px-2 py-1 bg-primary rounded-full">
              <span className="text-xs text-white font-medium">
                {currentLevel.title}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Progress to Level {currentLevel.level + 1}:
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {Math.max(
              0,
              currentLevel.pointsToNext -
                (points.totalPoints - currentLevel.minPoints)
            )}{" "}
            pts to go
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex-1 text-center">
          <div className="w-12 h-12 bg-sky-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
            <Edit2 size={16} className="text-primary" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {points.creatorPoints || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Creator</p>
        </div>
        <div className="flex-1 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
            <Heart size={20} className="text-green-600" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {points.fanPoints || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Fan</p>
        </div>
        <div className="flex-1 text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
            <Star size={20} className="text-yellow-600" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {points.bonusPoints || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Bonus</p>
        </div>
      </div>
      <button
        className="mt-3 w-full py-2 bg-primary cursor-pointer hover:bg-sky-600 rounded-lg text-white text-sm font-medium transition-colors"
        onClick={handleLeaderboardPress}
      >
        Leaderboard
      </button>
    </div>
  );
};

// Streak Display Component (unchanged)
const StreakDisplay = ({ consecutiveDays }) => {
  if (!consecutiveDays || consecutiveDays === 0) return null;

  return (
    <div className="mt-3 flex items-center justify-center">
      <div className="flex items-center px-3 py-2 bg-orange-50 rounded-full border border-orange-200">
        <Flame size={16} className="text-orange-600" />
        <span className="ml-2 text-orange-600 font-semibold">
          {consecutiveDays} Day Streak
        </span>
      </div>
    </div>
  );
};

// Tab Bar Component (unchanged)
const TabBarAnimated = ({ tabs, activeTab, onTabPress }) => {
  return (
    <div className="flex w-full border justify-center gap-25 border-gray-100 dark:border-gray-700 pt-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`flex-1 flex items-center justify-center pb-2 ${
            activeTab === tab.key ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => onTabPress(tab.key)}
        >
          <div className="flex items-center cursor-pointer">
            {tab.key === "posts" && (
              <Grid
                size={18}
                className={
                  activeTab === tab.key ? "text-primary" : "text-gray-500 dark:text-gray-400"
                }
              />
            )}
            {tab.key === "media" && (
              <ImageIcon
                size={18}
                className={
                  activeTab === tab.key ? "text-primary" : "text-gray-500 dark:text-gray-400"
                }
              />
            )}
            <span
              className={`ml-1 text-sm font-medium ${
                activeTab === tab.key ? "text-primary" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {tab.title}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

// User Stats Component (unchanged)
const UserStats = ({
  followersCount,
  followingCount,
  postsCount,
  onPressFollowers,
  onPressFollowing,
}) => {
  return (
    <div className="flex justify-center mt-4 space-x-6 dark:text-white">
      <button className="text-center cursor-pointer" onClick={onPressFollowers}>
        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{followersCount}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
      </button>
      <button className="text-center cursor-pointer" onClick={onPressFollowing}>
        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{followingCount}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
      </button>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{postsCount}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
      </div>
    </div>
  );
};

// Gallery Grid Component (unchanged)
const GalleryGrid = ({ media, onMediaPress, emptyStateMessage }) => {
  if (!media || media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ImageIcon size={48} className="text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-700">No media yet</h3>
        <p className="mt-2 text-center text-sm text-gray-500 mx-8">
          {emptyStateMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {media.map((item) => (
        <button
          key={item.id}
          className="aspect-square p-1"
          onClick={() => onMediaPress(item)}
        >
          <img
            src={item.uri}
            alt="Media"
            className="w-full h-full object-cover rounded-md"
          />
        </button>
      ))}
    </div>
  );
};

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-gray-50 dark:bg-gray-900 flex-1 px-4 mx-4">
      <div className="w-full max-w-sm sm:max-w-lg md:w-lg lg:w-xl mx-auto flex flex-col items-center relative px-2 sm:px-4 min-h-screen">
        <div className="w-full flex flex-col items-center bg-gray-50 dark:bg-gray-900">
          <div className="w-full relative">
            <div className="w-full h-[150px] bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 z-20">
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-700 animate-pulse" />
            </div>
          </div>
          <div className="h-12"></div>
          <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 w-full">
            <div className="mt-4 text-center px-4 space-y-3">
              {/* Name skeleton */}
              <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto animate-pulse" />
              {/* Username skeleton */}
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mt-2 mx-auto animate-pulse" />
              {/* Bio skeleton */}
              <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mt-4 mx-auto animate-pulse" />

              {/* Stats skeleton */}
              <div className="flex justify-center mt-4 space-x-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                  <div className="w-14 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mt-1 animate-pulse" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                  <div className="w-14 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mt-1 animate-pulse" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                  <div className="w-14 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mt-1 animate-pulse" />
                </div>
              </div>

              {/* Buttons skeleton */}
              <div className="flex mt-4 w-full max-w-md mx-auto space-x-3">
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>

              {/* Points skeleton */}
              <div className="mt-4 w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />

              {/* Streak skeleton */}
              <div className="mt-3 w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto animate-pulse" />

              {/* Profile stats skeleton */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 animate-pulse" />
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 animate-pulse" />
                <div className="w-36 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              </div>
            </div>
          </div>

          {/* Tab bar skeleton */}
          <div className="flex w-full border justify-center border-gray-100 dark:border-gray-700 pt-2 px-2 sm:px-0">
            <div className="flex-1 flex items-center justify-center pb-2">
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
            <div className="flex-1 flex items-center justify-center pb-2">
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
          </div>

          <div className="px-2 sm:px-4 pt-2 w-full">
            {/* Post skeletons */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 w-full"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="ml-3 flex-1">
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mb-1 animate-pulse" />
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                  </div>
                </div>
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 animate-pulse" />
                <div className="flex justify-between">
                  <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ params, initialUser, initialPosts, initialPoints }) => {
  const router = useRouter();
  const resolvedParams = use(params);
  const usernameParam = resolvedParams?.username;
  const { user: currentUser, token, isAuthenticated } = useAuth();
  const { isUserOnline } = useActivityTracker();

  // State for resizable header
  const [headerHeight, setHeaderHeight] = useState(HEADER_MAX_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef(null);
  const resizeRef = useRef(null);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // State
  const [user, setUser] = useState(initialUser || null);
  const [posts, setPosts] = useState(initialPosts || []);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(
    initialUser?.followersCount || 0
  );
  const [followingCount, setFollowingCount] = useState(
    initialUser?.followingCount || 0
  );
  const [postsCount, setPostsCount] = useState(initialPosts?.length || 0);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);
  const [profileStats, setProfileStats] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [userPoints, setUserPoints] = useState(initialPoints || null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsLoaded, setPointsLoaded] = useState(!!initialPoints);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAmplifyModalVisible, setAmplifyModalVisible] = useState(false);
  const [postToAmplify, setPostToAmplify] = useState(null);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [postToComment, setPostToComment] = useState(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState();
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowersModalVisible, setIsFollowersModalVisible] = useState(false);
  const [isFollowingModalVisible, setIsFollowingModalVisible] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  // ADDED: New states for post menu interactions
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Loading guards
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPointsLoading, setIsPointsLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  const abortControllerRef = useRef(null);

  // Helper function to update posts array (compatible with post interactions)
  const updatePostData = useCallback((updaterOrNewPosts) => {
    if (typeof updaterOrNewPosts === "function") {
      setPosts((prevPosts) => {
        const updatedPosts = updaterOrNewPosts(prevPosts);
        return Array.isArray(updatedPosts) ? updatedPosts : prevPosts;
      });
    } else if (Array.isArray(updaterOrNewPosts)) {
      setPosts(updaterOrNewPosts);
    }
  }, []);

  // Post handlers with proper updatePostData function
  const postHandlers = useMemo(
    () =>
      createPostHandlers(
        currentUser,
        token,
        updatePostData,
        setPostToComment,
        setCommentModalVisible,
        setPostToAmplify,
        setAmplifyModalVisible,
        setPostToReport,
        setReportModalVisible
      ),
    [currentUser, token, updatePostData]
  );

  // Use the post interactions hook
  const { handleMenuOptionPress, loadPostMenuOptions } = usePostInteractions(
    currentUser,
    token,
    isAuthenticated,
    postHandlers,
    router,
    updatePostData
  );

  // Scroll handler with debouncing
  const handleScroll = useCallback(
    (e) => {
      const currentScrollY = e.target.scrollTop;
      setScrollY(currentScrollY);

      const deltaY = currentScrollY - lastScrollY;
      if (deltaY !== 0) {
        setHeaderHeight((prevHeight) => {
          let newHeight = prevHeight - deltaY * SCROLL_SENSITIVITY;
          newHeight = Math.max(
            HEADER_MIN_HEIGHT,
            Math.min(HEADER_MAX_HEIGHT, newHeight)
          );
          return newHeight;
        });
      }
      setLastScrollY(currentScrollY);
    },
    [lastScrollY]
  );

  // Header resize handlers
  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e) => {
      if (isResizing && headerRef.current) {
        const newHeight =
          e.clientY - headerRef.current.getBoundingClientRect().top;
        setHeaderHeight(
          Math.max(HEADER_MIN_HEIGHT, Math.min(HEADER_MAX_HEIGHT, newHeight))
        );
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // Profile image size calculation
  const profileImageSize = useMemo(
    () =>
      Math.max(PROFILE_IMAGE_MIN_SIZE, PROFILE_IMAGE_MAX_SIZE - scrollY * 0.6),
    [scrollY]
  );

  // Determine if viewing own profile
  useEffect(() => {
    if (currentUser && usernameParam) {
      setIsMyProfile(currentUser.username === usernameParam);
    } else {
      setIsMyProfile(false);
    }
  }, [currentUser?.username, usernameParam]);

  // FIXED: Fetch user posts with rate limit handling
  const fetchUserPosts = useCallback(
    async (userId, page = 1) => {
      if (!userId || isPostsLoading) {
        return;
      }

      setIsPostsLoading(true);
      setError(null);

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(
          `${API_ENDPOINTS.SOCIAL}/posts/user/${userId}?page=${page}&limit=${POST_LIMIT}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user posts: ${response.status} ${response.statusText}`
          );
        }

        const postsData = await response.json();
        const postsArray = postsData.posts || postsData.data || postsData || [];

        const formattedPosts = postsArray
          .map((post, index) => formatPostFromApi(post, index))
          .filter(Boolean);

        setHasMorePosts(formattedPosts.length === POST_LIMIT);

        setPosts((prevPosts) =>
          page === 1 ? formattedPosts : [...prevPosts, ...formattedPosts]
        );
        setPostPage(page);
        if (page === 1) {
          setPostsCount(
            postsData.totalCount || postsData.total || formattedPosts.length
          );
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setIsPostsLoading(false);
      }
    },
    [token]
  );

  // FIXED: Fetch user points
  const fetchUserPoints = useCallback(
    async (userId) => {
      if (!userId || isPointsLoading || pointsLoaded) return;

      setIsPointsLoading(true);
      setPointsLoading(true);

      try {
        setErrorMessage("");
        if (!token || !isAuthenticated) {
          setErrorMessage("Authentication required to fetch points.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const endpoint = isMyProfile
          ? `${API_ENDPOINTS.POINTS}/my-summary`
          : `${API_ENDPOINTS.POINTS}/summary/${userId}`;

        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          console.error(`Failed to fetch points: ${response.status}`);
          setErrorMessage(`Failed to fetch points: ${response.status}`);
          return;
        }

        const pointsData = await response.json();
        const levelInfo = {
          level: pointsData.level,
          title: pointsData.rank,
          minPoints: null,
          pointsToNext: isMyProfile ? pointsData.pointsToNextLevel : null,
        };

        setUserPoints({ ...pointsData, levelInfo });
      } catch (error) {
        setErrorMessage(`Failed to load points data: ${error.message}`);
        console.error("Error fetching points:", error);
      } finally {
        setPointsLoading(false);
        setPointsLoaded(true);
        setIsPointsLoading(false);
      }
    },
    [token, isAuthenticated, isMyProfile]
  );

  // Fetch followers list
  const fetchFollowers = useCallback(
    async (userId) => {
      if (!userId || !token) return;

      setFollowersLoading(true);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.SOCIAL}/followers/${userId}/followers?limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch followers");
        }

        const data = await response.json();

        // Add follow status for each follower
        let followersWithStatus = await Promise.all(
          data.followers.map(async (follower) => {
            // Mark current user
            const isCurrentUser = follower._id === currentUser?.userId;
            
            if (isCurrentUser) {
              return { 
                ...follower, 
                isFollowing: false, 
                isCurrentUser: true,
                username: currentUser.username || 'User',
                profilePicture: currentUser.profilePicture || defaultPic,
                fullname: currentUser.fullname || currentUser.username || 'User'
              };
            }

            try {
              const statusResponse = await fetch(
                `${API_ENDPOINTS.SOCIAL}/followers/${follower._id}/status`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const statusData = await statusResponse.json();
              return {
                ...follower,
                isFollowing: statusData.isFollowing,
                isCurrentUser: false,
                username: follower.username || 'User',
                profilePicture: follower.profilePicture || defaultPic,
                fullname: follower.fullname || follower.username || 'User'
              };
            } catch (error) {
              return { 
                ...follower,
                isFollowing: false, 
                isCurrentUser: false,
                username: follower.username || 'User',
                profilePicture: follower.profilePicture || defaultPic,
                fullname: follower.fullname || follower.username || 'User'
              };
            }
          })
        );

        // Sort the list to put current user at the top
        followersWithStatus.sort((a, b) => {
          if (a.isCurrentUser) return -1;
          if (b.isCurrentUser) return 1;
          return 0;
        });
        
        setFollowersList(followersWithStatus);
      } catch (error) {
        console.error("Error fetching followers:", error);
        toast.error("Failed to load followers");
      } finally {
        setFollowersLoading(false);
      }
    },
    [token, currentUser]
  );

  // Fetch following list
  const fetchFollowing = useCallback(
    async (userId) => {
      if (!userId || !token) return;

      setFollowingLoading(true);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.SOCIAL}/followers/${userId}/following?limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch following");
        }

        const data = await response.json();

        // Add follow status for each user being followed
        const followingWithStatus = await Promise.all(
          data.following.map(async (following) => {
            // Mark current user
            const isCurrentUser = following._id === currentUser?.userId;
            
            if (isCurrentUser) {
              return { 
                ...following, 
                isFollowing: false, 
                isCurrentUser: true 
              };
            }

            try {
              const statusResponse = await fetch(
                `${API_ENDPOINTS.SOCIAL}/followers/${following._id}/status`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const statusData = await statusResponse.json();
              return {
                ...following,
                isFollowing: statusData.isFollowing,
                isCurrentUser: false,
                username: following.username || 'User',
                profilePicture: following.profilePicture || defaultPic,
                fullname: following.fullname || following.username || 'User'
              };
            } catch (error) {
              return { 
                ...following,
                isFollowing: false, 
                isCurrentUser: false,
                username: following.username || 'User',
                profilePicture: following.profilePicture || defaultPic,
                fullname: following.fullname || following.username || 'User'
              };
            }
          })
        );

        // Sort the list to put current user at the top
        followingWithStatus.sort((a, b) => {
          if (a.isCurrentUser) return -1;
          if (b.isCurrentUser) return 1;
          return 0;
        });

        setFollowingList(followingWithStatus);
      } catch (error) {
        console.error("Error fetching following:", error);
        toast.error("Failed to load following");
      } finally {
        setFollowingLoading(false);
      }
    },
    [token, currentUser]
  );

  // FIXED: Fetch user profile - removed problematic dependencies
  const fetchUserProfile = useCallback(async () => {
    if (isProfileLoading) return;
    setIsProfileLoading(true);
    setPosts([]);
    setPostPage(1);
    setHasMorePosts(true);
    setError(null);

    try {
      if (isMyProfile && currentUser && currentUser._id) {
        const userData = {
          ...currentUser,
          name: currentUser.fullname || currentUser.username || "User",
          profilePicture: currentUser.profilePicture || defaultCover,
          coverPhoto: currentUser.coverPicture || defaultCover,
          bio: currentUser.bio || "",
          location: currentUser.location || "Not specified",
          website: currentUser.website || "Not specified",
          isVerified: currentUser.isVerified || false,
          createdAt: currentUser.createdAt || new Date().toISOString(),
          followersCount: currentUser.followersCount || 0,
          followingCount: currentUser.followingCount || 0,
        };
        setUser(userData);
        setFollowersCount(userData.followersCount || 0);
        setFollowingCount(userData.followingCount || 0);
        setIsFollowing(userData.isFollowing || false);

        const joined = new Date(userData.createdAt);
        const joinedDate = `${joined.toLocaleString("default", {
          month: "long",
        })} ${joined.getFullYear()}`;
        setProfileStats({
          joined: joinedDate,
          location: userData.location,
          website: userData.website,
          engagement: userData.engagement || "89%",
          responseRate: userData.responseRate || "94%",
        });

        // Call fetch functions directly without dependencies
        if (userData._id) {
          fetchUserPoints(userData._id);
          fetchUserPosts(userData._id);
        }
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const targetUsername = usernameParam || "";
      if (!targetUsername) {
        setErrorMessage("No username provided. Please try again.");
        setUser(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        `${API_ENDPOINTS.USER}/profiles/${targetUsername}`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setErrorMessage(
            "User not found. The username may be incorrect or the user may have deactivated their account."
          );
          setUser(null);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        } else if (response.status === 403) {
          setErrorMessage("You don't have permission to view this profile.");
          setUser(null);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        } else {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
      }

      const userData = await response.json();

      if (!userData || !userData._id) {
        setErrorMessage("Invalid user data received. Please try again.");
        setUser(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      setUser(userData);
      setFollowersCount(userData.followersCount || 0);
      setFollowingCount(userData.followingCount || 0);
      
      // Explicitly check follow status for non-profile owners
      if (!isMyProfile && isAuthenticated) {
        try {
          const followStatusResponse = await fetch(
            `${API_ENDPOINTS.SOCIAL}/followers/${userData._id}/status`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (followStatusResponse.ok) {
            const { isFollowing: followStatus } = await followStatusResponse.json();
            setIsFollowing(followStatus);
          }
        } catch (error) {
          console.error("Error checking follow status:", error);
          setIsFollowing(false);
        }
      } else {
        setIsFollowing(false);
      }

      const joined = new Date(userData.createdAt);
      const joinedDate = `${joined.toLocaleString("default", {
        month: "long",
      })} ${joined.getFullYear()}`;
      setProfileStats({
        joined: joinedDate,
        location: userData.location,
        website: userData.website,
        engagement: userData.engagement || "89%",
        responseRate: userData.responseRate || "94%",
      });

      // Call fetch functions directly
      if (userData._id) {
        fetchUserPoints(userData._id);
        fetchUserPosts(userData._id);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setErrorMessage(`Failed to load profile: ${error.message}`);
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsProfileLoading(false);
    }
  }, [usernameParam, token, isMyProfile, isProfileLoading]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users");
      return;
    }

    if (followLoading) return;

    const wasFollowing = isFollowing;
    setFollowLoading(true);

    // Clear any existing error states
    setError(null);
    
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowersCount((prev) => (wasFollowing ? prev - 1 : prev + 1));

    try {
      const endpoint = wasFollowing ? "unfollow" : "follow";
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/followers/${user._id}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${endpoint} user`);
      }

      const result = await response.json();
      
      // Double check the follow status after the action
      const followStatusResponse = await fetch(
        `${API_ENDPOINTS.SOCIAL}/followers/${user._id}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (followStatusResponse.ok) {
        const { isFollowing: currentStatus } = await followStatusResponse.json();
        setIsFollowing(currentStatus);
      }

      toast.success(
        wasFollowing
          ? "User unfollowed successfully"
          : "User followed successfully"
      );

      if (result.followersCount !== undefined) {
        setFollowersCount(result.followersCount);
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsFollowing(wasFollowing);
      setFollowersCount((prev) => (wasFollowing ? prev + 1 : prev - 1));

      console.error("Error updating follow status:", error);
      toast.error(
        `Failed to ${wasFollowing ? "unfollow" : "follow"} user: ${
          error.message
        }`
      );
    } finally {
      setFollowLoading(false);
    }
  };
  // Navigate to user profile
 

  // Follow/unfollow user in modal lists
  const handleModalFollowToggle = async (targetUser) => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users");
      return;
    }

    if (!targetUser?._id) {
      toast.error("Invalid user data");
      return;
    }

    // Optimistic update
    const wasFollowing = targetUser.isFollowing;

    // Update the followers list optimistically
    setFollowersList((prev) =>
      prev.map((user) =>
        user._id === targetUser._id
          ? { ...user, isFollowing: !wasFollowing }
          : user
      )
    );

    // Update the following list optimistically
    setFollowingList((prev) =>
      prev.map((user) =>
        user._id === targetUser._id
          ? { ...user, isFollowing: !wasFollowing }
          : user
      )
    );

    try {
      const endpoint = wasFollowing ? "unfollow" : "follow";
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/followers/${targetUser._id}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      // Update the followers list
      setFollowersList((prev) =>
        prev.map((user) =>
          user._id === targetUser._id
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      // Update the following list
      setFollowingList((prev) =>
        prev.map((user) =>
          user._id === targetUser._id
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      // Update profile counts if following/unfollowing the current profile user
      if (targetUser._id === user?._id) {
        setIsFollowing((prev) => !prev);
        setFollowersCount((prev) =>
          targetUser.isFollowing ? prev - 1 : prev + 1
        );
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast.error("Error", "Failed to update follow status. Please try again.");
    }
  };

  const handleShareProfile = async () => {
    try {
      toast.error(
        `Coming soon! Sharing profile for ${user?.username || "this user"}.`
      );
    } catch (error) {
      // Handle silently
    }
  };

  // FIXED: Handle refresh without circular dependencies
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPointsLoaded(false);
    setUserPoints(null);
    setHasFetched(false);
    setUser(null); // Reset user to trigger fresh fetch
    fetchUserProfile();
  }, [fetchUserProfile]);

  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (isPostsLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMorePosts && user?._id) {
          fetchUserPosts(user._id, postPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isPostsLoading, hasMorePosts, user?._id, postPage, fetchUserPosts]
  );

  // Load menu options when modal is visible
  useEffect(() => {
    if (!isModalVisible || !selectedPost || isLoadingOptions) {
      return;
    }

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const options = await loadPostMenuOptions(selectedPost);
        setFilteredOptions(options);
      } catch (error) {
        console.error("Error loading menu options:", error);
        const isOwnPost =
          isAuthenticated &&
          currentUser &&
          (selectedPost.user === currentUser._id ||
            selectedPost.userId === currentUser._id);
        const fallbackOptions = menuOptions.filter((option) => {
          if (option.text === "Delete Post") return isOwnPost;
          if (
            option.text === "Follow" ||
            option.text === "Unfollow" ||
            option.text === "Block"
          )
            return !isOwnPost;
          return true;
        });
        setFilteredOptions(fallbackOptions);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [
    isModalVisible,
    selectedPost?.id,
    isAuthenticated,
    currentUser?._id,
    loadPostMenuOptions,
  ]);

  // Handle menu option press with proper parameters
  const handleMenuPress = useCallback(
    (option) => {
      if (!selectedPost) {
        toast.error("No post selected");
        return;
      }

      handleMenuOptionPress(option, selectedPost, setModalVisible);
    },
    [selectedPost, handleMenuOptionPress]
  );

  // Handle comment success callback
  const handleCommentSuccess = useCallback(() => {
    setCommentModalVisible(false);
    toast.success("Comment posted successfully!");
    if (user?._id) {
      setHasFetched(false);
      fetchUserPosts(user._id);
    }
  }, [user?._id, fetchUserPosts]);

  // More options for profile menu
  const moreOptions = useMemo(
    () => [
      {
        icon: Flag,
        label: "Report User",
        onPress: () => {
          setIsMoreModalVisible(false);
          toast.error("Coming soon! Report functionality.");
        },
        danger: true,
        loading: false,
      },
      {
        icon: Ban,
        label: "Block User",
        onPress: () => {
          setIsMoreModalVisible(false);
          toast.error("Coming soon! Block functionality.");
        },
        danger: true,
        loading: false,
      },
      {
        icon: Share2,
        label: "Share Profile",
        onPress: () => {
          setIsMoreModalVisible(false);
          handleShareProfile();
        },
        danger: false,
        loading: false,
      },
    ],
    []
  );

  // FIXED: Main useEffect - only depends on usernameParam and isRefreshing
  useEffect(() => {
    if (!initialUser || isRefreshing) {
      fetchUserProfile();
    }
  }, [usernameParam, isRefreshing]);

  // FIXED: Simple initial load effect
  useEffect(() => {
    if (usernameParam && !user && !isLoading) {
      fetchUserProfile();
    }
  }, [usernameParam]);

  if (isLoading && !user) {
    return <ProfileSkeleton />;
  }

  if (!user && !isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="w-xl max-sm:w-100 px-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 dark:text-gray-200 text-3xl">😔</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
              {errorMessage ||
                "Sorry, we couldn't find this user. They may have deactivated their account or the username might be incorrect."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full px-4 py-2.5 bg-primary text-white rounded-full font-medium dark:hover:bg-sky-900 dark:hover:text-gray-200 transition-colors"
              >
                Go Back
              </button>
              <Link
                href="/home"
                className="block w-full px-4 py-2.5 bg-gray-200 text-gray-700 dark:text-gray-900 rounded-full font-medium hover:bg-gray-600 dark:hover:text-gray-200 transition-colors text-center"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center">
      <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-gray-50 dark:bg-gray-900 flex-1 px-4 mx-4 overflow-y-auto h-screen custom-scrollbar">
        <div className="w-full flex flex-col items-center bg-gray-50 dark:bg-gray-900"></div>
        {/* Scrollable Content */}
        <div
          className="w-full flex flex-col items-center bg-gray-50 dark:bg-gray-900 overflow-y-auto"
          style={{ width: "100%" }}
          onScroll={handleScroll}
        >
          {/* Cover Image */}
          <div className="w-full relative">
            <Image
              src={user?.coverPhoto || defaultCover}
              alt="Cover"
              className="w-full h-[150px] object-cover"
              width={1200}
              height={150}
              priority
            />

            {/* Profile Image */}
            <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 z-20">
              <motion.div
                className="border-4 border-gray-300 shadow-sm bg-gray-200 relative w-full"
                animate={{
                  height: profileImageSize,
                  width: profileImageSize,
                  borderRadius: profileImageSize / 2,
                }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <Image
                  src={user.profilePicture || defaultCover}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  width={PROFILE_IMAGE_MAX_SIZE}
                  height={PROFILE_IMAGE_MAX_SIZE}
                  priority
                />
                {/* Activity indicator dot -- positioned bottom-right */}
                {isFollowing && isUserOnline(user?._id) && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow"
                    title="User is active"
                  />
                )}
                
                {isMyProfile && (
                  <Link
                    href="/profile/edit"
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-white/80 dark:bg-gray-900 flex items-center justify-center"
                  >
                    <Edit2 className="text-primary text-sm" />
                  </Link>
                )}
              </motion.div>
            </div>
          </div>

          {/* Spacer to push content below profile image */}
          <div className="h-12"></div>

          {/* Profile Info */}
          <motion.div
            className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 w-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Profile Info */}
            <div className="mt-4 text-center px-4">
              <div className="flex items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-15">
                  {user.name || user.username || "User"}
                </h2>
                {user.isVerified && (
                  <Verified className="ml-2 text-primary text-xl" />
                )}
                {userPoints && (
                  <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-xs text-white font-bold">
                    LV.{userPoints.levelInfo.level}
                  </span>
                )}
              </div>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                @{user.username || "username"}
              </p>
              {user.bio && (
                <p className="text-gray-700 dark:text-gray-300 text-center mt-3 leading-5">
                  {user.bio}
                </p>
              )}
              <UserStats
                followersCount={followersCount}
                followingCount={followingCount}
                postsCount={postsCount}
                onPressFollowers={() => {
                  setIsFollowersModalVisible(true);
                  fetchFollowers(user._id);
                }}
                onPressFollowing={() => {
                  setIsFollowingModalVisible(true);
                  fetchFollowing(user._id);
                }}
              />
              <div className="flex mt-4 w-full max-w-md mx-auto space-x-3">
                {isMyProfile ? (
                  <>
                    <Link
                      href="/profile/edit"
                      className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-center text-gray-900 dark:text-gray-100 font-medium"
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleShareProfile}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <Share2 className="text-gray-600 dark:text-gray-400 text-lg" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`flex-1 cursor-pointer py-2.5 rounded-full text-center font-medium transition-colors disabled:opacity-50 ${
                        isFollowing
                          ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                          : "bg-primary text-white hover:bg-sky-600"
                      }`}
                    >
                      {followLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          <span className="ml-2">
                            {isFollowing ? "Unfollowing..." : "Following..."}
                          </span>
                        </div>
                      ) : isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                    {user._id && (
                      <Link
                        href={`/messages/chat/${user._id}`}
                        className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-center text-gray-900 dark:text-gray-100 font-medium"
                      >
                        Message
                      </Link>
                    )}
                    <button
                      onClick={() => setIsMoreModalVisible(true)}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <MoreHorizontal className="text-gray-600 dark:text-gray-400 text-lg" />
                    </button>
                  </>
                )}
              </div>
              {isAuthenticated && userPoints && (
                <>
                  <PointsDisplay points={userPoints} loading={pointsLoading} />
                  <StreakDisplay
                    consecutiveDays={userPoints.consecutiveLoginDays}
                  />
                </>
              )}
              {profileStats && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {user.location && (
                    <div className="flex items-center mb-2">
                      <MapPin className="text-gray-600 dark:text-gray-400 text-base" />
                      <span className="ml-2 text-gray-500 dark:text-gray-300">
                        {user.location}
                      </span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center mb-2">
                      <LinkIcon className="text-gray-600 dark:text-gray-400 text-base" />
                      <span className="ml-2 text-gray-500 dark:text-gray-300">
                        {user.website}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center mb-2">
                    <Calendar className="text-gray-600 dark:text-gray-400 text-base" />
                    <span className="ml-2 text-gray-500 dark:text-gray-300">
                      Joined {profileStats.joined}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <TabBarAnimated
            tabs={[
              { key: "posts", title: "Posts", icon: "grid" },
              { key: "media", title: "Media", icon: "image" },
            ]}
            activeTab={activeTab}
            onTabPress={setActiveTab}
            className="border-2 w-full flex justify-between"
          />

          <motion.div
            className="pt-2 w-full "
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeTab === "posts" && (
              <>
                {isPostsLoading && posts.length === 0 ? (
                  <div className="flex justify-center items-center py-12 w-full">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post, index) => (
                    <div
                      key={post.id || index}
                      ref={
                        posts.length === index + 1 ? lastPostElementRef : null
                      }
                    >
                      <PostCard
                        post={post}
                        handleLikePost={postHandlers.handleLikePost}
                        handleUnlikePost={postHandlers.handleUnlikePost}
                        handleDislikePost={postHandlers.handleDislikePost}
                        handleUndislikePost={postHandlers.handleUndislikePost}
                        handleCommentPost={postHandlers.handleCommentPost}
                        handleAmplifyPost={postHandlers.handleAmplifyPost}
                        handleBookmarkPost={postHandlers.handleBookmarkPost}
                        handleUnbookmarkPost={postHandlers.handleUnbookmarkPost}
                        setSelectedPost={setSelectedPost}
                        setModalVisible={setModalVisible}
                        username={currentUser?.username}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col max-w-xl items-center justify-center py-12">
                    <ImageIcon className="text-gray-300 dark:text-gray-500 text-5xl" />
                    <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                      No posts yet
                    </h3>
                    <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 mx-8">
                      {isMyProfile
                        ? "Start sharing your thoughts, photos, and experiences with the world."
                        : `${
                            user.username || "This user"
                          } hasn't posted anything yet.`}
                    </p>
                    {isMyProfile && (
                      <Link
                        href="/create"
                        className="mt-6 px-6 py-2.5 bg-primary rounded-full text-white font-medium"
                      >
                        Create First Post
                      </Link>
                    )}
                  </div>
                )}
                {isPostsLoading && posts.length > 0 && (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                )}
                {!hasMorePosts && posts.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    You've reached the end!
                  </div>
                )}
              </>
            )}
            {activeTab === "media" && (
              <GalleryGrid
                media={posts
                  .filter((post) => post.media && post.media.length > 0)
                  .flatMap((post) =>
                    post.media.map((uri, i) => ({ id: `${post.id}-${i}`, uri }))
                  )}
                onMediaPress={(item) => {
                  const post = posts.find((p) => item.id.startsWith(p.id));
                  if (post) {
                    router.push(`/home/post-detail?postId=${post.id}`);
                  }
                }}
                emptyStateMessage={
                  isMyProfile
                    ? "Share photos and videos with your followers."
                    : `${
                        user.username || "This user"
                      } hasn't posted any media yet.`
                }
              />
            )}
          </motion.div>
          <div className="h-20"></div>
        </div>

        {/* --- MODALS --- */}
        {/* Profile More Options Modal */}
        <CustomModal
          visible={isMoreModalVisible}
          onClose={() => setIsMoreModalVisible(false)}
          title="More Options"
        >
          <div className="p-4">
            {moreOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.onPress}
                disabled={option.loading}
                className={`w-full flex items-center p-3 rounded-xl text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  option.danger
                    ? "hover:bg-red-50 text-gray-600"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <option.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{option.label}</span>
                {option.loading && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CustomModal>

        {/* Post Options Modal */}
        <CustomModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title="Post Options"
        >
          <div className="p-4">
            {selectedPost && (
              <div className="flex items-center mb-4 p-3 truncate bg-gray-50 rounded-xl">
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
                  <p className="text-sm text-gray-500 truncate">
                    {selectedPost.content}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {isLoadingOptions ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Loading options...</span>
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={`${option.text}-${index}`}
                    onClick={() => handleMenuPress(option)}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-colors cursor-pointer ${
                      option.text === "Delete Post" ||
                      option.text === "Block" ||
                      option.text === "Report"
                        ? "hover:bg-red-50 text-red-600"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <option.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{option.text}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </CustomModal>

        {/* Comment Modal */}
        <CommentModal
          visible={isCommentModalVisible}
          onClose={() => setCommentModalVisible(false)}
          title="Add Comment"
          post={postToComment}
          onSuccess={handleCommentSuccess}
          token={token}
        />

        {/* Amplify Modal */}
        <AmplifyModal
          visible={isAmplifyModalVisible}
          onClose={() => setAmplifyModalVisible(false)}
          post={postToAmplify}
          token={token}
          onSuccess={() => {
            setAmplifyModalVisible(false);
            if (user?._id) {
              setHasFetched(false);
              fetchUserPosts(user._id);
            }
          }}
        />

        {/* Report Modal */}
        <ReportModal
          visible={isReportModalVisible}
          onClose={() => setReportModalVisible(false)}
          post={postToReport}
          token={token}
          onSuccess={() => {
            setReportModalVisible(false);
          }}
        />

        {/* Follower Modal */}
        <CustomModal
          visible={isFollowersModalVisible}
          onClose={() => setIsFollowersModalVisible(false)}
          title="Followers"
          showHeader={true}
          position="bottom"
        >
          {followersLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                Loading followers..
              </p>
            </div>
          ) : followersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-gray-100 rounded-full p-3 mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No followers yet
              </p>
              <p className="text-sm text-gray-500 text-center px-4 dark:text-gray-400">
                When people follow this account, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 p-4">
              {followersList.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center py-4 px-1 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/UserProfile/${follower.username}`);
                    setIsFollowersModalVisible(false);
                  }}
                >
                  <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                    <Image
                      src={follower.profilePicture || defaultPic}
                      alt={`${follower.username}'s profile`}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                      {follower.username}
                    </p>
                    {follower.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {follower.bio}
                      </p>
                    )}
                  </div>
                  {!follower.isCurrentUser && (
                    <button
                      className={`ml-3 px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 cursor-pointer ${
                        follower.isFollowing
                          ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                          : "bg-sky-500 text-white hover:bg-sky-600"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModalFollowToggle(follower);
                      }}
                    >
                      {follower.isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CustomModal>

        {/* Following Modal */}
        <CustomModal
          visible={isFollowingModalVisible}
          onClose={() => setIsFollowingModalVisible(false)}
          title="Following"
          showHeader={true}
          position="bottom"
        >
          {followingLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                Loading following...
              </p>
            </div>
          ) : followingList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-gray-100 rounded-full p-3 mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Not following anyone yet
              </p>
              <p className="text-sm text-gray-500 text-center px-4 dark:text-gray-400">
                When this account follows people, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 p-4">
              {followingList.map((following) => (
                <div
                  key={following._id}
                  className="flex items-center py-4 px-1 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/UserProfile/${following.username}`);
                    setIsFollowingModalVisible(false);
                  }}
                >
                  <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                    <Image
                      src={following.profilePicture || defaultPic}
                      alt={`${following.username}'s profile`}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                      {following.username}
                    </p>
                    {following.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {following.bio}
                      </p>
                    )}
                  </div>
                  {!following.isCurrentUser && (
                    <button
                      className={`ml-3 px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 cursor-pointer ${
                        following.isFollowing
                          ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                          : "bg-sky-500 text-white hover:bg-sky-600"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModalFollowToggle(following);
                      }}
                    >
                      {following.isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CustomModal>
      </div>
    </div>
  );
};

export default ProfilePage;
