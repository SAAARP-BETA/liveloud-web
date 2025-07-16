'use client';
import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../app/utils/config';
// const API_URL = "http://192.168.1.13:3002/api/";


const CommentModal = ({ visible, onClose, post, token, onSuccess }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [replyTo, setReplyTo] = useState(null); // Track which comment we're replying to

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setReplyTo(null);
    }
  }, [visible]);

  // Fetch comments when post changes or modal opens
  useEffect(() => {
    if (visible && post) {
      fetchComments(1, true);
    }
  }, [visible, post]);

  // Fetch comments
  const fetchComments = async (pageNum = 1, refresh = false) => {
    if (!post || !token || loadingComments) return;

    try {
      setLoadingComments(true);
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${post.id}/comments?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();

      // Check if comments array exists
      if (!data.comments || !Array.isArray(data.comments)) {
        throw new Error('Invalid comments response format');
      }

      // Update pagination info
      setHasMoreComments(data.currentPage < data.totalPages);

      if (refresh) {
        setComments(data.comments);
        setPage(1);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error - Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';

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
      toast.error('Login Required - Please login to comment');
      return;
    }

    try {
      setLoading(true);

      // If replying to a comment
      if (replyTo) {
        const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${post.id}/comment/${replyTo._id}/reply`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: commentText.trim()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit reply');
        }

        const data = await response.json();

        // Update the comment with the new reply
        setComments(prev => prev.map(comment => {
          if (comment._id === replyTo._id) {
            if (!comment.replies) comment.replies = [];
            comment.replies.push(data.reply);
          }
          return comment;
        }));

        // Clear reply mode
        setReplyTo(null);
      } else {
        // Regular comment
        const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${post.id}/comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: commentText.trim()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit comment');
        }

        const data = await response.json();

        // Add the new comment to the top of the list
        setComments(prev => [data.comment, ...prev]);
      }

      // Clear the input
      setCommentText('');

      // Call the success callback
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error posting comment/reply:', error);
      toast.error('Error - Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  // Like a comment
  const handleLikeComment = async (commentId) => {
    if (!token) {
      toast.error('Login Required - Please login to like comments');
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${post.id}/comment/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      // Update comment in state
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          if (!comment.likes) comment.likes = [];
          // Add current user's ID to likes if not already there
          if (!comment.likes.some(like => like._id === post.user?._id)) {
            comment.likes.push({ _id: post.user?._id });
          }
        }
        return comment;
      }));

    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Unlike a comment
  const handleUnlikeComment = async (commentId) => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${post.id}/comment/${commentId}/unlike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unlike comment');
      }

      // Update comment in state
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId && comment.likes) {
          comment.likes = comment.likes.filter(like => like._id !== post.user?._id);
        }
        return comment;
      }));

    } catch (error) {
      console.error('Error unliking comment:', error);
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
    setCommentText('');
  };

  // Handle scroll to load more comments
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop === clientHeight && !loadingComments && hasMoreComments) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage);
    }
  };

  // Render a comment item
  const CommentItem = ({ item }) => {
    const isLiked = item.likes && item.likes.some(like => like._id === post.user?._id);

    return (
      <div className="p-4 border-b border-gray-100">
        <div className="flex">
          <img
            src={item.user?.profilePicture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="font-medium text-sm text-gray-800">
                {item.user?.username || 'Anonymous'}
              </span>
              {item.user?.isVerified && (
                <CheckCircle size={14} className="text-blue-500 ml-1" />
              )}
              <span className="text-xs text-gray-500 ml-2">
                {formatTimestamp(item.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-800 mt-1">
              {item.content}
            </p>

            {/* Comment actions */}
            <div className="flex items-center mt-2">
              <button
                className="flex items-center mr-4 hover:bg-gray-100 p-1 rounded cursor-pointer"
                onClick={() => isLiked ? handleUnlikeComment(item._id) : handleLikeComment(item._id)}
              >
                <Heart
                  size={12}
                  className={isLiked ? "text-red-500 fill-current" : "text-gray-500"}
                />
                <span className={`text-xs ml-1 font-medium ${isLiked ? "text-red-500" : "text-gray-500"}`}>
                  {item.likes?.length || 0}
                </span>
              </button>

              <button
                className="flex items-center hover:bg-gray-100 p-1 rounded cursor-pointer"
                onClick={() => handleReplyToComment(item)}
              >
                <MessageCircle size={12} className="text-gray-500" />
                <span className="text-xs ml-1 font-medium text-gray-500">
                  Reply
                </span>
              </button>
            </div>

            {/* Render replies if any */}
            {item.replies && item.replies.length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-gray-200">
                {item.replies.map((reply, index) => (
                  <div key={index} className={index < item.replies.length - 1 ? "mb-2" : ""}>
                    <div className="flex">
                      <img
                        src={reply.user?.profilePicture || 'https://via.placeholder.com/150'}
                        alt="Profile"
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="ml-2 flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-xs text-gray-800">
                            {reply.user?.username || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            {formatTimestamp(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800">
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
      </div>
    );
  };

  // Empty comments component
  const EmptyComments = () => (
    <div className="py-8 text-center">
      <p className="font-medium text-gray-500">
        No comments yet. Be the first to comment!
      </p>
    </div>
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 opacity-100 flex items-center justify-center z-50">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 relative animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
        <div className="w-full flex items-center justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-800">
              Comments
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Original post preview */}
          {post && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
              <img
                src={post.profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-sm text-gray-800">
                    {post.username}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {post.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {post.content}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Comments list */}
        <div
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
          style={{ maxHeight: '400px' }}
        >
          {comments.length === 0 && !loadingComments ? (
            <EmptyComments />
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment._id} item={comment} />
            ))
          )}

          {loadingComments && (
            <div className="py-4 text-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        {/* Reply indicator */}
        {replyTo && (
          <div className="flex items-center justify-between bg-gray-100 px-4 py-2">
            <p className="text-xs text-gray-600">
              Replying to <span className="font-medium text-blue-500">
                @{replyTo.user?.username || 'user'}
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

        {/* Comment input */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-2xl">
          <div className="flex items-center ">
            <textarea
              className="flex-1 bg-gray-50 rounded-full px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder={replyTo ? "Add your reply..." : "Add a comment..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <button
              className={`ml-2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${commentText.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'
                }`}
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={18} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;