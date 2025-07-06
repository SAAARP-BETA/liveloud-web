'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../../Components/home/PostCard';
import EmptyFeed from '../../../Components/home/EmptyFeed';
import CommentModal from '../../../Components/ui/CommentModal';
import AmplifyModal from '../../../Components/ui/AmplifyModal';
import CustomModal from '../../../Components/ui/Modal';
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
import ReportModal from '@/Components/ui/ReportModal';
// Constants
const REFRESH_INTERVAL = 300000; // 5 minutes
const MIN_FETCH_INTERVAL = 10000; // 10 seconds

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
      {/* <Navbar /> */}

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
      </AmplifyModal>

      {/* Report Modal */}
      <ReportModal
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
      </ReportModal>
    </div>
  );
};

export default HomePage;