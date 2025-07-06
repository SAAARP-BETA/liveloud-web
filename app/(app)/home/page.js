
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
  Link as LinkIcon,
  Camera,
  Edit,
} from 'lucide-react';
import {
  Heart as HeartIconSolid,
  Bookmark as BookmarkIconSolid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import real AuthContext

// Constants
const MAX_CHAR_LIMIT = 1000;
const MEDIA_LIMIT = 4;
const API_BASE_USERS = process.env.NEXT_PUBLIC_API_USERS_BASE_URL || 'http://localhost:3001/api/users';
const API_BASE_SOCIAL = process.env.NEXT_PUBLIC_API_SOCIAL_BASE_URL || 'http://localhost:3002/api';
const API_ENDPOINTS = {
  SOCIAL: `${API_BASE_SOCIAL}/social`,
  UPLOAD: `${API_BASE_SOCIAL}/upload`,
  MEDIA: `${API_BASE_SOCIAL}/media`,
};
const REFRESH_INTERVAL = 300000;
const MIN_FETCH_INTERVAL = 10000;

// FilteredImage Component
const FilteredImage = ({ src, filterType, className }) => {
  const filterStyles = {
    none: '',
    sepia: 'sepia(100%)',
    grayscale: 'grayscale(100%)',
    blur: 'blur(2px)',
    brightness: 'brightness(150%)',
    contrast: 'contrast(150%)'
  };

  return (
    <img
      src={src}
      className={className}
      style={{ filter: filterStyles[filterType] || '' }}
      alt="Post content"
    />
  );
};

// Modal Component
const CustomModal = ({ visible, onClose, title, children, showHeader = true }) => {
  if (!visible) return null;

  return (
    <div className="w-full max-w-2xl bg-white border rounded-lg shadow-lg mt-2 z-30">
      {showHeader && (
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      )}
      <div className="p-4">{children}</div>
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
                <FilteredImage
                  src={post.image}
                  filterType={post.filter || 'none'}
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
  const { user, token, isAuthenticated, loading, error, logout } = useAuth();
  
  // State
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [showComposeButton, setShowComposeButton] = useState(false);
  const [text, setText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFilters, setImageFilters] = useState([]);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isAmplifyModalVisible, setAmplifyModalVisible] = useState(false);
  const [postToAmplify, setPostToAmplify] = useState(null);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [postToComment, setPostToComment] = useState(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Mock post data (for fallback or testing)
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

  // Format post from API
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
      image: post.image || post.imageUrl,
      filter: post.filter || 'none'
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
        
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked: true, likeCount: post.likeCount + 1 }
            : post
        ));
        
        console.log('Liking post:', postId);
      },
      
      handleUnlikePost: async (postId) => {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked: false, likeCount: post.likeCount - 1 }
            : post
        ));
        
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

  // Media handling
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (images.length < MEDIA_LIMIT) {
          setImages(prev => [...prev, e.target.result]);
          setImageFilters(prev => [...prev, 'none']);
        }
      };
      reader.readAsDataURL(file);
    });
    setShowMediaOptions(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditImage = (index) => {
    setEditingImageIndex(index);
    setShowImageEditor(true);
  };

  const applyImageFilter = (filterType) => {
    if (editingImageIndex !== null) {
      setImageFilters(prev => {
        const newFilters = [...prev];
        newFilters[editingImageIndex] = filterType;
        return newFilters;
      });
    }
    setShowImageEditor(false);
    setEditingImageIndex(null);
  };

  const uploadMedia = useCallback(async () => {
    if (images.length === 0) return { urls: [], metadata: [] };

    try {
      setUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);

      const mediaMetadata = images.map((uri, index) => ({
        filter: imageFilters[index] || null,
        originalUri: uri,
      }));

      const base64Images = await Promise.all(
        images.map(async (uri, index) => {
          setUploadProgress(prev => {
            const progressPerImage = 90 / images.length;
            const currentImageProgress = (index / images.length) * 90;
            return Math.min(currentImageProgress + progressPerImage * 0.5, 95);
          });

          const response = await fetch(uri);
          const blob = await response.blob();

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );

      // const uploadEndpoint = `${API_ENDPOINTS.MEDIA}/upload/post`;
      const uploadEndpoint = `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/upload/post`;

      console.log('Uploading media to:', uploadEndpoint, 'with token:', token);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          images: base64Images,
          metadata: mediaMetadata,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Media upload failed:', errorData);
        throw new Error(errorData.message || `Media upload failed with status ${response.status}`);
      }

      setUploadProgress(100);
      const data = await response.json();
      console.log('Media upload successful:', data);
      return {
        urls: data.imageUrls || [],
        metadata: data.metadata || [],
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [images, imageFilters, token]);

  // Load feed on authentication change
  useEffect(() => {
    if (loading) return; // Wait for auth to complete
    setPosts([]);
    setPage(1);
    setHasMorePosts(true);

    if (isAuthenticated) {
      fetchHomeFeed(1, true);
    }

    const intervalId = setInterval(() => {
      if (isAuthenticated) {
        fetchHomeFeed(1, true);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, loading]);

  // Fetch home feed
  const fetchHomeFeed = useCallback(async (pageNum = 1, refresh = false) => {
    if (loadingPosts) return;
    if (!hasMorePosts && !refresh && pageNum > 1) return;

    const now = Date.now();
    if (now - lastFetchTime < MIN_FETCH_INTERVAL && !refresh) return;
    setLastFetchTime(now);

    try {
      setLoadingPosts(true);
      if (refresh) setFeedError(null);

      const formattedPosts = mockPosts.map(formatPostFromApi);
      
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
      
      setHasMorePosts(false);
    } catch (error) {
      console.error('Error fetching home feed:', error);
      setFeedError(`Failed to load posts: ${error.message}`);
      
      if (refresh) {
        setPosts([]);
      }
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  }, [loadingPosts, token, hasMorePosts]);

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

  // User interaction handlers
  const handleFollowUser = async (userId) => {
    if (!isAuthenticated) {
      alert('Please login to follow users');
      return;
    }

    try {
      console.log('Following user:', userId);
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
      console.log('Unfollowing user:', userId);
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
    if (isAuthenticated) {
      try {
        console.log('Blocking user:', userId);
        setPosts(prev => prev.filter(post => post.user !== userId));
        alert('User blocked successfully');
      } catch (error) {
        console.error('Error blocking user:', error);
        alert(`Failed to block user: ${error.message}`);
      }
    } else {
      alert('Please login to block users');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to delete posts');
      return;
    }
    
    if (confirm('Are you sure you want to delete this post?')) {
      try {
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
    if (!loadingPosts && hasMorePosts) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHomeFeed(nextPage);
    }
  }, [loadingPosts, page, fetchHomeFeed, hasMorePosts]);

  const handleCreatePost = async () => {
    console.log('handleCreatePost called');
    console.log('Current state:', { isAuthenticated, token, user, text, images, uploading });

    if (loading) {
      console.log('Auth loading, cannot create post');
      alert('Please wait while authentication is in progress');
      return;
    }

    if (!isAuthenticated || !token || !user) {
      console.log('Not authenticated or missing user/token');
      alert('Login Required: Please login to create posts');
      router.push('/login');
      return;
    }

    if (!text.trim() && images.length === 0) {
      console.log('Empty post');
      alert('Empty Post: Please add some text or images to your post');
      return;
    }

    if (text.length > MAX_CHAR_LIMIT) {
      console.log('Text exceeds limit:', text.length);
      alert(`Content Too Long: Your post exceeds the ${MAX_CHAR_LIMIT} character limit`);
      return;
    }

    try {
      setLoadingPosts(true);
      console.log('Starting post creation');
      let mediaUrls = [];
      let mediaIds = [];

      if (images.length > 0) {
        console.log('Uploading images:', images.length);
        try {
          const uploadResults = await uploadMedia();
          mediaUrls = uploadResults.urls;
          mediaIds = uploadResults.metadata.map(item => item.publicId);
          console.log('Upload successful:', { mediaUrls, mediaIds });
        } catch (error) {
          console.error('Upload error:', error);
          alert(`Upload Error: ${error.message}`);
          setLoadingPosts(false);
          return;
        }
      }

      const postData = {
        content: text.trim(),
        media: mediaUrls,
        mediaIds: mediaIds,
        filter: images.length > 0 ? imageFilters[0] : null,
      };

      console.log('Sending post data to:', `${API_ENDPOINTS.SOCIAL}/posts`, postData);
      console.log('Using token:', token);

      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Post creation failed:', errorData);
        throw new Error(errorData.message || `Failed to create post with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Post created successfully:', responseData);

      const newPost = {
        id: responseData.id || Date.now().toString(), // Use API-provided ID if available
        username: user.username || 'You',
        user: user._id,
        profilePic: user.profilePicture || '/api/placeholder/40/40',
        content: text,
        timestamp: 'Just now',
        likeCount: 0,
        commentCount: 0,
        amplifyCount: 0,
        isLiked: false,
        isBookmarked: false,
        isFollowing: false,
        image: mediaUrls[0] || null,
        filter: imageFilters[0] || 'none'
      };

      console.log('Adding new post to state:', newPost);
      setPosts(prev => [newPost, ...prev]);
      setText('');
      setImages([]);
      setImageFilters([]);
      setIsInputFocused(false);
      alert('Post created successfully!');
      router.push('/app/home');
    } catch (error) {
      console.error('Error creating post:', error);
      alert(`Post Error: Failed to create your post: ${error.message}`);
      if (error.message.includes('Invalid token') || error.message.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleCreatePost();
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

  const loadMenuOptions = async () => {
    if (!selectedPost || !selectedPost.user) {
      console.log('Missing post data for menu options');
      setFilteredOptions([]);
      return;
    }

    try {
      const isOwnPost = isAuthenticated && user && 
        selectedPost.user === user._id;
      let isFollowing = selectedPost.isFollowing;

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
      setFilteredOptions([
        { icon: FlagIcon, text: 'Report' },
        { icon: EyeSlashIcon, text: 'Hide' }
      ]);
    }
  };

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

  // Load menu options when modal is visible
  useEffect(() => {
    const loadOptions = async () => {
      if (isModalVisible && selectedPost) {
        await loadMenuOptions();
      }
    };
    
    loadOptions();
  }, [isModalVisible, selectedPost]);

  return (
  <>
    <style jsx>{`
      .blur-content {
        filter: blur(5px);
        pointer-events: none;
        transition: filter 0.3s ease;
      }
      .post-composer {
        transition: all 0.3s ease;
        position: relative;
        z-index: 10;
      }
      .post-composer textarea {
        transition: height 0.3s ease;
      }
      .post-composer textarea.focused {
        height: 120px;
      }
      .post-composer button {
        pointer-events: auto;
      }
    `}</style>

    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="p-4 mx-4 mb-4 bg-gray-100 rounded-xl border border-gray-200">
            <p className="text-gray-600 font-medium">Loading authentication...</p>
          </div>
        ) : error ? (
          <div className="p-4 mx-4 mb-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-red-600 font-medium">Authentication Error: {error}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        ) : (
          <div className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200 post-composer">
            <div className="flex items-start space-x-3">
              <Image
                src={isAuthenticated && user?.profilePicture ? user.profilePicture : '/default-avatar.png'}
                alt="Your img"
                width={50}
                height={50}
                className="rounded-full"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyPress={handleKeyPress}
                placeholder="What's on your mind?"
                className={`flex-1 bg-gray-100 py-3 px-4 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors resize-none outline-none ${isInputFocused ? 'focused' : ''}`}
                rows={isInputFocused ? 4 : 1}
                maxLength={MAX_CHAR_LIMIT * 1.1}
              />
              <button
                onClick={() => setShowMediaOptions(true)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <PhotoIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {images.length > 0 && (
              <div className="mt-3 flex overflow-x-auto space-x-3 pb-2">
                {images.map((img, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                    <FilteredImage
                      src={img}
                      filterType={imageFilters[index]}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="absolute top-1 right-1 flex space-x-1">
                      <button onClick={() => handleEditImage(index)} className="bg-black/50 rounded-full p-1.5">
                        <Edit className="text-white" size={12} />
                      </button>
                      <button onClick={() => removeImage(index)} className="bg-black/50 rounded-full p-1.5">
                        <XMarkIcon className="text-white" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
              <span className={`text-sm ${text.length > MAX_CHAR_LIMIT ? 'text-red-600' : 'text-gray-500'}`}>
                {MAX_CHAR_LIMIT - text.length} characters remaining
              </span>
              <button
                onClick={handleCreatePost}
                disabled={uploading || loading || text.length > MAX_CHAR_LIMIT || (!text.trim() && images.length === 0)}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Post'}
              </button>
            </div>

            {uploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <CustomModal
              visible={showMediaOptions}
              onClose={() => setShowMediaOptions(false)}
              title="Add Media"
            >
              <div className="p-4">
                <div className="space-y-3">
                  <label className="flex items-center p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <Camera className="text-blue-500 mr-3" size={24} />
                    <span>Upload Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </CustomModal>
          </div>
        )}

        {/* ✅ Your Feed, Modals and Everything Below Stays Same */}
        <div className={isInputFocused || showMediaOptions ? 'blur-content' : ''}>
          {feedError && (
            <div className="p-4 mx-4 mb-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-yellow-700 font-medium">{feedError}</p>
            </div>
          )}
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
          ) : !loadingPosts ? (
            <EmptyFeed
              isAuthenticated={isAuthenticated}
              handleCreatePost={() => setIsInputFocused(true)}
              error={feedError || error}
              onLogin={() => {
                if (isAuthenticated) {
                  logout().then(() => router.push('/login'));
                } else {
                  router.push('/login');
                }
              }}
            />
          ) : null}

          {loadingPosts && !refreshing && (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!loadingPosts && posts.length > 5 && (
            <div className="py-8 text-center">
              <p className="text-gray-500 font-medium">You're all caught up!</p>
            </div>
          )}
          <div className="h-20" />
        </div>

        {showComposeButton && (
          <button
            onClick={() => setIsInputFocused(true)}
            className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center animate-fade-in"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        )}

        {/* ✅ Other modals like post options, amplify, comment, report */}
        <CustomModal visible={isModalVisible} onClose={() => setModalVisible(false)} title="Post options" showHeader={false}>
          {/* modal content */}
        </CustomModal>

        <CustomModal visible={isCommentModalVisible} onClose={() => setCommentModalVisible(false)} title="Add Comment">
          {/* modal content */}
        </CustomModal>

        <CustomModal visible={isAmplifyModalVisible} onClose={() => setAmplifyModalVisible(false)} title="Amplify Post">
          {/* modal content */}
        </CustomModal>

        <CustomModal visible={isReportModalVisible} onClose={() => setReportModalVisible(false)} title="Report Post">
          {/* modal content */}
        </CustomModal>

        <CustomModal
          visible={showImageEditor && editingImageIndex !== null}
          onClose={() => setShowImageEditor(false)}
          title="Edit Image"
        >
          {/* image editing UI */}
        </CustomModal>
      </div>
    </div>
  </>
);

};

export default HomePage;
