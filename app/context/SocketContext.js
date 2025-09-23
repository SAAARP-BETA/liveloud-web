'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  notifications: [],
  unreadCount: 0,
  unreadMessageCount: 0,
  markNotificationAsRead: () => {},
  clearNotifications: () => {},
  updateUnreadCount: () => {},
  updateUnreadMessageCount: () => {}
});

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Initialize Socket.io connection
  useEffect(() => {
    if (isAuthenticated && token && user) {
      console.log('🔌 Initializing Socket.io connection...');
      console.log('👤 User:', user.username);
      console.log('🎫 Token length:', token.length);
      
      // Use local backend for development, production backend for production
      const isDevelopment = process.env.NODE_ENV === 'development';
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
        (isDevelopment ? 'http://localhost:3009' : 'https://backend-4iko.onrender.com');
      
      console.log('🌐 Backend URL:', backendUrl);
      
      const newSocket = io(backendUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket.io connected:', newSocket.id);
        console.log('🔗 Backend URL:', backendUrl);
        setIsConnected(true);
        // toast.success('Connected to notifications');
        console.info('Connected to notifications');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket.io disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          console.log('🔄 Attempting to reconnect...');
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket.io connection error:', error);
        console.error('🔍 Error details:', {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type
        });
        setIsConnected(false);
        if (error.message.includes('Authentication error')) {
          //toast.error('Authentication failed. Please log in again.');
          console.error('Authentication failed. Please log in again.');
        } else {
          //toast.error('Connection failed. Retrying...');
          console.error('Connection failed. Retrying...');
        }
      });

      // Notification event handlers
      newSocket.on('new_notification', (notification) => {
        console.log('🔔 Received new notification:', notification);
        console.log('📊 Notification type:', notification.type);
        console.log('👤 From:', notification.sender?.username);
        
        // Add notification to state
        setNotifications(prev => [notification, ...prev]);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        const notificationMessage = getNotificationMessage(notification);
        if (notificationMessage) {
          console.log('🍞 Showing toast:', notificationMessage);
          toast.success(notificationMessage, {
            duration: 4000,
            position: 'top-right'
          });
        }
      });

      // Message event handlers
      newSocket.on('new_message', (message) => {
        console.log('💬 Received new message:', message);
        console.log('👤 From:', message.sender?.username);
        
        // Increment unread message count
        setUnreadMessageCount(prev => prev + 1);
        
        // Show toast notification for new message
        const senderName = message.sender?.username || 'Someone';
        toast.success(`New message from ${senderName}`, {
          duration: 3000,
          position: 'top-right'
        });
      });

      // Room management events
      newSocket.on('joined_room', (roomName) => {
        console.log('Joined room:', roomName);
      });

      newSocket.on('left_room', (roomName) => {
        console.log('Left room:', roomName);
      });

      setSocket(newSocket);

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up Socket.io connection...');
        console.log('🔌 Socket ID before cleanup:', newSocket.id);
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
        console.log('✅ Socket.io connection cleaned up');
      };
    } else {
      // User not authenticated, close any existing connection
      if (socket) {
        console.log('User not authenticated, closing Socket.io connection...');
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token, user?._id]);

  // Helper function to generate notification messages
  const getNotificationMessage = (notification) => {
    const senderName = notification.sender?.username || 'Someone';
    
    switch (notification.type) {
      case 'post':
        return `${senderName} created a new post`;
      case 'like':
        return `${senderName} liked your post`;
      case 'comment':
        return `${senderName} commented on your post`;
      case 'follow':
        return `${senderName} started following you`;
      case 'amplify':
        return `${senderName} amplified your post`;
      case 'quote':
        return `${senderName} quoted your post`;
      case 'mention':
        return `${senderName} mentioned you in a post`;
      default:
        return `New notification from ${senderName}`;
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Decrement unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Update unread count (for API-fetched notifications)
  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  // Update unread message count (for API-fetched messages)
  const updateUnreadMessageCount = (count) => {
    setUnreadMessageCount(count);
  };

  // Mark message as read (when user opens a chat)
  const markMessagesAsRead = (userId) => {
    // This could be enhanced to mark specific conversation as read
    // For now, we'll rely on the API call to get updated counts
    console.log('Marking messages as read for user:', userId);
  };

  // Join a specific room
  const joinRoom = (roomName) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomName);
    }
  };

  // Leave a specific room
  const leaveRoom = (roomName) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomName);
    }
  };

  // Send a custom event
  const emit = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  };

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    unreadMessageCount,
    markNotificationAsRead,
    clearNotifications,
    updateUnreadCount,
    updateUnreadMessageCount,
    markMessagesAsRead,
    joinRoom,
    leaveRoom,
    emit
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
