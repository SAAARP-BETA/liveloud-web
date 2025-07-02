"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ArrowLeft,
  Edit2,
  MapPin,
  Link,
  Calendar,
  Grid,
  Image as ImageIcon,
  FileText,
  Flag,
  XCircle,
  Trophy,
  Star,
  Flame,
  CheckCircle,
  QrCode,
  Trash2,
  Copy,
  Repeat2,
} from "lucide-react";

// Points Display Component (unchanged)
const PointsDisplay = ({ points, loading }) => {
  if (loading || !points) {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-xl">
        <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  const levelInfo = points.levelInfo || {
    level: 1,
    title: "Newcomer",
    pointsToNext: 100,
  };
  const progressPercentage = Math.min(
    ((points.totalPoints % levelInfo.pointsToNext) / levelInfo.pointsToNext) *
      100,
    100
  );

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div className="ml-3">
            <p className="text-2xl font-bold text-gray-900">
              {points.totalPoints.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Total Points</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">
              Level {levelInfo.level}
            </span>
            <div className="ml-2 px-2 py-1 bg-sky-500 rounded-full">
              <span className="text-xs font-medium text-white">
                {levelInfo.title}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-600">
            Progress to Level {levelInfo.level + 1}
          </span>
          <span className="text-xs text-gray-600">
            {Math.max(
              0,
              levelInfo.pointsToNext -
                (points.totalPoints % levelInfo.pointsToNext)
            )}{" "}
            pts to go
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="text-center flex-1">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1 mx-auto">
            <Edit2 size={20} className="text-blue-600" />
          </div>
          <p className="text-base font-bold text-gray-900">
            {points.creatorPoints || 0}
          </p>
          <p className="text-xs text-gray-600">Creator</p>
        </div>
        <div className="text-center flex-1">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1 mx-auto">
            <Heart size={20} className="text-green-600" />
          </div>
          <p className="text-base font-bold text-gray-900">
            {points.fanPoints || 0}
          </p>
          <p className="text-xs text-gray-600">Fan</p>
        </div>
        <div className="text-center flex-1">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-1 mx-auto">
            <Star size={20} className="text-yellow-600" />
          </div>
          <p className="text-base font-bold text-gray-900">
            {points.bonusPoints || 0}
          </p>
          <p className="text-xs text-gray-600">Bonus</p>
        </div>
      </div>
      <button className="mt-3 w-full py-2 bg-sky-500 rounded-lg text-white text-sm font-medium hover:bg-sky-600 transition-colors">
        Leaderboard
      </button>
    </div>
  );
};

// Streak Display Component (unchanged)
const StreakDisplay = ({ consecutiveDays }) => {
  if (!consecutiveDays || consecutiveDays === 0) return null;

  return (
    <div className="mt-3 flex justify-center">
      <div className="flex items-center px-3 py-2 bg-orange-50 rounded-full border border-orange-200">
        <Flame size={16} className="text-orange-600" />
        <span className="ml-2 text-orange-600 font-semibold">
          {consecutiveDays} Day Streak
        </span>
      </div>
    </div>
  );
};

// Post Card Component (unchanged)
const PostCard = ({
  post,
  onLike,
  onComment,
  onAmplify,
  onBookmark,
  onMore,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden transition-shadow">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={post.profilePic}
            alt={post.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3">
            <div className="flex items-center">
              <span className="font-semibold text-gray-900">
                {post.username}
              </span>
              <CheckCircle size={16} className="ml-1 text-blue-500" />
            </div>
            <span className="text-sm text-gray-500">{post.timestamp}</span>
          </div>
        </div>
        <button
          onClick={() => onMore(post)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="px-4 pb-3">
        <p className="text-gray-900 leading-relaxed">{post.content}</p>
      </div>
      {post.media && post.media.length > 0 && (
        <div className="px-4 pb-3">
          <img
            src={post.media[0]}
            alt="Post media"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 cursor-pointer transition-colors ${
                post.isLiked
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
              <span className="text-sm">Like</span>
            </button>
            <button
              onClick={() => onComment(post.id)}
              className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm">Comment</span>
            </button>
            <button
              onClick={() => onAmplify(post.id)}
              className={`flex items-center space-x-2 transition-colors cursor-pointer ${
                post.isAmplified
                  ? "text-green-500"
                  : "text-gray-500 hover:text-green-500"
              }`}
            >
              <Repeat2 size={20} />
              <span className="text-sm">Amplify</span>
            </button>
          </div>
          <button
            onClick={() => onBookmark(post.id)}
            className={`transition-colors flex cursor-pointer ${
              post.isBookmarked
                ? "text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            <Bookmark
              size={20}
              fill={post.isBookmarked ? "currentColor" : "none"}
            />
            <span className="text-sm ml-1">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component (unchanged)
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XCircle size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Main Profile Component
export default function ProfilePage() {
  const {
    user,
    token,
    isAuthenticated,
    loading,
    error: authError,
    getProfile,
    refreshToken,
    clearError,
    logout,
  } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userPoints, setUserPoints] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(200);
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const scrollContainerRef = useRef(null);
  const router = useRouter();

  // Fetch profile, posts, and points
  useEffect(() => {
    const fetchData = async () => {
      if (!loading && isAuthenticated && user) {
        setDataLoading(true);
        try {
          // Fetch profile
          const profile = await getProfile();
          if (!profile) throw new Error("Failed to fetch profile");

          setProfileData(profile);
          setIsMyProfile(user._id === profile._id);
          setIsFollowing(profile.isFollowing || false);

          // Fetch posts
          const postsResponse = await fetch(`/api/users/${user._id}/posts`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!postsResponse.ok) {
            if (postsResponse.status === 401) {
              const refreshed = await refreshToken();
              if (refreshed) {
                const retryResponse = await fetch(
                  `/api/users/${user._id}/posts`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                if (!retryResponse.ok)
                  throw new Error("Failed to fetch posts after token refresh");
                const postsData = await retryResponse.json();
                setPosts(postsData);
              } else {
                throw new Error("Session expired");
              }
            } else {
              throw new Error("Failed to fetch posts");
            }
          } else {
            const postsData = await postsResponse.json();
            setPosts(postsData);
          }

          // Fetch points
          const pointsResponse = await fetch(`/api/users/${user._id}/points`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!pointsResponse.ok) {
            if (pointsResponse.status === 401) {
              const refreshed = await refreshToken();
              if (refreshed) {
                const retryResponse = await fetch(
                  `/api/users/${user._id}/points`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                if (!retryResponse.ok)
                  throw new Error("Failed to fetch points after token refresh");
                const pointsData = await retryResponse.json();
                setUserPoints(pointsData);
              } else {
                throw new Error("Session expired");
              }
            } else {
              throw new Error("Failed to fetch points");
            }
          } else {
            const pointsData = await pointsResponse.json();
            setUserPoints(pointsData);
          }

          setDataError(null);
        } catch (err) {
          setDataError(err.message || "Failed to load data");
          if (err.message.includes("Session expired")) {
            logout();
            router.push("/login");
          }
        } finally {
          setDataLoading(false);
        }
      } else if (!loading && !isAuthenticated) {
        router.push("/login");
      }
    };

    fetchData();
  }, [
    loading,
    isAuthenticated,
    user,
    token,
    getProfile,
    refreshToken,
    logout,
    router,
  ]);

  // Handle scroll for header animation
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      const maxScroll = 130;
      if (scrollTop <= maxScroll) {
        const newHeight = Math.max(70, 200 - scrollTop);
        setHeaderHeight(newHeight);
        setShowHeaderTitle(scrollTop > maxScroll + 25);
      } else {
        setHeaderHeight(70);
        setShowHeaderTitle(true);
      }
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  // Post interaction handlers
  const handleLike = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryResponse = await fetch(`/api/posts/${postId}/like`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!retryResponse.ok)
              throw new Error("Failed to like/unlike post after token refresh");
            setPosts((prev) =>
              prev.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !post.isLiked,
                      likeCount: post.isLiked
                        ? post.likeCount - 1
                        : post.likeCount + 1,
                    }
                  : post
              )
            );
          } else {
            throw new Error("Session expired");
          }
        } else {
          throw new Error("Failed to like/unlike post");
        }
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likeCount: post.isLiked
                    ? post.likeCount - 1
                    : post.likeCount + 1,
                }
              : post
          )
        );
      }
      setDataError(null);
    } catch (err) {
      setDataError(err.message || "Failed to like/unlike post");
      if (err.message.includes("Session expired")) {
        logout();
        router.push("/login");
      }
    }
  };

  const handleComment = (postId) => {
    console.log("Comment on post:", postId);
    // Implement comment functionality
  };

  const handleAmplify = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/amplify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryResponse = await fetch(`/api/posts/${postId}/amplify`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!retryResponse.ok)
              throw new Error("Failed to amplify post after token refresh");
            setPosts((prev) =>
              prev.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isAmplified: !post.isAmplified,
                      amplifyCount: post.isAmplified
                        ? post.amplifyCount - 1
                        : post.amplifyCount + 1,
                    }
                  : post
              )
            );
          } else {
            throw new Error("Session expired");
          }
        } else {
          throw new Error("Failed to amplify post");
        }
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isAmplified: !post.isAmplified,
                  amplifyCount: post.isAmplified
                    ? post.amplifyCount - 1
                    : post.amplifyCount + 1,
                }
              : post
          )
        );
      }
      setDataError(null);
    } catch (err) {
      setDataError(err.message || "Failed to amplify post");
      if (err.message.includes("Session expired")) {
        logout();
        router.push("/login");
      }
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryResponse = await fetch(`/api/posts/${postId}/bookmark`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!retryResponse.ok)
              throw new Error("Failed to bookmark post after token refresh");
            setPosts((prev) =>
              prev.map((post) =>
                post.id === postId
                  ? { ...post, isBookmarked: !post.isBookmarked }
                  : post
              )
            );
          } else {
            throw new Error("Session expired");
          }
        } else {
          throw new Error("Failed to bookmark post");
        }
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, isBookmarked: !post.isBookmarked }
              : post
          )
        );
      }
      setDataError(null);
    } catch (err) {
      setDataError(err.message || "Failed to bookmark post");
      if (err.message.includes("Session expired")) {
        logout();
        router.push("/login");
      }
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryResponse = await fetch(`/api/posts/${postId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!retryResponse.ok)
              throw new Error("Failed to delete post after token refresh");
            setPosts((prev) => prev.filter((post) => post.id !== postId));
            setIsPostModalVisible(false);
          } else {
            throw new Error("Session expired");
          }
        } else {
          throw new Error("Failed to delete post");
        }
      } else {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        setIsPostModalVisible(false);
      }
      setDataError(null);
    } catch (err) {
      setDataError(err.message || "Failed to delete post");
      if (err.message.includes("Session expired")) {
        logout();
        router.push("/login");
      }
    }
  };

  const handleCopyPostLink = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    console.log(`Copied link for post: ${postId}`);
    setIsPostModalVisible(false);
  };

  const handlePostMore = (post) => {
    setSelectedPost(post);
    setIsPostModalVisible(true);
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${profileData._id}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryResponse = await fetch(
              `/api/users/${profileData._id}/follow`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!retryResponse.ok)
              throw new Error(
                "Failed to follow/unfollow user after token refresh"
              );
            setIsFollowing(!isFollowing);
            setProfileData((prev) => ({
              ...prev,
              followersCount: isFollowing
                ? prev.followersCount - 1
                : prev.followersCount + 1,
            }));
          } else {
            throw new Error("Session expired");
          }
        } else {
          throw new Error("Failed to follow/unfollow user");
        }
      } else {
        setIsFollowing(!isFollowing);
        setProfileData((prev) => ({
          ...prev,
          followersCount: isFollowing
            ? prev.followersCount - 1
            : prev.followersCount + 1,
        }));
      }
      setDataError(null);
    } catch (err) {
      setDataError(err.message || "Failed to follow/unfollow user");
      if (err.message.includes("Session expired")) {
        logout();
        router.push("/login");
      }
    }
  };

  const profileImageSize = Math.max(
    40,
    Math.min(120, 120 - (200 - headerHeight) * 0.6)
  );

  // if (loading || dataLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (authError || dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500">{authError || dataError}</p>
          <button
            onClick={() => {
              clearError();
              router.push("/login");
            }}
            className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-full font-medium hover:bg-sky-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-full font-medium hover:bg-sky-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-gray-50">
      {/* Animated Header */}
      <div
        className="fixed top-0 left-0 right-0 max-w-2xl mx-auto overflow-hidden transition-all duration-200"
        style={{ height: `${headerHeight}px` }}
      >
        <div className="relative w-full h-full">
          <img
            src={profileData?.coverPhoto || "https://placehold.co/600x400"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />
        </div>

        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div
            className={`flex items-center transition-opacity duration-200 ${
              showHeaderTitle ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-white font-semibold">
              {profileData?.username}
            </span>
            {(profileData?.isVerified && (
              <CheckCircle size={16} className="ml-1 text-blue-400" />
            )) ||
              null}
          </div>
          <button
            onClick={() => setIsMoreModalVisible(true)}
            className="w-10 h-10 rounded-full cursor-pointer bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
          >
            <MoreHorizontal size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={scrollContainerRef}
        className="h-screen overflow-y-auto"
        style={{ paddingTop: `${headerHeight}px` }}
      >
        <div className="px-4 pb-4 bg-white border-b border-gray-100">
          <div
            className="self-center border-4 border-white shadow-lg bg-white rounded-full overflow-hidden mx-auto relative"
            style={{
              width: `${profileImageSize}px`,
              height: `${profileImageSize}px`,
              marginTop: `-${profileImageSize / 2}px`,
              marginBottom: "10px",
            }}
          >
            <img
              src={
                profileData?.profilePicture || "https://placehold.co/120x120"
              }
              alt={profileData?.username || "Profile"}
              className="w-full h-full object-cover"
            />
            {isMyProfile && (
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border-2 border-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Edit2 size={14} className="text-sky-500" />
              </button>
            )}
          </div>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData?.name || "Anonymous User"}
              </h1>
              {profileData?.isVerified && (
                <CheckCircle size={20} className="ml-2 text-blue-500" />
              )}
              {userPoints && (
                <div className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                  <span className="text-xs font-bold text-white">
                    LV.{userPoints?.levelInfo.level || 1}
                  </span>
                </div>
              )}
            </div>
            <p className="text-base text-gray-500 mt-1">
              @{profileData?.username || "anonymous"}
            </p>
            {profileData?.bio && (
              <p className="text-gray-700 text-center mt-3 leading-relaxed max-w-md mx-auto">
                {profileData?.bio ||
                  "This user prefers to keep their bio private."}
              </p>
            )}
            <div className="flex justify-center mt-4 space-x-6">
              <button className="text-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <p className="text-lg font-bold text-gray-800">
                  {profileData?.followersCount.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-500">Followers</p>
              </button>
              <button className="text-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <p className="text-lg font-bold text-gray-800">
                  {profileData?.followingCount.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-500">Following</p>
              </button>
              <div className="text-center px-3 py-2">
                <p className="text-lg font-bold text-gray-800">
                  {posts?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Posts</p>
              </div>
            </div>
            <div className="flex mt-4 w-full max-w-md mx-auto">
              {isMyProfile ? (
                <>
                  <button
                    onClick={() => router.push("/edit")}
                    className="flex-1 py-2.5 bg-gray-100 rounded-full font-medium text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button className="ml-3 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Share2 size={18} className="text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`flex-1 py-2.5 rounded-full cursor-pointer font-medium transition-colors ${
                      isFollowing
                        ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        : "bg-sky-500 text-white hover:bg-sky-600"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button className="ml-3 w-10 h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <MoreHorizontal size={18} className="text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>
          {userPoints && (
            <>
              <PointsDisplay points={userPoints} loading={dataLoading} />
              <StreakDisplay
                consecutiveDays={userPoints?.consecutiveLoginDays || 0}
              />
            </>
          )}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col max-w-md mx-auto">
            {profileData?.location && (
              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500" />
                <span className="ml-2 text-gray-500">
                  {profileData.location}
                </span>
              </div>
            )}

            {profileData?.website && (
              <div className="flex items-center mb-2">
                <Link size={16} className="text-gray-500" />
                <span className="ml-2 text-gray-500">
                  {profileData.website}
                </span>
              </div>
            )}

            {profileData?.createdAt && (
              <div className="flex items-center mb-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="ml-2 text-gray-500">
                  Joined{" "}
                  {new Date(profileData.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex bg-white border-b border-gray-100 sticky top-0 z-30">
          {[
            { key: "posts", title: "Posts", icon: Grid },
            { key: "media", title: "Media", icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-sky-500 text-sky-500"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={18} />
                <span className="ml-1 text-sm font-medium">{tab.title}</span>
              </button>
            );
          })}
        </div>
        <div className="px-4 pt-4">
          {activeTab === "posts" && (
            <>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onAmplify={handleAmplify}
                    onBookmark={handleBookmark}
                    onMore={handlePostMore}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    {isMyProfile
                      ? "Start sharing your thoughts, photos, and experiences with the world."
                      : `${profileData?.username} hasn't posted anything yet.`}
                  </p>
                  {isMyProfile && (
                    <button className="px-6 py-2.5 bg-sky-500 text-white rounded-full font-medium hover:bg-sky-600 transition-colors">
                      Create First Post
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {activeTab === "media" && (
            <div className="flex flex-wrap -mx-1">
              {posts
                .filter((post) => post.media && post.media.length > 0)
                .map((post) => (
                  <div key={post.id} className="w-1/3 px-1 mb-2">
                    <div className="aspect-square">
                      <img
                        src={post.media[0]}
                        alt="Media"
                        className="w-full h-full object-cover rounded-md hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              {posts.filter((post) => post.media && post.media.length > 0)
                .length === 0 && (
                <div className="w-full text-center py-12">
                  <ImageIcon size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No media yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isMyProfile
                      ? "Share photos and videos with your followers."
                      : `${profileData?.username} hasn't posted any media yet.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="h-20" />
      </div>

      {/* More Options Modal */}
      <Modal
        isOpen={isMoreModalVisible}
        onClose={() => setIsMoreModalVisible(false)}
        title="More Options"
      >
        <div className="p-4">
          {[
            {
              icon: Share2,
              label: "Share Profile",
              onClick: () => console.log("Share profile"),
            },
            {
              icon: QrCode,
              label: "QR Code",
              onClick: () => console.log("Show QR Code"),
            },
            {
              icon: Flag,
              label: "Report User",
              onClick: () => console.log("Report user"),
              danger: true,
            },
            {
              icon: XCircle,
              label: "Block User",
              onClick: () => console.log("Block user"),
              danger: true,
            },
          ].map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  option.onClick();
                  setIsMoreModalVisible(false);
                }}
              >
                <Icon
                  size={20}
                  className={option.danger ? "text-red-500" : "text-gray-500"}
                />
                <span
                  className={`ml-3 font-medium ${
                    option.danger ? "text-red-500" : "text-gray-800"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
          <button
            className="w-full mt-4 py-3 bg-gray-100 rounded-full font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={() => setIsMoreModalVisible(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Post Options Modal */}
      <Modal
        isOpen={isPostModalVisible}
        onClose={() => setIsPostModalVisible(false)}
        title="Post Options"
      >
        <div className="p-4">
          {[
            ...(isMyProfile
              ? [
                  {
                    icon: Trash2,
                    label: "Delete Post",
                    onClick: () => handleDeletePost(selectedPost?.id),
                    danger: true,
                  },
                  {
                    icon: Edit2,
                    label: "Edit Post",
                    onClick: () => console.log(`Edit post ${selectedPost?.id}`),
                  },
                ]
              : []),
            {
              icon: Copy,
              label: "Copy Link",
              onClick: () => handleCopyPostLink(selectedPost?.id),
            },
            {
              icon: Share2,
              label: "Share Post",
              onClick: () => console.log(`Share post ${selectedPost?.id}`),
            },
            {
              icon: Flag,
              label: "Report Post",
              onClick: () => console.log(`Report post ${selectedPost?.id}`),
              danger: true,
            },
          ].map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  option.onClick();
                  setIsPostModalVisible(false);
                }}
              >
                <Icon
                  size={20}
                  className={option.danger ? "text-red-500" : "text-gray-500"}
                />
                <span
                  className={`ml-3 font-medium ${
                    option.danger ? "text-red-500" : "text-gray-800"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
          <button
            className="w-full mt-4 py-3 bg-gray-100 rounded-full font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={() => setIsPostModalVisible(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
