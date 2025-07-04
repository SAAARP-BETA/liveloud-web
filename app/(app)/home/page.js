'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus as PlusIcon,
  Image as PhotoIcon,
  Heart as HeartIcon,
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

import {
  Heart as HeartIconSolid,
  Bookmark as BookmarkIconSolid
} from 'lucide-react';

// Mock context - replace with your actual auth context
const useAuth = () => {
  const [user, setUser] = useState({
    _id: 'user123',
    profilePicture: '/api/placeholder/40/40',
    username: 'johndoe'
  });
  const [token, setToken] = useState('mock-token');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [error, setError] = useState(null);
  
  const logout = async () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };
  
  return { user, token, isAuthenticated, error, logout };
};

// Mock API endpoints
const API_ENDPOINTS = {
  SOCIAL: '/api/social'
};

// Constants
const REFRESH_INTERVAL = 300000; // 5 minutes
const MIN_FETCH_INTERVAL = 10000; // 10 seconds

// Modal Component
const CustomModal = ({ visible, onClose, title, children, showHeader = true }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-3xl animate-slide-up">
        {showHeader && (
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// PostCard Component
const PostCard = ({ 
  post, 
  handleLikePost, 
  handleUnlikePost, 
  handleCommentPost, 
  handleAmplifyPost, 
  handleBookmarkPost, 
  handleUnbookmarkPost, 
  setSelectedPost, 
  setModalVisible 
}) => {
  const handleMenuClick = () => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        <Image
          src={post.profilePic || '/api/placeholder/40/40'}
          alt={post.username}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{post.username}</h3>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
            <button
              onClick={handleMenuClick}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-900">{post.content}</p>
            {post.image && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <Image
                  src={post.image}
                  alt="Post image"
                  width={500}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
            <button
              onClick={() => post.isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id)}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500"
            >
              {post.isLiked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span className="text-sm">{post.likeCount}</span>
            </button>
            
            <button
              onClick={() => handleCommentPost(post)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
            >
              <ChatBubbleOvalLeftIcon className="w-5 h-5" />
              <span className="text-sm">{post.commentCount}</span>
            </button>
            
            <button
              onClick={() => handleAmplifyPost(post)}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span className="text-sm">{post.amplifyCount}</span>
            </button>
            
            <button
              onClick={() => post.isBookmarked ? handleUnbookmarkPost(post.id) : handleBookmarkPost(post.id)}
              className="text-gray-500 hover:text-yellow-500"
            >
              {post.isBookmarked ? (
                <BookmarkIconSolid className="w-5 h-5 text-yellow-500" />
              ) : (
                <BookmarkIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// EmptyFeed Component
const EmptyFeed = ({ isAuthenticated, handleCreatePost, error, onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <PhotoIcon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {error ? 'Something went wrong' : 'No posts yet'}
      </h3>
      <p className="text-gray-500 mb-6">
        {error ? 'Please try again later' : 'Be the first to share something!'}
      </p>
      {isAuthenticated ? (
        <button
          onClick={handleCreatePost}
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
        >
          Create Post
        </button>
      ) : (
        <button
          onClick={onLogin}
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
        >
          Login to Post
        </button>
      )}
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Social Feed</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <PlusIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </nav>
  );
};

// Main HomePage Component
const HomePage = () => {
  const router = useRouter();
  const { user, token, isAuthenticated, error, logout } = useAuth();
  
  // State
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
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
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Mock post data for demonstration
  const mockPosts = [
    {
      id: '1',
      username: 'alice_smith',
      user: 'user456',
      profilePic: '/api/placeholder/40/40',
      content: 'Just had an amazing sunset view from my balcony! 🌅',
      timestamp: '2 hours ago',
      likeCount: 24,
      commentCount: 8,
      amplifyCount: 3,
      isLiked: false,
      isBookmarked: false,
      isFollowing: false,
      image: '/api/placeholder/500/300'
    },
    {
      id: '2',
      username: 'bob_wilson',
      user: 'user789',
      profilePic: '/api/placeholder/40/40',
      content: 'Working on a new project today. Excited to share the progress soon! 💻',
      timestamp: '4 hours ago',
      likeCount: 15,
      commentCount: 5,
      amplifyCount: 2,
      isLiked: true,
      isBookmarked: true,
      isFollowing: true
    },
    {
      id: '3',
      username: 'carol_johnson',
      user: 'user101',
      profilePic: '/api/placeholder/40/40',
      content: 'Coffee and code - the perfect combination for a productive morning! ☕',
      timestamp: '6 hours ago',
      likeCount: 32,
      commentCount: 12,
      amplifyCount: 7,
      isLiked: false,
      isBookmarked: false,
      isFollowing: false
    }
  ];

  // Format post from API (keeping original structure)
  const formatPostFromApi = (post, index) => {
    return {
      id: post.id || `post-${index}`,
      username: post.username || 'Unknown User',
      user: post.user || post.userId,
      profilePic: post.profilePic || '/api/placeholder/40/40',
      content: post.content || post.text,
      timestamp: post.timestamp || post.createdAt,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      amplifyCount: post.amplifyCount || 0,
      isLiked: post.isLiked || false,
      isBookmarked: post.isBookmarked || false,
      isFollowing: post.isFollowing || false,
      image: post.image || post.imageUrl
    };
  };

  // Create post handlers
  const createPostHandlers = (
    user, 
    token, 
    setPosts, 
    setPostToComment, 
    setCommentModalVisible, 
    setPostToAmplify, 
    setAmplifyModalVisible,
    setPostToReport,
    setReportModalVisible
  ) => {
    return {
      handleLikePost: async (postId) => {
        if (!isAuthenticated) {
          alert('Please login to like posts');
          return;
        }
        
        // Optimistic update
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked: true, likeCount: post.likeCount + 1 }
            : post
        ));
        
        // API call would go here
        console.log('Liking post:', postId);
      },
      
      handleUnlikePost: async (postId) => {
        // Optimistic update
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked: false, likeCount: post.likeCount - 1 }
            : post
        ));
        
        // API call would go here
        console.log('Unliking post:', postId);
      },
      
      handleCommentPost: (post) => {
        setPostToComment(post);
        setCommentModalVisible(true);
      },
      
      handleAmplifyPost: (post) => {
        setPostToAmplify(post);
        setAmplifyModalVisible(true);
      },
      
      handleBookmarkPost: async (postId) => {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: true }
            : post
        ));
        
        console.log('Bookmarking post:', postId);
      },
      
      handleUnbookmarkPost: async (postId) => {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: false }
            : post
        ));
        
        console.log('Unbookmarking post:', postId);
      },
      
      handleInitiateReport: (post) => {
        setPostToReport(post);
        setReportModalVisible(true);
      }
    };
  };

  const postHandlers = createPostHandlers(
    user, 
    token, 
    setPosts, 
    setPostToComment, 
    setCommentModalVisible, 
    setPostToAmplify, 
    setAmplifyModalVisible,
    setPostToReport,
    setReportModalVisible
  );

  // Load feed on authentication change
  useEffect(() => {
    // Reset state when auth changes
    setPosts([]);
    setPage(1);
    setHasMorePosts(true);

    if (isAuthenticated) {
      fetchHomeFeed(1, true);
    }

    // Periodic refresh
    const intervalId = setInterval(() => {
      if (isAuthenticated) {
        fetchHomeFeed(1, true);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  // Fetch home feed
  const fetchHomeFeed = useCallback(async (pageNum = 1, refresh = false) => {
    // Validation checks
    if (loading) return;
    if (!hasMorePosts && !refresh && pageNum > 1) return;

    // API call throttling
    const now = Date.now();
    if (now - lastFetchTime < MIN_FETCH_INTERVAL && !refresh) return;
    setLastFetchTime(now);

    try {
      setLoading(true);
      if (refresh) setFeedError(null);

      // For demo purposes, use mock data
      // In real app, replace with actual API call
      const formattedPosts = mockPosts.map(formatPostFromApi);
      
      // Update state
      if (refresh) {
        setPosts(formattedPosts);
        setPage(1);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = formattedPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
      }
      
      setHasMorePosts(false); // Mock: no more posts
    } catch (error) {
      console.error('Error fetching home feed:', error);
      setFeedError(`Failed to load posts: ${error.message}`);
      
      if (refresh) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, token, hasMorePosts]);

  // Handle scroll for compose button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120 && !showComposeButton) {
        setShowComposeButton(true);
      } else if (window.scrollY <= 120 && showComposeButton) {
        setShowComposeButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showComposeButton]);

  // Load menu options when modal is visible
  useEffect(() => {
    const loadOptions = async () => {
      if (isModalVisible && selectedPost) {
        await loadMenuOptions();
      }
    };
    
    loadOptions();
  }, [isModalVisible, selectedPost]);

  // User interaction handlers
  const handleFollowUser = async (userId) => {
    if (!isAuthenticated) {
      alert('Please login to follow users');
      return;
    }

    try {
      // API call would go here
      console.log('Following user:', userId);
      
      // Update posts to reflect new following status
      setPosts(prev => prev.map(post => 
        post.user === userId ? { ...post, isFollowing: true } : post
      ));
      
      alert('You are now following this user');
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
      // API call would go here
      console.log('Unfollowing user:', userId);
      
      // Update posts to reflect new following status
      setPosts(prev => prev.map(post => 
        post.user === userId ? { ...post, isFollowing: false } : post
      ));
      
      alert('You have unfollowed this user');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert(`Failed to unfollow user: ${error.message}`);
    }
  };

  const handleViewProfile = (userId) => {
    router.push(`/profile/${userId}`);
  };

  const handleHidePost = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    alert('Post hidden from your feed');
  };

  const handleBlockUser = async (userId) => {
    if (!isAuthenticated) {
      alert('Please login to block users');
      return;
    }

    try {
      // API call would go here
      console.log('Blocking user:', userId);
      
      // Remove all posts from this user
      setPosts(prev => prev.filter(post => post.user !== userId));
      alert('User blocked successfully');
    } catch (error) {
      console.error('Error blocking user:', error);
      alert(`Failed to block user: ${error.message}`);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to delete posts');
      return;
    }
    
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        // API call would go here
        console.log('Deleting post:', postId);
        
        setPosts(prev => prev.filter(post => post.id !== postId));
        alert('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert(`Failed to delete post: ${error.message}`);
      }
    }
  };

  const handleCommentSuccess = () => {
    // Update comment count without full refresh
    if (postToComment) {
      setPosts(prev => prev.map(post => {
        if (post.id === postToComment.id) {
          return { ...post, commentCount: post.commentCount + 1 };
        }
        return post;
      }));
    }
  };

  const handleReportSuccess = (reportedPostId) => {
    setPosts(prev => prev.filter(post => post.id !== reportedPostId));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeFeed(1, true);
  }, [fetchHomeFeed]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMorePosts) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHomeFeed(nextPage);
    }
  }, [loading, page, fetchHomeFeed, hasMorePosts]);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      alert('Please login to create posts');
      return;
    }

    if (text.trim()) {
      router.push(`/create/?text=${encodeURIComponent(text)}`);
      setText('');
    } else {
      router.push('/create/');
    }
  };

  // Menu options configuration
  const menuOptions = [
    { icon: UserPlusIcon, text: 'Follow' },
    { icon: UserMinusIcon, text: 'Unfollow' },
    { icon: InformationCircleIcon, text: 'About this account' },
    { icon: FlagIcon, text: 'Report' },
    { icon: EyeSlashIcon, text: 'Hide' },
    { icon: XMarkIcon, text: 'Block' },
    { icon: LinkIcon, text: 'Copy link' },
    { icon: TrashIcon, text: 'Delete Post' },
  ];

  // Load menu options based on post and user context
  const loadMenuOptions = async () => {
    if (!selectedPost || !selectedPost.user) {
      console.log('Missing post data for menu options');
      setFilteredOptions([]);
      return;
    }

    try {
      // Determine if this is the user's own post
      const isOwnPost = isAuthenticated && user && 
        selectedPost.user === user._id;

      // Check follow status
      let isFollowing = selectedPost.isFollowing;

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
        if (option.text === 'Hide') {
          return !isOwnPost;
        }
        return true;
      });
      
      setFilteredOptions(filtered);
    } catch (error) {
      console.error('Error loading menu options:', error);
      // Set default options if there's an error
      setFilteredOptions([
        { icon: FlagIcon, text: 'Report' },
        { icon: EyeSlashIcon, text: 'Hide' }
      ]);
    }
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
        handleDeletePost(selectedPost.id);
        break;
      case 'Copy link':
        navigator.clipboard.writeText(`${window.location.origin}/post/${selectedPost.id}`);
        alert('Link copied to clipboard');
        break;
      default:
        console.log('Unknown option:', option.text);
    }
    
    setModalVisible(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header */}
      <Navbar />

      <div className="max-w-2xl mx-auto">
        {/* Post composer */}
        <div className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Image
              src={
                isAuthenticated && user?.profilePicture
                  ? user.profilePicture
                  : '/api/placeholder/40/40'
              }
              alt="Your avatar"
              width={40}
              height={40}
              className="rounded-full"
            />

            <button
              onClick={handleCreatePost}
              className="flex-1 bg-gray-100 py-3 px-4 rounded-full text-left text-gray-500 hover:bg-gray-200 transition-colors"
            >
              What's on your mind?
            </button>

            <button
              onClick={handleCreatePost}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <PhotoIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Error states */}
        {error && (
          <div className="p-4 mx-4 mb-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-red-600 font-medium">
              Authentication Error: {error}
            </p>
          </div>
        )}

        {feedError && (
          <div className="p-4 mx-4 mb-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-yellow-700 font-medium">
              {feedError}
            </p>
          </div>
        )}

        {/* Posts list */}
        {posts.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl mx-4 overflow-hidden">
            {posts.map((post, index) => (
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
                username={post.user}
              />
            ))}
          </div>
        ) : !loading ? (
          <EmptyFeed 
            isAuthenticated={isAuthenticated} 
            handleCreatePost={handleCreatePost}
            error={feedError || error}
            onLogin={() => {
              if (isAuthenticated) {
                logout().then(() => {
                  router.push('/login');
                });
              } else {
                router.push('/login');
              }
            }}
          />
        ) : null}

        {/* Loading indicator */}
        {loading && !refreshing && (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* End of feed message */}
        {!loading && posts.length > 5 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 font-medium">
              You're all caught up!
            </p>
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-20" />
      </div>

      {/* Floating compose button */}
      {showComposeButton && (
        <button
          onClick={handleCreatePost}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center animate-fade-in"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      )}

      {/* Post action menu modal */}
      <CustomModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="Post options"
        showHeader={false}
      >
        <div className="w-full flex justify-center pt-2 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

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
                className={`w-full flex items-center p-3 rounded-xl text-left transition-colors ${
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
      <CustomModal
        visible={isCommentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        title="Add Comment"
      >
        <div className="p-4">
          {postToComment && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
              <Image
                src={postToComment.profilePic || '/api/placeholder/40/40'}
                alt={postToComment.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-800">{postToComment.username}</p>
                <p className="text-sm text-gray-500 truncate">{postToComment.content}</p>
              </div>
            </div>
          )}
          
          <textarea
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setCommentModalVisible(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleCommentSuccess();
                setCommentModalVisible(false);
                alert('Comment added successfully!');
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              Post
            </button>
          </div>
        </div>
      </CustomModal>

      {/* Amplify Modal */}
      <CustomModal
        visible={isAmplifyModalVisible}
        onClose={() => setAmplifyModalVisible(false)}
        title="Amplify Post"
      >
        <div className="p-4">
          {postToAmplify && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
              <Image
                src={postToAmplify.profilePic || '/api/placeholder/40/40'}
                alt={postToAmplify.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-800">{postToAmplify.username}</p>
                <p className="text-sm text-gray-500 truncate">{postToAmplify.content}</p>
              </div>
            </div>
          )}
          
          <textarea
            placeholder="Add your thoughts... (optional)"
            className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setAmplifyModalVisible(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Update amplify count
                setPosts(prev => prev.map(post => 
                  post.id === postToAmplify.id 
                    ? { ...post, amplifyCount: post.amplifyCount + 1 }
                    : post
                ));
                setAmplifyModalVisible(false);
                alert('Post amplified successfully!');
              }}
              className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
            >
              Amplify
            </button>
          </div>
        </div>
      </CustomModal>

      {/* Report Modal */}
      <CustomModal
        visible={isReportModalVisible}
        onClose={() => setReportModalVisible(false)}
        title="Report Post"
      >
        <div className="p-4">
          {postToReport && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
              <Image
                src={postToReport.profilePic || '/api/placeholder/40/40'}
                alt={postToReport.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-800">{postToReport.username}</p>
                <p className="text-sm text-gray-500 truncate">{postToReport.content}</p>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mb-4">
            Why are you reporting this post?
          </p>
          
          <div className="space-y-2 mb-4">
            {[
              'Spam or misleading',
              'Harassment or bullying',
              'Inappropriate content',
              'Violence or threats',
              'Copyright violation',
              'Other'
            ].map((reason, index) => (
              <label key={index} className="flex items-center p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  className="mr-3"
                />
                <span className="text-gray-700">{reason}</span>
              </label>
            ))}
          </div>
          
          <textarea
            placeholder="Additional details (optional)"
            className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setReportModalVisible(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleReportSuccess(postToReport.id);
                setReportModalVisible(false);
                alert('Report submitted successfully. Thank you for helping keep our community safe.');
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              Submit Report
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default HomePage;