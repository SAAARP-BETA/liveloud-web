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

  // Send a message to a conversation (group)
  async sendToConversation(conversationId, content, token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING.replace(/\/+$/,'')}/messages/conversations/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message to conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending to conversation:', error);
      throw error;
    }
  }

  // Get a single conversation's metadata
  async getConversation(conversationId, token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING.replace(/\/+$/,'')}/messages/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch conversation');
      }

      return await response.json();
    } catch (error) {
      // Don't log here - let the caller decide if this is an error
      // (It's expected to fail when trying to fetch a user ID as conversation)
      throw error;
    }
  }

  // Create a new conversation (group)
  async createConversation(participantIds = [], name = '', token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING.replace(/\/+$/,'')}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ participantIds, name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Update conversation (e.g., rename group)
  async updateConversation(conversationId, payload = {}, token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING.replace(/\/+$/,'')}/messages/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  // Add a participant to a conversation
  async addParticipant(conversationId, userId, token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING.replace(/\/+$/,'')}/messages/conversations/${conversationId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add participant');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  // Remove a participant from a conversation
  async removeParticipant(conversationId, userId, token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING.replace(/\/+$/,'')}/messages/conversations/${conversationId}/participants/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove participant');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  // Mark messages as read for a conversation or user
  async markAsRead(conversationOrUserId, token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGING}/messages/${conversationOrUserId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to mark messages as read');
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

}

// Create and export a singleton instance
export const messagingService = new MessagingService();
