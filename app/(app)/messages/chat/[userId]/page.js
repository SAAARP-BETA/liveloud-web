"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../../context/AuthContext';
import { messagingService } from '../../../../utils/messagingService';
import { chatManager, messageUtils } from '../../../../utils/chatUtils';
import { useToast } from '../../../../components/ui/Toast';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recipient, setRecipient] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(null);

  const router = useRouter();
  const params = useParams();
  const userId = params.userId; // This gets the dynamic route parameter
  const { token, user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle visibility change for auto-refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      chatManager.setActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Setup auto-refresh when component mounts
  useEffect(() => {
    if (!userId || !token) return;

    const refreshMessages = async () => {
      try {
        const response = await messagingService.getMessages(userId, 1, 20, token);
        
        if (response.messages.length > 0) {
          const newestMessageId = response.messages[0]._id;
          if (newestMessageId !== lastMessageId) {
            setMessages(response.messages.reverse());
            setLastMessageId(newestMessageId);
            // Scroll to bottom if there are new messages
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch (error) {
        console.error('Error auto-refreshing messages:', error);
      }
    };

    // Start auto-refresh
    chatManager.startAutoRefresh(`chat_${userId}`, refreshMessages, 3000);

    return () => {
      chatManager.stopAutoRefresh(`chat_${userId}`);
    };
  }, [token, userId, lastMessageId]);

  // Fetch recipient info and messages
  const fetchMessages = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      if (!token || !userId) return;

      if (!isLoadMore) {
        setLoading(true);
      }

      const response = await messagingService.getMessages(userId, pageNum, 20, token);
      
      if (!isLoadMore) {
        const reversedMessages = response.messages.reverse();
        setMessages(reversedMessages);
        setLastMessageId(reversedMessages[0]?._id || null);
        
        // Get recipient info from first message if available
        if (response.messages.length > 0) {
          const firstMessage = response.messages[0];
          const recipientInfo = firstMessage.sender._id === user._id 
            ? firstMessage.recipient 
            : firstMessage.sender;
          setRecipient(recipientInfo);
        }
      } else {
        setMessages(prev => [...response.messages.reverse(), ...prev]);
      }

      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, userId, user?._id]);

  useEffect(() => {
    if (userId && token && user) {
      fetchMessages();
    }
  }, [fetchMessages, userId, token, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e?.preventDefault();
    
    const validation = messageUtils.validateMessage(messageText);
    if (!validation.isValid || sending || !token) {
      if (!validation.isValid) {
        showToast(validation.error, 'warning');
      }
      return;
    }

    let optimisticMessage = null;
    let content = '';

    try {
      setSending(true);
      content = validation.content;
      setMessageText('');

      // Create optimistic message for immediate UI update
      optimisticMessage = messageUtils.createOptimisticMessage(content, user._id, userId);
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Scroll to bottom immediately
      setTimeout(scrollToBottom, 50);

      const response = await messagingService.sendMessage(userId, content, [], token);
      
      // Replace optimistic message with real message
      setMessages(prev => prev.map(msg => 
        msg._id === optimisticMessage._id ? response : msg
      ));
      
      setLastMessageId(response._id);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle specific error cases
      if (error.message.includes('only message users who follow')) {
        showToast('You can only message users who follow you or whom you follow', 'warning');
        // Navigate back after a short delay to show the toast
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        showToast('Failed to send message', 'error');
      }
      
      // Remove optimistic message on error if it was created
      if (optimisticMessage) {
        setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      }
      setMessageText(content); // Restore message text on error
    } finally {
      setSending(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      fetchMessages(page + 1, true);
    }
  };

  const formatMessageTime = (timestamp) => {
    return messageUtils.formatMessageTime(timestamp);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !loading) {
      loadMoreMessages();
    }
  };

  if (loading && messages.length === 0) {
    return (
      <>
        <ToastComponent />
        <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-white dark:bg-gray-900 flex-1 px-4 mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10">
          <div className="flex items-center px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={() => router.back()}
              className="mr-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
              </div>
            </div>

            <button className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading messages...</p>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <ToastComponent />
      <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-white dark:bg-gray-900 flex-1 px-4 mx-4 flex flex-col overflow-y-auto h-screen custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10">
        <div className="flex items-center px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => router.back()}
            className="mr-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center flex-1">
            <Image
              src={recipient?.profilePicture || '/placeholder-avatar.png'}
              alt={recipient?.username || 'User'}
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {recipient?.username || 'Loading...'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                {recipient?.fullname || ''}
              </p>
            </div>
          </div>

          <button className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 lg:px-8 pb-4"
        onScroll={handleScroll}
        style={{ minHeight: 'calc(100vh - 200px)' }}
      >
        {/* Load More Button */}
        {hasMore && messages.length > 0 && (
          <div className="py-4 flex justify-center">
            <button
              onClick={loadMoreMessages}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Load more messages'
              )}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start the conversation</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">Send a message to start chatting</p>
          </div>
        ) : (
          messages.map((item, index) => {
            const isMyMessage = item.sender._id === user._id;
            const showAvatar = !isMyMessage && messageUtils.shouldShowAvatar(item, messages[index + 1], user._id);
            const showTime = messageUtils.shouldShowTimestamp(item, messages[index - 1]);
            const isOptimistic = item.isOptimistic;

            return (
              <div key={item._id} className="mb-2">
                {showTime && (
                  <div className="flex justify-center mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                      {formatMessageTime(item.createdAt)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  {!isMyMessage && showAvatar && (
                    <Image
                      src={item.sender.profilePicture || '/placeholder-avatar.png'}
                      alt={item.sender.username}
                      width={24}
                      height={24}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 object-cover"
                    />
                  )}
                  
                  {!isMyMessage && !showAvatar && (
                    <div className="w-6 sm:w-8 mr-2" />
                  )}

                  <div
                    className={`max-w-xs px-3 sm:px-4 py-2 rounded-2xl text-sm sm:text-base ${
                      isMyMessage
                        ? isOptimistic 
                          ? 'bg-blue-400' 
                          : 'bg-blue-500'
                        : 'bg-white dark:bg-gray-700 border dark:border-gray-600'
                    }`}
                    style={{
                      opacity: isOptimistic ? 0.7 : 1
                    }}
                  >
                    <p className={`${isMyMessage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {item.content}
                    </p>
                  </div>
                  
                  {isMyMessage && isOptimistic && (
                    <div className="ml-2 flex items-end">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-3 sm:p-4">
        <form onSubmit={sendMessage} className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 sm:px-4 py-2">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm sm:text-base"
              maxLength={2000}
              rows={1}
              style={{ minHeight: '20px', maxHeight: '100px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
              messageText.trim() && !sending 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
            ) : (
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 ${messageText.trim() ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}