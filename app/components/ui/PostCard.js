"use client";
import defaultPic from "../../assets/avatar.png";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  MessageCircle,
  Repeat,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  ArrowUpRightFromSquare,
  Archive,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FilteredImage from "../common/FilteredImage";
import { MdLocationOn, MdMood, MdPeople, MdTranslate, MdVerified } from 'react-icons/md';
import { fonts } from "@/app/utils/fonts";

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
  handleUndislikePost,
  handleTranslatePost, // ADDED: Translation handler
  isTranslating, // ADDED: Translation loading state
  allowArchivedOptions = false, // ADDED: Allow options for archived posts
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({});
  const containerRef = useRef(null);

  // ADDED: Translation states from post props
  const translatedContent = post.translatedContent;
  const showTranslation = post.showTranslation || false;
  const detectedLanguage = post.detectedLanguage;

  // ADDED: Check if post is archived
  const isArchived = post.isArchived || post.archived || false;

  useEffect(() => {
    setIsVisible(true);
    console.log("Post media metadata:", post.mediaMetadata); // Debug metadata
  }, [post]);

  // Check if post is valid
  if (!post || !post.id) {
    console.warn("Invalid post passed to PostCard:", post);
    return null;
  }

  // Check if the post has been liked by the user
  const isLiked =
    isAuthenticated &&
    user &&
    Array.isArray(post.likes) &&
    post.likes.includes(user._id);
  const isDisliked =
    isAuthenticated &&
    user &&
    Array.isArray(post.dislikes) &&
    post.dislikes.includes(user._id);
  const isBookmarked =
    isAuthenticated &&
    user &&
    Array.isArray(post.bookmarks) &&
    post.bookmarks.includes(user._id);

  // Handle image scroll
  const handleImageScroll = (event) => {
    const scrollContainer = event.target;
    const imageIndex = Math.round(
      scrollContainer.scrollLeft / scrollContainer.clientWidth
    );
    setCurrentImageIndex(imageIndex);
  };

  // ADDED: Get image height calculation (from mobile)
  const getImageHeight = (imageUri, index) => {
    const key = `${post.id}-${index}`;
    
    if (imageDimensions[key]) {
      const { width: imgWidth, height: imgHeight } = imageDimensions[key];
      const containerWidth = 400; // approximate container width for web
      const aspectRatio = imgHeight / imgWidth;
      const calculatedHeight = containerWidth * aspectRatio;
      
      // Set reasonable min and max heights
      const minHeight = 200;
      const maxHeight = 500;
      
      return Math.max(minHeight, Math.min(maxHeight, calculatedHeight));
    }
    
    // Default height while loading
    return 320;
  };

  // ADDED: Load image dimensions (from mobile)
  const loadImageDimensions = (imageUri, index) => {
    const key = `${post.id}-${index}`;
    
    if (!imageDimensions[key]) {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions(prev => ({
          ...prev,
          [key]: { width: img.width, height: img.height }
        }));
      };
      img.onerror = () => {
        console.warn('Failed to get image dimensions:', imageUri);
        setImageDimensions(prev => ({
          ...prev,
          [key]: { width: 400, height: 300 }
        }));
      };
      img.src = imageUri;
    }
  };

  // ADDED: Load dimensions for all images when component mounts
  useEffect(() => {
    if (hasMedia && post.media) {
      post.media.forEach((imageUri, index) => {
        loadImageDimensions(imageUri, index);
      });
    }
  }, [post.media]);

  // ADDED: Translation handler
  const handleTranslatePostLocal = () => {
    if (handleTranslatePost) {
      handleTranslatePost(post);
    }
  };

  // ADDED: Toggle between original and translated content
  const toggleTranslation = () => {
    if (handleTranslatePost) {
      handleTranslatePost(post);
    }
  };

  // ADDED: Check if text is likely in English
  const isLikelyEnglish = (text) => {
    if (!text) return true;
    const asciiRatio = text.replace(/[^\x00-\x7F]/g, '').length / text.length;
    return asciiRatio > 0.8;
  };

  const shouldShowTranslateButton = !isLikelyEnglish(post.content);

  // MODIFIED: Extract hashtags from content with translation support
  const renderContent = () => {
    const contentToRender = post.showTranslation && post.translatedContent ? post.translatedContent : post.content;
    
    if (!contentToRender) return null;

    // Split content into lines first to preserve newlines
    const lines = contentToRender.split('\n');
    
    // Process each line to handle hashtags and mentions
    const processedLines = lines.map((line, lineIndex) => {
      const contentWithTags = line.split(/(\s+)/).map((word, i) => {
        if (word.startsWith("#")) {
          return (
            <span key={`${post.id}-${lineIndex}-${i}`} className="font-medium text-primary">
              {word}
            </span>
          );
        } else if (word.startsWith("@")) {
          return (
            <span key={`${post.id}-${lineIndex}-${i}`} className="font-medium text-primary">
              {word}
            </span>
          );
        }
        return word;
      });

      return (
        <React.Fragment key={`${post.id}-line-${lineIndex}`}>
          {contentWithTags}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });

    return (
      <div>
        <p className="text-base text-gray-800 dark:text-white leading-6 mb-3 font-normal break-words whitespace-pre-line ">
          {processedLines}
        </p>
        
        {/* ADDED: Translation indicator */}
        {showTranslation && translatedContent && (
          <div className="flex items-center justify-between mb-2 bg-green-50 p-2 rounded-lg">
            <div className="flex items-center">
              <MdTranslate size={14} className="text-green-600" />
              <span className="text-xs text-green-600 ml-1 font-normal">
                {detectedLanguage && detectedLanguage !== 'auto' ? 
                  `Translated from ${detectedLanguage.toUpperCase()} to English` : 
                  'Translated to English'
                }
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTranslation();
              }}
              className="px-2 py-1 text-xs text-blue-500 font-medium hover:underline"
            >
              Show original
            </button>
          </div>
        )}
        
        {/* ADDED: Loading indicator for translation */}
        {isTranslating && (
          <div className="flex items-center mb-2 bg-blue-50 p-2 rounded-lg">
            <Loader2 size={14} className="text-blue-600 animate-spin" />
            <span className="text-xs text-blue-600 ml-2 font-normal">
              Translating...
            </span>
          </div>
        )}
      </div>
    );
  };

  const getFilterBackgroundColor = (filterType) => {
    switch (filterType) {
      case "sepia":
        return "rgba(255,188,107,0.2)";
      case "vintage":
        return "rgba(255,235,205,0.2)";
      case "cool":
        return "rgba(173,216,230,0.1)";
      case "warm":
        return "rgba(255,160,122,0.1)";
      default:
        return "transparent";
    }
  };

  // Determine if we should render media
  const hasMedia = post.media && post.media.length > 0;
  const hasSingleImage = post.imageUrl || (hasMedia && post.media.length === 1);

  const handleProfileClick = () => {
    if (post.user === user._id) {
      router.push("/profile"); // own profile
    } else {
      router.push(`/UserProfile/${post.username}`); // someone else's profile
    }
  };
  const handleNavigateToPost = () => {
    router.push(`/post/${post.id}`);
  };
  const handleImageClick = () => {
    router.push({
      pathname: "/media-viewer",
      query: { postId: post.id, initialIndex: currentImageIndex },
    });
  };

  const handleCommentsClick = () => {
    router.push({
      pathname: "/post-detail",
      query: { postId: post.id },
    });
  };

  return (
    <div
      className={`mb-4 mt-5 bg-white dark:bg-gray-900 rounded-xl w-full overflow-hidden shadow-sm border border-white dark:border-gray-700 transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      ref={containerRef}
    >
      {/* ADDED: Archived indicator */}
      {isArchived && (
        <div className="bg-gray-500 dark:bg-gray-700 px-4 py-2">
          <div className="flex items-center">
            <Archive size={16} className="text-white" />
            <span className="text-white ml-2 text-sm font-medium">
              {/* This post has been archived */}
            </span>
          </div>
        </div>
      )}

      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <button
          className="flex items-center flex-1 text-left"
          onClick={handleProfileClick}
        >
          <div className="w-10 h-10 rounded-full mr-3 relative overflow-hidden">
            <Image
              src={post.profilePic ? post.profilePic : defaultPic}
              alt="Profile"
              fill
              className="object-cover cursor-pointer bg-gray-200"
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="font-medium cursor-pointer text-base text-gray-800 dark:text-white">
                {post.username}
              </span>
              {/* MODIFIED: Better verification badge */}
              {post.isVerified && (
                <MdVerified size={16} className="text-blue-500 ml-1" />
              )}
            </div>
            <span className="font-normal text-sm text-gray-500 dark:text-gray-400">
              {post.timestamp}
            </span>
          </div>
        </button>

        {/* MODIFIED: Show menu button based on archive status and permissions */}
        {(!isArchived || allowArchivedOptions) && (
          <button
            className="p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
            onClick={() => {
              setSelectedPost(post);
              setModalVisible(true);
            }}
          >
            <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-300 cursor-pointer" />
          </button>
        )}
      </div>

      {/* Post content */}
      <div
        className="px-4 pb-3 cursor-pointer dark:bg-gray-900 text-white"
        onClick={() => router.push(`/post/${post.id}`)}
      >
        {renderContent()}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap mb-3">
            {post.tags.map((tag, index) => (
              <button
                key={`${post.id}-tag-${index}-${tag}`}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/tags/${tag}`);
                }}
                className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 mr-2 mb-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-xs text-gray-700 dark:text-white">
                  #{tag}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Tagged People */}
        {post.taggedUsers?.length > 0 && (
          <div className="flex flex-row flex-wrap items-center mb-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
            <MdPeople size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 ml-2 mr-1 font-medium">
              With
            </span>
            {post.taggedUsers.map((taggedUser, index) => {
              const isCurrentUser =
                taggedUser._id === user._id || taggedUser.id === user._id;
              const identifier =
                taggedUser.username || taggedUser._id || taggedUser.id;

              return (
                <button
                  key={`${post.id}-tagged-${taggedUser._id || taggedUser.id || index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      isCurrentUser
                        ? '/profile'
                        : `/UserProfile/${identifier}`
                    );
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none font-medium cursor-pointer"
                >
                  @{taggedUser.username}
                  {index < post.taggedUsers.length - 1 && ', '}
                </button>
              );
            })}
          </div>
        )}

        {/* ADDED: Location */}
        {post.location?.source === 'user_input' && (post.location.name || post.location.coordinates) && (
            <div className="flex flex-row items-center mb-3 bg-green-50 dark:bg-green-950 rounded-lg p-3">
            <MdLocationOn size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 ml-2 font-medium">
              At {post.location.name || 'Location'}
              </span>
            </div>
          )}

        {/* ADDED: Feeling */}
        {post.feeling && (
          <div className="flex flex-row items-center mb-3 bg-amber-50 dark:bg-amber-950 rounded-lg p-3">
            <MdMood size={16} className="text-amber-600 dark:text-amber-400" />
            <span className="text-amber-600 dark:text-amber-400 ml-2 font-medium">
              Feeling {post.feeling}
            </span>
          </div>
        )}

        {/* MODIFIED: Amplified post with archive handling */}
        {post.isAmplified && post.originalPost && (
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-3">
            <div className="flex items-center mb-2">
              <span className="font-medium text-xs text-gray-500 dark:text-gray-400">
                Amplified from{' '}
                <span className="text-primary">
                  @{post.originalPost.user?.username || 'user'}
                </span>
              </span>
            </div>

            {post.quoteContent && (
              <p className="font-normal text-sm text-gray-700 dark:text-white mb-2">
                {post.quoteContent}
              </p>
            )}

            {/* Check if original post is archived */}
            {post.originalPost.isArchived || post.originalPost.archived ? (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex items-center justify-center">
                <Archive size={16} className="text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-2 font-medium">
                  This post has been archived.
                </span>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                {post.originalPost.content && (
                  <p className="font-normal text-sm text-gray-700 dark:text-white">
                    {post.originalPost.content}
                  </p>
                )}

                {post.originalPost.media?.length > 0 && (
                  <div
                    className="w-full relative rounded-lg mt-2 overflow-hidden"
                    style={{ height: Math.min(200, Math.max(120, 160)) }}
                  >
                    <Image
                      src={post.originalPost.media[0]}
                      alt="Original post media"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* View original post button - only if not archived */}
            {!(post.originalPost.isArchived || post.originalPost.archived) && (
              <button
                className="w-full mt-3 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  const originalPostId = typeof post.originalPost === 'string' 
                      ? post.originalPost
                    : (post.originalPost?._id || post.originalPost?.id);

                  if (originalPostId) {
                    router.push(`/post/${originalPostId}`);
                  }
                }}
              >
                <ExternalLink size={16} className="mr-2" />
                View Original Post
              </button>
            )}
          </div>
        )}

        {/* Images */}
        {hasMedia && (
          <div className="mb-3">
            {post.media.length === 1 ? (
              // Single image
              <button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick();
                }}
              >
                <div
                  className="w-full rounded-lg overflow-hidden"
                  style={{ height: `${getImageHeight(post.media[0], 0)}px` }}
                >
                  <FilteredImage
                    src={post.media[0]}
                    alt="Post media"
                    style={{ height: '100%' }}
                    imageStyle="object-contain"
                    filterType={post.mediaMetadata && post.mediaMetadata[0]?.filter}
                  />
                </div>
              </button>
            ) : (
              // Multiple images carousel
              <>
                <div
                  className="flex cursor-pointer overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  onScroll={handleImageScroll}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {post.media.map((item, index) => (
                    <button
                      key={`${post.id}-media-${index}`}
                      className="flex-shrink-0 w-full snap-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick();
                      }}
                    >
                      <div
                        className="w-full rounded-lg overflow-hidden"
                        style={{ height: `${getImageHeight(item, index)}px` }}
                      >
                        <FilteredImage
                          src={item}
                          alt={`Post media ${index + 1}`}
                          style={{ height: '100%' }}
                          imageStyle="object-contain"
                          filterType={post.mediaMetadata && post.mediaMetadata[index]?.filter}
                        />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Image counter dots */}
                <div className="flex cursor-pointer justify-center mt-3">
                  {post.media.map((item, index) => (
                    <button
                      key={`${post.id}-dot-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const container =
                          containerRef.current?.querySelector('.overflow-x-auto');
                        if (container) {
                          container.scrollLeft = index * container.clientWidth;
                          setCurrentImageIndex(index);
                        }
                      }}
                      className={`w-2 h-2 rounded-full mx-1 transition-colors ${
                        index === currentImageIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ADDED: Post stats */}
        <div className="flex items-center mb-2">
          {post.bookmarkCount > 0 && (
            <>
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full mx-2" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {post.bookmarkCount} saves
              </span>
            </>
          )}
        </div>
      </div>

      {/* MODIFIED: Post actions - Hide for archived posts */}
      {!isArchived && (
        <div className="flex items-center justify-around py-3 border-t border-gray-100 dark:border-gray-800">
          {/* Like Button - Thumbs Up */}
          <button
            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
            onClick={() =>
              isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id)
            }
          >
            <ThumbsUp
              size={20}
              className={isLiked ? "text-primary fill-current" : " text-gray-600 dark:text-gray-300"}
            />
            <span
              className={`ml-2 text-md font-medium ${
                isLiked ? " text-primary" : " text-gray-600 dark:text-gray-300"
              }`}
            >
              {post.likeCount || 0}
            </span>
          </button>

          {/* Dislike Button - Thumbs Down */}
          <button
            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
            onClick={() =>
              isDisliked
                ? handleUndislikePost(post.id)
                : handleDislikePost(post.id)
            }
          >
            <ThumbsDown
              size={20}
              className={
                isDisliked ? "text-orange-500 fill-current" : "text-gray-600 dark:text-gray-300"
              }
            />
            <span
              className={`ml-2 text-md font-medium ${
                isDisliked ? "text-orange-500" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {post.dislikeCount || 0}
            </span>
          </button>

          {/* Comment Button */}
          <button
            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
            onClick={() => handleCommentPost(post)}
          >
            <MessageCircle size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="ml-2 text-md text-gray-600 dark:text-gray-300 font-medium">
              {post.commentCount || 0}
            </span>
          </button>

          {/* Amplify Button */}
          <button
            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
            onClick={() => handleAmplifyPost(post)}
          >
            <Repeat size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="ml-2 text-md text-gray-600 dark:text-gray-300 font-medium">
              {post.amplifyCount || 0}
            </span>
          </button>

          {/* Bookmark Button */}
          <button
            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
            onClick={() =>
              isBookmarked
                ? handleUnbookmarkPost(post.id)
                : handleBookmarkPost(post.id)
            }
          >
            <Bookmark
              size={20}
              className={
                isBookmarked ? "text-primary fill-current" : "text-gray-600 dark:text-gray-300"
              }
            />
            <span
              className={`ml-2 text-md font-medium ${
                isBookmarked ? "text-primary" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {post.bookmarkCount || 0}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PostCard;