"use client";

import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send, Check } from "lucide-react";

// You'll need to define these in your Next.js app
// const API_ENDPOINTS = {
//   SOCIAL: 'your-api-endpoint'
// };

const CommentModal = ({ isVisible, onClose, post, token, onSuccess }) => {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [replyTo, setReplyTo] = useState(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isVisible) {
      setReplyTo(null);
    }
  }, [isVisible]);

  // Fetch comments when post changes or modal opens
  useEffect(() => {
    if (isVisible && post) {
      fetchComments(1, true);
    }
  }, [isVisible, post]);

  // Fetch comments
  const fetchComments = async (pageNum = 1, refresh = false) => {
    if (!post || !token || loadingComments) return;

    try {
      setLoadingComments(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/comments?page=${pageNum}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();

      if (!data.comments || !Array.isArray(data.comments)) {
        throw new Error("Invalid comments response format");
      }

      setHasMoreComments(data.currentPage < data.totalPages);

      if (refresh) {
        setComments(data.comments);
        setPage(1);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      alert("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

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

  // Submit a new comment
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    if (!token) {
      alert("Please login to comment");
      return;
    }

    try {
      setLoading(true);

      if (replyTo) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/comment/${replyTo._id}/reply`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: commentText.trim(),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit reply");
        }

        const data = await response.json();

        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === replyTo._id) {
              if (!comment.replies) comment.replies = [];
              comment.replies.push(data.reply);
            }
            return comment;
          })
        );

        setReplyTo(null);
      } else {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/comment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: commentText.trim(),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit comment");
        }

        const data = await response.json();
        setComments((prev) => [data.comment, ...prev]);
      }

      setCommentText("");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error posting comment/reply:", error);
      alert("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  // Like a comment
  const handleLikeComment = async (commentId) => {
    if (!token) {
      alert("Please login to like comments");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/comment/${commentId}/like`,
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

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            if (!comment.likes) comment.likes = [];
            if (!comment.likes.some((like) => like._id === post.user?._id)) {
              comment.likes.push({ _id: post.user?._id });
            }
          }
          return comment;
        })
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Unlike a comment
  const handleUnlikeComment = async (commentId) => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/comment/${commentId}/unlike`,
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

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId && comment.likes) {
            comment.likes = comment.likes.filter(
              (like) => like._id !== post.user?._id
            );
          }
          return comment;
        })
      );
    } catch (error) {
      console.error("Error unliking comment:", error);
    }
  };

  // Handle reply to comment
  const handleReplyToComment = (comment) => {
    setReplyTo(comment);
    setCommentText(`@${comment.user?.username} `);
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyTo(null);
    setCommentText("");
  };

  // Handle key press for submit
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmitComment();
    }
  };

  // Render a comment item
  const CommentItem = ({ comment }) => {
    const isLiked =
      comment.likes &&
      comment.likes.some((like) => like._id === post.user?._id);

    return (
      <div className="p-4 border-b border-gray-100">
        <div className="flex">
          <img
            src={
              comment.user?.profilePicture || "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="font-medium text-sm text-gray-900">
                {comment.user?.username || "Anonymous"}
              </span>
              {comment.user?.isVerified && (
                <Check className="w-3.5 h-3.5 text-blue-500 ml-1" />
              )}
              <span className="text-xs text-gray-500 ml-2">
                {formatTimestamp(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-900 mt-1">{comment.content}</p>

            {/* Comment actions */}
            <div className="flex items-center mt-2">
              <button
                className="flex items-center mr-4 hover:opacity-75"
                onClick={() =>
                  isLiked
                    ? handleUnlikeComment(comment._id)
                    : handleLikeComment(comment._id)
                }
              >
                <Heart
                  className={`w-3 h-3 ${
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs ml-1 font-medium ${
                    isLiked ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {comment.likes?.length || 0}
                </span>
              </button>

              <button
                className="flex items-center hover:opacity-75"
                onClick={() => handleReplyToComment(comment)}
              >
                <MessageCircle className="w-3 h-3 text-gray-500" />
                <span className="text-xs ml-1 font-medium text-gray-500">
                  Reply
                </span>
              </button>
            </div>

            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-gray-200">
                {comment.replies.map((reply, index) => (
                  <div
                    key={index}
                    className={index < comment.replies.length - 1 ? "mb-2" : ""}
                  >
                    <div className="flex">
                      <img
                        src={
                          reply.user?.profilePicture ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Profile"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="ml-2 flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-xs text-gray-900">
                            {reply.user?.username || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTimestamp(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-900">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[80vh] flex flex-col relative">
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-900">Comments</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Original post preview */}
          {post && (
            <div className="flex items-center mt-2">
              <img
                src={post.profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-sm text-gray-900">
                    {post.username}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {post.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{post.content}</p>
              </div>
            </div>
          )}
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {comments.length === 0 && !loadingComments ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 font-medium">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))
          )}

          {loadingComments && (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Reply indicator */}
        {replyTo && (
          <div className="flex items-center justify-between bg-gray-100 px-4 py-2">
            <span className="text-xs text-gray-600">
              Replying to{" "}
              <span className="font-medium text-blue-500">
                @{replyTo.user?.username || "user"}
              </span>
            </span>
            <button
              onClick={cancelReply}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Comment input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center">
            <textarea
              className="flex-1 bg-gray-50 rounded-full px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={replyTo ? "Add your reply..." : "Add a comment..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              maxLength={500}
            />
            <button
              className={`ml-2 w-10 h-10 rounded-full flex items-center justify-center ${
                commentText.trim()
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-300"
              }`}
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
