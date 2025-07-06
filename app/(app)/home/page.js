"use client";

import {
  Search,
  X,
  Clock,
  Hash,
  Users,
  TrendingUp,
  MapPin,
  ChevronRight,
  Verified,
  XCircle,
  Plus,
  Image as ImageIcon,
  MoreVertical,
  Flag,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Info,
  Trash2,
  Ban,
} from "lucide-react";
import { debounce } from "lodash";
import { API_ENDPOINTS } from "../../utils/config";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";



import React, { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from '@/Components/home/PostCard';
import EmptyFeed from '@/Components/home/EmptyFeed';
import CommentModal from '@/Components/ui/CommentModal';
import AmplifyModal from '@/Components/ui/AmplifyModal';
import CustomModal from '@/Components/ui/Modal';
import ReportModal from '@/Components/ui/ReportModal';
import Image from 'next/image';
import {
  Plus as PlusIcon,
  Image as PhotoIcon,
  MessageCircle as ChatBubbleOvalLeftIcon,
  RefreshCcw as ArrowPathIcon,
  Bookmark as BookmarkIcon,
  MoreHorizontal as EllipsisHorizontalIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  Info as InformationCircleIcon,
  Flag as FlagIcon,
  EyeOff as EyeSlashIcon,
  X as XMarkIcon,
  Trash2 as TrashIcon,
  Link as LinkIcon
} from 'lucide-react';

// import {
//   Heart as HeartIconSolid,
//   Bookmark as BookmarkIconSolid
// } from 'lucide-react';
import {
  createPostHandlers,
  formatPostFromApi,
} from '../../utils/postFunctions';

// Constants
const REFRESH_INTERVAL = 60000; // 1 minute
const MIN_FETCH_INTERVAL = 5000; // 5 seconds

// Feed types configuration
const FEED_TYPES = [
  { key: 'home', title: 'Home', endpoint: 'home', requiresAuth: true },
  { key: 'trending', title: 'Trending', endpoint: 'trending', requiresAuth: false },
  { key: 'latest', title: 'Latest', endpoint: 'latest', requiresAuth: false },
  { key: 'hot', title: 'Hot', endpoint: 'hot', requiresAuth: false },
  { key: 'popular', title: 'Popular', endpoint: 'popular', requiresAuth: false },
];


const HomePage = () => {
  const router = useRouter();
  const { user, token, isAuthenticated, error, logout } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('home');
  const [tabData, setTabData] = useState({
    home: { posts: [], page: 1, hasMore: true, loading: false, error: null },
    trending: { posts: [], page: 1, hasMore: true, loading: false, error: null },
    latest: { posts: [], page: 1, hasMore: true, loading: false, error: null },
    hot: { posts: [], page: 1, hasMore: true, loading: false, error: null },
    popular: { posts: [], page: 1, hasMore: true, loading: false, error: null },
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [showComposeButton, setShowComposeButton] = useState(false);
  
  // Post composer
  const [text, setText] = useState('');
  
  // Modals
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  
  // Amplify modal
  const [isAmplifyModalVisible, setAmplifyModalVisible] = useState(false);
  const [postToAmplify, setPostToAmplify] = useState(null);
  
  // Comment modal
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [postToComment, setPostToComment] = useState(null);
  
  // Report modal
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  
  // API throttling
  const [lastFetchTime, setLastFetchTime] = useState({});
  
  // Scroll handling
  const [scrollY, setScrollY] = useState(0);
  
  // Helper function to update tab data
  const updateTabData = (tabKey, updates) => {
    setTabData(prev => ({
      ...prev,
      [tabKey]: { ...prev[tabKey], ...updates }
    }));
  };

  // Get current tab data
  const getCurrentTabData = () => tabData[activeTab];
  
  // Create post handlers with updated setPosts function
  const postHandlers = createPostHandlers(
    user, 
    token, 
    (updater) => {
      if (typeof updater === 'function') {
        updateTabData(activeTab, { posts: updater(getCurrentTabData().posts) });
      } else {
        updateTabData(activeTab, { posts: updater });
      }
    }, 
    setPostToComment, 
    setCommentModalVisible, 
    setPostToAmplify, 
    setAmplifyModalVisible,
    setPostToReport,
    setReportModalVisible
  );

  // Load menu options when modal is visible
  useEffect(() => {
    const loadOptions = async () => {
      if (isModalVisible && selectedPost) {
        await loadMenuOptions();
      }
    };
    
    loadOptions();
  }, [isModalVisible, selectedPost]);

  // Load feed when tab changes or authentication changes
  useEffect(() => {
    const currentFeedType = FEED_TYPES.find(feed => feed.key === activeTab);
    
    // Check if feed requires authentication
    if (currentFeedType?.requiresAuth && !isAuthenticated) {
      return;
    }

    // Load feed if not already loaded or if it's the home feed and user just authenticated
    const currentTabData = tabData[activeTab];
    if (currentTabData.posts.length === 0 || (activeTab === 'home' && isAuthenticated)) {
      fetchFeed(activeTab, 1, true);
    }
  }, [activeTab, isAuthenticated]);

  // Periodic refresh for active tab
  useEffect(() => {
    const currentFeedType = FEED_TYPES.find(feed => feed.key === activeTab);
    
    if (currentFeedType?.requiresAuth && !isAuthenticated) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchFeed(activeTab, 1, true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [activeTab, isAuthenticated]);

  // Scroll handler for showing/hiding compose button
  const handleScroll = useCallback((e) => {
    const currentScrollY = e.target.scrollTop;
    setScrollY(currentScrollY);
    
    // Show compose button when scrolling down
    if (currentScrollY > 100) {
      setShowComposeButton(true);
    } else {
      setShowComposeButton(false);
    }
  }, []);

  // Fetch feed for specific tab
  const fetchFeed = useCallback(async (feedType, pageNum = 1, refresh = false) => {
    const currentTabData = tabData[feedType];
    const feedConfig = FEED_TYPES.find(feed => feed.key === feedType);
    console.log('Feed config:', feedConfig);
    console.log('API Base URL:', API_ENDPOINTS.SOCIAL); // Add this to see what endpoint is being used
    if (!feedConfig) return;
    
    // Validation checks
    if (currentTabData.loading) return;
    if (!currentTabData.hasMore && !refresh && pageNum > 1) return;

    // Check authentication requirement
    if (feedConfig.requiresAuth && !isAuthenticated) {
      updateTabData(feedType, { 
        error: 'Please log in to view this feed',
        posts: [],
        hasMore: false 
      });
      return;
    }

    // API call throttling
    const now = Date.now();
    const lastFetch = lastFetchTime[feedType] || 0;
    if (now - lastFetch < MIN_FETCH_INTERVAL && !refresh) return;
    
    setLastFetchTime(prev => ({ ...prev, [feedType]: now }));

    try {
      updateTabData(feedType, { loading: true });
      if (refresh) {
        updateTabData(feedType, { error: null });
      }

      // Set request headers
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token && feedConfig.requiresAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const url = `${API_ENDPOINTS.SOCIAL}/posts/feed/${feedConfig.endpoint}?page=${pageNum}&limit=10`;

      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(15000) // 15 seconds timeout
      });

      // Check for authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        if (feedConfig.requiresAuth) {
          console.log('Authentication failure in feed fetch, token may be expired');
          updateTabData(feedType, { 
            error: 'Your session has expired. Please log in again.',
            posts: [],
            hasMore: false 
          });
          await logout();
          return;
        }
      }

      // Handle response status
      if (response.status === 429) {
        updateTabData(feedType, { 
          error: 'Rate limited. Please wait a moment before refreshing.' 
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${feedType} feed: ${response.status}`);
      }

      const responseText = await response.text();
      const data = JSON.parse(responseText);
      
      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid server response format');
      }

      // Update pagination info
      const hasMore = data.currentPage < data.totalPages;

      // Process posts
      const formattedPosts = data.posts
        .map((post, index) => post ? formatPostFromApi(post, index) : null)
        .filter(Boolean);

      // Update state
      if (refresh) {
        updateTabData(feedType, { 
          posts: formattedPosts, 
          page: 1, 
          hasMore,
          error: null 
        });
      } else {
        const existingIds = new Set(currentTabData.posts.map(p => p.id));
        const uniqueNewPosts = formattedPosts.filter(p => !existingIds.has(p.id));
        
        updateTabData(feedType, { 
          posts: [...currentTabData.posts, ...uniqueNewPosts],
          page: pageNum,
          hasMore 
        });
      }
    } catch (error) {
      console.error(`Error fetching ${feedType} feed:`, error);
      
      // Check if this might be an auth error
      if (error.message && (
          error.message.includes('unauthorized') || 
          error.message.includes('forbidden') ||
          error.message.includes('authentication')
      ) && feedConfig.requiresAuth) {
        console.log('Likely authentication error, logging out');
        updateTabData(feedType, { 
          error: 'Your session has expired. Please log in again.',
          posts: refresh ? [] : currentTabData.posts,
          hasMore: false 
        });
        await logout();
      } else {
        updateTabData(feedType, { 
          error: `Failed to load posts: ${error.message}`,
          posts: refresh ? [] : currentTabData.posts 
        });
      }
    } finally {
      updateTabData(feedType, { loading: false });
      setRefreshing(false);
    }
  }, [tabData, token, isAuthenticated, lastFetchTime, logout]);

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  // User interaction handlers
  const handleFollowUser = async (userId) => {
    if (!isAuthenticated) {
      alert('Please login to follow users');
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/followers/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }

      alert('You are now following this user');
      
      // Update posts in current tab to reflect new following status
      const updatedPosts = getCurrentTabData().posts.map(post => 
        post.userId === userId ? { ...post, isFollowing: true } : post
      );
      updateTabData(activeTab, { posts: updatedPosts });
    } catch (error) {
      console.error('Error following user:', error);
      alert(`Failed to follow user: ${error.message}`);
    }
  };

  const handleUnfollowUser = async (userId) => {
    if (!isAuthenticated) {
      alert('Please login to unfollow users');
      return;
    }
  
    try {
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/followers/${userId}/unfollow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to unfollow user');
      }
  
      alert('You have unfollowed this user');
      
      // Update posts in current tab to reflect new following status
      const updatedPosts = getCurrentTabData().posts.map(post => {
        if (post.user === userId) {
          return { ...post, isFollowing: false };
        }
        return post;
      });
      updateTabData(activeTab, { posts: updatedPosts });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert(`Failed to unfollow user: ${error.message}`);
    }
  };

  const handleViewProfile = (userId) => {
    router.push(`/UserProfile/${userId}`);
  };

  const handleHidePost = (postId) => {
    const updatedPosts = getCurrentTabData().posts.filter(post => post.id !== postId);
    updateTabData(activeTab, { posts: updatedPosts });
    alert('This post will no longer appear in your feed');
  };

  const handleBlockUser = async (userId) => {
    if (!isAuthenticated) {
      alert('Please login to block users');
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/users/block/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      // Remove all posts from this user in current tab
      const updatedPosts = getCurrentTabData().posts.filter(post => post.userId !== userId);
      updateTabData(activeTab, { posts: updatedPosts });
      alert('You will no longer see content from this user');
    } catch (error) {
      console.error('Error blocking user:', error);
      alert(`Failed to block user: ${error.message}`);
    }
  };

  const handleCommentSuccess = () => {
    // Update comment count without full refresh
    if (postToComment) {
      const updatedPosts = getCurrentTabData().posts.map(post => {
        if (post.id === postToComment.id) {
          return { ...post, commentCount: post.commentCount + 1 };
        }
        return post;
      });
      updateTabData(activeTab, { posts: updatedPosts });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeed(activeTab, 1, true);
  }, [fetchFeed, activeTab]);

  const handleLoadMore = useCallback(() => {
    const currentTabData = getCurrentTabData();
    if (!currentTabData.loading && currentTabData.hasMore) {
      const nextPage = currentTabData.page + 1;
      fetchFeed(activeTab, nextPage);
    }
  }, [getCurrentTabData, fetchFeed, activeTab]);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      alert('Please login to create posts');
      return;
    }

    if (text.trim()) {
      router.push(`/create/createpost?initialText=${encodeURIComponent(text)}`);
      setText('');
    } else {
      router.push('/create/createpost');
    }
  };

  // Check follow status for menu options
  const checkFollowStatus = async (userId) => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/followers/${userId}/status`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.isFollowing || false;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  // Menu options configuration
  const menuOptions = [
    { icon: UserPlus, text: 'Follow' },
    { icon: UserMinus, text: 'Unfollow' },
    { icon: Info, text: 'About this account' },
    { icon: Flag, text: 'Report' },
    { icon: Ban, text: 'Block' },
    { icon: Trash2, text: 'Delete Post' },
  ];

  // Load menu options based on post and user context
  const loadMenuOptions = async () => {
    if (!selectedPost || !selectedPost.user) {
      console.log(selectedPost);
      console.log('Missing post data for menu options');
      setFilteredOptions([]);
      return;
    }

    try {
      // Determine if this is the user's own post
      const isOwnPost = isAuthenticated && user && 
        selectedPost.user === user._id;

      // Check follow status if needed
      let isFollowing = selectedPost.isFollowing;
      if (isAuthenticated && !isOwnPost && isFollowing === undefined) {
        try {
          console.log('Checking follow status for:', selectedPost.user);
          isFollowing = await checkFollowStatus(selectedPost.user);

          // Update post with follow status in current tab
          const updatedPosts = getCurrentTabData().posts.map(post => {
            if (post.id === selectedPost.id) {
              return { ...post, isFollowing };
            }
            return post;
          });
          updateTabData(activeTab, { posts: updatedPosts });
        } catch (error) {
          console.error('Error fetching follow status:', error);
          isFollowing = false;
        }
      }

      // Filter menu options based on conditions
      const filtered = menuOptions.filter(option => {
        if (option.text === 'Follow') {
          return !isOwnPost && !isFollowing;
        }
        if (option.text === 'Unfollow') {
          return !isOwnPost && isFollowing;
        }
        if (option.text === 'Block') {
          return !isOwnPost;
        }
        if (option.text === 'Delete Post') {
          return isOwnPost;
        }
        return true;
      });
      
      console.log('Filtered options:', filtered.length);
      setFilteredOptions(filtered);
    } catch (error) {
      console.error('Error loading menu options:', error);
      // Set default options if there's an error
      setFilteredOptions([
        { icon: Flag, text: 'Report' },
        { icon: EyeOff, text: 'Hide' }
      ]);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to delete posts');
      return;
    }
    
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete post');
        }

        const updatedPosts = getCurrentTabData().posts.filter(post => post.id !== postId);
        updateTabData(activeTab, { posts: updatedPosts });
        alert('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert(`Failed to delete post: ${error.message}`);
      }
    }
  };

  const handleReportSuccess = (reportedPostId) => {
    const updatedPosts = getCurrentTabData().posts.filter(post => post.id !== reportedPostId);
    updateTabData(activeTab, { posts: updatedPosts });
  };

  // Handle menu option selection
  const handleMenuOptionPress = (option) => {
    if (!selectedPost) return;
    
    const userId = selectedPost?.user;
    
    switch(option.text) {
      case 'Follow':
        if (isAuthenticated) {
          handleFollowUser(userId);
        } else {
          alert('Please login to follow users');
        }
        break;
      case 'Unfollow':
        handleUnfollowUser(userId);
        break;
      case 'Report':
        postHandlers.handleInitiateReport(selectedPost);
        break;
      case 'Hide':
        handleHidePost(selectedPost.id);
        break;
      case 'Block':
        handleBlockUser(userId);
        break;
      case 'About this account':
        handleViewProfile(userId);
        break;
      case 'Delete Post':
        console.log('Delete post:', selectedPost.id);
        handleDeletePost(selectedPost.id);
        break;
      default:
    }
    
    setModalVisible(false);
  };

  // Render tab bar
  const renderTabBar = () => (
    <div className="bg-white border-b border-gray-200">
      <div className=" overflow-x-auto px-4 py-2 space-x-2">
        {FEED_TYPES.map((feedType) => {
          const isActive = activeTab === feedType.key;
          const canAccess = !feedType.requiresAuth || isAuthenticated;
          
          return (
            <button
              key={feedType.key}
              onClick={() => canAccess && handleTabChange(feedType.key)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canAccess}
            >
              {feedType.title}
              {feedType.requiresAuth && !isAuthenticated && ' 🔒'}
            </button>
          );
        })}
      </div>
    </div>
  );

  const currentTabData = getCurrentTabData();
  const currentFeedType = FEED_TYPES.find(feed => feed.key === activeTab);

  return (
    <div className=" max-w-2xl w-full mx-auto p-4 bg-white rounded-xl mb-4 shadow-sm">
      {/* Custom Header */}
      {/* <Navbar /> */}

      {/* Tab Bar */}
      {renderTabBar()}

      <div 
        className=" overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Post composer - only show on home tab */}
        {activeTab === 'home' && (
          <div className="m-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 relative overflow-hidden">
                {isAuthenticated && user?.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>

              <button
                onClick={handleCreatePost}
                className="flex-1 bg-gray-100 py-3 px-4 rounded-full text-left text-gray-500 hover:bg-gray-200 transition-colors"
              >
                What's on your mind?
              </button>

              <button
                className="ml-3 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                onClick={handleCreatePost}
              >
                <ImageIcon size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Error states */}
        {error && activeTab === 'home' && (
          <div className="p-4 mx-4 mt-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600 font-medium">
              Authentication Error: {error}
            </p>
          </div>
        )}

        {currentTabData.error && (
          <div className="p-4 mx-4 mt-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <p className="text-yellow-700 font-medium">
              {currentTabData.error}
            </p>
          </div>
        )}

        {/* Posts list */}
        {currentTabData.posts.length > 0 ? (
          <div>
            {currentTabData.posts.map((post, index) => (
              <PostCard
                      key={post.id || index}
                      post={post}
                      handleLikePost={postHandlers.handleLikePost}
                      handleUnlikePost={postHandlers.handleUnlikePost}
                      handleCommentPost={postHandlers.handleCommentPost}
                      handleAmplifyPost={postHandlers.handleAmplifyPost}
                      handleBookmarkPost={postHandlers.handleBookmarkPost}
                      handleUnbookmarkPost={postHandlers.handleUnbookmarkPost}
                      setSelectedPost={setSelectedPost}
                      setModalVisible={setModalVisible}
                      username={user.username}
                    />
            ))}
          </div>
        ) : !currentTabData.loading ? (
          <EmptyFeed 
            isAuthenticated={isAuthenticated} 
            handleCreatePost={handleCreatePost}
            error={currentTabData.error || error}
            feedType={activeTab}
            onLogin={() => {
              // Make sure we're really logged out first
              if (!isAuthenticated) {
                  router.push('/login');
              }           
            }}
          />
        ) : null}

        {/* Loading indicator */}
        {currentTabData.loading && !refreshing && (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        )}

        {/* End of feed message */}
        {!currentTabData.loading && currentTabData.posts.length > 5 && !currentTabData.hasMore && (
          <div className="py-8 text-center">
            <p className="text-gray-500 font-medium">
              You're all caught up!
            </p>
          </div>
        )}

        {/* Bottom padding for scrolling behind floating button */}
        <div className="h-20" />
      </div>

      {/* Floating compose button - only show on home tab */}
      {showComposeButton && activeTab === 'home' && (
        <div className="fixed bottom-36 right-4 z-50">
          <button
            onClick={handleCreatePost}
            className="w-14 h-14 bg-sky-500 rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 transition-colors"
          >
            <Plus size={24} className="text-white" />
          </button>
        </div>
      )}

      {/* Custom Modal for post options */}
      <CustomModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="Post Options"
      >
        

        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Post options
          </h3>

          {selectedPost && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
              <Image
                src={selectedPost.profilePic || '/api/placeholder/40/40'}
                alt={selectedPost.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-800">{selectedPost.username}</p>
                <p className="text-sm text-gray-500 truncate">{selectedPost.content}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filteredOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleMenuOptionPress(option)}
                className={`w-full flex items-center p-3 rounded-xl text-left transition-colors cursor-pointer ${
                  option.text === 'Delete Post' || option.text === 'Block' || option.text === 'Report'
                    ? 'hover:bg-red-50 text-red-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <option.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      </CustomModal>

      {/* Comment Modal */}
      <CommentModal
        visible={isCommentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        title="Add Comment"
        post={postToComment}
        onSuccess={handleCommentSuccess}
      >

      </CommentModal>

      {/* Amplify Modal */}
      <AmplifyModal
        visible={isAmplifyModalVisible}
        onClose={() => setAmplifyModalVisible(false)}
        post={postToAmplify
        
        }
        
        title="Amplify Post"
        onSuccess={(postId) => {
          // Update amplify count in current posts
          const updatedPosts = posts.map(post => {
            if (post.id === postId) {
              return { 
                ...post, 
                amplifyCount: post.amplifyCount + 1,
                hasAmplified: true 
              };
            }
            return post;
          });
          setPosts(updatedPosts);
        }}
      >
       
      </AmplifyModal>

      {/* Report Modal */}
      <ReportModal
        visible={isReportModalVisible}
        onClose={() => setReportModalVisible(false)}
        title="Report Post"
        post={postToReport}
        onSuccess={handleReportSuccess}
      >
        
      </ReportModal>
    </div>
  );
};

export default HomePage;
