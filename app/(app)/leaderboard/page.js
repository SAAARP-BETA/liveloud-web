"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../utils/config";
import {
  User,
  Heart,
  Pencil,
  Star,
  Trophy,
  Medal,
  SquarePen,
  Users,
  PenLine,
  Crown,
} from "lucide-react";
import Image from "next/image";
import { getProfilePicture } from "@/app/utils/fallbackImage";
import defaultPic from "../../assets/avatar.png";
// Fixed Tab Component
const LeaderboardTabs = ({ tabs, activeTab, onTabPress }) => {
  return (
    <div
      className="bg-white border-b border-gray-100 sticky top-4 z-10 flex justify-center"
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <div className="flex gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              className={` cursor-pointer mr-3 py-3 px-4 rounded-full flex-shrink-0 transition-all duration-200 ${isActive
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              onClick={() => onTabPress(tab.key)}
              style={{
                boxShadow: isActive
                  ? "0 2px 4px rgba(14, 165, 233, 0.1)"
                  : "none",
              }}
            >
              <div className="flex items-center space-x-2">
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-white" : "text-black"
                    }`}
                />
                {/* Show text only on sm screens and larger (hidden on mobile) */}
                <span className={`hidden sm:inline ${isActive ? "text-white" : "text-black"}`}>
                  {tab.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const LeaderboardItem = ({ item, index, currentUserId, onPress, activeTab }) => {
  // Check if this is the current user - more robust comparison
  const isCurrentUser = String(item.userId) === String(currentUserId) || String(item.user?._id) === String(currentUserId) || String(item._id) === String(currentUserId);
  const rank = index + 1;
  const userData = item.user?._id ? item.user : null;
  const userId = userData?._id || item.user;
  const username = userData?.username || `User #${String(userId).slice(-6)}`;
  const profilePicture = userData?.profilePicture;
  const getPointsForTab = (item, tab) => {
    switch (tab) {
      case 'total':
        return item.totalPoints || 0;
      case 'creators':
        return item.creatorPoints || 0;
      case 'fans':
        return item.fanPoints || 0;
      case 'followers':
        return item.stats?.totalFollowers || 0;
      default:
        return item.totalPoints || 0;
    }
  };
  const displayPoints = getPointsForTab(item, activeTab);
  const pointsLabel = activeTab === 'followers' ? 'followers' : 'points';
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 cursor-pointer text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <Medal className="w-4 h-4 cursor-pointer text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
            <Medal className="cursor-pointer w-4 h-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">{rank}</span>
          </div>
        );
    }
  };

  const getLevelInfo = (points) => {
    const levels = [
      {
        level: 1,
        title: "Newcomer",
        minPoints: 0,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
      },
      {
        level: 2,
        title: "Active Member",
        minPoints: 100,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      },
      {
        level: 3,
        title: "Contributor",
        minPoints: 500,
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
      },
      {
        level: 4,
        title: "Influencer",
        minPoints: 1000,
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
        borderColor: "border-purple-200",
      },
      {
        level: 5,
        title: "Star",
        minPoints: 2500,
        bgColor: "bg-pink-100",
        textColor: "text-pink-700",
        borderColor: "border-pink-200",
      },
      {
        level: 6,
        title: "Superstar",
        minPoints: 5000,
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
      },
      {
        level: 7,
        title: "Icon",
        minPoints: 10000,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      },
      {
        level: 8,
        title: "Legend",
        minPoints: 25000,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
      },
      {
        level: 9,
        title: "Master",
        minPoints: 50000,
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-700",
        borderColor: "border-indigo-200",
      },
      {
        level: 10,
        title: "Grandmaster",
        minPoints: 100000,
        bgColor: "bg-gradient-to-r from-yellow-400 to-orange-500",
        textColor: "text-white",
        borderColor: "border-yellow-400",
      },
    ];

    return (
      levels.reverse().find((level) => points >= level.minPoints) || levels[0]
    );
  };

  const levelInfo = getLevelInfo(item.totalPoints);

  return (
    <div
      className={`flex items-center p-5 mx-4 mb-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${isCurrentUser
          ? "bg-sky-50 border-2 border-primary"
          : "bg-white shadow-sm hover:shadow-md"
        }`}
      onClick={() => onPress(item)}
    >
      {/* Rank */}
      <div className="mr-4 flex-shrink-0">{getRankIcon()}</div>

      {/* Profile Picture */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border-2 border-white flex-shrink-0 relative overflow-hidden">
        <Image
          src={profilePicture || defaultPic}
          alt={username|| "Profile"}
          width={48}
          height={48}
          className="rounded-full object-cover w-12 h-12"
        />
      </div>

      {/* User Info */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="flex items-center mb-1">
          <span className="text-gray-900 text-base font-medium truncate">
            {username ||
              item.fullname ||
              `User #${item?.userId?.slice(-6)}`}
          </span>
          {isCurrentUser && (
            <div className="ml-2 px-2 py-1 bg-primary rounded-full flex-shrink-0">
              <span className="text-xs text-white font-medium">You</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <div
            className={`px-2 py-1 ${levelInfo.bgColor} ${levelInfo.borderColor} rounded-xl border`}
          >
            <span className={`text-xs ${levelInfo.textColor} font-medium`}>
              Level {levelInfo.level}
            </span>
          </div>
          <span className={`text-xs ${levelInfo.textColor} truncate`}>
            {levelInfo.title}
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0 ml-4">
        <div className="text-lg font-semibold text-gray-900">
          {displayPoints.toLocaleString() || "0"}
        </div>
        <div className="text-xs text-gray-500">{pointsLabel}</div>
      </div>
    </div>
  );
};

// Main Leaderboard Component
export default function LeaderboardPage() {
  const router = useRouter();
  const { user: currentUser, token, isAuthenticated } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState("total");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [myPoints, setMyPoints] = useState(null);

  const tabs = [
    { key: "total", title: "Overall", icon: Trophy },
    { key: "creators", title: "Creators", icon: Pencil },
    { key: "fans", title: "Fans", icon: Heart },
    { key: "followers", title: "Followers", icon: User },
  ];

  // Fetch user's points
  const fetchMyPoints = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(`${API_ENDPOINTS.POINTS}/my-summary`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setMyPoints(data);
      }
    } catch (error) {
      console.error("Error fetching my points:", error);
    }
  }, [isAuthenticated, currentUser, token]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(
    async (resetData = false) => {
      try {
        if (resetData) {
          setIsLoading(true);
          setPage(1);
        }

        const currentPage = resetData ? 1 : page;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
          `${API_ENDPOINTS.POINTS}/leaderboard?type=${activeTab}&page=${currentPage}&limit=20`,
          { headers }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }

        const data = await response.json();

        if (resetData) {
          setLeaderboardData(data.leaderboard || []);
        } else {
          setLeaderboardData((prev) => [...prev, ...(data.leaderboard || [])]);
        }

        setHasMore(data.leaderboard?.length === 20);

        // Find current user's position
        if (isAuthenticated && currentUser) {
          const userIndex = data.leaderboard?.findIndex(
            (item) => item.userId === currentUser._id
          );

          if (userIndex !== -1) {
            setUserPosition({
              rank: (currentPage - 1) * 20 + userIndex + 1,
              ...data.leaderboard[userIndex],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab, page, token, isAuthenticated, currentUser]
  );

  // Load more data
  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLeaderboard(true);
    fetchMyPoints();
  };

  // Navigate to user profile - FIXED VERSION
  const navigateToProfile = (userItem) => {
    if (!userItem) return;

    // Check if it's the current user
    if (currentUser && userItem.userId === currentUser._id) {
      // Navigate to current user's profile using their username
      const username = currentUser.username || currentUser._id;
      router.push(`/UserProfile/${username}`);
    } else {
      // Navigate to other user's profile
      // Use username if available, otherwise use userId
      const identifier = userItem.user.username || userItem.userId;
      router.push(`/UserProfile/${identifier}`);
    }
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    fetchLeaderboard(true);
  };

  // Initial load
  useEffect(() => {
    fetchLeaderboard(true);
    fetchMyPoints();
  }, []);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchLeaderboard();
    }
  }, [page]);

  // Render loading state
  
if (isLoading && page === 1) {
  return (
    <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-gray-50 flex-1 px-4 mx-4">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 flex justify-center items-center border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    </div>
  );
}
  // console.log("leaderboardData:", leaderboardData);


  return (
    <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl   bg-gray-50 flex-1 px-4 mx-4 overflow-y-auto h-screen custom-scrollbar">
      {/* Tabs */}
      <LeaderboardTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabChange}
      />

        {/* My Points Summary */}
        {isAuthenticated && myPoints && (
          <div className="my-6 rounded-xl overflow-hidden shadow-lg">
            <div
              className="p-6 bg-gradient-to-r from-sky-400 to-primary"
              style={{
                background: "linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)",
              }}
            >
              <div className="flex flex-col items-center justify-center mb-4 sm:flex-row sm:justify-center">
                <div>
                  <p className="text-white/80 text-sm text-center sm:text-center">
                    Your Total Points
                  </p>
                  <p className="text-white cursor-pointer text-center sm:text-center text-2xl font-bold mt-1">
                    {myPoints.totalPoints?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>

              {/* Points Breakdown */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-lg font-semibold">
                    {myPoints.creatorPoints || 0}
                  </p>
                  <p className="text-white/80 text-xs">Creator</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-lg font-semibold">
                    {myPoints.fanPoints || 0}
                  </p>
                  <p className="text-white/80 text-xs">Fan</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-lg font-semibold">
                    {myPoints.bonusPoints || 0}
                  </p>
                  <p className="text-white/80 text-xs">Bonus</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="py-4 flex flex-row justify-between sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-gray-800 text-lg font-semibold">
            🏆 Top Users - {tabs.find(tab => tab.key === activeTab)?.title}

          </h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-primary border text-white px-4 cursor-pointer py-2 rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Leaderboard Items */}
        <div className="pb-8">
          {leaderboardData
              ?.filter(item => item && item.totalPoints !== undefined) 
              .map((item, index) => (
          <LeaderboardItem
            key={item?.userId || index}
            item={item}
            index={index}
            currentUserId={currentUser?._id}
            onPress={navigateToProfile}
            activeTab={activeTab}
          />
))}
          {isLoading && page > 1 && (
            <div className="py-6 text-center ">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          )}

          {!isLoading && hasMore && leaderboardData.length > 0 && (
            <div className="py-4 text-center">
              <button
                onClick={loadMore}
                className="bg-white text-primary border border-primary px-6 py-3 rounded-lg hover:bg-sky-50 transition-colors font-medium"
              >
                Load More
              </button>
            </div>
          )}

          {!hasMore && leaderboardData.length > 0 && (
            <div className="py-6 text-center">
              <p className="text-gray-500">
                🎉 You've reached the end of the leaderboard!
              </p>
            </div>
          )}

          {!isLoading && leaderboardData.length === 0 && (
            <div className="py-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm">
                Be the first to earn points!
              </p>
            </div>
          )}
        </div>
      </div>
  );
}