'use client';

import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { messagingService } from './messagingService';

export const useMessages = () => {
  const { token } = useAuth();
  const { updateUnreadMessageCount, unreadMessageCount } = useSocket();

  // Fetch unread message count on mount
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (token) {
        try {
          const result = await messagingService.getUnreadCount(token);
          const count = result.unreadCount || 0;
          updateUnreadMessageCount(count);
        } catch (error) {
          console.error('Error fetching unread message count:', error);
          updateUnreadMessageCount(0);
        }
      }
    };

    fetchUnreadCount();
  }, [token, updateUnreadMessageCount]);

  // Refetch unread count function
  const refetchUnreadCount = async () => {
    if (token) {
      try {
        const result = await messagingService.getUnreadCount(token);
        const count = result.unreadCount || 0;
        updateUnreadMessageCount(count);
        return count;
      } catch (error) {
        console.error('Error refetching unread message count:', error);
        return 0;
      }
    }
    return 0;
  };

  return {
    unreadMessageCount,
    refetchUnreadCount
  };
};