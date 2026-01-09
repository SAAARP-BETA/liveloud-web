"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import defaultAvatar from '@/assets/default-avatar.jpg';
import { useAuth } from '../../../../context/AuthContext';
import { useSocket } from '../../../../context/SocketContext';
import { messagingService } from '../../../../utils/messagingService';
import { API_ENDPOINTS } from '../../../../utils/config';
import { chatManager, messageUtils } from '../../../../utils/chatUtils';
import { useToast } from '../../../../components/ui/Toast';

export default function ChatScreen() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId; // This gets the dynamic route parameter
  const { token, user } = useAuth();
  const { markMessagesAsRead, refetchUnreadMessageCount } = useSocket();
  const { showToast, ToastComponent } = useToast();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recipient, setRecipient] = useState(null);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const renameInputRef = useRef(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [addResults, setAddResults] = useState([]);
  const [addSearching, setAddSearching] = useState(false);
  const addTimerRef = useRef(null);

  const isGroupConv = !!(
    conversationInfo?.isGroup ||
    (conversationInfo?.participants && conversationInfo.participants.length > 2)
  );

  const openAddMember = () => {
    // Only allow adding members on group conversations. conversationInfo may not be
    // populated yet, so also check messages for conversation metadata.
    if (!isGroupConv) {
      showToast('Add member is only available for group conversations', 'warning');
      return;
    }

    setShowAddMember(true);
  };

  const openRenameModal = () => {
    if (!conversationInfo || !conversationInfo.isGroup) {
      showToast('Only group conversations can be renamed', 'warning');
      return;
    }
    setRenameName(conversationInfo?.name || '');
    setShowRenameModal(prev => {
      return true;
    });
  };

  useEffect(() => {
    if (showRenameModal) {
      // focus the input a tick after render
      setTimeout(() => {
        try { renameInputRef.current?.focus(); } catch (e) { /* focus failed silently */ }
      }, 50);
    }
  }, [showRenameModal]);
  
  const [lastMessageId, setLastMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Pre-render Add Member portal so it can show even if component returns early (loading state)
  const addMemberPortal = showAddMember && typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" style={{ zIndex: 2147483647 }} role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg mx-4 p-4 shadow-xl" style={{ zIndex: 2147483648 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Add Member</h3>
          <button onClick={() => setShowAddMember(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
        </div>

        {/* Participants list (show current members with remove action) */}
        <div className="mb-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Participants</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(conversationInfo?.participants || []).map(p => (
              <div key={p._id} className="flex items-center space-x-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                <Image src={p.profilePicture || defaultAvatar} width={28} height={28} className="w-7 h-7 rounded-full object-cover" alt={p.username} />
                <div className="text-sm">{p.username}</div>
                {p._id !== user._id && (
                  <button onClick={async () => {
                    try {
                      showToast('Removing member...', 'info');
                      await messagingService.removeParticipant(userId, p._id, token);
                      setConversationInfo(prev => ({ ...(prev||{}), participants: (prev?.participants||[]).filter(x => x._id !== p._id) }));
                      showToast('Member removed', 'success');
                    } catch (err) {
                      console.error('Failed to remove member', err);
                      showToast(err?.message || 'Failed to remove member', 'error');
                    }
                  }} className="ml-2 text-red-600 px-2 py-1 rounded border">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Search users</label>
          <input
            value={addQuery}
            onChange={(e) => setAddQuery(e.target.value)}
            placeholder="Type a username to search"
            className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {addSearching ? (
            <div className="py-6 text-center">Searching...</div>
          ) : (
            addResults.map(u => (
              <div key={u._id} className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                <div className="flex items-center">
                  <Image src={u.profilePicture || defaultAvatar} width={36} height={36} className="w-9 h-9 rounded-full mr-3 object-cover" alt={u.username} />
                  <div>
                    <div className="font-medium text-sm">{u.username}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{u.fullname || ''}</div>
                  </div>
                </div>
                <div>
                  <button onClick={async () => {
                    try {
                      showToast('Adding member...', 'info');
                      const res = await messagingService.addParticipant(userId, u._id, token);
                      const updated = res?.conversation || res;
                      if (updated && updated.participants) {
                        setConversationInfo(prev => ({ ...(prev||{}), ...updated }));
                      } else {
                        setConversationInfo(prev => ({ ...(prev||{}), participants: [...(prev?.participants||[]), u] }));
                      }
                      showToast('Member added', 'success');
                      setShowAddMember(false);
                    } catch (err) {
                      console.error('Failed to add member', err);
                      showToast(err?.message || 'Failed to add member', 'error');
                    }
                  }} className="px-3 py-1 bg-blue-600 text-white rounded-md">Add</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-end mt-3">
          <button onClick={() => setShowAddMember(false)} className="px-3 py-1 rounded-md border">Close</button>
        </div>
      </div>
    </div>, document.body
  ) : null;

  // Search users for adding to conversation (debounced)
  useEffect(() => {
    if (addTimerRef.current) clearTimeout(addTimerRef.current);
    if (!addQuery || addQuery.trim().length < 2) {
      setAddResults([]);
      setAddSearching(false);
      return;
    }

    setAddSearching(true);
    addTimerRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(`${API_ENDPOINTS.SEARCH}/search?query=${encodeURIComponent(addQuery)}&type=users&limit=20`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (!resp.ok) throw new Error('Search failed');
        const data = await resp.json();
        const filtered = (data.users || []).filter(u => u._id !== user._id);
        setAddResults(filtered);
      } catch (err) {
        console.error('Add member search error', err);
        setAddResults([]);
      } finally {
        setAddSearching(false);
      }
    }, 300);

    return () => clearTimeout(addTimerRef.current);
  }, [addQuery, token, user._id]);

  useEffect(() => {}, [showAddMember]);

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
        // Try conversation endpoint first (groups), fallback to user messages
        try {
          const data = await messagingService.getConversation(userId, token);
          if (data.messages && data.messages.length > 0) {
            const newestMessageId = data.messages[0]._id;
            if (newestMessageId !== lastMessageId) {
              setMessages(data.messages.reverse());
              setLastMessageId(newestMessageId);
              setConversationInfo(data.conversation || data);
              setTimeout(scrollToBottom, 100);
            }
          }
        } catch (err) {
          // not a conversation id — fallback to user messages
          const response = await messagingService.getMessages(userId, 1, 20, token);
          if (response.messages.length > 0) {
            const newestMessageId = response.messages[0]._id;
            if (newestMessageId !== lastMessageId) {
              setMessages(response.messages.reverse());
              setLastMessageId(newestMessageId);
              setTimeout(scrollToBottom, 100);
            }
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

      // Try conversation endpoint first (groups)
      try {
        const data = await messagingService.getConversation(userId, token);

        if (!isLoadMore) {
          const reversedMessages = (data.messages || []).reverse();
          setMessages(reversedMessages);
          setLastMessageId(reversedMessages[0]?._id || null);
          setConversationInfo(data.conversation || data.conversationInfo || data);

          // For 1:1 fallback recipient still may be present on messages
          if (data.messages && data.messages.length > 0) {
            const firstMessage = data.messages[0];
            const recipientInfo = firstMessage.sender._id === user._id ? firstMessage.recipient : firstMessage.sender;
            setRecipient(recipientInfo);
          }
        } else {
          setMessages(prev => [...(data.messages || []).reverse(), ...prev]);
        }

        setHasMore(pageNum < (data.totalPages || 1));
        setPage(pageNum);
      } catch (err) {
        // Not a conversation or conversation endpoint failed — fallback to user messages
        const response = await messagingService.getMessages(userId, pageNum, 20, token);

        if (!isLoadMore) {
          const reversedMessages = response.messages.reverse();
          setMessages(reversedMessages);
          setLastMessageId(reversedMessages[0]?._id || null);

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
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
      
      // Backend marks messages as read when fetching them, so update the counter
      if (!isLoadMore && pageNum === 1) {
        // Small delay to ensure backend has processed the read status
        setTimeout(() => {
          refetchUnreadMessageCount();
        }, 300);
      }
    }
  }, [token, userId, user?._id, refetchUnreadMessageCount]);

  useEffect(() => {
    if (userId && token && user) {
      fetchMessages();
    }
  }, [fetchMessages, userId, token, user]);

  // Mark messages as read when opening the chat
  useEffect(() => {
    if (userId && token) {
      // Mark messages as read via socket to notify other clients
      markMessagesAsRead(userId);
      
      // The backend automatically marks messages as read when fetching them
      // via GET /messages/:recipientId, so we just need to refetch the counter
      // after a short delay to ensure the backend has processed it
      const timer = setTimeout(() => {
        refetchUnreadMessageCount();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [userId, token, markMessagesAsRead, refetchUnreadMessageCount]);

  // Try to load conversation metadata (for groups) if not already populated
  useEffect(() => {
    if (!userId || !token) return;
    if (conversationInfo) return; // already have it

    const loadConversation = async () => {
      try {
        const data = await messagingService.getConversation(userId, token);
        // response might be the conversation object or { conversation: { ... } }
        if (data) {
          if (data.conversation) setConversationInfo(data.conversation);
          else setConversationInfo(data);
        }
      } catch (err) {
        // Not a group or no metadata available; ignore
        // console.debug('No conversation metadata for', userId, err);
      }
    };

    loadConversation();
  }, [userId, token, conversationInfo]);

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
      // Determine whether this is a group conversation. Only use the conversation
      // endpoint for real group conversations (conversationInfo.isGroup or participants>2).
      const isConversation = !!(
        conversationInfo?.isGroup ||
        (conversationInfo?.participants && conversationInfo.participants.length > 2)
      );

      // Build optimistic message depending on type
      if (isConversation) {
        optimisticMessage = {
          _id: `temp_${Date.now()}`,
          content,
          sender: { _id: user._id, username: user.username, profilePicture: user.profilePicture || '' },
          recipient: null,
          conversation: userId,
          createdAt: new Date().toISOString(),
          isOptimistic: true
        };
      } else {
        optimisticMessage = messageUtils.createOptimisticMessage(content, user._id, userId);
      }

      setMessages(prev => [...prev, optimisticMessage]);

      // Scroll to bottom immediately
      setTimeout(scrollToBottom, 50);

      const response = isConversation
        ? await messagingService.sendToConversation(userId, content, token)
        : await messagingService.sendMessage(userId, content, [], token);

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

  // Rename conversation (group)
  const saveRename = async () => {
    if (!renameName.trim() || !token) {
      showToast('Please provide a valid name', 'warning');
      return;
    }

    try {
      setRenaming(true);
      const data = await messagingService.updateConversation(userId, { name: renameName.trim() }, token);
      // update response received
      // Response might be { conversation: { ... } } or the conversation object
      const newConv = data?.conversation || data;
      if (newConv) {
        setConversationInfo(prev => ({ ...(prev || {}), ...newConv }));
      }
      showToast('Conversation renamed', 'success');
      setShowRenameModal(false);
    } catch (err) {
      console.error('Failed to rename conversation', err);
      showToast('Failed to rename conversation', 'error');
    } finally {
      setRenaming(false);
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

  // Determine at render-time whether this conversation is a group. We use this to
  // hide group-only actions (rename/add) when viewing a 1:1 chat. conversationInfo may
  // be empty until loaded, so also detect per-message conversation metadata.
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
      {/* Rename Modal (portal) */}
      {showRenameModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" style={{ zIndex: 2147483647 }} role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md mx-4 p-4 shadow-xl" style={{ zIndex: 2147483648 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Rename Group</h3>
              <button onClick={() => setShowRenameModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
            </div>

            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">New group name</label>
              <input
                ref={renameInputRef}
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="Enter new group name"
                className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button onClick={() => setShowRenameModal(false)} className="px-3 py-1 rounded-md border">Cancel</button>
              <button onClick={saveRename} disabled={renaming} className="px-4 py-1 bg-blue-600 text-white rounded-md">
                {renaming ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Member Modal (portal) */}
      {showAddMember && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" style={{ zIndex: 2147483647 }} role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg mx-4 p-4 shadow-xl" style={{ zIndex: 2147483648 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add Member</h3>
              <button onClick={() => setShowAddMember(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
            </div>

            {/* Participants list (show current members with remove action) */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">Participants</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(conversationInfo?.participants || []).map(p => (
                  <div key={p._id} className="flex items-center space-x-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    <Image src={p.profilePicture || defaultAvatar} width={28} height={28} className="w-7 h-7 rounded-full object-cover" alt={p.username} />
                    <div className="text-sm">{p.username}</div>
                    {p._id !== user._id && (
                      <button onClick={async () => {
                        try {
                          showToast('Removing member...', 'info');
                          await messagingService.removeParticipant(userId, p._id, token);
                          setConversationInfo(prev => ({ ...(prev||{}), participants: (prev?.participants||[]).filter(x => x._id !== p._id) }));
                          showToast('Member removed', 'success');
                        } catch (err) {
                          console.error('Failed to remove member', err);
                          showToast(err?.message || 'Failed to remove member', 'error');
                        }
                      }} className="ml-2 text-red-600 px-2 py-1 rounded border">Remove</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">Search users</label>
              <input
                value={addQuery}
                onChange={(e) => setAddQuery(e.target.value)}
                placeholder="Type a username to search"
                className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {addSearching ? (
                <div className="py-6 text-center">Searching...</div>
              ) : (
                addResults.map(u => (
                  <div key={u._id} className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <div className="flex items-center">
                      <Image src={u.profilePicture || defaultAvatar} width={36} height={36} className="w-9 h-9 rounded-full mr-3 object-cover" alt={u.username} />
                      <div>
                        <div className="font-medium text-sm">{u.username}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{u.fullname || ''}</div>
                      </div>
                    </div>
                    <div>
                      <button onClick={async () => {
                        try {
                          showToast('Adding member...', 'info');
                          const res = await messagingService.addParticipant(userId, u._id, token);
                          const updated = res?.conversation || res;
                          if (updated && updated.participants) {
                            setConversationInfo(prev => ({ ...(prev||{}), ...updated }));
                          } else {
                            // optimistic: append user if not present
                            setConversationInfo(prev => ({ ...(prev||{}), participants: [...(prev?.participants||[]), u] }));
                          }
                          showToast('Member added', 'success');
                          setShowAddMember(false);
                        } catch (err) {
                          console.error('Failed to add member', err);
                          showToast(err?.message || 'Failed to add member', 'error');
                        }
                      }} className="px-3 py-1 bg-blue-600 text-white rounded-md">Add</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end mt-3">
              <button onClick={() => setShowAddMember(false)} className="px-3 py-1 rounded-md border">Close</button>
            </div>
          </div>
        </div>, document.body
      )}
      </>
    );
  }

  return (
    <>
      <ToastComponent />
      {showAddMember && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" style={{ zIndex: 2147483647 }} role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg mx-4 p-4 shadow-xl" style={{ zIndex: 2147483648 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add Member</h3>
              <button onClick={() => setShowAddMember(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
            </div>
            {/* Participants list (show current members with remove action) */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">Participants</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(conversationInfo?.participants || []).map(p => (
                  <div key={p._id} className="flex items-center space-x-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    <Image src={p.profilePicture || defaultAvatar} width={28} height={28} className="w-7 h-7 rounded-full object-cover" alt={p.username} />
                    <div className="text-sm">{p.username}</div>
                    {p._id !== user._id && (
                      <button onClick={async () => {
                        try {
                          showToast('Removing member...', 'info');
                          await messagingService.removeParticipant(userId, p._id, token);
                          setConversationInfo(prev => ({ ...(prev||{}), participants: (prev?.participants||[]).filter(x => x._id !== p._id) }));
                          showToast('Member removed', 'success');
                        } catch (err) {
                          console.error('Failed to remove member', err);
                          showToast(err?.message || 'Failed to remove member', 'error');
                        }
                      }} className="ml-2 text-red-600 px-2 py-1 rounded border">Remove</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">Search users</label>
              <input
                value={addQuery}
                onChange={(e) => setAddQuery(e.target.value)}
                placeholder="Type a username to search"
                className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {addSearching ? (
                <div className="py-6 text-center">Searching...</div>
              ) : (
                addResults.map(u => (
                  <div key={u._id} className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <div className="flex items-center">
                      <Image src={u.profilePicture || defaultAvatar} width={36} height={36} className="w-9 h-9 rounded-full mr-3 object-cover" alt={u.username} />
                      <div>
                        <div className="font-medium text-sm">{u.username}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{u.fullname || ''}</div>
                      </div>
                    </div>
                    <div>
                      <button onClick={async () => {
                        try {
                          showToast('Adding member...', 'info');
                          const res = await messagingService.addParticipant(userId, u._id, token);
                          const updated = res?.conversation || res;
                          if (updated && updated.participants) {
                            setConversationInfo(prev => ({ ...(prev||{}), ...updated }));
                          } else {
                            setConversationInfo(prev => ({ ...(prev||{}), participants: [...(prev?.participants||[]), u] }));
                          }
                          showToast('Member added', 'success');
                          setShowAddMember(false);
                        } catch (err) {
                          console.error('Failed to add member', err);
                          showToast(err?.message || 'Failed to add member', 'error');
                        }
                      }} className="px-3 py-1 bg-blue-600 text-white rounded-md">Add</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end mt-3">
              <button onClick={() => setShowAddMember(false)} className="px-3 py-1 rounded-md border">Close</button>
            </div>
          </div>
        </div>, document.body
      )}
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
            {conversationInfo?.groupProfilePicture ? (
              <Image
                src={conversationInfo.groupProfilePicture}
                alt={conversationInfo.name || 'Group'}
                width={32}
                height={32}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 object-cover"
              />
            ) : isGroupConv && conversationInfo?.participants?.length > 1 ? (
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 mr-3">
                {conversationInfo.participants
                  .filter(p => p._id !== user?._id)
                  .slice(0, 3)
                  .map((p, i) => (
                    <div
                      key={p._id}
                      className="absolute rounded-full border border-white dark:border-gray-900 overflow-hidden"
                      style={{
                        width: '60%',
                        height: '60%',
                        left: i === 0 ? '0' : i === 1 ? '30%' : '15%',
                        top: i === 0 ? '0' : i === 1 ? '0' : '30%',
                        zIndex: 3 - i
                      }}
                    >
                      <Image
                        src={p.profilePicture || defaultAvatar}
                        alt={p.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <Image
                src={recipient?.profilePicture || defaultAvatar}
                alt={recipient?.username || 'User'}
                width={32}
                height={32}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {conversationInfo?.name || recipient?.username || 'Loading...'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                {conversationInfo?.subtitle || recipient?.fullname || ''}
              </p>
            </div>
          </div>

          {isGroupConv && (
            <>
              {isGroupConv && (
                <>
                  <button onClick={openRenameModal} className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" title="Edit group name">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                    </svg>
                  </button>
                  <button onClick={openAddMember} className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" title="Add member">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9a3 3 0 11-6 0 3 3 0 016 0zM6 12a4 4 0 014-4h1" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 21v-2a4 4 0 014-4h1" />
                    </svg>
                  </button>
                </>
              )}
            </>
          )}
          <button className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Inline fallback Rename Panel (shows inside page if portal/modal not visible) */}
      {showRenameModal && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <input
              ref={renameInputRef}
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Rename group..."
              className="flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button onClick={saveRename} disabled={renaming} className="px-3 py-2 bg-blue-600 text-white rounded-md">
              {renaming ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowRenameModal(false)} className="px-3 py-2 rounded-md border">Cancel</button>
          </div>
        </div>
      )}

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
            // Determine whether this message belongs to a group conversation. conversationInfo may be
            const isGroup = !!(
              conversationInfo?.isGroup ||
              (conversationInfo?.participants && conversationInfo.participants.length > 2) ||
              item.conversation ||
              item.conversationId
            );
            const showAvatar = !isMyMessage && (isGroup || messageUtils.shouldShowAvatar(item, messages[index + 1], user._id));
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
                    <div className="flex flex-col items-center mr-2">
                      <Image
                        src={item.sender.profilePicture || defaultAvatar}
                        alt={item.sender.username}
                        width={32}
                        height={32}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                      />
                      {isGroup && (
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1 text-center">{item.sender.username}</div>
                      )}
                    </div>
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
                    {/* username shown under avatar */}
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