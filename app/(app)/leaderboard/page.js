'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
// import { fonts } from '../../utils/fonts';
// import Navbar from "../../components/Navbar";
import { API_ENDPOINTS } from '../../utils/config';

// Fixed Tab Component
const LeaderboardTabs = ({ tabs, activeTab, onTabPress }) => {
  return (
    <div className="bg-white border-b border-gray-100" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12 }}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`mr-3 py-3 px-4 rounded-full flex-shrink-0 transition-all duration-200 ${
              activeTab === tab.key ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            onClick={() => onTabPress(tab.key)}
            style={{
              boxShadow: activeTab === tab.key ? '0 2px 4px rgba(14, 165, 233, 0.1)' : 'none',
            }}
          >
            <div className="flex items-center">
              <i className={`fas fa-${tab.icon} text-base mr-2`}></i>
              <span
              
                className={activeTab === tab.key ? 'text-white' : 'text-gray-500'}
              >
                {tab.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Fixed Leaderboard Item Component
const LeaderboardItem = ({ item, index, currentUserId, onPress }) => {
  const isCurrentUser = item.user === currentUserId;
  const rank = index + 1;

  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <i className="fas fa-crown text-white text-sm"></i>
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <i className="fas fa-medal text-white text-sm"></i>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
            <i className="fas fa-medal text-white text-sm"></i>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span  className="text-gray-600 text-sm">
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
      className={`flex items-center p-4 mx-4 mb-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isCurrentUser ? 'bg-sky-50 border-2 border-sky-300' : 'bg-white shadow-sm hover:shadow-md'
      }`}
      onClick={() => onPress(item.user)}
    >
      {/* Rank */}
      <div className="mr-3">
        {getRankIcon()}
      </div>

      {/* Profile Picture */}
      <div className="w-12 h-12 rounded-full ml-2 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center border-2 border-white">
        <i className="fas fa-user text-sky-500 text-lg"></i>
      </div>

      {/* User Info */}
      <div className="flex-1 ml-3">
        <div className="flex items-center">
          <span  className="text-gray-900 text-base">
            User #{item?.user?.slice(-6)}
          </span>
          {isCurrentUser && (
            <div className="ml-2 px-2 py-1 bg-sky-500 rounded-full">
              <span  className="text-xs text-white">
                You
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center mt-1">
          <div className="px-2 py-1 bg-blue-100 rounded-full">
            <span className="text-xs text-blue-700">
              Level {levelInfo.level}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {levelInfo.title}
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <div className="text-lg text-gray-900">
          {item.totalPoints.toLocaleString()}
        </div>
        <div  className="text-xs text-gray-500">
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
    { key: 'total', title: 'Overall', icon: 'trophy' },
    { key: 'creators', title: 'Creators', icon: 'edit' },
    { key: 'fans', title: 'Fans', icon: 'heart' },
    { key: 'followers', title: 'Followers', icon: 'users' },
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
          item => item.user === currentUser._id
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

  // Navigate to user profile
  const navigateToProfile = (userId) => {
    if (!currentUser || !userId) return;

    if (userId === currentUser._id) {
      router.push('/profile/profile');
    } else {
      router.push(`/UserProfile/${userId}`);
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
            <p  className="mt-4 text-gray-600">
              Loading leaderboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* {isAuthenticated && <Navbar />} */}

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
          <div className="mx-4 my-4 rounded-xl overflow-hidden">
            <div 
              className="p-5 bg-gradient-to-r from-sky-500 to-blue-600"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p  className="text-white/80 text-sm">
                    Your Total Points
                  </p>
                  <p  className="text-white text-2xl mt-1">
                    {myPoints.totalPoints?.toLocaleString() || '0'}
                  </p>
                </div>
                <button
                  className="bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                  onClick={() => router.push('/points/dashboard')}
                >
                  <span className="text-white text-sm">
                    View Details
                  </span>
                </button>
              </div>
              
              {/* Points Breakdown */}
              <div className="flex justify-between pt-4 border-t border-white/20">
                <div className="items-center flex-1 text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <i className="fas fa-edit text-white text-lg"></i>
                  </div>
                  <p  className="text-white text-lg">
                    {myPoints.creatorPoints || 0}
                  </p>
                  <p  className="text-white/80 text-xs">
                    Creator
                  </p>
                </div>
                <div className="items-center flex-1 text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <i className="fas fa-heart text-white text-lg"></i>
                  </div>
                  <p className="text-white text-lg">
                    {myPoints.fanPoints || 0}
                  </p>
                  <p  className="text-white/80 text-xs">
                    Fan
                  </p>
                </div>
                <div className="items-center flex-1 text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <i className="fas fa-star text-white text-lg"></i>
                  </div>
                  <p  className="text-white text-lg">
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

        {/* Leaderboard title */}
        <div className="px-4 py-2">
          <h2  className="text-gray-800 text-lg">
            🏆 Top Users
          </h2>
        </div>

        {/* Refresh Button */}
        <div className="px-4 mb-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Leaderboard Items */}
        <div 
          className="max-h-96 overflow-y-auto"
          onScroll={handleScroll}
        >
          {leaderboardData.map((item, index) => (
            <LeaderboardItem
              key={item.user || index}
              item={item}
              index={index}
              currentUserId={currentUser?._id}
              onPress={navigateToProfile}
            />
          ))}

          {/* Loading Footer */}
          {isLoading && page > 1 && (
            <div className="py-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mx-auto"></div>
            </div>
          )}

          {/* End of List */}
          {!hasMore && leaderboardData.length > 0 && (
            <div className="py-6 text-center">
              <p className="text-gray-500">
                End of leaderboard
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}