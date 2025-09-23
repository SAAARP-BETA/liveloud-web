export class ChatManager {
  constructor() {
    this.refreshIntervals = new Map();
    this.isActive = true;
  }

  // Start auto-refresh for a specific chat
  startAutoRefresh(chatId, callback, intervalMs = 3000) {
    this.stopAutoRefresh(chatId); // Clear any existing interval
    
    const interval = setInterval(() => {
      if (this.isActive) {
        callback();
      }
    }, intervalMs);
    
    this.refreshIntervals.set(chatId, interval);
  }

  // Stop auto-refresh for a specific chat
  stopAutoRefresh(chatId) {
    const interval = this.refreshIntervals.get(chatId);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(chatId);
    }
  }

  // Stop all auto-refresh intervals
  stopAllRefresh() {
    this.refreshIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.refreshIntervals.clear();
  }

  // Set app state (to pause refresh when app is in background)
  setActive(isActive) {
    this.isActive = isActive;
  }

  // Cleanup
  destroy() {
    this.stopAllRefresh();
    this.isActive = false;
  }
}

// Message utilities
export const messageUtils = {
  // Group messages by date
  groupMessagesByDate: (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  },

  // Format time for message display
  formatMessageTime: (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  },

  // Check if message should show timestamp
  shouldShowTimestamp: (currentMessage, previousMessage, minuteThreshold = 5) => {
    if (!previousMessage) return true;
    
    const currentTime = new Date(currentMessage.createdAt);
    const previousTime = new Date(previousMessage.createdAt);
    const diffInMinutes = (currentTime - previousTime) / (1000 * 60);
    
    return diffInMinutes > minuteThreshold;
  },

  // Check if message should show sender avatar
  shouldShowAvatar: (currentMessage, nextMessage, userId) => {
    if (currentMessage.sender._id === userId) return false; // Don't show avatar for own messages
    if (!nextMessage) return true; // Last message in list
    return nextMessage.sender._id !== currentMessage.sender._id; // Different sender for next message
  },

  // Validate message content
  validateMessage: (content) => {
    if (!content || typeof content !== 'string') {
      return { isValid: false, error: 'Message content is required' };
    }
    
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    
    if (trimmed.length > 2000) {
      return { isValid: false, error: 'Message is too long (max 2000 characters)' };
    }
    
    return { isValid: true, content: trimmed };
  },

  // Generate optimistic message for immediate UI update
  createOptimisticMessage: (content, senderId, recipientId) => {
    return {
      _id: `temp_${Date.now()}`,
      content,
      sender: { _id: senderId },
      recipient: { _id: recipientId },
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
  },

  // Truncate user bio for display
  truncateBio: (bio, maxLength = 60) => {
    if (!bio || typeof bio !== 'string') return '';
    
    const trimmed = bio.trim();
    if (trimmed.length <= maxLength) return trimmed;
    
    // Find the last space before the maxLength to avoid cutting words
    const truncated = trimmed.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.7) { // Only use last space if it's not too far back
      return trimmed.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  },

  // Format user display name
  formatDisplayName: (user) => {
    if (!user) return 'Unknown User';
    return user.fullname || user.username || 'Unknown User';
  }
};

// Notification utilities for messages
export const messageNotifications = {
  // Get unread count for display
  formatUnreadCount: (count) => {
    if (count === 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  },

  // Check if notification should be shown
  shouldShowNotification: (message, currentUserId, isAppActive) => {
    return message.sender._id !== currentUserId && !isAppActive;
  }
};

// Create a singleton instance
export const chatManager = new ChatManager();
