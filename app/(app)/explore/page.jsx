"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Clock,
  Hash,
  Users,
  TrendingUp,
  MapPin,
  ChevronRight,
  Verified,
  XCircle,
} from "lucide-react";
import { debounce } from "lodash";
import { API_ENDPOINTS } from "../../utils/config";
import defaultPic from "../../assets/avatar.png";
import { getProfilePicture } from "@/app/utils/fallbackImage";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const fonts = {
  Regular: "Inter, sans-serif",
  Medium: "Inter, sans-serif",
  SemiBold: "Inter, sans-serif",
  Bold: "Inter, sans-serif",
};

// Component for trending item with gradient border
const TrendingItem = ({ tag, count, index, onPress }) => {
  const getGradientColors = (idx) => {
    const gradients = [
      "from-red-400 to-orange-400", // Sunset
      "from-purple-600 to-purple-400", // Purple
      "from-cyan-400 to-green-300", // Mint
      "from-pink-500 to-blue-500", // Pinkish Blue
      "from-indigo-600 to-blue-300", // Blue Night
      "from-teal-500 to-green-400", // Green
    ];
    return gradients[idx % gradients.length];
  };

  return (
    <button
      onClick={onPress}
      className="mr-4 mb-3 p-[1.5px] rounded-full bg-gradient-to-r hover:scale-105 transition-transform"
      style={{
        background: `linear-gradient(135deg, ${getGradientColors(index)
          .replace("from-", "")
          .replace(" to-", ", ")})`,
      }}
    >
      <div className="bg-white rounded-full px-4 py-2">
        <p className="text-gray-900 font-medium">#{tag}</p>
        <p className="text-xs text-gray-500">{count.toLocaleString()} posts</p>
      </div>
    </button>
  );
};

// Component for search suggestion item
const SuggestionItem = ({ item, onPress, showType = true }) => {
  return (
    <button
      className="flex items-center py-3 px-4 w-full text-left hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
      onClick={() => onPress(item)}
    >
      {item.type === "user" ? (
        <>
          <img
            src={getProfilePicture(item.profilePicture)}
            alt={item.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="text-gray-900 font-medium">{item.username}</span>
              {item.isVerified && (
                <Verified
                  size={14}
                  className="ml-1 text-primary fill-current"
                />
              )}
            </div>
            {item.bio && (
              <p className="text-gray-500 text-sm truncate">{item.bio}</p>
            )}
          </div>
          {showType && (
            <div className="bg-gray-100 rounded-full px-2 py-1">
              <span className="text-xs text-gray-500 font-medium">Profile</span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Hash size={18} className="text-gray-500" />
          </div>
          <div className="ml-3 flex-1">
            <span className="text-gray-900 font-medium">#{item.tag}</span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {item.count.toLocaleString()} posts
            </p>
          </div>
          {showType && (
            <div className="bg-gray-100 rounded-full px-2 py-1">
              <span className="text-xs text-gray-500 font-medium">Tag</span>
            </div>
          )}
        </>
      )}
    </button>
  );
};

// Component for recent search item
const RecentSearchItem = ({ item, onPress, onRemove }) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      <button
        className="flex items-center flex-1 text-left rounded -m-2 p-2 cursor-pointer"
        onClick={() => onPress(item)}
      >
        {item.type === "user" && item.profilePicture ? (
          <img
            src={getProfilePicture(item.profilePicture)}
            alt={item.username}
            className="w-4 h-4 rounded-full object-cover mr-3"
          />
        ) : (
          <Clock size={16} className="text-gray-500" />
        )}
        <span className="ml-3 text-gray-700 truncate">
          {item.type === "user"
            ? `@${item.username}`
            : item.type === "tag"
            ? `#${item.tag}`
            : item.query}
        </span>
      </button>

      <button onClick={() => onRemove(item)} className="p-2rounded">
        <X size={16} className="text-gray-500 cursor-pointer" />
      </button>
    </div>
  );
};

// Component for post search result
const PostSearchResult = ({ post, onPress }) => {
  return (
    <div
      className="bg-white rounded-xl p-4 mb-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onPress(post)}
    >
      <div className="flex items-center mb-3">
        <img
          src={getProfilePicture(post.user.profilePicture)}
          alt={post.user.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="ml-2">
          <div className="flex items-center">
            <span className="text-gray-900 font-medium">
              {post.user.username}
            </span>
            {post.user.isVerified && (
              <Verified size={14} className="ml-1 text-primary fill-current" />
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500 ml-auto">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-gray-800 mb-2">{post.content}</p>

      {post.media && post.media[0] && (
        <img
          src={post.media[0]}
          alt="Post media"
          className="w-full h-48 rounded-lg object-cover"
        />
      )}
    </div>
  );
};

// Component for user search result
const UserSearchResult = ({ user, onPress }) => {
  return (
    <div
      className="bg-white rounded-xl p-4 mb-4 flex items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onPress(user)}
    >
      <img
        src={getProfilePicture(user.profilePicture)}
        alt={user.username}
        className="w-14 h-14 rounded-full object-cover"
      />

      <div className="ml-3 flex-1">
        <div className="flex items-center">
          <span className="text-gray-900 dark:text-white text-base font-semibold">
            {user.username}
          </span>
          {user.isVerified && (
            <Verified size={16} className="ml-1 text-primary fill-current" />
          )}
        </div>

        {user.bio && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
            {user.bio}
          </p>
        )}

        <div className="flex mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span className="text-gray-700 dark:text-gray-300">
              {user.followersCount}
            </span>{" "}
            followers
          </span>

          {user.followingCount && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-3 font-medium">
              <span className="text-gray-700 dark:text-gray-300">
                {user.followingCount}
              </span>{" "}
              following
            </span>
          )}
        </div>
      </div>

      <button className="bg-primary hover:bg-sky-600 rounded-full px-4 py-1.5 text-white font-medium transition-colors">
        Follow
      </button>
    </div>
  );
};

// Main Search Page component
export default function SearchPage() {
  const router = useRouter();
  const handleNavigateToPost = () => {
    router.push(`/post/${post.id}`);
  };
  const { user, token } = useAuth();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("initial"); // 'initial', 'suggestions', 'results'
  const [activeTab, setActiveTab] = useState("users"); // 'all', 'users', 'posts', 'tags'
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search data
  const [suggestions, setSuggestions] = useState({ users: [], tags: [] });
  const [searchResults, setSearchResults] = useState({
    users: [],
    posts: [],
    tags: [],
  });
  const [trendingTags, setTrendingTags] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hasMore, setHasMore] = useState({
    users: false,
    posts: false,
    tags: false,
  });

  // Animation states
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Effects
  useEffect(() => {
    fetchTrendingTags();
    fetchTrendingSearches();
    loadRecentSearches();
  }, []);

  // Handle search focus/blur
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim()) {
      setSearchMode("suggestions");
      fetchSuggestions(searchQuery);
    } else {
      setSearchMode("initial");
    }
  };

  const handleSearchBlur = () => {
    // Only reset if there's no query
    if (!searchQuery.trim()) {
      setIsSearchFocused(false);
      setSearchMode("initial");
    }
  };

  // Handle cancel button press
  const handleCancel = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
    setSearchMode("initial");
  };

  // Handle search query change
  const handleSearchChange = (text) => {
    setSearchQuery(text);

    if (text.trim()) {
      setSearchMode("suggestions");
      debouncedFetchSuggestions(text);
    } else {
      setSearchMode("initial");
      setSuggestions({ users: [], tags: [] });
    }
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchMode("results");
      saveRecentSearch({ type: "query", query: searchQuery.trim() });
      fetchSearchResults(searchQuery);
    }
  };

  // API calls
  const fetchTrendingTags = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SEARCH}/posts/tags/trending`
      );
      if (response.ok) {
        const data = await response.json();
        setTrendingTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error fetching trending tags:", error);
    }
  };

  const fetchTrendingSearches = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SEARCH}/trending-searches`);
      if (response.ok) {
        const data = await response.json();
        setTrendingSearches(data.trending || []);
      }
    } catch (error) {
      console.error("Error fetching trending searches:", error);
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.SEARCH}/search/suggestions?query=${encodeURIComponent(
          query
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || { users: [], tags: [] });
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    []
  );

  const fetchSearchResults = async (query, type = "all", page = 1) => {
    if (!query.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.SEARCH}/search?query=${encodeURIComponent(
          query
        )}&type=${type}&page=${page}&limit=10`
      );

      if (response.ok) {
        const data = await response.json();

        if (page === 1) {
          setSearchResults(data);
        } else {
          setSearchResults({
            users: [...searchResults.users, ...data.users],
            posts: [...searchResults.posts, ...data.posts],
            tags: [...searchResults.tags, ...data.tags],
          });
        }

        setHasMore(data.more || { users: false, posts: false, tags: false });
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Recent searches functionality with API and localStorage backup
  const STORAGE_KEY = 'liveloud_recent_searches';
  const MAX_RECENT_SEARCHES = 10;

  const loadRecentSearches = async () => {
    try {
      // Try to get from API first
      const response = await fetch(`${API_ENDPOINTS.SEARCH}/recent-searches`);
      if (response.ok) {
        const data = await response.json();
        const searches = data.searches || [];
        setRecentSearches(searches);
        // Update localStorage with API data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
        return;
      }
    } catch (error) {
      console.error("Error loading recent searches from API:", error);
    }

    // Fallback to localStorage if API fails
    try {
      const storedSearches = localStorage.getItem(STORAGE_KEY);
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      setRecentSearches([]);
    }
  };

  const saveRecentSearch = async (item) => {
    try {
      // Try to save to API first
      const response = await fetch(`${API_ENDPOINTS.SEARCH}/recent-searches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        await loadRecentSearches(); // Reload from API
        return;
      }
    } catch (error) {
      console.error("Error saving to API:", error);
    }

    // Fallback to localStorage if API fails
    try {
      const currentSearches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      
      // Check for duplicates
      const exists = currentSearches.some(search => {
        if (search.type === item.type) {
          if (search.type === 'query') return search.query === item.query;
          if (search.type === 'user') return search.username === item.username;
          if (search.type === 'tag') return search.tag === item.tag;
        }
        return false;
      });

      if (!exists) {
        const updatedSearches = [item, ...currentSearches].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));
        setRecentSearches(updatedSearches);
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const removeRecentSearch = async (item) => {
    try {
      // Try to remove from API first
      let searchId;
      if (item.type === "query") searchId = item.query;
      else if (item.type === "user") searchId = item.username;
      else if (item.type === "tag") searchId = item.tag;

      const response = await fetch(`${API_ENDPOINTS.SEARCH}/recent-searches/${searchId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadRecentSearches(); // Reload from API
        return;
      }
    } catch (error) {
      console.error("Error removing from API:", error);
    }

    // Fallback to localStorage if API fails
    try {
      const currentSearches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updatedSearches = currentSearches.filter(search => {
        if (search.type !== item.type) return true;
        if (search.type === 'query') return search.query !== item.query;
        if (search.type === 'user') return search.username !== item.username;
        if (search.type === 'tag') return search.tag !== item.tag;
        return true;
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  };

  const clearAllRecentSearches = async () => {
    try {
      // Try to clear from API first
      const response = await fetch(`${API_ENDPOINTS.SEARCH}/recent-searches`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecentSearches([]);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
    } catch (error) {
      console.error("Error clearing from API:", error);
    }

    // Fallback to clearing localStorage if API fails
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  // Handlers for tapping on items
  const handleSuggestionPress = (item) => {
    if (item.type === "user") {
      saveRecentSearch(item);
      console.log("item in handleSuggestionPress", item);

      if (item.username === user.username) {
        router.push(`/profile`);
      } else {
        router.push(`/UserProfile/${item.username}`);
      }
    } else if (item.type === "tag") {
      saveRecentSearch(item);
      setSearchQuery(`#${item.tag}`);
      setSearchMode("results");
      fetchSearchResults(item.tag);
      router.push(`/search/searchpage?tag=${item.tag}`);
    }
  };

  const handleResultPress = (item, type) => {
    if (type === "user") {
      saveRecentSearch(item);
      console.log("item in handleResultPress", item.username);
      router.push(`/UserProfile/${item.username}`);
    } else if (type === "post") {
      router.push(`/post/${item._id}`);
    } else if (type === "tag") {
      saveRecentSearch(item);
      setSearchQuery(`#${item.tag}`);
      fetchSearchResults(item.tag);
    }
  };

  const handleTrendingTagPress = (tag) => {
    const tagItem = { type: "tag", tag: tag.tag, count: tag.count };
    saveRecentSearch(tagItem);
    setSearchQuery(`#${tag.tag}`);
    setSearchMode("results");
    fetchSearchResults(tag.tag);
  };

  const handleRecentSearchPress = (item) => {
    if (item.type === "user") {
      router.push(`/UserProfile/${item.username}`);
    } else if (item.type === "tag") {
      setSearchQuery(`#${item.tag}`);
      setSearchMode("results");
      fetchSearchResults(item.tag);
    } else if (item.type === "query") {
      setSearchQuery(item.query);
      setSearchMode("results");
      fetchSearchResults(item.query);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (searchMode === "results" && searchQuery) {
      fetchSearchResults(searchQuery, activeTab);
    } else {
      fetchTrendingTags();
      fetchTrendingSearches();
      setIsRefreshing(false);
    }
  };

  return (
     <div className="min-h-screen bg-gray-50 w-full md:min-w-[410px] lg:w-[610px] max-w-2xl px-4 flex-1 overflow-y-auto h-screen custom-scrollbar">
    <div className="md:w-xl w-90 mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center">
            <form onSubmit={handleSearch} className="flex-1">
              <div
                className={`flex items-center bg-white rounded-full transition-colors shadow-sm ${
                  isSearchFocused ? "ring-2 ring-primary" : ""
                }`}
              >
                <Search size={20} className="text-gray-500 ml-3 w-5 h-5" />{" "}
                {/* Add flex here */}
                <input
                  className="flex-1 py-3 px-2 text-gray-800 bg-transparent outline-none placeholder-gray-500"
                  placeholder="Search people, post using tags..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  autoComplete="off"
                  style={{ fontFamily: fonts.Regular }}
                />
                {searchQuery.length > 0 && (
                  <button
                    className="pr-3 pl-1 hover:bg-gray-100 rounded-3xl p-1"
                    onClick={() => setSearchQuery("")}
                    type="button"
                  >
                    <XCircle size={18} className="text-gray-400" />
                  </button>
                )}
              </div>
            </form>
            {isSearchFocused && (
              <button
                className="ml-3 py-2 px-3 text-gray-500  font-medium cursor-pointer"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Search Type Tabs */}
          {searchMode === "results" && (
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {["users", "posts"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                    activeTab === tab
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700  hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    setActiveTab(tab);
                    fetchSearchResults(searchQuery, tab);
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content based on search mode */}
        <div className="flex-1 overflow-auto">
          {searchMode === "initial" ? (
            // Initial state
            <div className="p-4 space-y-6 mx-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      Recent Searches
                    </h2>
                    <button
                      onClick={clearAllRecentSearches}
                      className="text-primary hover:text-sky-600 font-medium cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                    {recentSearches.map((item, index) => (
                      <RecentSearchItem
                        key={index}
                        item={item}
                        onPress={handleRecentSearchPress}
                        onRemove={removeRecentSearch}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900">
                    Trending Now
                  </h2>
                </div>

                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                  {trendingSearches.map((item, index) => (
                    <SuggestionItem
                      key={index}
                      item={item}
                      onPress={handleSuggestionPress}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : searchMode === "suggestions" ? (
            // Suggestions state
            <div className=" mt-2">
              {(suggestions?.users?.length || 0) > 0 ||
              (suggestions?.tags?.length || 0) > 0 ? (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm px-4 py-2 font-medium">
                    Suggestions
                  </p>
                  {[...suggestions.users, ...suggestions.tags].map(
                    (item, index) => (
                      <SuggestionItem
                        key={
                          item.type === "user"
                            ? `user-${item.username}`
                            : `tag-${item.tag}`
                        }
                        item={item}
                        onPress={handleSuggestionPress}
                      />
                    )
                  )}
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <Search size={48} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 text-center">
                    No results found for "{searchQuery}"
                  </h3>
                  <p className="mt-2 text-gray-600 text-center">
                    Try searching for a different term or check your spelling.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Results state
            <div className="p-4">
              {isLoading && !isRefreshing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeTab === "all"
                    ? [
                        ...searchResults.users,
                        ...searchResults.posts,
                        ...searchResults.tags,
                      ]
                    : activeTab === "users"
                    ? searchResults.users
                    : activeTab === "posts"
                    ? searchResults.posts
                    : searchResults.tags
                  ).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Search size={48} className="text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 text-center">
                        No results found
                      </h3>
                      <p className="mt-2 text-gray-500 dark:text-gray-400 text-center">
                        Try adjusting your search or filter to find what you're
                        looking for.
                      </p>
                    </div>
                  ) : (
                    (activeTab === "all"
                      ? [
                          ...searchResults.users,
                          ...searchResults.posts,
                          ...searchResults.tags,
                        ]
                      : activeTab === "users"
                      ? searchResults.users
                      : activeTab === "posts"
                      ? searchResults.posts
                      : searchResults.tags
                    ).map((item, index) => {
                      if (item.content) {
                        return (
                          <PostSearchResult
                            key={`post-${item._id || index}`}
                            post={item}
                            onPress={() => handleResultPress(item, "post")}
                          />
                        );
                      } else if (item.username) {
                        return (
                          <UserSearchResult
                            key={`user-${item.username || index}`}
                            user={item}
                            onPress={() => handleResultPress(item, "user")}
                          />
                        );
                      } else if (item.tag) {
                        return (
                          <div
                            key={`tag-${item.tag || index}`}
                            className="rounded-xl p-4 flex items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleResultPress(item, "tag")}
                          >
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Hash size={22} className="text-gray-500" />
                            </div>

                            <div className="ml-3 flex-1">
                              <span className="text-gray-900 dark:text-white font-semibold">
                                #{item.tag}
                              </span>
                              <p className="text-gray-500 dark:text-gray-400">
                                {item.count.toLocaleString()} posts
                              </p>
                            </div>

                            <ChevronRight size={20} className="text-gray-400" />
                          </div>
                        );
                      }
                      return null;
                    })
                  )}

                  {isLoading && !isRefreshing && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
