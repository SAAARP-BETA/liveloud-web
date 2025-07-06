"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  MessageCircle,
  Repeat,
  Bookmark,
  BookmarkMinus,
  Heart,
  HeartOff,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Optional: Replace this with a styled Next.js <Image> or fallback <img>
const FilteredImage = ({ src, alt, className, style, filterType }) => {
  const getFilterStyle = (filter) => {
    switch (filter) {
      case "sepia":
        return { filter: "sepia(1)" };
      case "vintage":
        return { filter: "sepia(0.5) contrast(1.2)" };
      case "cool":
        return { filter: "hue-rotate(180deg)" };
      case "warm":
        return { filter: "hue-rotate(30deg)" };
      default:
        return {};
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ ...style, ...getFilterStyle(filterType) }}
    />
  );
};

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
  // const isAuthenticated = true;

  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.95);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
      setScale(1);
    }, 50);
    return () => clearTimeout(timer);
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
    const scrollLeft = event.target.scrollLeft;
    const imageWidth = event.target.clientWidth;
    const imageIndex = Math.round(scrollLeft / imageWidth);
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

  const hasMedia = post.media?.length > 0;

  return (
    <div
      className="mb-4 bg-white rounded-xl mx-4 overflow-hidden shadow-sm border border-gray-100 transition-all duration-300"
      style={{ opacity, transform: `scale(${scale})` }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          className="flex items-center flex-1 text-left"
          onClick={() =>
            post.user === user._id
              ? router.push("/profile")
              : router.push(`/user/${post.username}`)
          }
        >
          <img
            src={
              (isAuthenticated && post.profilePic?.trim()) ||
              "../../app/assets/Profilepic1.png"
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
                <CheckCircle size={16} className="text-sky-500 ml-1" />
              )}
            </div>
            <span className="text-xs text-gray-500 font-normal">
              {post.timestamp}
            </span>
          </div>
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                <span className="text-xs text-gray-700 font-medium">
                  #{tag}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Amplified Post */}
        {post.isAmplified && post.originalPost && (
          <div className="border border-gray-200 rounded-xl p-3 mb-3">
            <div className="flex items-center mb-2">
              <span className="text-xs text-gray-500 font-medium">
                Amplified from
                <span className="text-sky-500">
                  {" "}
                  @{post.originalPost.user?.username || "user"}
                </span>
              </span>
            </div>
            {post.quoteContent && (
              <p className="text-sm text-gray-700 mb-2 font-normal">
                {post.quoteContent}
              </p>
            )}
            <div className="bg-gray-50 p-3 rounded-lg">
              {post.originalPost.content && (
                <p className="text-sm text-gray-700 font-normal">
                  {post.originalPost.content}
                </p>
              )}
              {post.originalPost.media?.[0] && (
                <img
                  src={post.originalPost.media[0]}
                  alt="Amplified media"
                  className="w-full h-45 object-cover rounded-lg mt-2"
                />
              )}
            </div>
          </div>
        )}

        {/* Image Carousel */}
        {hasMedia && (
          <div className="mb-3">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              onScroll={handleImageScroll}
            >
              {post.media.map((item, index) => (
                <button
                  key={index}
                  className="flex-shrink-0 w-full snap-center"
                  onClick={() =>
                    router.push({
                      pathname: "/media-viewer",
                      query: {
                        postId: post.id,
                        initialIndex: currentImageIndex,
                      },
                    })
                  }
                >
                  <div className="w-full h-75 rounded-lg overflow-hidden">
                    <FilteredImage
                      src={item}
                      alt={`Post image ${index}`}
                      className="w-full h-full object-cover"
                      filterType={post.mediaMetadata?.[index]?.filter}
                    />
                  </div>
                </button>
              ))}
            </div>
            {post.media.length > 1 && (
              <div className="flex justify-center mt-3">
                {post.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      scrollRef.current?.scrollTo({
                        left: index * scrollRef.current.clientWidth,
                        behavior: "smooth",
                      });
                      setCurrentImageIndex(index);
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

        {/* Stats */}
        <div className="flex items-center mb-2">
          <span className="text-xs text-gray-500 font-medium">
            {post.likeCount} likes
          </span>
          <div className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
          <button
            onClick={() =>
              router.push({
                pathname: "/post-detail",
                query: { postId: post.id },
              })
            }
            className="hover:text-gray-700 transition-colors"
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

      {/* Actions */}
      <div className="flex items-center justify-around py-3 border-t border-gray-100">
        <button
          className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          onClick={() =>
            isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id)
          }
        >
          {isLiked ? (
            <Heart size={18} className="text-red-500 fill-red-500" />
          ) : (
            <HeartOff size={18} className="text-slate-500" />
          )}
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
          {isBookmarked ? (
            <Bookmark size={18} className="text-sky-500 fill-sky-500" />
          ) : (
            <BookmarkMinus size={18} className="text-slate-500" />
          )}
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
