"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import defaultAvatar from '@/assets/default-avatar.jpg';
import { useAuth } from '../../../context/AuthContext';
import { API_ENDPOINTS } from '../../../utils/config';
import { messagingService } from '../../../utils/messagingService';
import { useToast } from '../../../components/ui/Toast';

export default function NewMessageScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const { token, user } = useAuth();
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupMode, setGroupMode] = useState(false);

  // Utility function to truncate bio (added since it was missing)
  const truncateBio = (bio, maxLength = 50) => {
    if (!bio) return '';
    return bio.length > maxLength ? `${bio.substring(0, maxLength)}...` : bio;
  };

  // Search for users
  const searchUsers = useCallback(async (query) => {
    if (!query.trim() || !token) {
      setUsers([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(
        `${API_ENDPOINTS.SEARCH}/search?query=${encodeURIComponent(query.trim())}&type=users&limit=20`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      // Filter out current user from results
      const filteredUsers = data.users?.filter(u => u._id !== user._id) || [];
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      showToast('Failed to search users', 'error');
      setUsers([]);
    } finally {
      setSearching(false);
    }
  }, [token, user._id]);

  // Load suggested users (followers/following)
  const loadSuggestedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.USER}/users/suggestions`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load suggested users');
      }

      const data = await response.json();
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading suggested users:', error);
      // Fallback: try to get recent search results or empty array
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers(searchQuery);
      } else if (searchQuery.length === 0) {
        // Load suggested users when search is cleared
        loadSuggestedUsers();
      } else {
        // For queries with 1 character, clear results
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers, loadSuggestedUsers]);

  // Load suggested users on initial load (fixed dependency issue)
  useEffect(() => {
    loadSuggestedUsers();
  }, []); // Only run on mount, removed loadSuggestedUsers dependency

  const selectUser = (selectedUser) => {
    if (groupMode) {
      addParticipant(selectedUser);
      return;
    }

    router.push(`/messages/chat/${selectedUser._id}`);
  };

  const toggleGroupModal = () => {
    setShowGroupModal(s => !s);
  };

  const toggleGroupMode = () => {
    setGroupMode(g => {
      const next = !g;
      if (!next) {
        // leaving group mode, reset temporary state
        setSelectedParticipants([]);
        setGroupName('');
      }
      return next;
    });
  };

  const addParticipant = (u) => {
    setSelectedParticipants(prev => {
      if (prev.find(p => p._id === u._id)) return prev;
      return [...prev, u];
    });
    showToast(`${u.username} added`, 'info');
  };

  const removeParticipant = (id) => {
    setSelectedParticipants(prev => prev.filter(p => p._id !== id));
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0) {
      showToast('Please provide a group name and at least one participant', 'error');
      return;
    }

    try {
      setCreatingGroup(true);
      const participantIds = selectedParticipants.map(p => p._id);
      const data = await messagingService.createConversation(participantIds, groupName.trim(), token);
      showToast('Group created', 'success');
      // Try to find created conversation id
      const convoId = data?.conversation?._id || data?.conversation?.id || data?._id;
      if (convoId) {
        router.push(`/messages/chat/${convoId}`);
      }
      // Reset modal state
      setShowGroupModal(false);
      setSelectedParticipants([]);
      setGroupName('');
      setGroupMode(false);
    } catch (err) {
      console.error('Failed to create group', err);
      showToast('Failed to create group', 'error');
    } finally {
      setCreatingGroup(false);
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.USER}/users/${userId}/follow`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }

      // Update the user's follow status in the list
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isFollowing: true }
          : user
      ));

      showToast('User followed successfully!', 'success');
    } catch (error) {
    //   console.error('Error following user:', error);
      showToast('Failed to follow user', 'error');
    }
  };

  return (
    <>
      <ToastComponent />
      <div className="min-h-screen w-full md:min-w-[410px] lg:w-[580px] max-w-2xl bg-white dark:bg-gray-900 flex-1 px-4 mx-4 overflow-y-auto h-screen custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => router.back()}
            className="mr-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">New Message</h1>
          <div className="ml-2">
            {!groupMode ? (
              <button onClick={toggleGroupMode} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm">Create Group</button>
            ) : (
              <div className="flex items-center space-x-2">
                <button onClick={createGroup} disabled={creatingGroup || selectedParticipants.length===0 || !groupName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  {creatingGroup ? 'Creating...' : `Create (${selectedParticipants.length})`}
                </button>
                <button onClick={toggleGroupMode} className="px-3 py-1 rounded-md border text-sm">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Group Panel (visible in group mode) */}
      {groupMode && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="mb-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Group name</label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name (required)"
              className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Selected participants</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedParticipants.length === 0 ? (
                <div className="text-sm text-gray-500">No participants yet — tap user rows to add</div>
              ) : (
                selectedParticipants.map(p => (
                  <div key={p._id} className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-full">
                    <img src={p.profilePicture || defaultAvatar} className="w-6 h-6 rounded-full mr-2 object-cover" alt={p.username} />
                    <span className="text-sm mr-2">{p.username}</span>
                    <button onClick={() => removeParticipant(p._id)} className="text-xs text-red-500">Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for users..."
            className="flex-1 ml-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchQuery.length > 0 && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Section Title */}
      <div className="px-4 py-3">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {searchQuery ? 'Search Results' : 'Suggested People'}
        </h2>
      </div>

      {/* Users List */}
      <div className="flex-1 pb-24">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12">
            {searching ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Searching...</p>
              </div>
            ) : searchQuery ? (
              <>
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Try searching for a different username
                </p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Find people to message</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  Search for users to follow and message
                </p>
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 text-sm text-center">
                    💡 You can only message users who follow you or whom you follow
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          users.map((item) => {
            return (
              <div key={item._id} className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center">
                  <button
                    onClick={() => selectUser(item)}
                    className="flex items-center flex-1 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <Image
                      src={item.profilePicture || defaultAvatar}
                      alt={item.username}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {item.username}
                      </h3>
                      {item.fullname && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm truncate">{item.fullname}</p>
                      )}
                      {item.bio && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1" title={item.bio}>
                          {truncateBio(item.bio, 50)}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Follow/Message Buttons */}
                  <div className="flex items-center ml-2 space-x-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); addParticipant(item); }}
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-green-500 rounded-full transition-colors"
                        title="Add to group"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    <button
                      onClick={() => followUser(item._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    >
                      Follow
                    </button>
                    
                    <button 
                      onClick={() => selectUser(item)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-500 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    
    {/* Create Group Modal */}
    {showGroupModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg mx-4 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Create Group</h3>
            <button onClick={toggleGroupModal} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              ✕
            </button>
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-600 dark:text-gray-300">Group name</label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Weekend Hike Crew"
              className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-600 dark:text-gray-300">Selected participants</label>
            <div className="flex flex-wrap mt-2 gap-2">
              {selectedParticipants.length === 0 ? (
                <div className="text-sm text-gray-500">No participants selected</div>
              ) : (
                selectedParticipants.map(p => (
                  <div key={p._id} className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    <img src={p.profilePicture || defaultAvatar} className="w-6 h-6 rounded-full mr-2 object-cover" alt={p.username} />
                    <span className="text-sm mr-2">{p.username}</span>
                    <button onClick={() => removeParticipant(p._id)} className="text-xs text-red-500">Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button onClick={toggleGroupModal} className="px-3 py-1 rounded-md border">Cancel</button>
            <button onClick={createGroup} disabled={creatingGroup} className="px-4 py-1 bg-blue-600 text-white rounded-md">
              {creatingGroup ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Floating Create Group Button */}
    <div className="fixed bottom-6 right-6 z-40">
      <button onClick={toggleGroupModal} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>

    </>
  );
}