import { API_ENDPOINTS } from './config';

export class MessagingService {
  // Send a message to a user
  async sendMessage(recipientId, content, attachments = [], token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId,
          content,
          attachments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.log('Error sending message:', error);
      throw error;
    }
  }

  // Get messages with a specific user
  async getMessages(userId, page = 1, limit = 20, token) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.MESSAGING}/messages/${userId}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Get all conversations for the current user
  async getConversations(page = 1, limit = 20, token) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.MESSAGING}/messages?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch conversations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Delete a message
  async deleteMessage(messageId, token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount(token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING}/messages/unread/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch unread count');
      }

      const data = await response.json();
      return data; // Return the full response object
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { unreadCount: 0 }; // Return proper structure on error
    }
  }
}

// Create and export a singleton instance
export const messagingService = new MessagingService();
