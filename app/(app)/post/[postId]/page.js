"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

// --- Local Imports ---
import { useAuth } from '../../../context/AuthContext'; // Adjust path if needed
import PostCard from '../../../../Components/ui/PostCard'; // Adjust path
import CommentModal from '../../../../Components/ui/CommentModal'; // Adjust path
import AmplifyModal from '../../../../Components/ui/AmplifyModal'; // Adjust path
import CustomModal from '../../../../Components/ui/Modal'; // Adjust path
import ReportModal from '../../../../Components/ui/ReportModal'; // Adjust path
import { API_ENDPOINTS } from "../../../utils/config"; // Adjust path
import { createPostHandlers } from '../../../utils/postFunctions'; // Adjust path

/**
 * A simple component to display a single comment.
 */
const CommentCard = ({ comment }) => {
    if (!comment || !comment.user) {
        return null;
    }
    return (
        <div className="flex items-start space-x-3 p-4 border-t border-gray-100">
            <div className="w-10 h-10 rounded-full relative overflow-hidden flex-shrink-0">
                <Image
                    src={comment.user.profilePicture || '/path/to/default/pic.png'}
                    alt={`${comment.user.username}'s profile`}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">{comment.user.username}</span>
                    <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <p className="text-gray-800 mt-1">{comment.content}</p>
            </div>
        </div>
    );
};

/**
 * The main page component for displaying a single post and its comments.
 */
const PostPage = () => {
    const params = useParams();
    const postId = params.postId;
    const { user, token, isAuthenticated } = useAuth();

    // --- State Management ---
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");

    // Modal States
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isAmplifyModalVisible, setAmplifyModalVisible] = useState(false);
    const [postToAmplify, setPostToAmplify] = useState(null);
    const [isCommentModalVisible, setCommentModalVisible] = useState(false);
    const [postToComment, setPostToComment] = useState(null);
    const [isReportModalVisible, setReportModalVisible] = useState(false);
    const [postToReport, setPostToReport] = useState(null);

    // --- Data Fetching ---
    const fetchPost = useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${postId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch post');
            }
            const data = await response.json();
            const formattedPost = {
                ...data,
                id: data._id,
                username: data.user.username,
                profilePic: data.user.profilePicture,
            };
            setPost(formattedPost);
            setSelectedPost(formattedPost); // Also set the selected post for modals
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

    // --- Interaction Handlers ---
    const postHandlers = createPostHandlers(
        user,
        token,
        (updater) => { // This function updates the single post's state
            setPost(prevPost => updater([prevPost])[0]);
        },
        setPostToComment,
        setCommentModalVisible,
        setPostToAmplify,
        setAmplifyModalVisible,
        setPostToReport,
        setReportModalVisible
    );

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;

        try {
            const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }
            toast.success('Comment posted!');
            setNewComment("");
            fetchPost(); // Re-fetch post to show the new comment
        } catch (err) {
            console.error('Error submitting comment:', err);
            toast.error(err.message || 'Could not post comment.');
        }
    };

    // --- Render Logic ---
    if (loading) return <div className="text-center py-20">Loading post...</div>;
    if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
    if (!post) return <div className="text-center py-20">Post not found.</div>;

    return (
        <>
            <div className="container mx-auto max-w-2xl py-4">
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

                {/* Comment Submission Form */}
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
                    <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3">
                        <textarea
                            id="comment-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            rows="1"
                        />
                        <button
                            type="submit"
                            className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-gray-400"
                            disabled={!newComment.trim() || !isAuthenticated}
                        >
                            Post
                        </button>
                    </form>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-xl mt-4">
                    <h2 className="text-lg font-bold p-4 border-b border-gray-100">Comments ({post.commentCount})</h2>
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                            <CommentCard key={comment._id} comment={comment} />
                        ))
                    ) : (
                        <p className="px-4 pb-4 text-gray-500">No comments yet.</p>
                    )}
                </div>
            </div>

            {/* --- Modals --- */}
            <CustomModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Post Options"
            >
                {/* You would need to replicate the logic for menu options from HomePage here */}
                <div className="p-4">Options for post {selectedPost?.id}</div>
            </CustomModal>

            <CommentModal
                visible={isCommentModalVisible}
                onClose={() => setCommentModalVisible(false)}
                post={postToComment}
                token={token}
                onSuccess={() => {
                    setCommentModalVisible(false);
                    fetchPost(); // Refresh post on successful comment
                }}
            />

            <AmplifyModal
                visible={isAmplifyModalVisible}
                onClose={() => setAmplifyModalVisible(false)}
                post={postToAmplify}
                token={token}
                onSuccess={() => {
                    setAmplifyModalVisible(false);
                    fetchPost(); // Refresh post on successful amplify
                }}
            />

            <ReportModal
                visible={isReportModalVisible}
                onClose={() => setReportModalVisible(false)}
                post={postToReport}
                token={token}
                onSuccess={() => {
                    setReportModalVisible(false);
                    toast.success("Post reported. Thank you for your feedback.");
                }}
            />
        </>
    );
};

export default PostPage;
