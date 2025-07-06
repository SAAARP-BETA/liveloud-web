"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { fonts } from "../../app/utils/fonts";

// Update EmptyFeed.js to handle session expiration
const EmptyFeed = ({ isAuthenticated, handleCreatePost, error, onLogin }) => {
  const router = useRouter();

  // Different message if there's an authentication error
  const hasAuthError =
    error &&
    (error.includes("session") ||
      error.includes("expired") ||
      error.includes("authentication"));

  return (
    <div className="py-16 flex flex-col items-center px-6">
      <img
        src="https://placehold.co/400x300/EAEAEA/999999?text=No+Posts+Yet"
        alt="No posts placeholder"
        className="w-40 h-40 mb-6"
      />
      <h2
        style={{ fontFamily: fonts.Bold }}
        className="text-xl text-gray-700 mb-2 text-center"
      >
        {hasAuthError ? "Session Expired" : "No posts yet"}
      </h2>
      <p
        style={{ fontFamily: fonts.Regular }}
        className="text-base text-gray-500 mb-6 text-center"
      >
        {hasAuthError
          ? "Your session has expired. Please login again."
          : isAuthenticated
          ? "Start following people or create your first post"
          : "Please login to see your personalized feed"}
      </p>

      {hasAuthError || !isAuthenticated ? (
        <button
          onClick={onLogin}
          className="bg-sky-500 py-3 px-8 rounded-full hover:bg-sky-600 transition-colors"
        >
          <span style={{ fontFamily: fonts.Bold }} className="text-white">
            Login
          </span>
        </button>
      ) : (
        <button
          onClick={handleCreatePost}
          className="bg-sky-500 py-3 px-8 rounded-full hover:bg-sky-600 transition-colors"
        >
          <span style={{ fontFamily: fonts.Bold }} className="text-white">
            Create Post
          </span>
        </button>
      )}
    </div>
  );
};

export default EmptyFeed;
