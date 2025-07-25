// postFunctions.js
// Utility functions for post interactions

import { API_ENDPOINTS } from "./config";

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  // MongoDB ObjectIds are 24 characters long and contain only hexadecimal characters
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Like a post
 * @param {string} postId - The ID of the post to like
 * @param {object} user - Current user object
 * @param {string} token - Authentication token
 * @param {function} setPosts - State setter function for posts
 * @returns {Promise} - Promise that resolves when the operation is complete
 */
export const handleLikePost = async (postId, user, token, setPosts) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Optimistically update UI first
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedLikes = [...post.likes];
          const updatedDislikes = [...(post.dislikes || [])];
          const userId = user?._id || "current-user";

          // Remove from dislikes if present
          const dislikeIndex = updatedDislikes.indexOf(userId);
          if (dislikeIndex > -1) {
            updatedDislikes.splice(dislikeIndex, 1);
          }

          // Add to likes if not present
          if (!updatedLikes.includes(userId)) {
            updatedLikes.push(userId);
          }

          return {
            ...post,
            likes: updatedLikes,
            dislikes: updatedDislikes,
            likeCount: updatedLikes.length,
            dislikeCount: updatedDislikes.length,
          };
        }
        return post;
      })
    );

    const apiUrl = `${API_ENDPOINTS.SOCIAL}/posts/${postId}/like`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Like request failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Failed to like post: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error liking post:", error);
    // Revert optimistic update on error
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const userId = user?._id || "current-user";
          const updatedLikes = post.likes.filter((id) => id !== userId);
          return {
            ...post,
            likes: updatedLikes,
            likeCount: updatedLikes.length,
          };
        }
        return post;
      })
    );
  }
};

/**
 * Unlike a post
 * @param {string} postId - The ID of the post to unlike
 * @param {object} user - Current user object
 * @param {string} token - Authentication token
 * @param {function} setPosts - State setter function for posts
 * @returns {Promise} - Promise that resolves when the operation is complete
 */
export const handleUnlikePost = async (postId, user, token, setPosts) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Optimistically update UI first
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const userId = user?._id || "current-user";
          const updatedLikes = post.likes.filter((id) => id !== userId);

          return {
            ...post,
            likes: updatedLikes,
            likeCount: updatedLikes.length,
          };
        }
        return post;
      })
    );

    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/posts/${postId}/unlike`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to unlike post");
    }
  } catch (error) {
    console.error("Error unliking post:", error);
    // Revert optimistic update on error
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const userId = user?._id || "current-user";
          const updatedLikes = [...post.likes];
          if (!updatedLikes.includes(userId)) {
            updatedLikes.push(userId);
          }
          return {
            ...post,
            likes: updatedLikes,
            likeCount: updatedLikes.length,
          };
        }
        return post;
      })
    );
  }
};

/**
 * Dislike a post
 * @param {string} postId - The ID of the post to dislike
 * @param {object} user - Current user object
 * @param {string} token - Authentication token
 * @param {function} setPosts - State setter function for posts
 * @returns {Promise} - Promise that resolves when the operation is complete
 */
export const handleDislikePost = async (postId, user, token, setPosts) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Optimistically update UI first
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedLikes = [...post.likes];
          const updatedDislikes = [...(post.dislikes || [])];
          const userId = user?._id || "current-user";

          // Remove from likes if present
          const likeIndex = updatedLikes.indexOf(userId);
          if (likeIndex > -1) {
            updatedLikes.splice(likeIndex, 1);
          }

          // Add to dislikes if not present
          if (!updatedDislikes.includes(userId)) {
            updatedDislikes.push(userId);
          }

          return {
            ...post,
            likes: updatedLikes,
            dislikes: updatedDislikes,
            likeCount: updatedLikes.length,
            dislikeCount: updatedDislikes.length,
          };
        }
        return post;
      })
    );

    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/posts/${postId}/dislike`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Failed to dislike post: ${responseBody}`);
    }
  } catch (error) {
    console.error("Error disliking post:", error);
    // Revert optimistic update on error
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const userId = user?._id || "current-user";
          const updatedDislikes =
            post.dislikes?.filter((id) => id !== userId) || [];
          return {
            ...post,
            dislikes: updatedDislikes,
            dislikeCount: updatedDislikes.length,
          };
        }
        return post;
      })
    );
  }
};

/**
 * Remove dislike from a post
 * @param {string} postId - The ID of the post to remove dislike from
 * @param {object} user - Current user object
 * @param {string} token - Authentication token
 * @param {function} setPosts - State setter function for posts
 * @returns {Promise} - Promise that resolves when the operation is complete
 */
export const handleUndislikePost = async (postId, user, token, setPosts) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Optimistically update UI first
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const userId = user?._id || "current-user";
          const updatedDislikes = (post.dislikes || []).filter(
            (id) => id !== userId
          );

          return {
            ...post,
            dislikes: updatedDislikes,
            dislikeCount: updatedDislikes.length,
          };
        }
        return post;
      })
    );

    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/posts/${postId}/removeDislike`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Failed to undislike post: ${responseBody}`);
    }
  } catch (error) {
    console.error("Error undisliking post:", error);
    // Revert optimistic update on error
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const userId = user?._id || "current-user";
          const updatedDislikes = [...(post.dislikes || [])];
          if (!updatedDislikes.includes(userId)) {
            updatedDislikes.push(userId);
          }
          return {
            ...post,
            dislikes: updatedDislikes,
            dislikeCount: updatedDislikes.length,
          };
        }
        return post;
      })
    );
  }
};

/**
 * Bookmark a post
 * @param {string} postId - The ID of the post to bookmark
 * @param {object} user - Current user object
 * @param {string} token - Authentication token
 * @param {function} setPosts - State setter function for posts
 * @returns {Promise} - Promise that resolves when the operation is complete
 */
export const handleBookmarkPost = async (postId, user, token, setPosts) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Optimistically update UI
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            bookmarks: [...(post.bookmarks || []), user?._id || "current-user"],
            bookmarkCount: (post.bookmarkCount || 0) + 1,
            isBookmarked: true,
          };
        }
        return post;
      })
    );

    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/posts/${postId}/bookmark`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to bookmark post");
    }
  } catch (error) {
    console.error("Error bookmarking post:", error);
  }
};

/**
 * Remove bookmark from a post
 * @param {string} postId - The ID of the post to remove bookmark from
 * @param {object} user - Current user object
 * @param {string} token - Authentication token
 * @param {function} setPosts - State setter function for posts
 * @returns {Promise} - Promise that resolves when the operation is complete
 */
export const handleUnbookmarkPost = async (postId, user, token, setPosts) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Optimistically update UI
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            bookmarks: (post.bookmarks || []).filter(
              (id) => id !== (user?._id || "current-user")
            ),
            bookmarkCount: Math.max(0, (post.bookmarkCount || 0) - 1),
            isBookmarked: false,
          };
        }
        return post;
      })
    );

    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/posts/${postId}/unbookmark`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to unbookmark post");
    }
  } catch (error) {
    console.error("Error unbookmarking post:", error);
  }
};

/**
 * Format timestamp for display
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted timestamp string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Just now";

  const postDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now - postDate;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs}s`;
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return postDate.toLocaleDateString();
};

/**
 * Format post data from API response
 * @param {object} post - Raw post data from API
 * @param {number} index - Index of the post in the list
 * @returns {object} - Formatted post object
 */
export const formatPostFromApi = (post, index) => {
  if (!post || typeof post !== "object") {
    console.warn(`Post at index ${index} is invalid:`, post);
    return null;
  }

  // Check if post has a valid MongoDB ObjectId
  if (!post._id || !isValidObjectId(post._id)) {
    console.warn(
      `Post at index ${index} has invalid or missing ObjectId:`,
      post._id
    );
    return null;
  }

  // Create the formatted post object with all required fields
  return {
    id: post._id,
    user: post.user._id || {},
    content: post.content || "",
    media: post.media || [],
    imageUrl: post.media && post.media.length > 0 ? post.media[0] : null,
    username: post.user?.username || "Anonymous",
    timestamp: formatTimestamp(post.createdAt),
    profilePic: post.user?.profilePicture || "",
    isVerified: post.user?.isVerified || false,
    likes: Array.isArray(post.likes) ? post.likes : [],
    dislikes: Array.isArray(post.dislikes) ? post.dislikes : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    bookmarks: Array.isArray(post.bookmarks) ? post.bookmarks : [],
    tags: Array.isArray(post.tags) ? post.tags : [],
    isAmplified: Boolean(post.isAmplified),
    originalPost: post.originalPost,
    quoteContent: post.quoteContent,
    likeCount: post.likeCount || post.likes?.length || 0,
    dislikeCount: post.dislikeCount || post.dislikes?.length || 0,
    commentCount: post.commentCount || post.comments?.length || 0,
    bookmarkCount: post.bookmarkCount || post.bookmarks?.length || 0,
  };
};

/**
 * Report a post with a specific reason
 * @param {string} postId - The ID of the post to report
 * @param {string} reason - The reason for reporting
 * @param {string} token - Authentication token
 * @returns {Promise} - Promise that resolves when the operation is complete
 */
export const handleReportPost = async (postId, reason, token) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/posts/${postId}/report`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to report post");
    }

    // Return the response data for potential use
    return await response.json();
  } catch (error) {
    console.error("Error reporting post:", error);
    throw error;
  }
};

// Standard report reasons that can be used throughout the app
export const reportReasons = [
  { id: "inappropriate", text: "Inappropriate content" },
  { id: "spam", text: "Spam or misleading" },
  { id: "harassment", text: "Harassment or bullying" },
  { id: "violence", text: "Violence or harmful behavior" },
  { id: "hate_speech", text: "Hate speech or symbols" },
  { id: "copyright", text: "Intellectual property violation" },
  { id: "false_info", text: "False information" },
  { id: "self_harm", text: "Self-harm or suicide" },
  { id: "other", text: "Other" },
];

// Export a wrapper function to handle all post-related operations
export const createPostHandlers = (
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
    handleLikePost: (postId) => handleLikePost(postId, user, token, setPosts),
    handleUnlikePost: (postId) =>
      handleUnlikePost(postId, user, token, setPosts),
    handleDislikePost: (postId) =>
      handleDislikePost(postId, user, token, setPosts),
    handleUndislikePost: (postId) =>
      handleUndislikePost(postId, user, token, setPosts),
    handleBookmarkPost: (postId) =>
      handleBookmarkPost(postId, user, token, setPosts),
    handleUnbookmarkPost: (postId) =>
      handleUnbookmarkPost(postId, user, token, setPosts),
    handleCommentPost: (post) => {
      setPostToComment(post);
      setCommentModalVisible(true);
    },
    handleAmplifyPost: (post) => {
      setPostToAmplify(post);
      setAmplifyModalVisible(true);
    },
    // Add new function to initiate report process
    handleInitiateReport: (post) => {
      setPostToReport(post);
      setReportModalVisible(true);
    },
    // Add report function
    handleReportPost: (postId, reason) =>
      handleReportPost(postId, reason, token),
  };
};

// Update the default export to include new functions
export default {
  handleLikePost,
  handleUnlikePost,
  handleDislikePost,
  handleUndislikePost,
  handleBookmarkPost,
  handleUnbookmarkPost,
  handleReportPost,
  reportReasons,
  formatTimestamp,
  formatPostFromApi,
  createPostHandlers,
};
