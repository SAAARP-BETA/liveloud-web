"use client";
import defaultCover from "../../assets/Profilepic1.png";
import defaultPic from "../../assets/avatar.png";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
// import { fonts } from "../../utils/fonts";
import CustomModal from "../../components/ui/Modal";
import AmplifyModal from "../../components/ui/AmplifyModal";
import CommentModal from "../../components/ui/CommentModal";
import {
  createPostHandlers,
  formatPostFromApi,
} from "../../utils/postFunctions";
import PostCard from "../../components/ui/PostCard";
import { API_ENDPOINTS } from "../../utils/config";

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
  LinkIcon,
  Calendar,
  Grid,
  Trophy,
  Star,
  Heart,
  Edit2,
  CheckCircle as Verified,
  Loader2,
  PenLineIcon,
  Award,
  Users,
} from "lucide-react";
import ReportModal from "@/app/components/ui/ReportModal";

const POST_LIMIT = 10;

// Window dimensions
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;
const PROFILE_IMAGE_MAX_SIZE = 120;
const PROFILE_IMAGE_MIN_SIZE = 40;
const SCROLL_SENSITIVITY = 0.5;

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
    <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div className="ml-3 cursor-pointer">
            <h3 className="text-2xl font-bold text-gray-900">
              {points.totalPoints.toLocaleString() || 0}
            </h3>
            <p className="text-xs text-gray-600">Total Points</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">
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
          <span className="text-xs text-gray-600">
            Progress to Level {currentLevel.level + 1}:
          </span>
          <span className="text-xs text-gray-600">
            {Math.max(
              0,
              currentLevel.pointsToNext -
                (points.totalPoints - currentLevel.minPoints)
            )}{" "}
            pts to go
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex-1 text-center">
          <div className="w-12 cursor-pointer h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <PenLineIcon size={16} className="text-primary" />
          </div>
          <p className="text-base font-bold text-gray-900">
            {points.creatorPoints || 0}
          </p>
          <p className="text-xs text-gray-600">Creator</p>
        </div>
        <div className="flex-1 text-center">
          <div className="w-12 cursor-pointer h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <Heart size={20} className="text-green-600" />
          </div>
          <p className="text-base font-bold text-gray-900">
            {points.fanPoints || 0}
          </p>
          <p className="text-xs text-gray-600">Fan</p>
        </div>
        <div className="flex-1 text-center">
          <div className="cursor-pointer w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <Star size={20} className="text-yellow-600" />
          </div>
          <p className="text-base font-bold text-gray-900">
            {points.bonusPoints || 0}
          </p>
          <p className="text-xs text-gray-600">Bonus</p>
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
    <div className="flex w-full border justify-center gap-25 border-gray-100 pt-2">
      {" "}
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
                  activeTab === tab.key ? "text-primary" : "text-gray-500"
                }
              />
            )}
            {tab.key === "media" && (
              <ImageIcon
                size={18}
                className={
                  activeTab === tab.key ? "text-primary" : "text-gray-500"
                }
              />
            )}
            <span
              className={`ml-1 text-sm font-medium ${
                activeTab === tab.key ? "text-primary" : "text-gray-500"
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

// --- FIX: Added cursor-pointer to clickable stat buttons ---
const UserStats = ({
  followersCount,
  followingCount,
  postsCount,
  onPressFollowers,
  onPressFollowing,
}) => {
  return (
    <div className="flex justify-center mt-4 space-x-6">
      <button className="text-center cursor-pointer" onClick={onPressFollowers}>
        <div className="text-lg font-bold text-gray-800">{followersCount}</div>
        <div className="text-sm text-gray-500">Followers</div>
      </button>
      <button className="text-center cursor-pointer" onClick={onPressFollowing}>
        <div className="text-lg font-bold text-gray-800">{followingCount}</div>
        <div className="text-sm text-gray-500">Following</div>
      </button>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-800">{postsCount}</div>
        <div className="text-sm text-gray-500">Posts</div>
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

// Profile Skeleton Component (FIXED)
const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Use the same container structure as ProfilePage */}
      <div className="w-full max-w-sm sm:max-w-lg md:w-lg lg:w-xl mx-auto flex flex-col items-center relative px-2 sm:px-4 min-h-screen">
        <div className="w-full flex flex-col items-center bg-gray-50">
          <div className="w-full relative">
            {/* Cover photo skeleton */}
            <div className="w-full h-[150px] bg-gray-200 animate-pulse" />

            {/* Profile image skeleton - positioned like the real component */}
            <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 z-20">
              <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white animate-pulse" />
            </div>
          </div>

          <div className="h-12"></div>

          {/* Content skeleton matching the real component structure */}
          <div className="bg-white border-b border-gray-100 w-full">
            <div className="mt-4 text-center px-4">
              {/* Name skeleton */}
              <div className="w-32 h-6 bg-gray-200 rounded-md mx-auto animate-pulse" />
              {/* Username skeleton */}
              <div className="w-24 h-4 bg-gray-200 rounded-md mt-2 mx-auto animate-pulse" />
              {/* Bio skeleton */}
              <div className="w-48 h-4 bg-gray-200 rounded-md mt-4 mx-auto animate-pulse" />

              {/* Stats skeleton */}
              <div className="flex justify-center mt-4 space-x-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-6 bg-gray-200 rounded-md animate-pulse" />
                  <div className="w-14 h-4 bg-gray-200 rounded-md mt-1 animate-pulse" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-6 bg-gray-200 rounded-md animate-pulse" />
                  <div className="w-14 h-4 bg-gray-200 rounded-md mt-1 animate-pulse" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-6 bg-gray-200 rounded-md animate-pulse" />
                  <div className="w-14 h-4 bg-gray-200 rounded-md mt-1 animate-pulse" />
                </div>
              </div>

              {/* Buttons skeleton */}
              <div className="flex mt-4 w-full max-w-md mx-auto space-x-3">
                <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* Points skeleton */}
              <div className="mt-4 w-full h-32 bg-gray-200 rounded-xl animate-pulse" />

              {/* Streak skeleton */}
              <div className="mt-3 w-32 h-8 bg-gray-200 rounded-full mx-auto animate-pulse" />

              {/* Profile stats skeleton */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="w-40 h-4 bg-gray-200 rounded-md mb-2 animate-pulse" />
                <div className="w-32 h-4 bg-gray-200 rounded-md mb-2 animate-pulse" />
                <div className="w-36 h-4 bg-gray-200 rounded-md animate-pulse" />
              </div>
            </div>
          </div>

          {/* Tab bar skeleton */}
          <div className="flex w-full border justify-center border-gray-100 pt-2 px-2 sm:px-0">
            <div className="flex-1 flex items-center justify-center pb-2">
              <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse" />
            </div>
            <div className="flex-1 flex items-center justify-center pb-2">
              <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Content area skeleton - FIXED to maintain full width */}
          <div className="px-2 sm:px-4 pt-2 w-full">
            {/* Post skeletons */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="mb-4 p-4 bg-white rounded-xl border border-gray-100 w-full"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="ml-3 flex-1">
                    <div className="w-24 h-4 bg-gray-200 rounded-md mb-1 animate-pulse" />
                    <div className="w-16 h-3 bg-gray-200 rounded-md animate-pulse" />
                  </div>
                </div>
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 animate-pulse" />
                <div className="flex justify-between">
                  <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
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

const ProfilePage = ({ initialUser, initialPosts, initialPoints }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get("username");
  const { user: currentUser, token, isAuthenticated } = useAuth();

  // State for resizable header
  const [headerHeight, setHeaderHeight] = useState(HEADER_MAX_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef(null);
  const resizeRef = useRef(null);

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
  const [isFollowersModalVisible, setIsFollowersModalVisible] = useState(false);
  const [isFollowingModalVisible, setIsFollowingModalVisible] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [postsCount, setPostsCount] = useState(initialUser?.postsCount || 0);
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
  const [errorMessage, setErrorMessage] = useState(null);
  // Report modal
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [postToReport, setPostToReport] = useState(null);

  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [error, setError] = useState();

  // Loading guards
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPointsLoading, setIsPointsLoading] = useState(false);

  const abortControllerRef = useRef(null);

  // Post handlers
  const postHandlers = useMemo(
    () =>
      createPostHandlers(
        currentUser,
        token,
        setPosts,
        setPostToComment,
        setCommentModalVisible,
        setPostToAmplify,
        setAmplifyModalVisible
      ),
    [currentUser, token]
  );

  // More options
  const moreOptions = useMemo(
    () => [
      {
        label: "Share Profile",
        icon: <Share2 className="text-gray-600 text-xl" />,
        onPress: () =>
          toast.error(
            `Coming soon! Sharing profile for ${user?.username || "this user"}.`
          ),
      },
      {
        label: isMyProfile ? "Edit Profile" : "Report User",
        icon: isMyProfile ? (
          <Edit2 className="text-gray-600 text-xl" />
        ) : (
          <Flag className="text-red-500 text-xl" />
        ),
        onPress: isMyProfile
          ? () => router.push("/profile/edit")
          : () => {
              if (confirm("Are you sure you want to report this user?")) {
                toast.success("Thank you for your report.");
              }
            },
        danger: !isMyProfile,
      },
    ],
    [isMyProfile, user?.username]
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
    } else if (currentUser && !usernameParam) {
      setIsMyProfile(true);
    } else {
      setIsMyProfile(false);
    }
  }, [currentUser?.username, usernameParam]);

  const fetchUserPosts = useCallback(
    async (userId, page) => {
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
    [token, isPostsLoading]
  );

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
    [token, isAuthenticated, isMyProfile, isPointsLoading, pointsLoaded]
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
        const followersWithStatus = await Promise.all(
          data.followers.map(async (follower) => {
            if (follower._id === currentUser?.userId) {
              return { ...follower, isFollowing: false, isCurrentUser: true };
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
              };
            } catch (error) {
              return { ...follower, isFollowing: false, isCurrentUser: false };
            }
          })
        );

        setFollowersList(followersWithStatus);
      } catch (error) {
        console.error("Error fetching followers:", error);
        toast.error("Error", "Failed to load followers");
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
            if (following._id === currentUser?.userId) {
              return { ...following, isFollowing: false, isCurrentUser: true };
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
              };
            } catch (error) {
              return { ...following, isFollowing: false, isCurrentUser: false };
            }
          })
        );

        setFollowingList(followingWithStatus);
      } catch (error) {
        console.error("Error fetching following:", error);
        toast.error("Error", "Failed to load following");
      } finally {
        setFollowingLoading(false);
      }
    },
    [token, currentUser]
  );

  const fetchUserProfile = useCallback(async () => {
    if (isProfileLoading) return;

    setIsProfileLoading(true);
    setPosts([]);
    setPostPage(1);
    setHasMorePosts(true);

    try {
      const targetUsername =
        usernameParam || (currentUser && currentUser.username) || "";
      if (!targetUsername) {
        setErrorMessage("No username provided.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        `${API_ENDPOINTS.USER}/profiles/${targetUsername}`,
        { headers }
      );

      if (!response.ok)
        throw new Error(`Failed to fetch profile: ${response.status}`);

      const userData = await response.json();
      if (!userData || !userData._id) {
        throw new Error("Invalid user data received from API");
      }

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

      fetchUserPoints(userData._id);
      fetchUserPosts(userData._id, 1);
    } catch (error) {
      setErrorMessage(`Failed to load profile: ${error.message}`);
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsProfileLoading(false);
    }
  }, [
    usernameParam,
    currentUser?.username,
    token,
    isProfileLoading,
    fetchUserPoints,
    fetchUserPosts,
  ]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users");
      return;
    }

    const wasFollowing = isFollowing;

    try {
      setIsFollowing(!wasFollowing);
      setFollowersCount((prev) => (wasFollowing ? prev - 1 : prev + 1));

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
        throw new Error("Failed to update follow status");
      }
    } catch (error) {
      setIsFollowing(wasFollowing);
      setFollowersCount((prev) => (wasFollowing ? prev + 1 : prev - 1));
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow status. Please try again.");
    }
  };

  // Follow/unfollow user in modal lists
  const handleModalFollowToggle = async (targetUser) => {
    if (!isAuthenticated) {
      toast.error("Login Required", "Please login to follow users");
      return;
    }

    try {
      const endpoint = targetUser.isFollowing ? "unfollow" : "follow";
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

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPointsLoaded(false);
    setUserPoints(null);
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleCommentSuccess = () => {
    if (postToComment) {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postToComment.id) {
            return { ...post, commentCount: post.commentCount + 1 };
          }
          return post;
        })
      );
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [usernameParam]);

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

  if (isLoading || (!initialUser && !user)) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        {errorMessage || "User not found"}
      </div>
    );
  }
  const handleReportSuccess = (reportedPostId) => {
    const updatedPosts = getCurrentTabData().posts.filter(
      (post) => post.id !== reportedPostId
    );
    updateTabData(activeTab, { posts: updatedPosts });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm sm:max-w-lg md:w-lg lg:w-xl mx-auto flex flex-col items-center relative px-2 sm:px-4 min-h-screen">
        <div className="w-full flex flex-col items-center bg-gray-50">
          <div
            className="w-full flex flex-col items-center bg-gray-50 overflow-y-auto"
            style={{ width: "100%" }}
            onScroll={handleScroll}
          >
            <div className="w-full relative">
              <Image
                src={user?.coverPhoto || defaultCover}
                alt="Cover"
                className="w-full h-[150px] object-cover"
                width={1200}
                height={150}
                priority
              />

              <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 z-20">
                <motion.div
                  className="border-4 border-white shadow-sm bg-white relative w-full"
                  animate={{
                    height: profileImageSize,
                    width: profileImageSize,
                    borderRadius: profileImageSize / 2,
                  }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <Image
                    src={user?.profilePicture || defaultPic}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    width={PROFILE_IMAGE_MAX_SIZE}
                    height={PROFILE_IMAGE_MAX_SIZE}
                    priority
                  />
                  {isMyProfile && (
                    <Link
                      href="/profile/edit"
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-white/80 flex items-center justify-center cursor-pointer"
                    >
                      <Edit2 className=" text-primary text-md" size={20} />
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="h-12"></div>

            <motion.div
              className="bg-white border-b border-gray-100 w-full"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mt-4 text-center px-4">
                <div className="flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-gray-900 ml-15">
                    {user.fullname || "User"}
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
                <p className="text-base text-gray-500 mt-1">
                  @{user.username || "username"}
                </p>
                {user.bio && (
                  <p className="text-gray-700 text-center mt-3 leading-5">
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
                        className="flex-1 py-2.5 bg-gray-100 rounded-full text-center text-gray-900 font-medium cursor-pointer"
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={handleShareProfile}
                        className="w-10 h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center"
                      >
                        <Share2 className="text-gray-600 text-lg" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleFollowToggle}
                        className={` cursor-pointer flex-1 py-2.5 rounded-full text-center font-medium ${
                          isFollowing
                            ? "bg-gray-100 text-gray-900"
                            : "bg-primary text-white"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                      {user._id && (
                        <Link
                          href={`/messages/chat/${user._id}`}
                          className="flex-1 py-2.5 bg-gray-100 rounded-full text-center text-gray-900 font-medium cursor-pointer"
                        >
                          Message
                        </Link>
                      )}
                      <button
                        onClick={() => setIsMoreModalVisible(true)}
                        className="w-10 h-10 bg-gray-100 rounded-full flex cursor-pointer items-center justify-center"
                      >
                        <MoreHorizontal className="text-gray-600 text-lg" />
                      </button>
                    </>
                  )}
                </div>

                {/* Premium Button for User's Own Profile */}
                {isMyProfile && (
                  <button
                    onClick={() => router.push("/premium")}
                    className="mt-3 w-full py-3 rounded-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 active:bg-sky-700 transition-colors duration-200 shadow-md hover:shadow-lg active:shadow-sm cursor-pointer"
                    style={{
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Award size={18} className="text-white" />
                    <span className="text-white ml-2 font-medium">
                      Upgrade to Premium
                    </span>
                  </button>
                )}

                {isAuthenticated && userPoints && (
                  <>
                    <PointsDisplay
                      points={userPoints}
                      loading={pointsLoading}
                    />
                    <StreakDisplay
                      consecutiveDays={userPoints.consecutiveLoginDays}
                    />
                  </>
                )}
                {profileStats && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    {user.location && (
                      <div className="flex items-center mb-2 cursor-pointer">
                        <MapPin className="text-gray-600 text-base" />
                        <span className="ml-2 text-gray-500">
                          {user.location}
                        </span>
                      </div>
                    )}
                    {/* --- FIX: Made website a clickable link --- */}
                    {user?.website && (
                      <div className="flex items-center mb-2">
                        <LinkIcon className="text-gray-600 text-lg" />
                        <Link
                          href={
                            user.website.startsWith("http")
                              ? user.website
                              : `https://${user.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-sky-400 hover:underline transition-colors"
                        >
                          {user.website}
                        </Link>
                      </div>
                    )}
                    <div className="flex items-center mb-2">
                      <Calendar className="text-gray-600 cursor-pointer text-base" />
                      <span className="ml-2 text-gray-500">
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
              className="border-2 w-full flex  justify-between"
            />

            <motion.div
              className=" pt-2 cursor-pointer w-full"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {activeTab === "posts" && (
                <>
                  {isPostsLoading && posts.length === 0 ? (
                    <div className="flex cursor-pointer justify-center items-center py-12 w-full">
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
                          handleCommentPost={postHandlers.handleCommentPost}
                          handleAmplifyPost={postHandlers.handleAmplifyPost}
                          handleBookmarkPost={postHandlers.handleBookmarkPost}
                          handleUnbookmarkPost={
                            postHandlers.handleUnbookmarkPost
                          }
                          setSelectedPost={setSelectedPost}
                          setModalVisible={setModalVisible}
                          handleDislikePost={postHandlers.handleDislikePost}
                          handleUndislikePost={postHandlers.handleUndislikePost}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex cursor-pointer flex-col items-center justify-center py-12 w-full min-h-[200px]">
                      <ImageIcon className="cursor-pointer text-gray-300 text-5xl" />
                      <h3 className="mt-4 text-lg font-medium text-gray-700">
                        No posts yet
                      </h3>
                      <p className="mt-2 text-center text-sm text-gray-500 mx-8">
                        {isMyProfile
                          ? "Start sharing your thoughts, photos, and experiences with the world."
                          : `${
                              user.username || "This user"
                            } hasn't posted anything yet.`}
                      </p>
                      {isMyProfile && (
                        <Link
                          href="/create-post"
                          className="mt-6 px-6 py-2.5 bg-primary rounded-full text-white font-medium cursor-pointer"
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
                      post.media.map((uri, i) => ({
                        id: `${post.id}-${i}`,
                        uri,
                      }))
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
        </div>
        <CustomModal
          visible={isMoreModalVisible}
          onClose={() => setIsMoreModalVisible(false)}
          title="More Options"
        >
          <div className="bg-white p-4">
            {moreOptions.map((option, index) => (
              <button
                key={index}
                className="flex items-center py-4 border-b border-gray-100 w-full text-left"
                onClick={() => {
                  setIsMoreModalVisible(false);
                  setTimeout(() => option.onPress(), 300);
                }}
              >
                <div className="w-8">{option.icon}</div>
                <span
                  className={`text-base ${
                    option.danger ? "text-red-500" : "text-gray-800"
                  } font-medium`}
                >
                  {option.label}
                </span>
              </button>
            ))}
            <button
              onClick={() => setIsMoreModalVisible(false)}
              className="mt-4 py-3 bg-gray-100 rounded-full w-full text-center text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </CustomModal>
        <CustomModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title="Post Options"
        >
          <div className="bg-white p-4">
            {selectedPost && (
              <div className="flex items-center mb-4 p-3 truncate bg-gray-50 rounded-xl">
                <Image
                  src={selectedPost.profilePic || defaultPic}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                  width={40}
                  height={40}
                />
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-800">
                    {selectedPost.username}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedPost.timestamp}
                  </p>
                </div>
              </div>
            )}
            <button
              className="flex items-center py-4 border-b border-gray-100 w-full text-left"
              onClick={() => {
                setModalVisible(false);
                if (selectedPost) {
                  postHandlers.handleBookmarkPost(selectedPost.id);
                }
              }}
            >
              <div className="w-8">
                <Bookmark className="text-gray-600 text-xl" />
              </div>
              <span className="text-base text-gray-800 font-medium">
                Save Post
              </span>
            </button>
            <button
              // href={`/home/post-detail?postId=${selectedPost?.id}`}
              className="flex items-center py-4 border-b border-gray-100 w-full text-left"
              onClick={() => {
                setModalVisible(false);
                postHandlers.handleCommentPost(selectedPost.id);
              }}
            >
              <div className="w-8">
                <MessageCircle className="text-gray-600 text-xl" />
              </div>
              <span className="text-base text-gray-800 font-medium">
                View Comments
              </span>
            </button>
            {/* <button
              className="flex items-center py-4 border-b border-gray-100 w-full text-left"
              onClick={() => {
                setModalVisible(false);
                if (confirm("Are you sure you want to report this post?")) {
                  toast.success("Thank you for your report.");
                }
              }}
            >
              <div className="w-8">
                <Flag className="text-gray-600 text-xl" />
              </div>
              <span className="text-base text-red-500 font-medium">
                Report Post
              </span>
            </button> */}
            <button
              onClick={() => setModalVisible(false)}
              className="mt-4 py-3 bg-gray-100 rounded-full w-full text-center text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </CustomModal>
        <AmplifyModal
          isVisible={isAmplifyModalVisible}
          onClose={() => setAmplifyModalVisible(false)}
          post={postToAmplify}
          token={token}
          onSuccess={() => {
            setAmplifyModalVisible(false);
            fetchUserProfile();
          }}
        />
        {/* Comment Modal */}
        <CommentModal
          visible={isCommentModalVisible}
          onClose={() => setCommentModalVisible(false)}
          title="Add Comment"
          post={postToComment}
          onSuccess={handleCommentSuccess}
          token={token}
        ></CommentModal>
        {/* Amplify Modal */}
        <AmplifyModal
          visible={isAmplifyModalVisible}
          onClose={() => setAmplifyModalVisible(false)}
          post={postToAmplify}
          token={token}
          title="Amplify Post"
          onSuccess={(postId) => {
            // Update amplify count in current posts
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
        ></AmplifyModal>
        {/* Report Modal */}
        <ReportModal
          visible={isReportModalVisible}
          onClose={() => setReportModalVisible(false)}
          title="Report Post"
          post={postToReport}
          onSuccess={handleReportSuccess}
          token={token}
        ></ReportModal>

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
              <p className="mt-4 text-gray-600 text-sm">Loading following...</p>
            </div>
          ) : followersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-gray-100 rounded-full p-3 mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                No followers yet
              </p>
              <p className="text-sm text-gray-500 text-center px-4">
                When people follow this account, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 p-4">              {followersList
                .sort((a, b) => {
                  // Sort by current user first
                  if (a.isCurrentUser && !b.isCurrentUser) return -1;
                  if (!a.isCurrentUser && b.isCurrentUser) return 1;
                  return 0;
                })
                .map((follower) => (
                  <div
                    key={follower._id}
                    onClick={() => {
                      router.push(`/UserProfile/${follower.username}`);
                      setIsFollowersModalVisible(false);
                    }}
                    className="flex items-center py-4 px-1 hover:bg-gray-50 cursor-pointer"
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
                    <p className="text-base font-medium text-gray-900 truncate">
                      {follower.username}
                    </p>
                    {follower.bio && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
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
                      onClick={() => handleModalFollowToggle(follower)}
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
              <p className="mt-4 text-gray-600 text-sm">Loading following...</p>
            </div>
          ) : followingList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-gray-100 rounded-full p-3 mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Not following anyone yet
              </p>
              <p className="text-sm text-gray-500 text-center px-4">
                When this account follows people, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 p-4 ">
              {followingList.map((following) => (
                <div
                  key={following._id}
                  onClick={() => {
                      router.push(`/UserProfile/${following.username}`);
                      setIsFollowingModalVisible(false);
                    }}
                  className="flex items-center py-4 px-1 hover:bg-gray-50 cursor-pointer"
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
                    <p className="text-base font-medium text-gray-900 truncate">
                      {following.username}
                    </p>
                    {following.bio && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
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
                      onClick={() => handleModalFollowToggle(following)}
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
