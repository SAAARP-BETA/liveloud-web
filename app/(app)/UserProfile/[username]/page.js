"use client";
import defaultCover from '../../../assets/Profilepic1.png';
import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    use
} from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
// import { fonts } from "../../utils/fonts";
import CustomModal from "../../../../Components/ui/Modal";
import AmplifyModal from "../../../../Components/ui/AmplifyModal";
import CommentModal from "../../../../Components/ui/CommentModal";
import ReportModal from "../../../../Components/ui/ReportModal"; // ADDED: Import ReportModal
import toast from 'react-hot-toast';

import {
    createPostHandlers,
    formatPostFromApi,
} from "../../../utils/postFunctions";
import PostCard from "../../../../Components/ui/PostCard";
import { API_ENDPOINTS } from "../../../utils/config";
import { getProfilePicture } from "@/app/utils/fallbackImage";
import { usePostInteractions } from '../../../utils/postinteractions';

import {
    ArrowLeft,
    MoreHorizontal,
    Image as ImageIcon,
    Share2,
    MessageCircle,
    Bookmark,
    Flag,
    Flame,
    MapPin,
    Link as LinkIcon,
    Calendar,
    Grid,
    Trophy,
    Star,
    Heart,
    Edit2,
    UserPlus,
    UserMinus, // ADDED: For unfollow option
    Info, // ADDED: For about account option
    Ban,
    Trash2, // ADDED: For delete post option
    CheckCircle as Verified,
    Loader2, // ADDED: For loading states
} from "lucide-react";

// Window dimensions
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;
const PROFILE_IMAGE_MAX_SIZE = 120;
const PROFILE_IMAGE_MIN_SIZE = 40;
const SCROLL_SENSITIVITY = 0.5;

// ADDED: Menu options for post interactions (same as in PostPage)
const menuOptions = [
    { icon: UserPlus, text: 'Follow' },
    { icon: UserMinus, text: 'Unfollow' },
    { icon: Info, text: 'About this account' },
    { icon: Flag, text: 'Report' },
    { icon: Ban, text: 'Block' },
    { icon: Trash2, text: 'Delete Post' },
];

// Points Display Component (unchanged)
const PointsDisplay = ({ points, loading }) => {
    const router = useRouter();

    if (loading || !points) {
        return (
            <div className="mt-4 p-4 bg-gray-100 rounded-xl">
                <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            </div>
        );
    }

    const levelInfo = [
        { level: 1, title: "Newcomer", minPoints: 0, pointsToNext: 100 },
        { level: 2, title: "Active Member", minPoints: 100, pointsToNext: 400 },
        { level: 3, title: "Contributor", minPoints: 500, pointsToNext: 500 },
        { level: 4, title: "Influencer", minPoints: 1000, pointsToNext: 1500 },
        { level: 5, title: "Star", minPoints: 2500, pointsToNext: 2500 },
        { level: 6, title: "Superstar", minPoints: 5000, pointsToNext: 5000 },
        { level: 7, title: "Icon", minPoints: 10000, pointsToNext: 15000 },
        { level: 8, title: "Legend", minPoints: 25000, pointsToNext: 25000 },
        { level: 9, title: "Master", minPoints: 50000, pointsToNext: 50000 },
        {
            level: 10,
            title: "Grandmaster",
            minPoints: 100000,
            pointsToNext: Infinity,
        },
    ];

    const currentLevel =
        levelInfo.find(
            (level) =>
                points.totalPoints >= level.minPoints &&
                points.totalPoints < level.minPoints + level.pointsToNext
        ) || levelInfo[0];

    const progressPercentage = Math.min(
        ((points.totalPoints - currentLevel.minPoints) /
            currentLevel.pointsToNext) *
        100,
        100
    );

    const handleLeaderboardPress = () => {
        try {
            router.push("/leaderboard");
        } catch (error) {
            toast.error("Unable to navigate to leaderboard. Please try again.");
        }
    };

    return (
    <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Trophy size={20} className="text-white" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {points.totalPoints.toLocaleString() || 0}
                        </h3>
                        <p className="text-xs text-gray-600">Total Points</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">
                            Level {currentLevel.level}
                        </span>
                        <div className="ml-2 px-2 py-1 bg-primary rounded-full">
                            <span className="text-xs text-white font-medium">
                                {currentLevel.title}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mb-3">
                <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">
                        Progress to Level {currentLevel.level + 1}:
                    </span>
                    <span className="text-xs text-gray-600">
                        {Math.max(
                            0,
                            currentLevel.pointsToNext -
                            (points.totalPoints - currentLevel.minPoints)
                        )}{" "}
                        pts to go
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-sky-400 to-primary rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
            <div className="flex justify-between">
                <div className="flex-1 text-center">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Edit2 size={16} className="text-primary" />
                    </div>
                    <p className="text-base font-bold text-gray-900">
                        {points.creatorPoints || 0}
                    </p>
                    <p className="text-xs text-gray-600">Creator</p>
                </div>
                <div className="flex-1 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Heart size={20} className="text-green-600" />
                    </div>
                    <p className="text-base font-bold text-gray-900">
                        {points.fanPoints || 0}
                    </p>
                    <p className="text-xs text-gray-600">Fan</p>
                </div>
                <div className="flex-1 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Star size={20} className="text-yellow-600" />
                    </div>
                    <p className="text-base font-bold text-gray-900">
                        {points.bonusPoints || 0}
                    </p>
                    <p className="text-xs text-gray-600">Bonus</p>
                </div>
            </div>
            <button
                className="mt-3 w-full py-2 bg-primary hover:bg-sky-600 rounded-lg text-white text-sm font-medium transition-colors"
                onClick={handleLeaderboardPress}
            >
                Leaderboard
            </button>
        </div>
    );
};

// Streak Display Component (unchanged)
const StreakDisplay = ({ consecutiveDays }) => {
    if (!consecutiveDays || consecutiveDays === 0) return null;

    return (
        <div className="mt-3 flex items-center justify-center">
            <div className="flex items-center px-3 py-2 bg-orange-50 rounded-full border border-orange-200">
                <Flame size={16} className="text-orange-600" />
                <span className="ml-2 text-orange-600 font-semibold">
                    {consecutiveDays} Day Streak
                </span>
            </div>
        </div>
    );
};

// Tab Bar Component (unchanged)
const TabBarAnimated = ({ tabs, activeTab, onTabPress }) => {
    return (
        <div className="flex  w-full  border justify-center gap-25 border-gray-100 pt-2">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`flex-1 flex items-center justify-center pb-2 ${activeTab === tab.key ? "border-b-2 border-primary" : ""
                        }`}
                    onClick={() => onTabPress(tab.key)}
                >
                    <div className="flex items-center cursor-pointer">
                        {tab.key === "posts" && (
                            <Grid
                                size={18}
                                className={
                                    activeTab === tab.key ? "text-primary" : "text-gray-500"
                                }
                            />
                        )}
                        {tab.key === "media" && (
                            <ImageIcon
                                size={18}
                                className={
                                    activeTab === tab.key ? "text-primary" : "text-gray-500"
                                }
                            />
                        )}
                        <span
                            className={`ml-1 text-sm font-medium ${activeTab === tab.key ? "text-primary" : "text-gray-500"
                                }`}
                        >
                            {tab.title}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
};

// User Stats Component (unchanged)
const UserStats = ({
    followersCount,
    followingCount,
    postsCount,
    onPressFollowers,
    onPressFollowing,
}) => {
    return (
        <div className="flex justify-center mt-4 space-x-6">
            <button className="text-center" onClick={onPressFollowers}>
                <div className="text-lg font-bold text-gray-800">{followersCount}</div>
                <div className="text-sm text-gray-500">Followers</div>
            </button>
            <button className="text-center" onClick={onPressFollowing}>
                <div className="text-lg font-bold text-gray-800">{followingCount}</div>
                <div className="text-sm text-gray-500">Following</div>
            </button>
            <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{postsCount}</div>
                <div className="text-sm text-gray-500">Posts</div>
            </div>
        </div>
    );
};

// Gallery Grid Component (unchanged)
const GalleryGrid = ({ media, onMediaPress, emptyStateMessage }) => {
    if (!media || media.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <ImageIcon size={48} className="text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-700">No media yet</h3>
                <p className="mt-2 text-center text-sm text-gray-500 mx-8">
                    {emptyStateMessage}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-1">
            {media.map((item) => (
                <button
                    key={item.id}
                    className="aspect-square p-1"
                    onClick={() => onMediaPress(item)}
                >
                    <img
                        src={item.uri}
                        alt="Media"
                        className="w-full h-full object-cover rounded-md"
                    />
                </button>
            ))}
        </div>
    );
};

// Profile Skeleton Component (unchanged)
const ProfileSkeleton = () => {
    return (
        <div className="flex w-xl justify-center bg-gray-50">
            <div className="w-full">
                <div className="top-0 left-0 right-0 max-w-2xl mx-auto h-40 bg-gray-200 animate-pulse" />
                <div className="pt-40">
                    <div className="flex justify-center -mt-12">
                        <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white animate-pulse" />
                    </div>
                    <div className="p-4 flex flex-col items-center">
                        <div className="w-32 h-6 bg-gray-200 rounded-md mt-4 animate-pulse" />
                        <div className="w-24 h-4 bg-gray-200 rounded-md mt-2 animate-pulse" />
                        <div className="w-48 h-4 bg-gray-200 rounded-md mt-4 animate-pulse" />
                        <div className="flex justify-center mt-4 space-x-6">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-6 bg-gray-200 rounded-md animate-pulse" />
                                <div className="w-14 h-4 bg-gray-200 rounded-md mt-1 animate-pulse" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-6 bg-gray-200 rounded-md animate-pulse" />
                                <div className="w-14 h-4 bg-gray-200 rounded-md mt-1 animate-pulse" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-6 bg-gray-200 rounded-md animate-pulse" />
                                <div className="w-14 h-4 bg-gray-200 rounded-md mt-1 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex mt-6 w-full max-w-md">
                            <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse" />
                            <div className="w-10 h-10 bg-gray-200 rounded-full ml-2 animate-pulse" />
                        </div>
                        <div className="mt-4 w-full h-32 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="mt-3 w-32 h-8 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfilePage = ({ params, initialUser, initialPosts, initialPoints }) => {
    const router = useRouter();
    const resolvedParams = use(params);
    const usernameParam = resolvedParams?.username;
    const { user: currentUser, token, isAuthenticated } = useAuth();

    // State for resizable header
    const [headerHeight, setHeaderHeight] = useState(HEADER_MAX_HEIGHT);
    const [isResizing, setIsResizing] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const headerRef = useRef(null);
    const resizeRef = useRef(null);

    // State
    const [user, setUser] = useState(initialUser || null);
    const [posts, setPosts] = useState(initialPosts || []);
    const [isLoading, setIsLoading] = useState(!initialUser);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(
        initialUser?.followersCount || 0
    );
    const [followingCount, setFollowingCount] = useState(
        initialUser?.followingCount || 0
    );
    const [postsCount, setPostsCount] = useState(initialPosts?.length || 0);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);
    const [profileStats, setProfileStats] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [userPoints, setUserPoints] = useState(initialPoints || null);
    const [pointsLoading, setPointsLoading] = useState(false);
    const [pointsLoaded, setPointsLoaded] = useState(!!initialPoints);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isAmplifyModalVisible, setAmplifyModalVisible] = useState(false);
    const [postToAmplify, setPostToAmplify] = useState(null);
    const [isCommentModalVisible, setCommentModalVisible] = useState(false);
    const [postToComment, setPostToComment] = useState(null);
    const [isReportModalVisible, setReportModalVisible] = useState(false); // ADDED: Report modal state
    const [postToReport, setPostToReport] = useState(null); // ADDED: Post to report state
    const [errorMessage, setErrorMessage] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);
    const [error, setError] = useState();
    const [followLoading, setFollowLoading] = useState(false);

    // ADDED: New states for post menu interactions
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    // Loading guards
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPointsLoading, setIsPointsLoading] = useState(false);
    const [isPostsLoading, setIsPostsLoading] = useState(false);

    const abortControllerRef = useRef(null);

    // MODIFIED: Helper function to update posts array (compatible with post interactions)
    const updatePostData = useCallback((updaterOrNewPosts) => {
        if (typeof updaterOrNewPosts === 'function') {
            setPosts(prevPosts => {
                const updatedPosts = updaterOrNewPosts(prevPosts);
                return Array.isArray(updatedPosts) ? updatedPosts : prevPosts;
            });
        } else if (Array.isArray(updaterOrNewPosts)) {
            setPosts(updaterOrNewPosts);
        }
    }, []);

    // MODIFIED: Post handlers with proper updatePostData function
    const postHandlers = useMemo(() => createPostHandlers(
        currentUser, // CHANGED: Use currentUser instead of user for consistency
        token,
        updatePostData,
        setPostToComment,
        setCommentModalVisible,
        setPostToAmplify,
        setAmplifyModalVisible,
        setPostToReport,
        setReportModalVisible
    ), [currentUser, token, updatePostData]);
    
    // ADDED: Use the post interactions hook
    const { handleMenuOptionPress, loadPostMenuOptions } = usePostInteractions(
        currentUser, // CHANGED: Use currentUser for consistency
        token,
        isAuthenticated,
        postHandlers,
        router,
        updatePostData
    );

    // Scroll handler with debouncing
    const handleScroll = useCallback(
        (e) => {
            const currentScrollY = e.target.scrollTop;
            setScrollY(currentScrollY);

            const deltaY = currentScrollY - lastScrollY;
            if (deltaY !== 0) {
                setHeaderHeight((prevHeight) => {
                    let newHeight = prevHeight - deltaY * SCROLL_SENSITIVITY;
                    newHeight = Math.max(
                        HEADER_MIN_HEIGHT,
                        Math.min(HEADER_MAX_HEIGHT, newHeight)
                    );
                    return newHeight;
                });
            }
            setLastScrollY(currentScrollY);
        },
        [lastScrollY]
    );

    // Header resize handlers
    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (e) => {
            if (isResizing && headerRef.current) {
                const newHeight =
                    e.clientY - headerRef.current.getBoundingClientRect().top;
                setHeaderHeight(
                    Math.max(HEADER_MIN_HEIGHT, Math.min(HEADER_MAX_HEIGHT, newHeight))
                );
            }
        },
        [isResizing]
    );

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    // Profile image size calculation
    const profileImageSize = useMemo(
        () =>
            Math.max(PROFILE_IMAGE_MIN_SIZE, PROFILE_IMAGE_MAX_SIZE - scrollY * 0.6),
        [scrollY]
    );

    // Determine if viewing own profile
    useEffect(() => {
        if (currentUser && usernameParam) {
            setIsMyProfile(currentUser.username === usernameParam);
        } else {
            setIsMyProfile(false);
        }
    }, [currentUser?.username, usernameParam]);

    // Fetch user posts with rate limit handling
    const fetchUserPosts = useCallback(
        async (userId, page = 1, limit = 10) => {
            // console.log(
            //     "fetchUserPosts called for userId:",
            //     userId,
            //     "at",
            //     new Date().toISOString()
            // );
            if (!userId || isPostsLoading || hasFetched) {
                // console.log(
                //     "Skipping fetchUserPosts: No userId, loading, or already fetched"
                // );
                return;
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                console.log(
                    "Aborted previous fetch request at",
                    new Date().toISOString()
                );
            }

            abortControllerRef.current = new AbortController();

            setIsPostsLoading(true);
            setError(null);

            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await fetch(
                    `${API_ENDPOINTS.SOCIAL}/posts/user/${userId}?page=${page}&limit=${limit}`,
                    {
                        headers,
                        signal: abortControllerRef.current.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch user posts: ${response.status} ${response.statusText}`
                    );
                }

                const postsData = await response.json();
                const postsArray = postsData.posts || postsData.data || postsData || [];

                const formattedPosts = postsArray
                    .map((post, index) => formatPostFromApi(post, index))
                    .filter(Boolean);

                setPosts((prevPosts) => {
                    if (JSON.stringify(prevPosts) === JSON.stringify(formattedPosts)) {
                        return prevPosts;
                    }
                    return formattedPosts;
                });
                setPostsCount(
                    postsData.totalCount || postsData.total || formattedPosts.length
                );

                console.log(
                    `Fetched ${formattedPosts.length} posts for user ${userId} at`,
                    new Date().toISOString()
                );
                setHasFetched(true);
            } catch (error) {
                if (error.name !== "AbortError") {
                    if (response?.status === 429 && response.headers.get("Retry-After")) {
                        const retryAfter = parseInt(
                            response.headers.get("Retry-After"),
                            10
                        );
                        console.log(
                            `Rate limit hit. Retrying after ${retryAfter} seconds at`,
                            new Date().toISOString()
                        );
                        setTimeout(
                            () => fetchUserPosts(userId, page, limit),
                            (retryAfter + 1) * 1000
                        );
                    } else {
                        console.error(
                            "Error fetching user posts:",
                            error,
                            "at",
                            new Date().toISOString()
                        );
                        setError("Failed to load posts. Please try again later.");
                    }
                }
            } finally {
                setIsPostsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [token, isPostsLoading, hasFetched] // ADDED: Missing dependencies
    );

    // Fetch user points
    const fetchUserPoints = useCallback(
        async (userId) => {
            if (!userId || isPointsLoading || pointsLoaded) return;

            setIsPointsLoading(true);
            setPointsLoading(true);

            try {
                setErrorMessage("");
                if (!token || !isAuthenticated) {
                    setErrorMessage("Authentication required to fetch points.");
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };
                const endpoint = isMyProfile
                    ? `${API_ENDPOINTS.POINTS}/my-summary`
                    : `${API_ENDPOINTS.POINTS}/summary/${userId}`;

                const response = await fetch(endpoint, { headers });

                if (!response.ok) {
                    console.error(`Failed to fetch points: ${response.status}`);
                    setErrorMessage(`Failed to fetch points: ${response.status}`);
                    return;
                }

                const pointsData = await response.json();
                const levelInfo = {
                    level: pointsData.level,
                    title: pointsData.rank,
                    minPoints: null,
                    pointsToNext: isMyProfile ? pointsData.pointsToNextLevel : null,
                };

                setUserPoints({ ...pointsData, levelInfo });
            } catch (error) {
                setErrorMessage(`Failed to load points data: ${error.message}`);
                console.error("Error fetching points:", error);
            } finally {
                setPointsLoading(false);
                setPointsLoaded(true);
                setIsPointsLoading(false);
            }
        },
        [token, isAuthenticated, isMyProfile, isPointsLoading, pointsLoaded] // ADDED: Missing dependencies
    );

    // Fetch user profile
    const fetchUserProfile = useCallback(async () => {
        if (isProfileLoading) return;

        setIsProfileLoading(true);
        setError(null); // Clear previous errors

        try {
            if (isMyProfile && currentUser && currentUser._id) {
                const userData = {
                    ...currentUser,
                    name: currentUser.fullname || currentUser.username || "User",
                    profilePicture: currentUser.profilePicture || defaultCover,
                    coverPhoto: currentUser.coverPicture || defaultCover,
                    bio: currentUser.bio || "",
                    location: currentUser.location || "Not specified",
                    website: currentUser.website || "Not specified",
                    isVerified: currentUser.isVerified || false,
                    createdAt: currentUser.createdAt || new Date().toISOString(),
                    followersCount: currentUser.followersCount || 0,
                    followingCount: currentUser.followingCount || 0,
                };
                setUser(userData);
                setFollowersCount(userData.followersCount || 0);
                setFollowingCount(userData.followingCount || 0);
                setIsFollowing(userData.isFollowing || false);

                const joined = new Date(userData.createdAt);
                const joinedDate = `${joined.toLocaleString("default", {
                    month: "long",
                })} ${joined.getFullYear()}`;
                setProfileStats({
                    joined: joinedDate,
                    location: userData.location,
                    website: userData.website,
                    engagement: userData.engagement || "89%",
                    responseRate: userData.responseRate || "94%",
                });

                await fetchUserPoints(userData._id);
                await fetchUserPosts(userData._id);
                setIsLoading(false);
                setIsRefreshing(false);
                return;
            }

            const targetUsername = usernameParam || "";
            if (!targetUsername) {
                setErrorMessage("No username provided. Please try again.");
                setUser(null);
                setIsLoading(false);
                setIsRefreshing(false);
                return;
            }

            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await fetch(
                `${API_ENDPOINTS.USER}/profiles/${targetUsername}`,
                { headers }
            );

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 404) {
                    setErrorMessage("User not found. The username may be incorrect or the user may have deactivated their account.");
                    setUser(null);
                    setIsLoading(false);
                    setIsRefreshing(false);
                    return;
                } else if (response.status === 403) {
                    setErrorMessage("You don't have permission to view this profile.");
                    setUser(null);
                    setIsLoading(false);
                    setIsRefreshing(false);
                    return;
                } else {
                    throw new Error(`Failed to fetch profile: ${response.status}`);
                }
            }

            const userData = await response.json();

            if (!userData || !userData._id) {
                setErrorMessage("Invalid user data received. Please try again.");
                setUser(null);
                setIsLoading(false);
                setIsRefreshing(false);
                return;
            }

            setUser(userData);
            setFollowersCount(userData.followersCount || 0);
            setFollowingCount(userData.followingCount || 0);
            setIsFollowing(userData.isFollowing || false);

            const joined = new Date(userData.createdAt);
            const joinedDate = `${joined.toLocaleString("default", {
                month: "long",
            })} ${joined.getFullYear()}`;
            setProfileStats({
                joined: joinedDate,
                location: userData.location,
                website: userData.website,
                engagement: userData.engagement || "89%",
                responseRate: userData.responseRate || "94%",
            });

            await fetchUserPoints(userData._id);
            await fetchUserPosts(userData._id);

        } catch (error) {
            console.error("Error fetching user profile:", error);
            setErrorMessage(`Failed to load profile: ${error.message}`);
            setUser(null);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsProfileLoading(false);
        }
    }, [
        usernameParam,
        currentUser?._id,
        currentUser?.username,
        token,
        isAuthenticated,
        isMyProfile,
        isProfileLoading,
        fetchUserPoints,
        fetchUserPosts
    ]);

   const handleFollowToggle = async () => {
    if (!isAuthenticated) {
        toast.error("Please login to follow users");
        return;
    }

    if (followLoading) return; // Prevent multiple clicks

    const wasFollowing = isFollowing;
    setFollowLoading(true);

    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowersCount((prev) => (wasFollowing ? prev - 1 : prev + 1));

    try {
        const endpoint = wasFollowing ? "unfollow" : "follow";
        const response = await fetch(
            `${API_ENDPOINTS.SOCIAL}/followers/${user._id}/${endpoint}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to ${endpoint} user`);
        }

        const result = await response.json();
        toast.success(wasFollowing ? "User unfollowed successfully" : "User followed successfully");
        
        // Update counts from server response if available
        if (result.followersCount !== undefined) {
            setFollowersCount(result.followersCount);
        }
        
    } catch (error) {
        // Revert optimistic update on error
        setIsFollowing(wasFollowing);
        setFollowersCount((prev) => (wasFollowing ? prev + 1 : prev - 1));
        
        console.error("Error updating follow status:", error);
        toast.error(`Failed to ${wasFollowing ? 'unfollow' : 'follow'} user: ${error.message}`);
    } finally {
        setFollowLoading(false);
    }
};

    const handleShareProfile = async () => {
        try {
            toast.error(
                `Coming soon! Sharing profile for ${user?.username || "this user"}.`
            );
        } catch (error) {
            // Handle silently
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setPointsLoaded(false);
        setUserPoints(null);
        setHasFetched(false); // Reset fetch state on refresh
        fetchUserProfile();
    };

    // ADDED: Load menu options when modal is visible (same as PostPage)
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
                const isOwnPost = isAuthenticated && currentUser && (selectedPost.user === currentUser._id || selectedPost.userId === currentUser._id);
                const fallbackOptions = menuOptions.filter(option => {
                    if (option.text === 'Delete Post') return isOwnPost;
                    if (option.text === 'Follow' || option.text === 'Unfollow' || option.text === 'Block') return !isOwnPost;
                    return true;
                });
                setFilteredOptions(fallbackOptions);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        loadOptions();
    }, [isModalVisible, selectedPost?.id, isAuthenticated, currentUser?._id, loadPostMenuOptions]);

    // ADDED: Handle menu option press with proper parameters (same as PostPage)
    const handleMenuPress = useCallback((option) => {
        if (!selectedPost) {
            toast.error('No post selected');
            return;
        }
        
        handleMenuOptionPress(option, selectedPost, setModalVisible);
    }, [selectedPost, handleMenuOptionPress]);

    // ADDED: Handle comment success callback
    const handleCommentSuccess = useCallback(() => {
        setCommentModalVisible(false);
        toast.success('Comment posted successfully!');
        // Refresh posts to show new comment
        if (user?._id) {
            setHasFetched(false);
            fetchUserPosts(user._id);
        }
    }, [user?._id, fetchUserPosts]);

    // ADDED: More options for profile menu
    const moreOptions = useMemo(() => [
        {
            icon: Flag,
            label: 'Report User',
            onPress: () => {
                setIsMoreModalVisible(false);
                toast.error('Coming soon! Report functionality.');
            },
            danger: true,
            loading: false
        },
        {
            icon: Ban,
            label: 'Block User',
            onPress: () => {
                setIsMoreModalVisible(false);
                toast.error('Coming soon! Block functionality.');
            },
            danger: true,
            loading: false
        },
        {
            icon: Share2,
            label: 'Share Profile',
            onPress: () => {
                setIsMoreModalVisible(false);
                handleShareProfile();
            },
            danger: false,
            loading: false
        }
    ], []);

    useEffect(() => {
        if (!initialUser || isRefreshing) {
            fetchUserProfile();
        }
    }, [initialUser, isRefreshing, fetchUserProfile]); // ADDED: Missing dependency

    useEffect(() => {
        if (
            user &&
            !isMyProfile &&
            !userPoints &&
            !pointsLoading &&
            isAuthenticated &&
            !pointsLoaded
        ) {
            fetchUserPoints(user._id);
        }
    }, [
        user?._id,
        isMyProfile,
        userPoints,
        pointsLoading,
        isAuthenticated,
        pointsLoaded,
        fetchUserPoints,
    ]);

    useEffect(() => {
        if (!initialPosts && user?._id && !isPostsLoading && !hasFetched) {
            fetchUserPosts(user._id);
        }
    }, [user?._id, initialPosts, isPostsLoading, hasFetched, fetchUserPosts]);

    if (isLoading && !user) {
        return <ProfileSkeleton />;
    }

    if (!user && !isLoading) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
                <div className="w-xl max-sm:w-100 px-6">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-400 text-3xl">😔</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Profile Not Found
                        </h2>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                            {errorMessage || "Sorry, we couldn't find this user. They may have deactivated their account or the username might be incorrect."}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.back()}
                                className="w-full px-4 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-sky-600 transition-colors"
                            >
                                Go Back
                            </button>
                            <Link
                                href="/home"
                                className="block w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                                Go to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-xl flex flex-col items-center relative overflow-hidden">
                {/* Scrollable Content */}
                <div
                    className="w-full flex flex-col items-center bg-gray-50 overflow-y-auto"
                    style={{ width: "100%" }}
                    onScroll={handleScroll}
                >
                    {/* Cover Image */}
                    <div className="w-full relative">
                        <Image
                            src={user?.coverPhoto || defaultCover}
                            alt="Cover"
                            className="w-full h-[150px] object-cover"
                            width={1200}
                            height={150}
                            priority
                        />

                        {/* Profile Image */}
                        <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 z-20">
                            <motion.div
                                className="border-4 border-white shadow-sm bg-white relative"
                                animate={{
                                    height: profileImageSize,
                                    width: profileImageSize,
                                    borderRadius: profileImageSize / 2,
                                }}
                                transition={{ type: "spring", stiffness: 100 }}
                            >
                                <Image                                    src={user.profilePicture || defaultCover}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover"
                                    width={PROFILE_IMAGE_MAX_SIZE}
                                    height={PROFILE_IMAGE_MAX_SIZE}
                                    priority
                                />
                                {isMyProfile && (
                                    <Link
                                        href="/profile/edit"
                                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-white/80 flex items-center justify-center"
                                    >
                                        <Edit2 className="text-primary text-sm" />
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Spacer to push content below profile image */}
                    <div className="h-12"></div>

                    {/* Profile Info */}
                    <motion.div
                        className="bg-white border-b border-gray-100 w-full"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Profile Info */}
                        <div className="mt-4 text-center px-4">
                            <div className="flex items-center justify-center">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.name || user.username || "User"}
                                </h2>
                                {user.isVerified && (
                                    <Verified className="ml-2 text-primary text-xl" />
                                )}
                                {userPoints && (
                                    <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-xs text-white font-bold">
                                        LV.{userPoints.levelInfo.level}
                                    </span>
                                )}
                            </div>
                            <p className="text-base text-gray-500 mt-1">
                                @{user.username || "username"}
                            </p>
                            {user.bio && (
                                <p className="text-gray-700 text-center mt-3 leading-5">
                                    {user.bio}
                                </p>
                            )}
                            <UserStats
                                followersCount={followersCount}
                                followingCount={followingCount}
                                postsCount={postsCount}
                                onPressFollowers={() =>
                                    router.push(`/profile/${user.username}/followers`)
                                }
                                onPressFollowing={() =>
                                    router.push(`/profile/${user.username}/following`)
                                }
                            />
                            <div className="flex mt-4 w-full max-w-md mx-auto space-x-3">
                                {isMyProfile ? (
                                    <>
                                        <Link
                                            href="/profile/edit"
                                            className="flex-1 py-2.5 bg-gray-100 rounded-full text-center text-gray-900 font-medium"
                                        >
                                            Edit Profile
                                        </Link>
                                        <button
                                            onClick={handleShareProfile}
                                            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                                        >
                                            <Share2 className="text-gray-600 text-lg" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleFollowToggle}
                                            disabled={followLoading}
                                            className={`flex-1 py-2.5 rounded-full text-center font-medium transition-colors disabled:opacity-50 ${
                                                isFollowing
                                                    ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                                    : "bg-primary text-white hover:bg-sky-600"
                                            }`}
                                        >
                                            {followLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                                    <span className="ml-2">
                                                        {isFollowing ? "Unfollowing..." : "Following..."}
                                                    </span>
                                                </div>
                                            ) : (
                                                isFollowing ? "Following" : "Follow"
                                            )}
                                        </button>
                                        {user._id && (
                                            <Link
                                                href={`/messages/chat/${user._id}`}
                                                className="flex-1 py-2.5 bg-gray-100 rounded-full text-center text-gray-900 font-medium"
                                            >
                                                Message
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => setIsMoreModalVisible(true)}
                                            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                                        >
                                            <MoreHorizontal className="text-gray-600 text-lg" />
                                        </button>
                                    </>
                                )}
                            </div>
                            {isAuthenticated && userPoints && (
                                <>
                                    <PointsDisplay
                                        points={userPoints}
                                        loading={pointsLoading}

                                    />
                                    <StreakDisplay
                                        consecutiveDays={userPoints.consecutiveLoginDays}
                                    />
                                </>
                            )}
                            {profileStats && (
                                <div className="mt-5 pt-4 border-t border-gray-100">
                                    {user.location && (
                                        <div className="flex items-center mb-2">
                                            <MapPin className="text-gray-600 text-base" />
                                            <span className="ml-2 text-gray-500">
                                                {user.location}
                                            </span>
                                        </div>
                                    )}
                                    {user.website && (
                                        <div className="flex items-center mb-2">
                                            <LinkIcon className="text-gray-600 text-base" />
                                            <span className="ml-2 text-gray-500">{user.website}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center mb-2">
                                        <Calendar className="text-gray-600 text-base" />
                                        <span className="ml-2 text-gray-500">
                                            Joined {profileStats.joined}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <TabBarAnimated 
                        tabs={[
                            { key: "posts", title: "Posts", icon: "grid" },
                            { key: "media", title: "Media", icon: "image" },
                        ]}
                        activeTab={activeTab}
                        onTabPress={setActiveTab}
                        className="border-2 w-full flex justify-between"
                    />

                    <motion.div
                        className="pt-2 w-full "
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {activeTab === "posts" && (
                            <>
                                {posts.length > 0 ? (
                                    posts.map((post, index) => (
                                        <PostCard
                                            key={post.id || index}
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
                                            username={currentUser?.username}
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col border-2 w-xl items-center justify-center py-12">
                                        <ImageIcon className="text-gray-300 text-5xl" />
                                        <h3 className="mt-4 text-lg font-medium text-gray-700">
                                            No posts yet
                                        </h3>
                                        <p className="mt-2 text-center text-sm text-gray-500 mx-8">
                                            {isMyProfile
                                                ? "Start sharing your thoughts, photos, and experiences with the world."
                                                : `${user.username || "This user"
                                                } hasn't posted anything yet.`}
                                        </p>
                                        {isMyProfile && (
                                            <Link
                                                href="/create-post"
                                                className="mt-6 px-6 py-2.5 bg-primary rounded-full text-white font-medium"
                                            >
                                                Create First Post
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                        {activeTab === "media" && (
                            <GalleryGrid
                                media={posts
                                    .filter((post) => post.media && post.media.length > 0)
                                    .flatMap((post) =>
                                        post.media.map((uri, i) => ({ id: `${post.id}-${i}`, uri }))
                                    )}
                                onMediaPress={(item) => {
                                    const post = posts.find((p) => item.id.startsWith(p.id));
                                    if (post) {
                                        router.push(`/home/post-detail?postId=${post.id}`);
                                    }
                                }}
                                emptyStateMessage={
                                    isMyProfile
                                        ? "Share photos and videos with your followers."
                                        : `${user.username || "This user"
                                        } hasn't posted any media yet.`
                                }
                            />
                        )}
                    </motion.div>
                    <div className="h-20"></div>
                </div>

                {/* --- MODALS --- */}
                {/* Profile More Options Modal */}
                <CustomModal
                    visible={isMoreModalVisible}
                    onClose={() => setIsMoreModalVisible(false)}
                    title="More Options"
                >
                    <div className="p-4">
                        {moreOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={option.onPress}
                                disabled={option.loading}
                                className={`w-full flex items-center p-3 rounded-xl text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                    option.danger
                                        ? 'hover:bg-red-50 text-red-600'
                                        : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <option.icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{option.label}</span>
                                {option.loading && (
                                    <div className="ml-auto">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </CustomModal>

                {/* MODIFIED: Post Options Modal (same structure as PostPage) */}
                <CustomModal visible={isModalVisible} onClose={() => setModalVisible(false)} title="Post Options">
                    <div className="p-4">
                        {selectedPost && (
                            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
                                <Image 
                                    src={getProfilePicture(selectedPost?.profilePic)} 
                                    alt={selectedPost?.username || "Profile"} 
                                    width={40} 
                                    height={40} 
                                    className="rounded-full" 
                                />
                                <div className="ml-3">
                                    <p className="font-semibold text-gray-800">{selectedPost.username}</p>
                                    <p className="text-sm text-gray-500 truncate">{selectedPost.content}</p>
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
                                            option.text === 'Delete Post' || option.text === 'Block' || option.text === 'Report' 
                                                ? 'hover:bg-red-50 text-red-600' 
                                                : 'hover:bg-gray-50 text-gray-700'
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

                {/* ADDED: Comment Modal */}
                <CommentModal 
                    visible={isCommentModalVisible} 
                    onClose={() => setCommentModalVisible(false)} 
                    title="Add Comment" 
                    post={postToComment} 
                    onSuccess={handleCommentSuccess}
                    token={token} 
                />

                {/* ADDED: Amplify Modal */}
                <AmplifyModal
                    visible={isAmplifyModalVisible}
                    onClose={() => setAmplifyModalVisible(false)}
                    post={postToAmplify}
                    token={token}
                    onSuccess={() => {
                        setAmplifyModalVisible(false);
                        // Refresh posts to show amplification
                        if (user?._id) {
                            setHasFetched(false);
                            fetchUserPosts(user._id);
                        }
                    }}
                />

                {/* ADDED: Report Modal */}
                <ReportModal
                    visible={isReportModalVisible}
                    onClose={() => setReportModalVisible(false)}
                    post={postToReport}
                    token={token}
                    onSuccess={() => {
                        setReportModalVisible(false);
                    }}
                />
            </div>
        </div>
    );
};

export default ProfilePage;