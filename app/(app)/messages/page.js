"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import defaultAvatar from '@/assets/default-avatar.jpg';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messagingService } from '../../utils/messagingService';


export default function MessagesIndex() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const { token, user } = useAuth();
  const { refetchUnreadMessageCount } = useSocket();
  const router = useRouter();

  // Fetch conversations
  const fetchConversations = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (!token) return;

      // fetching conversations

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await messagingService.getConversations(pageNum, 30, token);
      
      if (isRefresh || pageNum === 1) {
        setConversations(response.conversations);
      } else {
        setConversations(prev => [...prev, ...response.conversations]);
      }

      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      alert('Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!token) return;
      const response = await messagingService.getUnreadCount(token);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    refetchUnreadMessageCount();
  }, [fetchConversations, fetchUnreadCount, refetchUnreadMessageCount]);

  const onRefresh = () => {
    fetchConversations(1, true);
    fetchUnreadCount();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchConversations(page + 1);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
      loadMore();
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-white dark:bg-gray-900 flex-1 px-4 mx-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-white dark:bg-gray-900 flex-1 px-4 mx-4 overflow-y-auto h-screen custom-scrollbar">      
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            {unreadCount > 0 && (
              <p className="text-primary text-sm font-medium">
                {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
              </p>
            )}
          </div>
          
          <button
            onClick={() => router.push('/messages/new')}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center hover:bg-sky-600 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="pb-24">
        {conversations.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-96 px-4 sm:px-6">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">No Messages Yet</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base">
              Start a conversation by following someone and sending them a message!
            </p>
          </div>
        ) : (
          conversations.map((item) => {
            const isGroup = !!item.isGroup;
            const title = isGroup ? (item.name || item.participant?.username || 'Group') : (item.participant?.username || 'Unknown');
            const avatarSrc = isGroup ? (item.groupProfilePicture || defaultAvatar) : (item.participant?.profilePicture || defaultAvatar);
            const subtitle = item.lastMessage ? item.lastMessage.content : (isGroup ? `${item.totalParticipants || (item.participants?.length || 0)} participants` : 'No messages yet');
            const clickId = isGroup ? item._id : item.participant?._id || item._id;

            return (
              <div
                key={item._id}
                onClick={() => router.push(`/messages/chat/${clickId}`)}
                className="flex items-center px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <Image
                    src={avatarSrc}
                    alt={title}
                    width={40}
                    height={40}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  {item.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full min-w-4 h-4 sm:min-w-5 sm:h-5 flex items-center justify-center">
                      <span className="text-white text-xs font-bold px-1">
                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {title}
                    </h3>
                    <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0 ml-2">
                      {item.lastMessage ? formatTime(item.lastMessage.createdAt) : ''}
                    </span>
                  </div>

                  <p className={`text-gray-600 dark:text-gray-300 mt-1 truncate text-sm ${item.unreadCount > 0 ? 'font-semibold' : ''}`}>
                    {subtitle}
                  </p>
                </div>

                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            );
          })
        )}

        {hasMore && conversations.length > 0 && (
          <div className="py-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50 z-10"
      >
        <svg 
          className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}