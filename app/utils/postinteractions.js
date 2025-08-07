// utils/postInteractions.js
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "./config";
import {
  UserPlus,
  UserMinus,
  Info,
  Flag,
  Ban,
  Trash2,
  EyeOff,
} from "lucide-react";
import { useCallback } from "react";

/**
 * Post Interactions Utility
 * Handles all post-related interactions: menu options, follow/unfollow, block, delete, etc.
 */

// Menu options configuration
export const menuOptions = [
  { icon: UserPlus, text: "Follow" },
  { icon: UserMinus, text: "Unfollow" },
  { icon: Info, text: "About this account" },
  { icon: Flag, text: "Report" },

  { icon: Ban, text: "Block" },
  { icon: Trash2, text: "Delete Post" },
];

/**
 * Check if user is following another user
 */
export const checkFollowStatus = async (userId, token) => {
  if (!token) return false;

  try {
    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/followers/${userId}/status`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.isFollowing || false;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
};

/**
 * Load menu options based on post and user context
 */
export const loadMenuOptions = async (
  selectedPost,
  user,
  isAuthenticated,
  token
) => {
  if (!selectedPost) {
    console.log("Missing post data for menu options");
    return { options: [], isFollowing: false };
  }

  // Handle different user ID field names
  const postUserId =
    selectedPost.user || selectedPost.userId || selectedPost.author;

  if (!postUserId) {
    console.log("No user ID found in post:", selectedPost);
    return { options: [], isFollowing: false };
  }

  try {
    // Determine if this is the user's own post
    const isOwnPost =
      isAuthenticated &&
      user &&
      (postUserId === user._id ||
        postUserId === user.id ||
        selectedPost.username === user.username);

    console.log("Post ownership check:", {
      postUserId,
      currentUserId: user?._id || user?.id,
      postUsername: selectedPost.username,
      currentUsername: user?.username,
      isOwnPost,
    });

    // Check follow status if needed
    let isFollowing = selectedPost.isFollowing;
    if (isAuthenticated && !isOwnPost && isFollowing === undefined) {
      try {
        console.log("Checking follow status for:", postUserId);
        isFollowing = await checkFollowStatus(postUserId, token);
      } catch (error) {
        console.error("Error fetching follow status:", error);
        isFollowing = false;
      }
    }

    // Filter menu options based on conditions
    const filtered = menuOptions.filter((option) => {
      if (option.text === "Follow") {
        return isAuthenticated && !isOwnPost && !isFollowing;
      }
      if (option.text === "Unfollow") {
        return isAuthenticated && !isOwnPost && isFollowing;
      }
      if (option.text === "Block") {
        return isAuthenticated && !isOwnPost;
      }

      if (option.text === "Delete Post") {
        return isAuthenticated && isOwnPost;
      }
      if (option.text === "Report") {
        return isAuthenticated && !isOwnPost;
      }
      if (option.text === "About this account") {
        return !isOwnPost;
      }

      return true;
    });

    console.log(
      "Filtered options:",
      filtered.map((o) => o.text)
    );
    return { options: filtered, isFollowing };
  } catch (error) {
    console.error("Error loading menu options:", error);
    // Return default options if there's an error
    return {
      options: [{ icon: Flag, text: "Report" }],
      isFollowing: false,
    };
  }
};

/**
 * Handle following a user
 */
export const handleFollowUser = async (userId, token, isAuthenticated) => {
  if (!isAuthenticated) {
    toast.error("Please login to follow users");
    return false;
  }

  try {
    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/followers/${userId}/follow`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to follow user");
    }

    toast.success("You are now following this user");
    return true;
  } catch (error) {
    console.error("Error following user:", error);
    toast.error(`Failed to follow user: ${error.message}`);
    return false;
  }
};

/**
 * Handle unfollowing a user
 */
export const handleUnfollowUser = async (userId, token, isAuthenticated) => {
  if (!isAuthenticated) {
    toast.error("Please login to unfollow users");
    return false;
  }

  try {
    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/followers/${userId}/unfollow`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to unfollow user");
    }

    toast.success("You have unfollowed this user");
    return true;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    toast.error(`Failed to unfollow user: ${error.message}`);
    return false;
  }
};

/**
 * Handle blocking a user
 */
export const handleBlockUser = async (userId, token, isAuthenticated) => {
  if (!isAuthenticated) {
    toast.error("Please login to block users");
    return false;
  }

  if (
    !confirm(
      "Are you sure you want to block this user? You will no longer see their content."
    )
  ) {
    return false;
  }

  try {
    const response = await fetch(
      `${API_ENDPOINTS.SOCIAL}/users/block/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to block user");
    }

    toast.success("You will no longer see content from this user");
    return true;
  } catch (error) {
    console.error("Error blocking user:", error);
    toast.error(`Failed to block user: ${error.message}`);
    return false;
  }
};

/**
 * Handle deleting a post
 */
export const handleDeletePost = async (postId, token, isAuthenticated) => {
  if (!isAuthenticated) {
    toast.error("Please login to delete posts");
    return false;
  }

  if (!confirm("Are you sure you want to delete this post?")) {
    return false;
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete post");
    }

    toast.success("Post deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    toast.error(`Failed to delete post: ${error.message}`);
    return false;
  }
};

/**
 * Main menu option handler
 */
export const handleMenuOption = async (
  option,
  selectedPost,
  user,
  token,
  isAuthenticated,
  postHandlers,
  router,
  callbacks = {}
) => {
  if (!selectedPost) {
    console.error("No post selected for menu option");
    return false;
  }

  // Handle different user ID field names
  const userId =
    selectedPost.user || selectedPost.userId || selectedPost.author;

  if (
    !userId &&
    ["Follow", "Unfollow", "Block", "About this account"].includes(option.text)
  ) {
    console.error("No user ID found for menu option:", option.text);
    toast.error("Unable to perform this action - user information missing");
    return false;
  }

  let success = false;

  console.log(
    "Handling menu option:",
    option.text,
    "for post:",
    selectedPost.id || selectedPost._id
  );

  switch (option.text) {
    case "Follow":
      success = await handleFollowUser(userId, token, isAuthenticated);
      if (success && callbacks.onFollowSuccess) {
        callbacks.onFollowSuccess(userId);
      }
      break;

    case "Unfollow":
      success = await handleUnfollowUser(userId, token, isAuthenticated);
      if (success && callbacks.onUnfollowSuccess) {
        callbacks.onUnfollowSuccess(userId);
      }
      break;

    case "Report":
      if (postHandlers?.handleInitiateReport) {
        console.log("Initiating report for post:", selectedPost);
        postHandlers.handleInitiateReport(selectedPost);
        success = true;
      } else {
        console.error("Report handler not available");
        toast.error("Report functionality not available");
      }
      break;

    case "Block":
      success = await handleBlockUser(userId, token, isAuthenticated);
      if (success && callbacks.onBlockSuccess) {
        callbacks.onBlockSuccess(userId);
      }
      break;

    case "About this account":
      if (router) {
        router.push(`/UserProfile/${userId}`);
        success = true;
      } else {
        console.error("Router not available for navigation");
        toast.error("Navigation not available");
      }
      break;

    case "Delete Post":
      success = await handleDeletePost(
        selectedPost.id || selectedPost._id,
        token,
        isAuthenticated
      );
      if (success && callbacks.onDeleteSuccess) {
        callbacks.onDeleteSuccess(selectedPost.id || selectedPost._id);
      }
      break;

    default:
      console.log("Unknown menu option:", option.text);
  }

  return success;
};

/**
 * Custom hook for managing post interactions
 */
export const usePostInteractions = (
  user,
  token,
  isAuthenticated,
  postHandlers,
  router,
  updatePosts // Function to update posts in the component
) => {
  const handleMenuOptionPress = useCallback(
    async (option, selectedPost, setModalVisible) => {
      console.log("Menu option pressed:", option.text, "Post:", selectedPost);

      const callbacks = {
        onFollowSuccess: (userId) => {
          console.log("Follow success callback for user:", userId);
          if (updatePosts) {
            updatePosts((posts) =>
              posts.map((post) => {
                const postUserId = post.userId || post.user || post.author;
                return postUserId === userId
                  ? { ...post, isFollowing: true }
                  : post;
              })
            );
          }
        },
        onUnfollowSuccess: (userId) => {
          console.log("Unfollow success callback for user:", userId);
          if (updatePosts) {
            updatePosts((posts) =>
              posts.map((post) => {
                const postUserId = post.userId || post.user || post.author;
                return postUserId === userId
                  ? { ...post, isFollowing: false }
                  : post;
              })
            );
          }
        },

        onBlockSuccess: (userId) => {
          console.log("Block success callback for user:", userId);
          if (updatePosts) {
            updatePosts((posts) =>
              posts.filter((post) => {
                const postUserId = post.userId || post.user || post.author;
                return postUserId !== userId;
              })
            );
          }
        },
        onDeleteSuccess: (postId) => {
          console.log("Delete success callback for post:", postId);
          if (updatePosts) {
            updatePosts((posts) =>
              posts.filter((post) => (post.id || post._id) !== postId)
            );
          }
        },
      };

      const success = await handleMenuOption(
        option,
        selectedPost,
        user,
        token,
        isAuthenticated,
        postHandlers,
        router,
        callbacks
      );

      // Close modal only if action was successful or doesn't require success check
      if (success || ["About this account", "Report"].includes(option.text)) {
        if (setModalVisible) {
          setModalVisible(false);
        }
      }

      return success;
    },
    [user, token, isAuthenticated, postHandlers, router, updatePosts]
  );

  const loadPostMenuOptions = useCallback(
    async (selectedPost) => {
      console.log("Loading menu options for post:", selectedPost);

      const result = await loadMenuOptions(
        selectedPost,
        user,
        isAuthenticated,
        token
      );

      // Update the post with follow status if it was fetched
      if (result.isFollowing !== undefined && updatePosts) {
        updatePosts((posts) =>
          posts.map((post) => {
            const postId = post.id || post._id;
            const selectedPostId = selectedPost.id || selectedPost._id;
            return postId === selectedPostId
              ? { ...post, isFollowing: result.isFollowing }
              : post;
          })
        );
      }

      return result.options;
    },
    [user, isAuthenticated, token, updatePosts]
  );

  return {
    handleMenuOptionPress,
    loadPostMenuOptions,
  };
};
