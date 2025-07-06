"use client";

import React, { useState } from 'react';
import { Repeat, Edit, ArrowLeft } from 'lucide-react';

const AmplifyModal = ({ isVisible, onClose, post, token, onSuccess }) => {
  const [quoteContent, setQuoteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('options'); // 'options', 'quote'

  // Handle simple amplify (retweet)
  const handleAmplify = async () => {
    if (!token) {
      alert('Please login to amplify posts');
      onClose();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/amplify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: "Amplified"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to amplify post');
      }

      alert('Post amplified successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error amplifying post:', error);
      alert(error.message || 'Failed to amplify post');
    } finally {
      setLoading(false);
    }
  };

  // Handle quote amplify
  const handleQuote = async () => {
    if (!token) {
      alert('Please login to quote posts');
      onClose();
      return;
    }

    if (!quoteContent.trim()) {
      alert('Please add some text to your quote');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/quote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteContent: quoteContent.trim(),
          content: "Quoted post"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to quote post');
      }

      alert('Quote posted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error quoting post:', error);
      alert(error.message || 'Failed to quote post');
    } finally {
      setLoading(false);
    }
  };

  // Handle key press for submit
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaCmd)) {
      handleQuote();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="bg-white rounded-t-3xl w-full max-w-2xl relative">
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {mode === 'options' ? (
          <>
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Amplify this post
              </h2>

              {post && (
                <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
                  <img
                    src={post.profilePic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium text-gray-900">
                      {post.username}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              className="flex items-center w-full px-6 py-4 border-t border-gray-100 hover:bg-gray-50 transition-colors"
              onClick={handleAmplify}
              disabled={loading}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                <Repeat className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900">
                  Amplify
                </h3>
                <p className="text-sm text-gray-500">
                  Share this post with your followers
                </p>
              </div>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              )}
            </button>

            <button
              className="flex items-center w-full px-6 py-4 border-t border-gray-100 hover:bg-gray-50 transition-colors"
              onClick={() => setMode('quote')}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                <Edit className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900">
                  Quote
                </h3>
                <p className="text-sm text-gray-500">
                  Add your own thoughts to this post
                </p>
              </div>
            </button>

            <button
              className="w-full p-4 bg-gray-100 text-center mt-2 hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              <span className="font-medium text-gray-600">
                Cancel
              </span>
            </button>
          </>
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Quote this post
              </h2>
              <button 
                onClick={() => setMode('options')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <textarea
              className="w-full bg-gray-50 rounded-xl p-4 min-h-32 text-base text-gray-900 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add your thoughts..."
              value={quoteContent}
              onChange={(e) => setQuoteContent(e.target.value)}
              onKeyDown={handleKeyPress}
              maxLength={280}
            />

            {post && (
              <div className="border border-gray-200 rounded-xl p-3 mb-3">
                <div className="flex items-center mb-2">
                  <img
                    src={post.profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <span className="font-medium text-sm text-gray-900">
                    {post.username}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {post.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {post.content}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {280 - quoteContent.length} characters left
              </span>
              <button
                className={`px-6 py-3 rounded-full font-bold text-white transition-colors ${
                  quoteContent.trim() 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                onClick={handleQuote}
                disabled={!quoteContent.trim() || loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Quote'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmplifyModal;