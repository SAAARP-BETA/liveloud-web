"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Loader2,
  UserPlus,
  UserMinus,
  Info,
  Flag,
  Ban,
  Trash2,
  Heart, // ADDED: Import Heart icon for like functionality
  MessageCircle, // ADDED: Import MessageCircle icon for reply functionality
  X, // ADDED: Import X icon for cancel reply
} from "lucide-react";
import { getProfilePicture } from "@/app/utils/fallbackImage";

import { usePostInteractions } from "../../../utils/postinteractions";
import defaultPic from "../../../assets/avatar.png";

// --- Local Imports ---
import { useAuth } from "../../../context/AuthContext";
import PostCard from "@/app/components/ui/PostCard";
import CommentModal from "@/app/components/ui/CommentModal";
import AmplifyModal from "@/app/components/ui/AmplifyModal";
import CustomModal from "@/app/components/ui/Modal";
import ReportModal from "@/app/components/ui/ReportModal";
import { API_ENDPOINTS } from "../../../utils/config";
import { createPostHandlers } from "../../../utils/postFunctions";

// Move menu options outside component to prevent re-creation
const menuOptions = [
  { icon: UserPlus, text: "Follow" },
  { icon: UserMinus, text: "Unfollow" },
  { icon: Info, text: "About this account" },
  { icon: Flag, text: "Report" },
  { icon: Ban, text: "Block" },
  { icon: Trash2, text: "Delete Post" },
];

/**
 * A simple component to display a single comment.
 * MODIFIED: Added like/unlike functionality and reply functionality for comments
 */
const CommentCard = React.memo(
  ({ comment, postId, token, user, onCommentUpdate, onReplyToComment }) => {
    if (!comment || !comment.user) {
      return null;
    }

    // ADDED: Like/Unlike handlers for comments
    const handleLikeComment = async (commentId) => {
      if (!token) {
        toast.error("Login Required - Please login to like comments");
        return;
      }

      try {
        const response = await fetch(
          `${API_ENDPOINTS.SOCIAL}/posts/${postId}/comment/${commentId}/like`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to like comment");
        }

        // Update comment in parent component
        if (onCommentUpdate) {
          onCommentUpdate(commentId, "like");
        }
      } catch (error) {
        console.error("Error liking comment:", error);
        toast.error("Failed to like comment");
      }
    };

    const handleUnlikeComment = async (commentId) => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${API_ENDPOINTS.SOCIAL}/posts/${postId}/comment/${commentId}/unlike`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to unlike comment");
        }

        // Update comment in parent component
        if (onCommentUpdate) {
          onCommentUpdate(commentId, "unlike");
        }
      } catch (error) {
        console.error("Error unliking comment:", error);
        toast.error("Failed to unlike comment");
      }
    };

    // ADDED: Check if current user has liked the comment
    const isLiked =
      comment.likes &&
      comment.likes.some(
        (like) =>
          like._id === user?._id ||
          like.user === user?._id ||
          like === user?._id
      );

    // Format timestamp
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return "Just now";

      const commentDate = new Date(timestamp);
      const now = new Date();
      const diffMs = now - commentDate;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return `${diffSecs}s`;
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;

      return commentDate.toLocaleDateString();
    };

    return (
      <div className="flex items-start space-x-4 p-4 border-t border-gray-100 overflow-hidden">
        <div className="w-10 h-10 rounded-full relative overflow-hidden flex-shrink-0">
          <Image
            src={comment.user.profilePicture || defaultPic}
            alt={`${comment.user.username}'s profile`}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-gray-900">
              {comment.user.username}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>
          <p className="text-gray-800 mt-1 break-words overflow-wrap-anywhere whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* ADDED: Comment like/unlike and reply buttons */}
          <div className="flex items-center mt-2">
            <button
              className="flex items-center mr-4 hover:bg-gray-100 p-1 rounded cursor-pointer"
              onClick={() =>
                isLiked
                  ? handleUnlikeComment(comment._id)
                  : handleLikeComment(comment._id)
              }
            >
              <Heart
                size={14}
                className={
                  isLiked ? "text-red-500 fill-current" : "text-gray-500"
                }
              />
              <span
                className={`text-xs ml-1 font-medium ${
                  isLiked ? "text-red-500" : "text-gray-500"
                }`}
              >
                {comment.likes?.length || 0}
              </span>
            </button>

            {/* ADDED: Reply button */}
            <button
              className="flex items-center hover:bg-gray-100 p-1 rounded cursor-pointer"
              onClick={() => onReplyToComment && onReplyToComment(comment)}
            >
              <MessageCircle size={14} className="text-gray-500" />
              <span className="text-xs ml-1 font-medium text-gray-500">
                Reply
              </span>
            </button>
          </div>

          {/* ADDED: Render replies if any */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200">
              {comment.replies.map((reply, index) => (
                <div
                  key={index}
                  className={index < comment.replies.length - 1 ? "mb-2" : ""}
                >
                  <div className="flex">
                    <img
                      src={getProfilePicture(reply.user?.profilePicture)}
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />

                    <div className="ml-2 flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-xs text-gray-800">
                          {reply.user?.username || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          {formatTimestamp(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 break-words">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CommentCard.displayName = "CommentCard";

/**
 * The main page component for displaying a single post and its comments.
 */
const PostPage = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId;
  const { user, token, isAuthenticated } = useAuth();

  // --- State Management ---
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // ADDED: Reply state management
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Modal States
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isAmplifyModalVisible, setAmplifyModalVisible] = useState(false);
  const [postToAmplify, setPostToAmplify] = useState(null);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [postToComment, setPostToComment] = useState(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Helper function to update the single post - make it compatible with post interactions
  const updatePostData = useCallback((updater) => {
    if (typeof updater === "function") {
      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        // The hook expects an array, so we pass an array and take the first result
        const result = updater([prevPost]);
        return Array.isArray(result) ? result[0] : result;
      });
    } else if (updater && typeof updater === "object") {
      // Handle direct post object updates
      setPost(updater);
    }
  }, []);

  // ADDED: Handler for comment like/unlike updates
  const handleCommentUpdate = useCallback(
    (commentId, action) => {
      setPost((prevPost) => {
        if (!prevPost || !prevPost.comments) return prevPost;

        return {
          ...prevPost,
          comments: prevPost.comments.map((comment) => {
            if (comment._id === commentId) {
              if (!comment.likes) comment.likes = [];

              if (action === "like") {
                // Add current user's ID to likes if not already there
                const alreadyLiked = comment.likes.some(
                  (like) =>
                    like._id === user?._id ||
                    like.user === user?._id ||
                    like === user?._id
                );
                if (!alreadyLiked) {
                  comment.likes.push({ _id: user?._id });
                }
              } else if (action === "unlike") {
                // Remove current user's ID from likes
                comment.likes = comment.likes.filter(
                  (like) =>
                    like._id !== user?._id &&
                    like.user !== user?._id &&
                    like !== user?._id
                );
              }
            }
            return { ...comment };
          }),
        };
      });
    },
    [user?._id]
  );

  // ADDED: Handle reply to comment
  const handleReplyToComment = useCallback((comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.user?.username} `);
  }, []);

  // ADDED: Cancel reply
  const cancelReply = useCallback(() => {
    setReplyTo(null);
    setNewComment("");
  }, []);

  // --- Data Fetching ---
  const fetchPost = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${postId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch post");
      }
      const data = await response.json();
      const formattedPost = {
        ...data,
        id: data._id,
        username: data.user.username,
        profilePic: data.user.profilePicture,
        user: data.user._id || data.user.id,
        userId: data.user._id || data.user.id,
      };
      setPost(formattedPost);
      setSelectedPost(formattedPost);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId, token]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Memoize post handlers to prevent recreation
  const postHandlers = useMemo(
    () =>
      createPostHandlers(
        user,
        token,
        updatePostData,
        setPostToComment,
        setCommentModalVisible,
        setPostToAmplify,
        setAmplifyModalVisible,
        setPostToReport,
        setReportModalVisible
      ),
    [user, token, updatePostData]
  );

  // Use the post interactions hook
  const { handleMenuOptionPress, loadPostMenuOptions } = usePostInteractions(
    user,
    token,
    isAuthenticated,
    postHandlers,
    router,
    updatePostData
  );

  // MODIFIED: Comment submission handler to handle both comments and replies
  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!newComment.trim() || !isAuthenticated || !token) {
        toast.error("Please login to comment");
        return;
      }

      if (replyTo) {
        // Handle reply submission
        setIsSubmittingReply(true);
        try {
          const response = await fetch(
            `${API_ENDPOINTS.SOCIAL}/posts/${postId}/comment/${replyTo._id}/reply`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                content: newComment.trim(),
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to post reply");
          }

          const data = await response.json();

          // Update the post with the new reply
          setPost((prevPost) => ({
            ...prevPost,
            comments: prevPost.comments.map((comment) => {
              if (comment._id === replyTo._id) {
                if (!comment.replies) comment.replies = [];
                comment.replies.push(data.reply);
              }
              return comment;
            }),
          }));

          setNewComment("");
          setReplyTo(null);
          toast.success("Reply posted successfully!");
        } catch (err) {
          console.error("Error posting reply:", err);
          toast.error(err.message || "Failed to post reply");
        } finally {
          setIsSubmittingReply(false);
        }
      } else {
        // Handle regular comment submission
        setIsSubmittingComment(true);
        try {
          const response = await fetch(
            `${API_ENDPOINTS.SOCIAL}/posts/${postId}/comment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                content: newComment.trim(),
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to post comment");
          }

          const data = await response.json();
          const newCommentData = data.comment || data;

          // Update the post with the new comment
          setPost((prevPost) => ({
            ...prevPost,
            comments: [newCommentData, ...(prevPost.comments || [])],
            commentCount: (prevPost.commentCount || 0) + 1,
          }));

          setNewComment("");
          toast.success("Comment posted successfully!");
        } catch (err) {
          console.error("Error posting comment:", err);
          toast.error(err.message || "Failed to post comment");
        } finally {
          setIsSubmittingComment(false);
        }
      }
    },
    [newComment, isAuthenticated, token, postId, replyTo]
  );

  // Load menu options when modal is visible - Fixed to prevent infinite loops
  useEffect(() => {
    if (!isModalVisible || !selectedPost || isLoadingOptions) {
      return;
    }

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const options = await loadPostMenuOptions(selectedPost);
        setFilteredOptions(options);
      } catch (error) {
        console.error("Error loading menu options:", error);
        // Fallback options
        const isOwnPost =
          isAuthenticated &&
          user &&
          (selectedPost.user === user._id || selectedPost.userId === user._id);
        const fallbackOptions = menuOptions.filter((option) => {
          if (option.text === "Delete Post") return isOwnPost;
          if (
            option.text === "Follow" ||
            option.text === "Unfollow" ||
            option.text === "Block"
          )
            return !isOwnPost;
          return true;
        });
        setFilteredOptions(fallbackOptions);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [isModalVisible, selectedPost?.id, isAuthenticated, user?._id]);

  // Handle menu option press with proper parameters
  const handleMenuPress = useCallback(
    (option) => {
      if (!selectedPost) {
        toast.error("No post selected");
        return;
      }

      handleMenuOptionPress(option, selectedPost, setModalVisible);
    },
    [selectedPost, handleMenuOptionPress]
  );

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="sm:max-w-lg md:min-w-lg/3 lg:w-xl flex flex-col items-center justify-center p-16">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-lg text-gray-600">Loading post...</p>
      </div>
    );
  }

  if (error)
    return (
      <div className="w-xl text-center py-20 text-red-500">Error: {error}</div>
    );
  if (!post)
    return <div className="w-xl text-center py-20">Post not found.</div>;

  return (
    <>
      <div className="mx-auto p-2 sm:p-4 w-full sm:max-w-lg md:max-w-lg lg:min-w-xl/2 lg:w-xl">
        {/* <div className="mx-auto p-2 sm:p-4 w-full sm:max-w-lg md:max-w-lg lg:w-xl"> */}
        <PostCard
          post={post}
          handleLikePost={postHandlers.handleLikePost}
          handleUnlikePost={postHandlers.handleUnlikePost}
          handleDislikePost={postHandlers.handleDislikePost}
          handleUndislikePost={postHandlers.handleUndislikePost}
          handleCommentPost={postHandlers.handleCommentPost}
          handleAmplifyPost={postHandlers.handleAmplifyPost}
          handleBookmarkPost={postHandlers.handleBookmarkPost}
          handleUnbookmarkPost={postHandlers.handleUnbookmarkPost}
          setSelectedPost={setSelectedPost}
          setModalVisible={setModalVisible}
          username={user?.username}
        />

        {/* MODIFIED: Comment Submission Form with reply indicator */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
          {/* ADDED: Reply indicator */}
          {replyTo && (
            <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg mb-3">
              <p className="text-sm text-gray-600">
                Replying to{" "}
                <span className="font-medium text-primary">
                  @{replyTo.user?.username || "user"}
                </span>
              </p>
              <button
                onClick={cancelReply}
                className="p-1 hover:bg-gray-200 rounded cursor-pointer"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          )}

          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center space-x-2 sm:space-x-3"
          >
            <textarea
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Add your reply..." : "Add a comment..."}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition resize-none text-sm sm:text-base"
              rows="1"
              disabled={isSubmittingComment || isSubmittingReply}
            />
            <button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center text-sm sm:text-base"
              disabled={
                !newComment.trim() ||
                !isAuthenticated ||
                isSubmittingComment ||
                isSubmittingReply
              }
            >
              {isSubmittingComment || isSubmittingReply ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {replyTo ? "Replying..." : "Posting..."}
                </>
              ) : replyTo ? (
                "Reply"
              ) : (
                "Post"
              )}
            </button>
          </form>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-2">
              Please log in to post a comment.
            </p>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl mt-4 mx-1 sm:mx-0">
          <h2 className="text-lg font-bold p-4 border-b border-gray-100">
            Comments ({post.commentCount || post.comments?.length || 0})
          </h2>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                postId={postId}
                token={token}
                user={user}
                onCommentUpdate={handleCommentUpdate}
                onReplyToComment={handleReplyToComment}
              />
            ))
          ) : (
            <p className="px-4 pb-4 text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>

      {/* --- Modals --- */}
      <CustomModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="Post Options"
      >
        <div className="p-4">
          {selectedPost && (
            <div className="flex items-center mb-4 p-3 truncate bg-gray-50 rounded-xl">
              <img
                src={getProfilePicture(selectedPost?.profilePic)}
                alt={selectedPost?.username || "Profile"}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-800">
                  {selectedPost.username}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {selectedPost.content}
                </p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {isLoadingOptions ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Loading options...</span>
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option.text}-${index}`}
                  onClick={() => handleMenuPress(option)}
                  className={`w-full flex items-center p-3 rounded-xl text-left transition-colors cursor-pointer ${
                    option.text === "Delete Post" ||
                    option.text === "Block" ||
                    option.text === "Report"
                      ? "hover:bg-red-50 text-red-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <option.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{option.text}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </CustomModal>

      <CommentModal
        visible={isCommentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        title="Add Comment"
        post={postToComment}
        onSuccess={() => {
          setCommentModalVisible(false);
          fetchPost();
        }}
        token={token}
      />

      <AmplifyModal
        visible={isAmplifyModalVisible}
        onClose={() => setAmplifyModalVisible(false)}
        post={postToAmplify}
        token={token}
        onSuccess={() => {
          setAmplifyModalVisible(false);
          fetchPost();
        }}
      />

      <ReportModal
        visible={isReportModalVisible}
        onClose={() => setReportModalVisible(false)}
        post={postToReport}
        token={token}
        onSuccess={() => {
          setReportModalVisible(false);
        }}
      />
    </>
  );
};

export default PostPage;
