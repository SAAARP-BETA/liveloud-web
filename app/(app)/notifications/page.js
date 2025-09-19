'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSocket } from '@/app/context/SocketContext';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  FileText, 
  Repeat2, 
  Quote, 
  AtSign, 
  Bell, 
  BellRing,
  Check
} from "lucide-react";

const NotificationsPage = () => {
  const { isConnected, notifications, markNotificationAsRead, updateUnreadCount } = useSocket();
  const { token } = useAuth();
  const router = useRouter();
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  // Intersection Observer refs
  const observer = useRef(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (!token) return;
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3009';
      const response = await axios.get(`${backendUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pageNum,
          limit: LIMIT
        }
      });
      
      const newNotifications = response.data.notifications || [];
      const totalCount = response.data.total;
      
      if (isLoadMore) {
        setAllNotifications(prev => {
          const updated = [...prev, ...newNotifications];
          return updated;
        });
      } else {
        setAllNotifications(newNotifications);
      }
      
      // Check if there are more notifications to load
      let hasMoreNotifications;
      if (totalCount !== undefined && totalCount !== null) {
        // Backend provides total count - use it for accurate calculation
        const currentTotal = isLoadMore ? allNotifications.length + newNotifications.length : newNotifications.length;
        hasMoreNotifications = currentTotal < totalCount && newNotifications.length === LIMIT;
      } else {
        // Fallback: assume there are more if we got a full page of results
        hasMoreNotifications = newNotifications.length === LIMIT;
      }
      
      setHasMore(hasMoreNotifications);
      
      // Update page number for load more functionality
      if (isLoadMore) {
        setPage(pageNum);
      }
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [token, allNotifications]);

  // Load more notifications (for manual button)
  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || loadingMore || loading) {
      return;
    }
    
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchNotifications(nextPage, true);
  }, [page, hasMore, loadingMore, loading, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  // Keep refs in sync with state
  useEffect(() => {
    loadingRef.current = loadingMore || loading;
    hasMoreRef.current = hasMore;
  }, [loading, loadingMore, hasMore]);

  // Stable ref callback for last notification
  const lastNotificationElementRef = useCallback(
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
            
            // Get the current page and increment it
            setPage(prevPage => {
              const nextPage = prevPage + 1;
              fetchNotifications(nextPage, true);
              return nextPage;
            });
          }
        },
        {
          threshold: 0,
          rootMargin: "100px", // Start loading 100px before the element comes into view
        }
      );
      observer.current.observe(node);
    },
    [fetchNotifications]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  // Merge API + socket notifications
  const combinedNotifications = useMemo(() => {
    // Create a Map to avoid duplicates by ID
    const notificationMap = new Map();
    
    // First, add all API notifications
    allNotifications.forEach(notification => {
      if (notification._id) {
        notificationMap.set(notification._id, notification);
      }
    });
    
    // Then, add socket notifications (they take precedence if there's a duplicate)
    notifications.forEach(notification => {
      if (notification._id) {
        notificationMap.set(notification._id, notification);
      }
    });
    
    // Convert Map back to array and sort by date
    const uniqueNotifications = Array.from(notificationMap.values());
    return uniqueNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications, allNotifications]);

  // Update hasMore when new socket notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      // Reset pagination when new notifications arrive via socket
      // This ensures new notifications are shown immediately
    }
  }, [notifications]);

  const handleNotificationClick = async (notification) => {
    // First mark as read if not already read
    if (!notification.read) {
      setMarkingAsRead(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3009';
        await axios.patch(`${backendUrl}/api/notifications/${notification._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        markNotificationAsRead(notification._id);
        
        // Update local state
        setAllNotifications(prev => 
          prev.map(notif => 
            notif._id === notification._id ? { ...notif, read: true } : notif
          )
        );
        
      } catch (error) {
        console.error('Error marking notification as read:', error);
      } finally {
        setMarkingAsRead(false);
      }
    }

    // Navigate based on notification type
    try {
      switch (notification.type) {
        case 'like':
        case 'comment':
        case 'amplify':
        case 'quote':
        case 'mention':
          // For post-related notifications, navigate to the post
          if (notification.post?._id) {
            router.push(`/post/${notification.post._id}`);
          }
          break;
        
        case 'follow':
          // For follow notifications, navigate to the follower's profile
          if (notification.sender?.username) {
            router.push(`/UserProfile/${notification.sender.username}`);
          }
          break;
        
        case 'post':
          // For new post notifications, navigate to the post
          if (notification.post?._id) {
            router.push(`/post/${notification.post._id}`);
          }
          break;
        
        default:
          // For other types, try to navigate to post if available
          if (notification.post?._id) {
            router.push(`/post/${notification.post._id}`);
          } else if (notification.sender?.username) {
            router.push(`/UserProfile/${notification.sender.username}`);
          }
          break;
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAsRead(true);
    try {
      const unreadNotifications = combinedNotifications.filter(n => !n.read);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3009';
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(notification =>
          axios.patch(`${backendUrl}/api/notifications/${notification._id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      
      // Update local state
      unreadNotifications.forEach(notification => markNotificationAsRead(notification._id));
      
      // Update the allNotifications state to reflect the changes
      setAllNotifications(prev => 
        prev.map(notif => ({
          ...notif,
          read: true
        }))
      );
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Icon mapping
  const getNotificationIcon = (type) => {
    switch (type) {
      case "like": return <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      case "comment": return <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
      case "follow": return <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case "post": return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />;
      case "amplify": return <Repeat2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
      case "quote": return <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />;
      case "mention": return <AtSign className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />;
      default: return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    }
  };

  // Text mapping
  const getNotificationText = (notification) => {
    const senderName = notification.sender?.username || 'Someone';
    switch (notification.type) {
      case 'post': return `${senderName} created a new post`;
      case 'like': return `${senderName} liked your post`;
      case 'comment': return `${senderName} commented on your post`;
      case 'follow': return `${senderName} started following you`;
      case 'amplify': return `${senderName} amplified your post`;
      case 'quote': return `${senderName} quoted your post`;
      case 'mention': return `${senderName} mentioned you in a post`;
      default: return `New notification from ${senderName}`;
    }
  };

  // Time formatter
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const unreadNotificationsCount = combinedNotifications.filter(n => !n.read).length;

  // Update socket context's unread count whenever combined notifications change
  useEffect(() => {
    if (updateUnreadCount) {
      updateUnreadCount(unreadNotificationsCount);
    }
  }, [unreadNotificationsCount, updateUnreadCount]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center">
      <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-gray-50 dark:bg-gray-900 flex-1 px-4 mx-4 overflow-y-auto h-screen custom-scrollbar">
        <div className="w-full max-w-sm sm:max-w-lg md:w-lg lg:w-xl mx-auto flex flex-col items-center relative px-2 sm:px-4 min-h-screen">
          <div className="w-full py-6">

            
            <div 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 w-full"
              
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    {unreadNotificationsCount > 0 ? (
                      <div>
                        <BellRing className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                      </div>
                    ) : (
                      <Bell className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-600" />
                    )}
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-semibold shadow-md border border-white">
                        <span className="text-[10px] sm:text-xs">
                          {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-300 truncate">Notifications</h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 truncate">
                      {unreadNotificationsCount > 0 
                        ? `${unreadNotificationsCount} unread notification${unreadNotificationsCount > 1 ? 's' : ''}`
                        : 'All caught up'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3 flex-shrink-0">
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={markingAsRead}
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-primary text-white rounded-lg hover:bg-[#0089c7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                      title="Mark all as read"
                    >
                      {markingAsRead ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  )}

                  
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <motion.div 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {loading ? (
                <div className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading notifications...</p>
                </div>
              ) : combinedNotifications.length === 0 ? (
                <div className="p-4 sm:p-6 md:p-8 text-center"> 
                  <Bell className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 mx-auto mb-3 sm:mb-4 text-gray-900 dark:text-gray-300" />
                  <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-gray-300 mb-2">No notifications yet</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2 sm:px-4 max-w-sm mx-auto">
                    You'll see notifications here when people interact with your posts or follow you.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {combinedNotifications.map((notification, index) => {
                    const isLastNotification = combinedNotifications.length === index + 1;
                    // Create a unique key - use _id if available, otherwise fallback to index
                    const notificationKey = notification._id || `notification-${index}-${notification.type}-${notification.createdAt}`;
                    
                    return (
                      <motion.div
                        key={notificationKey}
                        ref={isLastNotification ? lastNotificationElementRef : null}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 sm:p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors rounded-md ${
                          !notification.read ? 'bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-gray-700 shadow-sm' : 'border dark:border-gray-700 border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                          <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-300 mb-1 leading-5 sm:leading-6">
                              {getNotificationText(notification)}
                            </p>
                            {notification.post?.content && (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 leading-4 sm:leading-5">
                                {notification.post.content.substring(0, 100)}
                              </p>
                            )}
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0 mt-1 sm:mt-2">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-blue-500 dark:bg-gray-900 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Loading more notifications */}
                  {loadingMore && (
                    <div className="p-4 sm:p-6 text-center border-t border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-900">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 sm:mt-3 text-sm sm:text-base font-medium text-blue-700">Loading more notifications...</p>
                      <p className="text-xs sm:text-sm text-blue-600 mt-1">Please wait</p>
                    </div>
                  )}
                  
                  {/* Manual Load More Button (fallback) */}
                  {hasMore && !loadingMore && !loading && combinedNotifications.length >= LIMIT && (
                    <div className="p-4 sm:p-6 text-center border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={loadMoreNotifications}
                        className="bg-primary text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-[#0089c7] transition-colors font-medium text-sm sm:text-base"
                      >
                        Load More Notifications
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Or scroll to auto-load</p>
                    </div>
                  )}
                  
                  {/* All caught up message */}
                  {!hasMore && combinedNotifications.length > 0 && !loadingMore && (
                    <div className="p-4 sm:p-6 text-center border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-center mb-2">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2" />
                        <span className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 ">You're all caught up!</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">You've seen all your notifications</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
