'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import {
  Image as PhotoIcon,
  X as XMarkIcon,
} from 'lucide-react';

const API_ENDPOINTS = {
  SOCIAL: process.env.NEXT_PUBLIC_SOCIAL_API_URL,
  MEDIA: process.env.NEXT_PUBLIC_MEDIA_API_URL,
  USERS: process.env.NEXT_PUBLIC_USERS_API_URL,
};

const MAX_CHAR_LIMIT = 1000;
const MEDIA_LIMIT = 4;

const HomePage = () => {
  const router = useRouter();
  const { user, token, isAuthenticated, error } = useAuth();

  const [text, setText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFilters, setImageFilters] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const fileInputRef = useRef(null);

  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     if (user?.username) {
  //       try {
  //         const res = await fetch(`${API_ENDPOINTS.USERS}/profiles/${user.username}`);
  //         console.log("res", res);
          
  //         if (!res.ok) throw new Error('Failed to fetch user info');
  //         const data = await res.json();
  //         setUserInfo(data);
  //         console.log('User Info:', data);
  //       } catch (err) {
  //         console.error(err);
  //       }
  //     }
  //   };
  //   fetchUserInfo();
  // }, [user]);

  const charCount = text.length;
  const isApproachingLimit = charCount > MAX_CHAR_LIMIT * 0.8;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;
  const gradientColors = isOverLimit
    ? ['#FF6B6B', '#FF0000']
    : isApproachingLimit
    ? ['#FFD166', '#FF9F1C']
    : ['#06D6A0', '#1B9AAA'];

    const uploadMedia = async () => {
      const formData = new FormData();
      images.forEach((image, index) => {
        const byteString = atob(image.split(',')[1]);
        const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      formData.append('files', blob, `image-${index}.jpg`);
    });

    const res = await fetch(`${API_ENDPOINTS.MEDIA}/upload/post`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!res.ok) throw new Error('Failed to upload media');
    const data = await res.json();
    return data.urls; // Expecting { urls: [ ... ] }
  };
  
  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      alert('Please login to create posts');
      return;
    }
    
    if (!text.trim() && images.length === 0) {
      alert('Please add some text or images to your post');
      return;
    }
    
    if (isOverLimit) {
      alert(`Content Too Long: Your post exceeds the ${MAX_CHAR_LIMIT} character limit.`);
      return;
    }
    
    try {
      let mediaUrls = [];
      if (images.length > 0) {
        mediaUrls = await uploadMedia();
      }
      
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: text,
          media: mediaUrls,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      alert('Post created successfully!');
      setText('');
      setImages([]);
      setImageFilters([]);
      setIsInputFocused(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert(`Failed to create post: ${error.message}`);
    }
  };
  
  const handleMediaButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (images.length < MEDIA_LIMIT) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, e.target.result]);
          setImageFilters(prev => [...prev, 'none']);
        };
        reader.readAsDataURL(file);
      }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCreatePost();
    }
  };
  
  return (
    <div className="min-h-screen max-w-3xl w-full mx-auto bg-gray-50 relative">
      <style jsx>{`
        .blur-content {
          filter: ${isInputFocused || images.length > 0 ? 'blur(4px)' : 'none'};
          pointer-events: ${isInputFocused || images.length > 0 ? 'none' : 'auto'};
          transition: filter 0.3s ease;
          }
          .post-composer {
            position: relative;
            z-index: 10;
            }
            .char-counter-bottom {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              }
              .char-counter-inner {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                }
                .char-counter-text {
                  font-size: 12px;
                  font-weight: 500;
                  }
                  .char-counter-text.over-limit {
                    color: #FF0000;
        }
        .char-counter-text.approaching-limit {
          color: #FF9F1C;
          }
          .char-counter-text.normal {
            color: #1B9AAA;
            }
            .image-preview-container {
              overflow-x: auto;
              scrollbar-width: thin;
              scrollbar-color: #d1d5db transparent;
              }
              `}</style>

      {!isAuthenticated ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Please log in to create posts.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              Log In
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200 post-composer">
             
            <div className="flex items-center mb-2 space-x-3">
              <Image
                src={userInfo?.profilePicture || '/api/placeholder/40/40'}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full "
              />
               <span className=" text-gray-700">@{user.username}</span>
              {/* <span className="font-semibold text-gray-700">@{userInfo?.username || 'Loading...'}</span> */}
            </div>

            <div className="flex items-start space-x-3">
              <textarea
                className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's on your mind?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(text.trim().length > 0)}
                onKeyDown={handleKeyPress}
                rows={isInputFocused ? 5 : 2}
                style={{ transition: 'all 0.3s ease' }}
              />
              <div>
                <button
                  onClick={handleMediaButtonClick}
                  disabled={images.length >= MEDIA_LIMIT}
                  className={`p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors ${
                    images.length >= MEDIA_LIMIT ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <PhotoIcon className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-2 flex overflow-x-auto space-x-3 image-preview-container">
                {images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt="Uploaded"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover"
                    />
                    <button
                      onClick={() => {
                        setImages(prev => prev.filter((_, i) => i !== index));
                        setImageFilters(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                    >
                      <XMarkIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <div
                className="char-counter-bottom"
                style={{
                  background: `linear-gradient(135deg, ${gradientColors.join(', ')})`
                }}
              >
                <div className="char-counter-inner">
                  <span
                    className={`char-counter-text ${
                      isOverLimit ? 'over-limit' :
                      isApproachingLimit ? 'approaching-limit' :
                      'normal'
                    }`}
                  >
                    {MAX_CHAR_LIMIT - charCount}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!text.trim() && images.length === 0 || isOverLimit}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="blur-content">
            <div className="m-4 p-4 text-center text-gray-600">
              No posts to display. Start sharing your thoughts!
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="p-4 mx-4 mb-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-600 font-medium">
            Authentication Error: {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
