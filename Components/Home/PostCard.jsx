"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  MessageCircle,
  Repeat,
  Bookmark,
  Heart,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
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
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!post || !post.id) return null;
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

  const handleImageScroll = (event) => {
    const scrollContainer = event.target;
    const imageIndex = Math.round(
      scrollContainer.scrollLeft / scrollContainer.clientWidth
    );
    setCurrentImageIndex(imageIndex);
  };

  const renderContent = () => {
    if (!post.content) return null;
    return (
      <p className="text-base text-gray-800 leading-6 mb-3 font-normal">
        {post.content.split(/(\s+)/).map((word, i) => {
          if (word.startsWith("#")) {
            return (
              <span key={i} className="font-medium text-sky-500">
                {word}
              </span>
            );
          } else if (word.startsWith("@")) {
            return (
              <span key={i} className="font-medium text-sky-600">
                {word}
              </span>
            );
          }
          return word;
        })}
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
      router.push(`/user/${post.username}`); // someone else's profile
    }
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
      className={`mb-4 bg-white rounded-xl mx-4 overflow-hidden -z-[15] shadow-sm border border-gray-100 transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      ref={containerRef}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          className="flex items-center flex-1 text-left"
          onClick={handleProfileClick}
        >
          <div className="w-10 h-10 rounded-full mr-3 relative overflow-hidden">
            <Image
              src={
                isAuthenticated && post.profilePic?.trim()
                  ? post.profilePic
                  : "../../app/assets/Profilepic1.png"
              }
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="font-medium text-base text-gray-800">
                {post.user.username}
              </span>
              {post.isVerified && (
                <CheckCircle size={16} className="text-blue-500 ml-1" />
              )}
            </div>
            <span className="font-normal text-xs text-gray-500">
              {post.createdAt && !isNaN(new Date(post.createdAt))
                ? formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })
                : "Just now"}
              {/* {console.log("post created at: ", post.createdAt)} */}
            </span>
          </div>
        </button>
        <button
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          onClick={() => {
            setSelectedPost(post);
            setModalVisible(true);
          }}
        >
          <MoreHorizontal size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {renderContent()}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap mb-3">
            {post.tags.map((tag, i) => (
              <button
                key={i}
                className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-xs text-gray-700">
                  #{tag}
                </span>
              </button>
            ))}
          </div>
        )}
         {/* Image Carousel */}
        {hasMedia && (
          <div className="mb-3">
            <div
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              onScroll={handleImageScroll}
            >
              {post.media.map((item, index) => (
                <button
                  key={`media-${post.id}-${index}`}
                  className="flex-shrink-0 w-full snap-start"
                  onClick={handleImageClick}
                ></button>
              ))}
            </div>
            {post.media.length > 1 && (
              <div className="flex justify-center mt-3">
                {post.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const container = containerRef.current?.querySelector(
                        ".overflow-x-auto"
                      );
                      if (container) {
                        container.scrollLeft = index * container.clientWidth;
                        setCurrentImageIndex(index);
                      }
                    }}
                    className={`w-2 h-2 rounded-full mx-1 transition-colors ${
                      index === currentImageIndex ? "bg-sky-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}


        {/* Amplified Post */}
        {post.isAmplified && post.originalPost && (
          <div className="border border-gray-200 rounded-xl p-3 mb-3">
            <div className="flex items-center mb-2">
              <span className="font-medium text-xs text-gray-500">
                Amplified from
                <span className="text-sky-500">
                  {" "}
                  @{post.originalPost.user?.username || "user"}
                </span>
              </span>
            </div>
            {post.quoteContent && (
              <p className="font-normal text-sm text-gray-700 mb-2">
                {post.quoteContent}
              </p>
            )}
            <div className="bg-gray-50 p-3 rounded-lg">
              {post.originalPost.content && (
                <p className="font-normal text-sm text-gray-700">
                  {post.originalPost.content}
                </p>
              )}

              {post.originalPost.media && post.originalPost.media.length > 0 && (
                <div className="w-full h-48 relative rounded-lg mt-2 overflow-hidden">
                  <Image
                    src={post.originalPost.media[0]}
                    alt="Original post media"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

       
        {/* Stats */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="font-medium text-xs text-gray-500">
              {post.likeCount} likes
            </span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
          <button
            onClick={handleCommentsClick}
            className="hover:text-gray-700 transition-colors"
          >
            <span className="font-medium text-xs text-gray-500">
              {post.commentCount} comments
            </span>
          </button>
          {post.bookmarkCount > 0 && (
            <>
              <div className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <span className="font-medium text-xs text-gray-500">
                {post.bookmarkCount} saves
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around py-3 border-t border-gray-100">
        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() =>
            isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id)
          }
        >
          <Heart
            size={18}
            className={isLiked ? "text-red-500 fill-current" : "text-gray-600"}
          />
          <span
            className={`ml-2 text-sm font-medium ${
              isLiked ? "text-red-500" : "text-gray-600"
            }`}
          >
            Like
          </span>
        </button>

        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => handleCommentPost(post)}
        >
          <MessageCircle size={18} className="text-slate-500" />
          <span className="ml-2 text-sm text-gray-600 font-medium">
            Comment
          </span>
        </button>

        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() => handleAmplifyPost(post)}
        >
          <Repeat size={18} className="text-slate-500" />
          <span className="ml-2 text-sm text-gray-600 font-medium">
            Amplify
          </span>
        </button>

        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() =>
            isBookmarked
              ? handleUnbookmarkPost(post.id)
              : handleBookmarkPost(post.id)
          }
        >
          <Bookmark
            size={18}
            className={
              isBookmarked ? "text-sky-500 fill-current" : "text-gray-600"
            }
          />
          <span
            className={`ml-2 text-sm font-medium ${
              isBookmarked ? "text-sky-500" : "text-gray-600"
            }`}
          >
            Save
          </span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
