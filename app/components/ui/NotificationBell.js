'use client';

import React from 'react';
import { useSocket } from '@/app/context/SocketContext';
import { useRouter } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

const NotificationBell = () => {
  const { isConnected, unreadCount } = useSocket();
  const router = useRouter();

  const handleNotificationClick = () => {
    router.push('/notifications');
  };

  return (
    <button
      onClick={handleNotificationClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors"
      aria-label="Notifications"
    >
      {unreadCount > 0 ? (
        <BellIconSolid className="h-6 w-6 text-blue-600" />
      ) : (
        <BellIcon className="h-6 w-6" />
      )}
      
      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    
    </button>
  );
};

export default NotificationBell;
