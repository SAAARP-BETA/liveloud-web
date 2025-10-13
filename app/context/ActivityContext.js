"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSocket } from './SocketContext';

export const ActivityContext = createContext({
  onlineUsers: new Set(),
  isUserOnline: () => false,
});

export const ActivityProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const handleUserOnline = useCallback(({ userId }) => {
    console.log(`ActivityContext: User ${userId} is online.`);
    setOnlineUsers(prev => new Set(prev).add(userId));
  }, []);

  const handleUserOffline = useCallback(({ userId }) => {
    console.log(`ActivityContext: User ${userId} is offline.`);
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const handleOnlineList = useCallback((userIds) => {
    console.log('ActivityContext: Received initial list of online users.', userIds);
    setOnlineUsers(new Set(userIds));
  }, []);

  useEffect(() => {
    if (isConnected && socket) {
      socket.on('user:online', handleUserOnline);
      socket.on('user:offline', handleUserOffline);
      socket.on('online_users_list', handleOnlineList);

      return () => {
        socket.off('user:online', handleUserOnline);
        socket.off('user:offline', handleUserOffline);
        socket.off('online_users_list', handleOnlineList);
      };
    }
  }, [isConnected, socket, handleUserOnline, handleUserOffline, handleOnlineList]);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const value = useMemo(() => ({ onlineUsers, isUserOnline }), [onlineUsers, isUserOnline]);

  return (
    <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
  );
};