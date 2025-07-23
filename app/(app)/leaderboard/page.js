'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../utils/config';
import { User, Heart, Pencil, Star, Trophy, Medal } from "lucide-react"

// Fixed Tab Component
const LeaderboardTabs = ({ tabs, activeTab, onTabPress }) => {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12 }}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              className={`mr-3 py-3 px-4 rounded-full flex-shrink-0 transition-all duration-200 ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              onClick={() => onTabPress(tab.key)}
              style={{
                boxShadow: isActive ? '0 2px 4px rgba(14, 165, 233, 0.1)' : 'none',
              }}
            >
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-black'}`} />
                <span className={`${isActive ? 'text-white' : 'text-black'}`}>
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

// Fixed Leaderboard Item Component
const LeaderboardItem = ({ item, index, currentUserId, onPress }) => {
  const isCurrentUser = item.userId === currentUserId;
  const rank = index + 1;

  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <Medal className="w-4 h-4 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
            <Medal className="w-4 h-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">
              {rank}
            </span>
          </div>
        );
    }
  };

  const getLevelInfo = (points) => {
    const levels = [
      { level: 1, title: 'Newcomer', minPoints: 0 },
      { level: 2, title: 'Active Member', minPoints: 100 },
      { level: 3, title: 'Contributor', minPoints: 500 },
      { level: 4, title: 'Influencer', minPoints: 1000 },
      { level: 5, title: 'Star', minPoints: 2500 },
      { level: 6, title: 'Superstar', minPoints: 5000 },
      { level: 7, title: 'Icon', minPoints: 10000 },
      { level: 8, title: 'Legend', minPoints: 25000 },
      { level: 9, title: 'Master', minPoints: 50000 },
      { level: 10, title: 'Grandmaster', minPoints: 100000 },
    ];

    return levels.reverse().find(level => points >= level.minPoints) || levels[0];
  };

  const levelInfo = getLevelInfo(item.totalPoints);

  return (
    <div
      className={`flex items-center p-5 mx-4 mb-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isCurrentUser ? 'bg-sky-50 border-2 border-primary' : 'bg-white shadow-sm hover:shadow-md'
      }`}
      onClick={() => onPress(item)}
    >
      {/* Rank */}
      <div className="mr-4 flex-shrink-0">
        {getRankIcon()}
      </div>

      {/* Profile Picture */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border-2 border-white flex-shrink-0">
        {item.profilePicture ? (
          <img 
            src={item.profilePicture} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-primary" />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="flex items-center mb-1">
          <span className="text-gray-900 text-base font-medium truncate">
            {item.username || item.fullname || `User #${item?.userId?.slice(-6)}`}
          </span>
          {isCurrentUser && (
            <div className="ml-2 px-2 py-1 bg-primary rounded-full flex-shrink-0">
              <span className="text-xs text-white font-medium">
                You
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-sky-100 rounded-full">
            <span className="text-xs text-primary font-medium">
              Level {levelInfo.level}
            </span>
          </div>
          <span className="text-xs text-gray-500 truncate">
            {levelInfo.title}
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0 ml-4">
        <div className="text-lg font-semibold text-gray-900">
          {item.totalPoints.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">
          points
        </div>
      </div>
    </div>
  );
};

// Main Leaderboard Component
export default function LeaderboardPage() {
  const router = useRouter();
  const { user: currentUser, token, isAuthenticated } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('total');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [myPoints, setMyPoints] = useState(null);

  const tabs = [
    { key: 'total', title: 'Overall', icon: Trophy },
    { key: 'creators', title: 'Creators', icon: Pencil },
    { key: 'fans', title: 'Fans', icon: Heart },
    { key: 'followers', title: 'Followers', icon: User },
  ];

  // Fetch user's points
  const fetchMyPoints = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return;

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(
        `${API_ENDPOINTS.POINTS}/my-summary`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setMyPoints(data);
      }
    } catch (error) {
      console.error('Error fetching my points:', error);
    }
  }, [isAuthenticated, currentUser, token]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (resetData = false) => {
    try {
      if (resetData) {
        setIsLoading(true);
        setPage(1);
      }

      const currentPage = resetData ? 1 : page;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(
        `${API_ENDPOINTS.POINTS}/leaderboard?type=${activeTab}&page=${currentPage}&limit=20`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();

      if (resetData) {
        setLeaderboardData(data.leaderboard || []);
      } else {
        setLeaderboardData(prev => [...prev, ...(data.leaderboard || [])]);
      }

      setHasMore(data.leaderboard?.length === 20);

      // Find current user's position
      if (isAuthenticated && currentUser) {
        const userIndex = data.leaderboard?.findIndex(
          item => item.userId === currentUser._id
        );

        if (userIndex !== -1) {
          setUserPosition({
            rank: (currentPage - 1) * 20 + userIndex + 1,
            ...data.leaderboard[userIndex]
          });
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, page, token, isAuthenticated, currentUser]);

  // Load more data
  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
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
      const identifier = userItem.username || userItem.userId;
      router.push(`/UserProfile/${identifier}`);
    }
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    fetchLeaderboard(true);
  };

  // Scroll handler for infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore();
    }
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
      <div className="min-h-screen w-xl bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading leaderboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-xl bg-gray-50">
      {/* Tabs */}
      <LeaderboardTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabChange}
      />

      {/* Main Content */}
      <div className="pb-24">
        {/* My Points Summary */}
        {isAuthenticated && myPoints && (
          <div className="mx-4 my-6 rounded-xl overflow-hidden shadow-lg">
            <div 
              className="p-6 bg-gradient-to-r from-sky-400 to-primary"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)'
              }}
            >
              <div className="flex items-center justify-center mb-4">
                <div>
                  <p className="text-white/80 text-sm">
                    Your Total Points
                  </p>
                  <p className="text-white text-center text-2xl font-bold mt-1">
                    {myPoints.totalPoints?.toLocaleString() || '0'}
                  </p>
                </div>
                {/* <button
                  className="bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                  onClick={() => router.push('/dashboard')}
                >
                  <span className="text-white text-sm font-medium">
                    View Details
                  </span>
                </button> */}
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
                  <p className="text-white/80 text-xs">
                    Creator
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-lg font-semibold">
                    {myPoints.fanPoints || 0}
                  </p>
                  <p className="text-white/80 text-xs">
                    Fan
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-lg font-semibold">
                    {myPoints.bonusPoints || 0}
                  </p>
                  <p className="text-white/80 text-xs">
                    Bonus
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="px-4 py-4 flex items-center justify-between">
          <h2 className="text-gray-800 text-lg font-semibold">
            🏆 Top Users
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Leaderboard Items */}
        <div className="pb-8">
          {leaderboardData.map((item, index) => (
            <LeaderboardItem
              key={item.userId || index}
              item={item}
              index={index}
              currentUserId={currentUser?._id}
              onPress={navigateToProfile}
            />
          ))}

          {/* Loading Footer */}
          {isLoading && page > 1 && (
            <div className="py-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          )}

          {/* Load More Button */}
          {!isLoading && hasMore && leaderboardData.length > 0 && (
            <div className="px-4 py-4 text-center">
              <button
                onClick={loadMore}
                className="bg-white text-primary border border-primary px-6 py-3 rounded-lg hover:bg-sky-50 transition-colors font-medium"
              >
                Load More
              </button>
            </div>
          )}

          {/* End of List */}
          {!hasMore && leaderboardData.length > 0 && (
            <div className="py-6 text-center">
              <p className="text-gray-500">
                🎉 You've reached the end of the leaderboard!
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && leaderboardData.length === 0 && (
            <div className="py-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No users found
              </p>
              <p className="text-gray-400 text-sm">
                Be the first to earn points!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}