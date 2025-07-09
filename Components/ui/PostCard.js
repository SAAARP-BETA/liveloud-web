import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MoreHorizontal, MessageCircle, Repeat, Bookmark, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FilteredImage from '../common/FilteredImage';

const PostCard = ({
  post,
  handleLikePost,
  handleUnlikePost,
  handleCommentPost,
  handleAmplifyPost,
  handleBookmarkPost,
  handleUnbookmarkPost,
  setSelectedPost,
  setModalVisible,
  username,
  handleDislikePost,
  handleUndislikePost
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.95);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setOpacity(1);
      setScale(1);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Check if post is valid
  if (!post || !post.id) {
    console.warn("Invalid post passed to PostCard:", post);
    return null;
  }

  // Check if the post has been liked by the user
  const isLiked = isAuthenticated && user && Array.isArray(post.likes) && post.likes.includes(user._id);
  const isDisliked = isAuthenticated && user && Array.isArray(post.dislikes) && post.dislikes.includes(user._id);
  const isBookmarked = isAuthenticated && user && Array.isArray(post.bookmarks) && post.bookmarks.includes(user._id);

  // Handle image scroll
  const handleImageScroll = (event) => {
    const container = event.target;
    const scrollLeft = container.scrollLeft;
    const imageWidth = container.offsetWidth;
    const imageIndex = Math.round(scrollLeft / imageWidth);
    setCurrentImageIndex(imageIndex);
  };

  // Extract hashtags from content
  const renderContent = () => {
    if (!post.content) return null;

    // Find and highlight hashtags and mentions
    const contentWithTags = post.content.split(/(\s+)/).map((word, i) => {
      if (word.startsWith('#')) {
        return (
          <span key={i} className="text-sky-500 font-medium">
            {word}
          </span>
        );
      } else if (word.startsWith('@')) {
        return (
          <span key={i} className="text-sky-600 font-medium">
            {word}
          </span>
        );
      }
      return word;
    });

    return (
      <p className="text-base text-gray-800 leading-6 mb-3">
        {contentWithTags}
      </p>
    );
  };

  const getFilterBackgroundColor = (filterType) => {
    switch (filterType) {
      case 'sepia':
        return 'rgba(255,188,107,0.2)';
      case 'vintage':
        return 'rgba(255,235,205,0.2)';
      case 'cool':
        return 'rgba(173,216,230,0.1)';
      case 'warm':
        return 'rgba(255,160,122,0.1)';
      default:
        return 'transparent';
    }
  };

  // Determine if we should render media
  const hasMedia = post.media && post.media.length > 0;
  const hasSingleImage = post.imageUrl || (hasMedia && post.media.length === 1);

  return (
    <div
      ref={containerRef}
      className="mb-4 bg-white rounded-xl mx-4 overflow-hidden shadow-sm border border-gray-100 transition-all duration-300"
      style={{
        opacity: opacity,
        transform: `scale(${scale})`
      }}
    >
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <button
          className="flex items-center flex-1 text-left"
          onClick={() => {
            if (post.user === user._id) {
              router.push('/profile/profile'); // own profile
            } else {
              router.push(`/UserProfile/${post.username}`); // someone else's profile
            }
          }}
        >
          <img
            src={
              isAuthenticated && post.profilePic?.trim()
                ? post.profilePic
                : '/assets/Profilepic1.png'
            }
            alt="Profile"
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />

          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="text-base text-gray-800 font-medium">
                {post.username}
              </span>
              {post.isVerified && (
                <CheckCircle size={16} className="text-blue-500 ml-1" />
              )}
            </div>
            <span className="text-xs text-gray-500">
              {post.timestamp}
            </span>
          </div>
        </button>

        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => {
            console.log('Three-dot menu pressed for post:', post.id);
            setSelectedPost(post);
            setModalVisible(true);
            console.log('Modal should be visible now');
          }}
        >
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Post content */}
      <div className="px-4 pb-3">
        {renderContent()}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap mb-3">
            {post.tags.map((tag, index) => (
              <button
                key={index}
                className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 hover:bg-gray-200 transition-colors"
              >
                <span className="text-xs text-gray-700 font-medium">
                  #{tag}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Amplified post */}
        {post.isAmplified && post.originalPost && (
          <div className="border border-gray-200 rounded-xl p-3 mb-3">
            <div className="flex items-center mb-2">
              <span className="text-xs text-gray-500 font-medium">
                Amplified from
                <span className="text-sky-500"> @{post.originalPost.user?.username || 'user'}</span>
              </span>
            </div>

            {post.quoteContent && (
              <p className="text-sm text-gray-700 mb-2">
                {post.quoteContent}
              </p>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              {post.originalPost.content && (
                <p className="text-sm text-gray-700">
                  {post.originalPost.content}
                </p>
              )}

              {post.originalPost.media && post.originalPost.media.length > 0 && (
                <img
                  src={post.originalPost.media[0]}
                  alt="Original post media"
                  className="w-full h-45 object-cover rounded-lg mt-2"
                />
              )}
            </div>
          </div>
        )}

        {/* Multiple images carousel */}
        {hasMedia && (
          <div className="mb-3">
            <div
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              onScroll={handleImageScroll}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {post.media.map((item, index) => (
                <div
                  key={`media-${post.id}-${index}`}
                  className="flex-shrink-0 w-full snap-start"
                >
                  <button
                    className="w-full h-75 rounded-lg overflow-hidden"
                    onClick={() => {
                      router.push({
                        pathname: '/home/media-viewer',
                        query: { postId: post.id, initialIndex: currentImageIndex }
                      });
                    }}
                  >
                    <FilteredImage
                      src={item}
                      alt={`Post media ${index + 1}`}
                      className="w-full h-full object-cover"
                      filterType={post.mediaMetadata && post.mediaMetadata[index]?.filter}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Image counter dots */}
            {post.media.length > 1 && (
              <div className="flex justify-center mt-3">
                {post.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const container = containerRef.current?.querySelector('.overflow-x-auto');
                      if (container) {
                        container.scrollLeft = index * container.offsetWidth;
                        setCurrentImageIndex(index);
                      }
                    }}
                    className={`w-2 h-2 rounded-full mx-1 transition-colors ${
                      index === currentImageIndex ? 'bg-sky-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post stats */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 font-medium">
              {post.likeCount} likes
            </span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
          <button
            onClick={() => router.push({
              pathname: '/home/post-detail',
              query: { postId: post.id }
            })}
            className="hover:underline"
          >
            <span className="text-xs text-gray-500 font-medium">
              {post.commentCount} comments
            </span>
          </button>
          {post.bookmarkCount > 0 && (
            <>
              <div className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <span className="text-xs text-gray-500 font-medium">
                {post.bookmarkCount} saves
              </span>
            </>
          )}
        </div>
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-around py-3 border-t border-gray-100">
        {/* Like Button - Thumbs Up */}
        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id)}
        >
          <ThumbsUp
            size={18}
            className={isLiked ? "text-blue-500" : "text-gray-500"}
            fill={isLiked ? "currentColor" : "none"}
          />
          <span
            className={`ml-2 text-sm font-medium ${isLiked ? 'text-blue-500' : 'text-gray-600'}`}
          >
            Like
          </span>
        </button>

        {/* Dislike Button - Thumbs Down */}
        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => isDisliked ? handleUndislikePost(post.id) : handleDislikePost(post.id)}
        >
          <ThumbsDown
            size={18}
            className={isDisliked ? "text-orange-500" : "text-gray-500"}
            fill={isDisliked ? "currentColor" : "none"}
          />
          <span
            className={`ml-2 text-sm font-medium ${isDisliked ? 'text-orange-500' : 'text-gray-600'}`}
          >
            Dislike
          </span>
        </button>

        {/* Comment Button */}
        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => handleCommentPost(post)}
        >
          <MessageCircle size={18} className="text-gray-500" />
          <span className="ml-2 text-sm text-gray-600 font-medium">
            Comment
          </span>
        </button>

        {/* Amplify Button */}
        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => handleAmplifyPost(post)}
        >
          <Repeat size={18} className="text-gray-500" />
          <span className="ml-2 text-sm text-gray-600 font-medium">
            Amplify
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => isBookmarked ? handleUnbookmarkPost(post.id) : handleBookmarkPost(post.id)}
        >
          <Bookmark
            size={18}
            className={isBookmarked ? "text-sky-500" : "text-gray-500"}
            fill={isBookmarked ? "currentColor" : "none"}
          />
          <span
            className={`ml-2 text-sm font-medium ${isBookmarked ? 'text-sky-500' : 'text-gray-600'}`}
          >
            Save
          </span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;