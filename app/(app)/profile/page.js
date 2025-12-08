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
  Trash2,
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
  Settings,
  Shield,
  Archive,
  Clock,
} from "lucide-react";
import ReportModal from "@/app/components/ui/ReportModal";

const POST_LIMIT = 10;

// Window dimensions
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;
const PROFILE_IMAGE_MAX_SIZE = 120;
const PROFILE_IMAGE_MIN_SIZE = 40;
const SCROLL_SENSITIVITY = 0.5;

// Points Display Component
const PointsDisplay = ({ points, loading }) => {
  const router = useRouter();

  if (loading || !points) {
    return (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
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
    <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-sky-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div className="ml-3 cursor-pointer">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {points.totalPoints.toLocaleString() || 0}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Points</p>
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
          <div className="w-12 cursor-pointer h-12 bg-sky-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
            <PenLineIcon size={16} className="text-primary" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {points.creatorPoints || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Creator</p>
        </div>
        <div className="flex-1 text-center">
          <div className="w-12 cursor-pointer h-12 bg-green-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
            <Heart size={20} className="text-green-600" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {points.fanPoints || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Fan</p>
        </div>
        <div className="flex-1 text-center">
          <div className="cursor-pointer w-12 h-12 bg-yellow-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
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

// Streak Display Component
const StreakDisplay = ({ consecutiveDays }) => {
  if (!consecutiveDays || consecutiveDays === 0) return null;

  return (
    <div className="mt-3 flex items-center justify-center">
      <div className="flex items-center px-3 py-2 bg-orange-50 dark:bg-gray-800 rounded-full border border-orange-200 dark:border-gray-700">
        <Flame size={16} className="text-orange-600" />
        <span className="ml-2 text-orange-600 font-semibold">
          {consecutiveDays} Day Streak
        </span>
      </div>
    </div>
  );
};

// Tab Bar Component
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
            {tab.key === "archived" && (
              <Archive
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

// User Stats Component
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

// Gallery Grid Component
const GalleryGrid = ({ media, onMediaPress, emptyStateMessage }) => {
  if (!media || media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ImageIcon size={48} className="text-gray-300 dark:text-gray-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">No media yet</h3>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 mx-8">
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

// Profile Skeleton Component
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

const ProfilePage = ({ initialUser, initialPosts, initialPoints }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get("username");
  const { user: currentUser, token, isAuthenticated, logout } = useAuth();

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
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
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
  const [postToReport, setPostToReport] = useState(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [error, setError] = useState();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPointsLoading, setIsPointsLoading] = useState(false);
  const [profileData, setProfileData] = useState({ allowTagsFrom: "everyone" });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deleteUserDataOption, setDeleteUserDataOption] = useState(false);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [isArchivedLoading, setIsArchivedLoading] = useState(false);

  const abortControllerRef = useRef(null);
  const hasFetchedProfile = useRef(false);

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
        icon: <Share2 className="text-gray-600 dark:text-gray-400 text-xl" />,
        onPress: () =>
          toast.error(
            `Coming soon! Sharing profile for ${user?.username || "this user"}.`
          ),
      },
      {
        label: isMyProfile ? "Edit Profile" : "Report User",
        icon: isMyProfile ? (
          <Edit2 className="text-gray-600 dark:text-gray-400 text-xl" />
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

  // Fetch archived posts
  const fetchArchivedPosts = useCallback(
    async (userId) => {
      if (!userId || !token || !isMyProfile) return;

      setIsArchivedLoading(true);
      try {
        const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/archived`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch archived posts: ${response.status}`);
        }

        const postsData = await response.json();
        const postsArray = postsData.posts || postsData.data || postsData || [];
        const formattedPosts = postsArray
          .map((post, index) => formatPostFromApi(post, index, currentUser?._id))
          .filter(Boolean);

        setArchivedPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching archived posts:", error);
        toast.error("Failed to load archived posts.");
      } finally {
        setIsArchivedLoading(false);
      }
    },
    [token, isMyProfile, currentUser?._id]
  );

  // Archive Post handler
  const handleArchivePost = async (postId) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/posts/${postId}/archive`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Server returned an error" }));
        throw new Error(errorData.message || "Failed to archive post");
      }
      // Remove post from main posts and add to archivedPosts
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setPostsCount((prev) => prev - 1);
      const postToArchive = posts.find((p) => p.id === postId);
      if (postToArchive) {
        setArchivedPosts((prev) => [
          { ...postToArchive, isArchived: true },
          ...prev,
        ]);
      }
      toast.success("Post archived successfully.");
    } catch (error) {
      console.error("Error archiving post:", error);
      toast.error(`Failed to archive post: ${error.message}`);
    }
  };

  // Unarchive Post handler
  const handleUnarchivePost = async (postId) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/posts/${postId}/unarchive`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to unarchive post");
      }
      // Move post from archivedPosts to posts
      const postToUnarchive = archivedPosts.find((p) => p.id === postId);
      if (postToUnarchive) {
        setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
        setPosts((prev) => [{ ...postToUnarchive, isArchived: false }, ...prev]);
        setPostsCount((prev) => prev + 1);
      }
      toast.success("Post restored to your profile.");
    } catch (error) {
      console.error("Error unarchiving post:", error);
      toast.error("Failed to unarchive post.");
    }
  };

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

  // Fetch user points
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
  // Delete Account
  const handleDeleteAccount = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_ENDPOINTS.AUTH}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deleteUserData: deleteUserDataOption }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete account");
      router.push("/login");
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setSubmitting(false);
      setShowDeleteDialog(false);
    }
  };
  const handleDeactivateAccount = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_ENDPOINTS.AUTH}/deactivate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to deactivate account");
      toast.success(data.message);
      await logout();
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "Failed to deactivate account");
    } finally {
      setSubmitting(false);
      setShowDeactivateDialog(false);
    }
  };

  // Fetch user posts
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

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (isProfileLoading || hasFetchedProfile.current) return;

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
      setProfileData({ allowTagsFrom: userData.allowTagsFrom || "everyone" });

      const joined = new Date(userData.createdAt);
      const joinedDate = `${joined.toLocaleString("default", {
        month: "long",
      })} ${joined.getFullYear()}`;

      // Get today's day for dailyTimeSpent
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const today = new Date();
      const dayName = days[today.getDay().toString().toLocaleLowerCase()];
      const todaysTimeSpent = userData.dailyTimeSpent?.[dayName] || 0;
      setProfileStats({
        joined: joinedDate,
        location: userData.location,
        website: userData.website,
        engagement: userData.engagement || "89%",
        responseRate: userData.responseRate || "94%",
        lifeTimeSpent: userData.lifeTimeSpent || 0,
        todaysTimeSpent: todaysTimeSpent,
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
      hasFetchedProfile.current = true; // Mark initial fetch as complete
    }
  }, [
    usernameParam,
    currentUser?.username,
    token,
    fetchUserPoints,
    fetchUserPosts,
  ]);

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

  // Handle follow toggle
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

  // Handle modal follow toggle
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

      setFollowersList((prev) =>
        prev.map((user) =>
          user._id === targetUser._id
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      setFollowingList((prev) =>
        prev.map((user) =>
          user._id === targetUser._id
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

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

  // Handle share profile
  const handleShareProfile = async () => {
    try {
      toast.error(
        `Coming soon! Sharing profile for ${user?.username || "this user"}.`
      );
    } catch (error) {
      // Handle silently
    }
  };

  // Handle input change for allowTagsFrom
  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle update allowTagsFrom
  const handleUpdateAllowTagsFrom = async () => {
    if (!isAuthenticated || !token) {
      toast.error("Please login to update settings");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("allowTagsFrom", profileData.allowTagsFrom);

      const response = await fetch(`${API_ENDPOINTS.USER}/profiles`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update settings");
      }

      toast.success("Settings updated successfully");
      setIsSettingsModalVisible(false);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(error.message || "Failed to update settings");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPointsLoaded(false);
    setUserPoints(null);
    hasFetchedProfile.current = false; // Allow fetch on refresh
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Handle comment success
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
  if (user?._id && isMyProfile) {
    // console.log('Debug: Fetching archived posts for user:', user._id); // Debug log
    fetchArchivedPosts(user._id);
  }
}, [user?._id, isMyProfile, fetchArchivedPosts]);
  // Trigger initial profile fetch
  useEffect(() => {
    if (!hasFetchedProfile.current) {
      fetchUserProfile();
    }
  }, [usernameParam, currentUser?.username, token, fetchUserProfile]);

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
    <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center">
      <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-gray-50 dark:bg-gray-900 flex-1 px-4 mx-4 overflow-y-auto h-screen custom-scrollbar">
        <div className="w-full flex flex-col items-center bg-gray-50 dark:bg-gray-900">
          <div
            className="w-full flex flex-col items-center bg-gray-50 dark:bg-gray-900 overflow-y-auto"
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
                  className="border-4 border-gray-300 shadow-sm bg-gray-200 relative w-full"
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
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-white/80 dark:bg-gray-900 flex items-center justify-center cursor-pointer"
                    >
                      <Edit2 className="text-primary text-md" size={20} />
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="h-12"></div>

            <motion.div
              className="bg-white border-b border-gray-100 w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mt-4 text-center px-4 dark:bg-gray-900 dark:text-white">
                <div className="flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-gray-900 ml-15 dark:text-white">
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
                <p className="text-base text-gray-500 mt-1 ">
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
                <div className="flex mt-4 w-full max-w-md mx-auto space-x-3 ">
                  {isMyProfile ? (
                    <>
                      <Link
                        href="/profile/edit"
                        className="flex-1 py-2.5 bg-gray-100 rounded-full text-center text-gray-900 font-medium cursor-pointer dark:bg-gray-500 dark:text-white"
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => setIsSettingsModalVisible(true)}
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer dark:bg-gray-500 "
                      >
                        <Settings className="text-gray-600 text-lg dark:text-white" />
                      </button>
                      <button
                        onClick={handleShareProfile}
                        className="w-10 h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center dark:bg-gray-500"
                      >
                        <Share2 className="text-gray-600 text-lg dark:text-white" />
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
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {user.location && (
                      <div className="flex items-center mb-2 cursor-pointer">
                        <MapPin className="text-gray-600 dark:text-gray-400 text-base" />
                        <span className="ml-2 text-gray-500 dark:text-gray-300">
                          {user.location}
                        </span>
                      </div>
                    )}
                    {user?.website && (
                      <div className="flex items-center mb-2">
                        <LinkIcon className="text-gray-600 dark:text-gray-400 text-lg" />
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
                      <Calendar className="text-gray-600 dark:text-gray-400 cursor-pointer text-base" />
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
                ...(isMyProfile
                  ? [{ key: "archived", title: "Archived", icon: "archive" }]
                  : []),
              ]}
              activeTab={activeTab}
              onTabPress={setActiveTab}
              className="border-2 w-full flex justify-between"
            />

            <motion.div
              className="pt-2 cursor-pointer w-full"
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
                          handleArchivePost={handleArchivePost}
                          handleUnarchivePost={handleUnarchivePost}
                          setSelectedPost={setSelectedPost}
                          setModalVisible={setModalVisible}
                          handleDislikePost={postHandlers.handleDislikePost}
                          handleUndislikePost={postHandlers.handleUndislikePost}
                          allowArchivedOptions={false}
                          className="dark:border-gray-700"
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
                            // console.log('Debug: PostCard props:', { post, allowArchivedOptions });
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
              {activeTab === "archived" && isMyProfile && (
                <>
                  {isArchivedLoading ? (
                    <div className="flex justify-center items-center py-12 w-full">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : archivedPosts.length > 0 ? (
                    archivedPosts.map((post, index) => (
                      <div key={post.id || index}>
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
                          handleDislikePost={postHandlers.handleDislikePost}
                          handleUndislikePost={postHandlers.handleUndislikePost}
                          handleArchivePost={handleArchivePost}
                          handleUnarchivePost={handleUnarchivePost}
                          setSelectedPost={setSelectedPost}
                          setModalVisible={setModalVisible}
                          allowArchivedOptions={true}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 w-full min-h-[200px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9V7a5 5 0 0110 0v2m-1 4v4m-6-4v4"
                        />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-700">
                        No archived posts
                      </h3>
                      <p className="mt-2 text-center text-sm text-gray-500 mx-8">
                        Only you can see your archived posts. Use the post
                        options menu to archive something.
                      </p>
                    </div>
                  )}
                </>
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
                className="flex items-center py-4 border-b border-gray-100 dark:border-gray-700 w-full text-left"
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
          visible={isSettingsModalVisible}
          onClose={() => setIsSettingsModalVisible(false)}
          title="Profile Settings"
          position="bottom"
          className="sm:items-center"
        >
          <div className="bg-white p-6 rounded-t-3xl sm:rounded-3xl dark:bg-gray-900 dark:text-white">
            <div className="mb-6">
              <label className="text-base text-gray-700 mb-2 block font-medium dark:bg-gray-900 dark:text-white">
                Who can tag you in posts
              </label>
              <div className="w-full dark:bg-black dark:text-white">
                <select
                  className="w-full py-2 px-3 border cursor-pointer dark:bg-black dark:text-white border-gray-300 dark:border-gray-700 rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  value={profileData.allowTagsFrom || "everyone"}
                  onChange={(e) =>
                    handleInputChange("allowTagsFrom", e.target.value)
                  }
                >
                  <option value="everyone">Everyone</option>
                  <option value="followers">Only followers</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <button
                className="w-full py-2  cursor-pointer rounded bg-rose-100 text-rose-700 font-semibold hover:bg-rose-200 transition"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </button>
              <button
                className="w-full py-2 rounded cursor-pointer bg-amber-100 text-amber-700 font-semibold hover:bg-amber-200 transition"
                onClick={() => setShowDeactivateDialog(true)}
              >
                Deactivate Account
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setIsSettingsModalVisible(false)}
                className="w-full py-2 rounded bg-gray-100 cursor-pointer text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAllowTagsFrom}
                className={`w-full py-2 rounded bg-primary cursor-pointer text-white font-semibold hover:bg-sky-600 transition ${
                  submitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </CustomModal>
        {/* // ...existing code... */}
        {/* Delete Account Modal */}
        <CustomModal
          visible={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Delete Account"
        >
          <div className="py-4 px-6">
            <div className="flex items-center mb-4">
              <span className="text-lg font-semibold text-rose-500">
                Delete Account
              </span>
            </div>
            <p className="mb-4 text-gray-700">
              Are you sure you want to{" "}
              <span className="font-bold text-rose-400">delete</span> your
              account? This action{" "}
              <span className="font-bold">cannot be undone</span>.
            </p>
            <div className="mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteUserDataOption}
                  onChange={(e) => setDeleteUserDataOption(e.target.checked)}
                  className="cursor-pointer"
                />
                <span className="text-gray-700">Also delete my data</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-rose-400 text-white font-semibold cursor-pointer hover:bg-rose-500 transition"
                onClick={handleDeleteAccount}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </CustomModal>
        {/* Deactivate Account Modal */}
        <CustomModal
          visible={showDeactivateDialog}
          onClose={() => setShowDeactivateDialog(false)}
          title="Deactivate Account"
        >
          <div className="py-4 px-6">
            <div className="flex items-center mb-4">
              <span className="text-lg font-semibold text-amber-500">
                Deactivate Account
              </span>
            </div>
            <p className="mb-4 text-gray-700">
              Are you sure you want to{" "}
              <span className="font-bold text-amber-400">deactivate</span> your
              account? You can reactivate it by logging in again.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition"
                onClick={() => setShowDeactivateDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-amber-200 text-gray-900 font-semibold cursor-pointer hover:bg-amber-300 transition"
                onClick={handleDeactivateAccount}
                disabled={submitting}
              >
                {submitting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </CustomModal>
<CustomModal
  visible={isModalVisible}
  onClose={() => {
    console.log('Debug: Closing Post Options modal');
    setModalVisible(false);
  }}
  title="Post Options"
>
  <div className="bg-white p-4">
    {selectedPost && (
      <div className="flex items-center mb-4 p-3 truncate bg-gray-50 dark:bg-gray-700 rounded-xl">
        <Image
          src={selectedPost.profilePic || defaultPic}
          alt="Profile"
          className="w-10 h-10 rounded-full"
          width={40}
          height={40}
        />
        <div className="ml-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-300">
            {selectedPost.username}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-300">
            {selectedPost.timestamp}
          </p>
        </div>
      </div>
    )}
    {selectedPost && (
      <>
        <button
          className="flex items-center py-4 border-b border-gray-100 dark:border-gray-700 w-full text-left"
          onClick={() => {
            // console.log('Debug: Save Post clicked, postId:', selectedPost.id);
            setModalVisible(false);
            postHandlers.handleBookmarkPost(selectedPost.id);
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
          className="flex items-center py-4 border-b border-gray-100 dark:border-gray-700 w-full text-left"
          onClick={() => {
            // console.log('Debug: View Comments clicked, postId:', selectedPost.id);
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
        {isMyProfile && (
  <button
    className="flex items-center py-4 border-b border-gray-100 dark:border-gray-700 w-full text-left"
    onClick={() => {
      console.log(
        `Debug: ${selectedPost.isArchived ? "Unarchive" : "Archive"} Post clicked, postId:`,
        selectedPost.id
      );
      setModalVisible(false);
      if (selectedPost.isArchived) {
        handleUnarchivePost(selectedPost.id);
      } else {
        handleArchivePost(selectedPost.id);
      }
    }}
  >
    <div className="w-8">
      <Archive className="text-gray-600 text-xl" />
    </div>
    <span className="text-base text-gray-800 font-medium">
      {selectedPost.isArchived ? "Unarchive Post" : "Archive Post"}
    </span>
  </button>
)}
        <button
          className="flex items-center py-4 border-b border-gray-100 dark:border-gray-700 w-full text-left"
          onClick={() => {
            // console.log('Debug: Report Post clicked, postId:', selectedPost.id);
            setModalVisible(false);
            setPostToReport(selectedPost);
            setReportModalVisible(true);
          }}
        >
          <div className="w-8">
            <Flag className="text-red-500 text-xl" />
          </div>
          <span className="text-base text-red-500 font-medium">
            Report Post
          </span>
        </button>
        {isMyProfile && (
          <button
            className="flex items-center py-4 border-b border-gray-100 dark:border-gray-700 w-full text-left"
            onClick={() => {
              // console.log('Debug: Delete Post clicked, postId:', selectedPost.id);
              setModalVisible(false);
              if (confirm('Are you sure you want to delete this post?')) {
                postHandlers.handleDeletePost(selectedPost.id);
              }
            }}
          >
            <div className="w-8">
              <Trash2 className="text-red-500 text-xl" />
            </div>
            <span className="text-base text-red-500 font-medium">
              Delete Post
            </span>
          </button>
        )}
        <button
          onClick={() => {
            console.log('Debug: Cancel clicked in Post Options modal');
            setModalVisible(false);
          }}
          className="mt-4 py-3 bg-gray-100 rounded-full w-full text-center text-gray-700 font-medium"
        >
          Cancel
        </button>
      </>
    )}
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
              <p className="mt-4 text-gray-600 text-sm">Loading followers...</p>
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
            <div className="divide-y divide-gray-100 p-4">
              {followersList.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center py-4 px-1 hover:bg-gray-50"
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
            <div className="divide-y divide-gray-100 p-4">
              {followingList.map((following) => (
                <div
                  key={following._id}
                  className="flex items-center py-4 px-1 hover:bg-gray-50"
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
