"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Heart,
  Pencil,
  Star,
  Trophy,
  Medal,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext"; // Update with your auth context path
import { API_ENDPOINTS } from "@/app/utils/config"; // Update with your config path

const PointsSidebar = ({ isVisible = true, onClose }) => {
  const { user: currentUser, token, isAuthenticated } = useAuth();
  const router = useRouter();

  // State for points data
  const [myPoints, setMyPoints] = useState({
    totalPoints: 0,
    creatorPoints: 0,
    fanPoints: 0,
    bonusPoints: 0,
    followersPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);

  // Get user level based on points
  const getLevelInfo = (points) => {
    const levels = [
      { level: 1, title: "Newcomer", minPoints: 0, color: "bg-gray-500" },
      {
        level: 2,
        title: "Active Member",
        minPoints: 100,
        color: "bg-green-500",
      },
      { level: 3, title: "Contributor", minPoints: 500, color: "bg-primary" },
      {
        level: 4,
        title: "Influencer",
        minPoints: 1000,
        color: "bg-purple-500",
      },
      { level: 5, title: "Star", minPoints: 2500, color: "bg-yellow-500" },
      { level: 6, title: "Superstar", minPoints: 5000, color: "bg-orange-500" },
      { level: 7, title: "Icon", minPoints: 10000, color: "bg-red-500" },
      { level: 8, title: "Legend", minPoints: 25000, color: "bg-pink-500" },
      { level: 9, title: "Master", minPoints: 50000, color: "bg-indigo-500" },
      {
        level: 10,
        title: "Grandmaster",
        minPoints: 100000,
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
      },
    ];

    return (
      levels.reverse().find((level) => points >= level.minPoints) || levels[0]
    );
  };

  // Calculate progress to next level
  const getProgressToNextLevel = (currentPoints) => {
    const levels = [0, 100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
    const currentLevelIndex = levels.findIndex(
      (level) => currentPoints < level
    );

    if (currentLevelIndex === -1) return { progress: 100, nextLevel: null };

    const currentLevelMin = levels[currentLevelIndex - 1] || 0;
    const nextLevelMin = levels[currentLevelIndex];
    const progress =
      ((currentPoints - currentLevelMin) / (nextLevelMin - currentLevelMin)) *
      100;

    return { progress: Math.min(progress, 100), nextLevel: nextLevelMin };
  };

  // Fetch user's points
  const fetchMyPoints = useCallback(async () => {
    if (!isAuthenticated || !currentUser || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(`${API_ENDPOINTS.POINTS}/my-summary`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update points with the actual data structure from your backend
      setMyPoints({
        totalPoints: data.totalPoints || 0,
        creatorPoints: data.creatorPoints || 0,
        fanPoints: data.fanPoints || 0,
        bonusPoints: data.bonusPoints || 0,
        followersPoints: data.followersPoints || 0,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching my points:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser, token]);

  // Navigate to leaderboard
  const handleLeaderboardClick = () => {
    router.push("/leaderboard");
  };
  // Initial load
  useEffect(() => {
    fetchMyPoints();
  }, [fetchMyPoints]);

  // Real-time updates when component becomes visible
  useEffect(() => {
    if (isVisible && isAuthenticated) {
      fetchMyPoints();
    }
  }, [isVisible, isAuthenticated, fetchMyPoints]);

  const levelInfo = getLevelInfo(myPoints.totalPoints);
  const progressInfo = getProgressToNextLevel(myPoints.totalPoints);

  const pointsData = [
    {
      key: "creator",
      title: "Creator",
      points: myPoints.creatorPoints,
      icon: Pencil,
      color: "text-primary",
      bgColor: "bg-sky-50",
    },
    {
      key: "fan",
      title: "Fan",
      points: myPoints.fanPoints,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      key: "bonus",
      title: "Bonus",
      points: myPoints.bonusPoints,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      key: "followers",
      title: "Followers",
      points: myPoints.followersPoints || 0,
      icon: User,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  // Don't render if not authenticated, not visible, or on mobile
  if (!isAuthenticated || !isVisible) return null;

  return (
    <div className="flex h-screen ">
      {/* Sidebar */}
      <div className="lg:w-80 md:max-w-lg sm:max-w-md bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700 border-r border-r-white hidden lg:flex flex-col overflow-y-auto custom-scrollbar h-screen">
        {/* Header */}
        <div className="top-0 bg-white border-b border-gray-100 dark:border-gray-700 p-4 dark:bg-gray-900 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">My Points</h2>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 mt-1 dark:text-white">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            {isLoading && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
            )}
          </div>
          {error && <p className="text-xs text-red-500 mt-1">Error: {error}</p>}
        </div>

        {/* Content */}
        <div className="px-4 py-10 space-y-4">
          {/* Total Points Card */}
          <div className="bg-gradient-to-br from-sky-600 to-primary rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm">Total Points</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">
                    {myPoints.totalPoints?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Award className="w-8 h-8 text-white/80" />
              </div>
            </div>

            {/* Level Info */}
            <div className="bg-white/20 rounded-lg py-5 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Level {levelInfo.level}
                </span>
                <span className="text-xs text-white/80">{levelInfo.title}</span>
              </div>

              {/* Progress Bar */}
              {progressInfo.nextLevel && (
                <div>
                  <div className="bg-white/20  rounded-full h-2 mb-1">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${progressInfo.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-white/80">
                    {progressInfo.nextLevel - myPoints.totalPoints} points to
                    next level
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Points Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center dark:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Points Breakdown
            </h3>

            {pointsData.map((item) => {
              const Icon = item.icon;
              const percentage =
                myPoints.totalPoints > 0
                  ? (item.points / myPoints.totalPoints) * 100
                  : 0;

              return (
                <div
                  key={item.key}
                  className="bg-white dark:bg-gray-900 rounded-lg border py-5 border-gray-100 dark:border-gray-700 p-3 hover:shadow-md dark:hover:bg-gray-800 transition-shadow "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}
                      >
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Points Earned</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.points?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <div className="w-full py-5">
              <button
                onClick={handleLeaderboardClick}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <Trophy className="w-5 h-5" />
                <span>View Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Example) */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Your Home Content goes here */}
      </div>
    </div>
  );
};

export default PointsSidebar;
