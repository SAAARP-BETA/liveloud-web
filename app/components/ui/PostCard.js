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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FilteredImage from "../common/FilteredImage";

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
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);

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

  // Extract hashtags from content
  const renderContent = () => {
    if (!post.content) return null;

    // Find and highlight hashtags and mentions
    const contentWithTags = post.content.split(/(\s+)/).map((word, i) => {
      if (word.startsWith("#")) {
        return (
          <span key={i} className="font-medium text-primary">
            {word}
          </span>
        );
      } else if (word.startsWith("@")) {
        return (
          <span key={i} className="font-medium text-primary">
            {word}
          </span>
        );
      }
      return word;
    });

    return (
      <p className="text-base text-gray-800 leading-6 mb-3 font-normal break-words">
        {" "}
        {contentWithTags}
      </p>
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
      className={`mb-4 bg-white rounded-xl mx-4 overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      ref={containerRef}
    >
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
              className="object-cover cursor-pointer"
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="font-medium cursor-pointer text-base text-gray-800">
                {post.username}
              </span>
              {post.isVerified && (
                <CheckCircle size={16} className="text-primary ml-1" />
              )}
            </div>
            <span className="font-normal text-md text-gray-500">
              {post.timestamp}
            </span>
          </div>
        </button>

        <button
          className="p-2 cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
          onClick={() => {
            setSelectedPost(post);
            setModalVisible(true);
          }}
        >
          <MoreHorizontal size={20} className="text-gray-600 cursor-pointer" />
        </button>
      </div>

      {/* Post content */}
      <div
        className="px-4 pb-3 cursor-pointer"
        onClick={() => router.push(`/post/${post.id}`)}
      >
        {renderContent()}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap mb-3">
            {post.tags.map((tag, index) => (
              <button
                key={index}
                className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-md text-gray-700">
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
              <span className="font-medium text-md text-gray-500">
                Amplified from
                <span className="text-primary">
                  @{post.originalPost.user?.username || "user"}
                </span>
              </span>
            </div>

            {post.quoteContent && (
              <p className="font-normal text-md text-gray-700 mb-2">
                {post.quoteContent}
              </p>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              {post.originalPost.content && (
                <p className="font-normal text-md text-gray-700 truncate">
                  {post.originalPost.content}
                </p>
              )}

              {post.originalPost.media &&
                post.originalPost.media.length > 0 && (
                  <div className="w-full relative rounded-lg mt-2 overflow-hidden">
                    <Image
                      src={post.originalPost.media[0]}
                      alt="Original post media"
                      width={400}
                      height={300}
                      className="w-full h-auto rounded-lg"
                      onLoad={() =>
                        console.log(
                          "Amplified image loaded:",
                          post.originalPost.media[0]
                        )
                      }
                      onError={() =>
                        console.error(
                          "Amplified image error:",
                          post.originalPost.media[0]
                        )
                      }
                    />
                  </div>
                )}
            </div>

            {/* View original post */}
            <button
              className="w-full mt-3 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent click handlers
                router.push(
                  `/post/${post.originalPost.id || post.originalPost._id}`
                );
              }}
            >
              <span className="mr-2">
                <ArrowUpRightFromSquare />
              </span>
              View Original Post
            </button>
          </div>
        )}

        {/* Multiple images carousel */}
        {hasMedia && (
          <div className="mb-3">
            <div
              className="flex cursor-pointer overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              onScroll={handleImageScroll}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {post.media.map((item, index) => (
                <button
                  key={`media-${post.id}-${index}`}
                  className="flex-shrink-0 w-full snap-start"
                  onClick={handleImageClick}
                >
                  <div
                    className="w-full h-80 rounded-lg"
                    style={{ position: "relative", minHeight: "320px" }}
                  >
                    <FilteredImage
                      src={item}
                      alt={`Post media ${index + 1}`}
                      style={{ height: "320px" }}
                      imageStyle="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Image counter dots */}
            {post.media.length > 1 && (
              <div className="flex cursor-pointer justify-center mt-3">
                {post.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const container =
                        containerRef.current?.querySelector(".overflow-x-auto");
                      if (container) {
                        container.scrollLeft = index * container.clientWidth;
                        setCurrentImageIndex(index);
                      }
                    }}
                    className={`w-2 h-2 rounded-full mx-1 transition-colors ${
                      index === currentImageIndex ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post stats */}
        {/* <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="font-medium cursor-pointer text-md text-gray-500">
              {post.likeCount} likes
            </span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
          <button
            onClick={handleCommentsClick}
            className="hover:text-gray-700 transition-colors"
          >
            <span className="font-medium  cursor-pointer text-md text-gray-500">
              {post.commentCount} comments
            </span>
          </button>
          {post.bookmarkCount > 0 && (
            <>
              <div className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <span className="font-medium cursor-pointer text-md text-gray-500">
                {post.bookmarkCount} saves
              </span>
            </>
          )}
        </div> */}
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-around py-3 border-t border-gray-100">
        {/* Like Button - Thumbs Up */}
        <button
          className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() =>
            isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id)
          }
        >
          <ThumbsUp
            size={20}
            className={isLiked ? "text-primary fill-current" : " text-gray-600"}
          />
          <span
            className={`ml-2 text-md font-medium ${
              isLiked ? " text-primary" : " text-gray-600"
            }`}
          >
            {post.likeCount}
          </span>
        </button>

        {/* Dislike Button - Thumbs Down */}
        <button
          className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() =>
            isDisliked
              ? handleUndislikePost(post.id)
              : handleDislikePost(post.id)
          }
        >
          <ThumbsDown
            size={20}
            className={
              isDisliked ? "text-orange-500 fill-current" : "text-gray-600"
            }
          />
          <span
            className={`ml-2 text-md font-medium ${
              isDisliked ? "text-orange-500" : "text-gray-600"
            }`}
          >
            {post.dislikeCount}
          </span>
        </button>

        {/* Comment Button */}
        <button
          className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => handleCommentPost(post)}
        >
          <MessageCircle size={20} className="text-gray-600" />
          <span className="ml-2 text-md text-gray-600 font-medium">
            {post.commentCount}
          </span>
        </button>

        {/* Amplify Button */}
        <button
          className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => handleAmplifyPost(post)}
        >
          <Repeat size={20} className="text-gray-600" />
          <span className="ml-2 text-md text-gray-600 font-medium">
            {post.amplifyCount}
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() =>
            isBookmarked
              ? handleUnbookmarkPost(post.id)
              : handleBookmarkPost(post.id)
          }
        >
          <Bookmark
            size={20}
            className={
              isBookmarked ? "text-primary fill-current" : "text-gray-600"
            }
          />
          <span
            className={`ml-2 text-md font-medium ${
              isBookmarked ? "text-primary" : "text-gray-600"
            }`}
          >
            {post.bookmarkCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
