"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, MapPin, Users, Smile, Image, X, Edit, Plus } from 'lucide-react';
// import image from '../../assets/default-avatar.png';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';

const FilteredImage = ({ src, filterType, className }) => {
  const filterStyles = {
    none: '',
    sepia: 'sepia(100%)',
    grayscale: 'grayscale(100%)',
    blur: 'blur(2px)',
    brightness: 'brightness(150%)',
    contrast: 'contrast(150%)'
  };

  return (
    <img
      src={src}
      className={className}
      style={{ filter: filterStyles[filterType] || '' }}
      alt="Post content"
    />
  );
};

const CreatePost = () => {
  // Constants
  const MAX_CHAR_LIMIT = 1000;
  const MEDIA_LIMIT = 4;
  
  
  // State
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imageMetadata, setImageMetadata] = useState([]);
  const [imageFilters, setImageFilters] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [taggedPeople, setTaggedPeople] = useState([]);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // const [loading, setLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  
  // UI State
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPeopleTagModal, setShowPeopleTagModal] = useState(false);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  
  // useAuth
  const { user, token, isAuthenticated } = useAuth();
  console.log("token", token);
  
  
  const router = useRouter();
  
  // Sample data
  // const trendyTags = ['Travel', 'Food', 'Photography', 'Nature', 'Fitness', 'Art'];
  
  const charCount = content.length;
// memoised value
  const isApproachingLimit = useMemo(
    () => charCount > MAX_CHAR_LIMIT * 0.8,
    [charCount]
  );

  const isOverLimit = useMemo(
    () => charCount > MAX_CHAR_LIMIT,
    [charCount]
  );

  const isSubmitDisabled = useMemo(
    () => loading || isOverLimit || !content.trim(),
    [loading, isOverLimit, content]
  );

  const feelings = [
    { name: 'Happy', icon: '😊' },
    { name: 'Excited', icon: '🎉' },
    { name: 'Grateful', icon: '🙏' },
    { name: 'Relaxed', icon: '😌' },
    { name: 'Motivated', icon: '💪' },
    { name: 'Creative', icon: '🎨' }
  ];

// API endpoints
// const SOCIAL_API_URL = `http://192.168.1.13:3002/api/social`;
// const UPLOAD_API_URL = `http://192.168.1.13:3003/api/upload`;


const API_SOCIAL = process.env.NEXT_PUBLIC_SOCIAL_API_URL;
const API_MEDIA = process.env.NEXT_PUBLIC_MEDIA_API_URL;

const API_ENDPOINTS = {
  CREATE_POST: `${API_SOCIAL}/posts`,
  TRENDING_TAGS: `${API_SOCIAL}/posts/tags/trending`,
  UPLOAD_MEDIA: `${API_MEDIA}/upload/post`,
};

// const API_ENDPOINTS = {
//   SOCIAL: API_SOCIAL,
//   UPLOAD: `${API_SOCIAL}/upload/post`, 
//   MEDIA: `${API_MEDIA}/api/media`, 
// };


  const samplePeople = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];

  const [trendyTags, setTrendyTags] = useState(['Systumm','Travel', 'Food', 'Photography', 'Nature', 'Fitness', 'Art']);

  

  
// check auth and fetch trending tags 

useEffect(() => {
    if(loading) return;

    if (!isAuthenticated) {
      const shouldLogin = window.confirm(
        'You need to be logged in to create a post. Do you want to login now?'
      );

      if (shouldLogin) {
        router.push('/login'); // Adjust the route as needed
      }

      return;
    }

    fetchTrendingTags();
    console.log("ENV MEDIA:", process.env.NEXT_PUBLIC_MEDIA_API_URL);

  }, [isAuthenticated, loading,  router]);

  // Computed values

  // const isOverLimit = charCount > MAX_CHAR_LIMIT;
  // const isApproachingLimit = charCount > MAX_CHAR_LIMIT * 0.9;

  // const gradientColors = isOverLimit 
  //   ? ['#ef4444', '#dc2626'] 
  //   : isApproachingLimit 
  //   ? ['#f59e0b', '#d97706'] 
  //   : ['#10b981', '#059669'];

    const gradientColors = useMemo(() => {
    if (isOverLimit) return ['#FF6B6B', '#FF0000'];
    if (isApproachingLimit) return ['#FFD166', '#FF9F1C'];
    return ['#06D6A0', '#1B9AAA'];
  }, [isOverLimit, isApproachingLimit]);

  // Extract hashtags from content
  useEffect(() => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    if (matches) {
      const extractedTags = matches.map(tag => tag.substring(1));
      setTags([...new Set(extractedTags)]);
    } else {
      setTags([]);
    }
  }, [content]);

const fetchTrendingTags = useCallback(async () => {
    try {
     const response = await fetch(API_ENDPOINTS.TRENDING_TAGS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTrendyTags(data.map(item => item.tag));
        }
      }
    } catch (error) {
      console.error('Error fetching trending tags:', error);
    }
  }, [token]);

  // Handlers
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (images.length < MEDIA_LIMIT) {
          setImages(prev => [...prev, e.target.result]);
          setImageFilters(prev => [...prev, 'none']);
        }
      };
      reader.readAsDataURL(file);
    });
    setShowMediaOptions(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditImage = (index) => {
    setEditingImageIndex(index);
    setShowImageEditor(true);
  };

  const applyImageFilter = (filterType) => {
    if (editingImageIndex !== null) {
      setImageFilters(prev => {
        const newFilters = [...prev];
        newFilters[editingImageIndex] = filterType;
        return newFilters;
      });
    }
    setShowImageEditor(false);
    setEditingImageIndex(null);
  };

  const addTag = (tag) => {
    if (!content.includes(`#${tag}`)) {
      setContent(prev => prev + ` #${tag}`);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationName('');
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setLocationName(loc);
    setShowLocationModal(false);
  };

  const handlePeopleTag = (person) => {
    if (!taggedPeople.find(p => p.name === person)) {
      setTaggedPeople(prev => [...prev, { name: person }]);
    }
    setShowPeopleTagModal(false);
  };

  // handle post function

  // const handlePost = () => {
  //   if (isOverLimit) return;
    
  //   const postData = {
  //     content,
  //     images,
  //     location,
  //     taggedPeople,
  //     feeling: selectedFeeling,
  //     tags,
  //     timestamp: new Date().toISOString()
  //   };
    
  //   console.log('Posting:', postData);
  //   alert('Post created successfully!');2
    
  //   // Reset form
  //   setContent('');
  //   setImages([]);
  //   setImageFilters([]);
  //   setLocation(null);
  //   setLocationName('');
  //   setTaggedPeople([]);
  //   setSelectedFeeling(null);
  //   setTags([]);
  // };





const uploadMedia = useCallback(async () => {
    if (images.length === 0) return { urls: [], metadata: [] };

    try {
      setUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);

      const mediaMetadata = images.map((uri, index) => ({
        filter: imageFilters[index] || null,
        originalUri: uri,
      }));

      const base64Images = await Promise.all(
        images.map(async (uri, index) => {
          setUploadProgress(prev => {
            const progressPerImage = 90 / images.length;
            const currentImageProgress = (index / images.length) * 90;
            return Math.min(currentImageProgress + progressPerImage * 0.5, 95);
          });

          const response = await fetch(uri);
          const blob = await response.blob();

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );
      // const uploadEndpoint = `${API_ENDPOINTS.MEDIA}`;
      const uploadEndpoint = `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/post`;

      console.log("Upload endpoint:", uploadEndpoint);
      console.log('Uploading to:', uploadEndpoint);
      console.log('Images count:', base64Images.length);
      console.log('Metadata count:', mediaMetadata.length);
      console.log('Token present:', !!token);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          images: base64Images,
          metadata: mediaMetadata,
        }),
      });

      clearInterval(progressInterval);
      console.log("Upload endpoint:", uploadEndpoint);
      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload failed:', errorData);
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      setUploadProgress(100);

      const data = await response.json();
      console.log('Upload successful:', data);

      return {
        urls: data.imageUrls || [],
        metadata: data.metadata || [],
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [images, imageFilters, token]);
  console.log("ENV MEDIA:", process.env.NEXT_PUBLIC_MEDIA_API_URL);

  console.log('Token being used:', token);

const handleSubmit = useCallback(async () => {
  if (!isAuthenticated) {
    toast.error('Login Required: Please login to create posts');
    return;
  }

  if (!content.trim() && images.length === 0) {
    toast.error('Empty Post: Please add some text or images to your post');
    return;
  }

  if (content.length > MAX_CHAR_LIMIT) {
    toast.error(`Content Too Long: Your post exceeds the ${MAX_CHAR_LIMIT} character limit.`);
    return;
  }

  setLoading(true);

 try {
  const extractedTags = tags.filter(tag => tag.trim() !== '');
  let mediaIds = [];
  let mediaUrls = [];

  if (images.length > 0) {
    try {
      const uploadResults = await uploadMedia();

      if (
        !uploadResults ||
        !uploadResults.metadata ||
        !uploadResults.urls ||
        uploadResults.urls.length === 0
      ) {
        throw new Error('Invalid upload response');
      }

      mediaIds = uploadResults.metadata.map(item => item.publicId);
      mediaUrls = uploadResults.urls;
    } catch (error) {
      toast.error(`Upload Error: ${error.message}`);
      setLoading(false);
      return;
    }
  }

  const postData = {
    content: content.trim(),
    media: mediaUrls,         // ✅ required if posting image-only
    mediaIds: mediaIds,       // ✅ keep if backend uses publicIds
    tags: extractedTags,
  };

  if (location) {
    postData.location = {
      coordinates: [location.coords.longitude, location.coords.latitude],
      name: locationName,
    };
  }

  if (taggedPeople.length > 0) {
    postData.taggedUsers = taggedPeople.map(person => person.id);
  }

  if (selectedFeeling) {
    postData.feeling = selectedFeeling.name;
  }

  const response = await fetch(`${API_ENDPOINTS.CREATE_POST}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    console.log('Server response error:', await response.text());
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create post');
  }

  toast.success('Post Created!\nYour post was published successfully.');
  router.push('/home');
} catch (error) {
  console.error('Error creating post:', error);
  toast.error(`Post Error: Failed to create your post: ${error.message}`);
} finally {
  setLoading(false);
}

}, [
  isAuthenticated,
  content,
  images,
  tags,
  location,
  locationName,
  taggedPeople,
  selectedFeeling,
  token,
  uploadMedia,
]);


  if(loading){
     return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-50 p-2">
     <Toaster position="top-right" />
     
      {/* Header */}

       {/* Centered Header */}
    <div className="bg-white border-b border-gray-200 max-w-2xl w-full rounded-md shadow-md shadow-blue-50 z-10 mx-auto">
    <div className="flex items-center justify-between px-4 py-3 mt-5">
      <button className="text-gray-600 transition-transform duration-200 cursor-pointer ease-in-out hover:rotate-90">
     <X size={24} />
    </button>

      <h1 className="text-lg font-semibold text-gray-900">Create New Post</h1>
      <button
  onClick={handleSubmit}
  disabled={isOverLimit || (content.trim().length === 0 && images.length === 0)}
  className={`px-4 py-2  rounded-full font-medium transition-all duration-200 ease-in-out
    ${
      isOverLimit || (content.trim().length === 0 && images.length === 0)
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-100'
        : 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600 hover:scale-105 active:scale-95'
    }`}
>
  Post
    </button>
  </div>
</div>

      {/* Main Content */}
      <div className="bg-white mt-4 rounded-lg max-w-2xl w-full mx-auto shadow-sm">
        {/* User Info Header */}
<div className="flex items-center px-4 pt-4">
  <img
    src={user?.profilePic || './default-avatar.png'} // Replace with actual image path or user.profilePic
    alt="User"
    className="w-10 h-10 bg-black rounded-full object-cover"
    />
  <div className="ml-3">
    <p className="text-sm text-gray-900">{user?.name || user?.username || 'User'}</p>
    {/* Optional: small caption like “Public” or timestamp */}
    {/* <p className="text-xs text-gray-500">Posting publicly</p> */}
  </div>
</div>

    {/* Character Counter */}
        {content.length > 0 && (
          <div className="flex items-center justify-center pt-4">
            <div
              className="rounded-full p-0.5 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
                width: 40,
                height: 40
              }}
            >
              <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center">
                <span
                  className={`text-xs font-medium ${
                    isOverLimit ? 'text-red-600' :
                    isApproachingLimit ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}
                >
                  {MAX_CHAR_LIMIT - charCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Input Box */}
        <div className="px-4 py-4">
          <textarea
            className="w-full text-base text-gray-800 placeholder-gray-400 outline-none resize-none"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={MAX_CHAR_LIMIT * 1.1}
          />
        </div>

        {/* Location Display */}
        {location && (
          <div className="px-4 mb-3">
            <div className="flex items-center bg-blue-50 rounded-lg p-3">
              <MapPin className="text-blue-500" size={20} />
              <span className="text-blue-600 ml-2 font-medium">{locationName}</span>
              <button onClick={clearLocation} className="ml-auto">
                <X className="text-blue-500" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Tagged People Display */}
        {taggedPeople.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex flex-wrap items-center bg-indigo-50 rounded-lg p-3">
              <Users className="text-indigo-500" size={20} />
              <span className="text-indigo-600 ml-2 mr-1 font-medium">With</span>
              {taggedPeople.map((person, index) => (
                <span key={index} className="text-indigo-600">
                  {person.name}{index < taggedPeople.length - 1 && ', '}
                </span>
              ))}
              <button onClick={() => setTaggedPeople([])} className="ml-2">
                <X className="text-indigo-500" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Feeling Display */}
        {selectedFeeling && (
          <div className="px-4 mb-3">
            <div className="flex items-center bg-amber-50 rounded-lg p-3">
              <span className="text-2xl">{selectedFeeling.icon}</span>
              <span className="text-amber-600 ml-2 font-medium">Feeling {selectedFeeling.name}</span>
              <button onClick={() => setSelectedFeeling(null)} className="ml-auto">
                <X className="text-amber-500" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Selected Images */}
        {images.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex overflow-x-auto space-x-3 pb-2">
              {images.map((img, index) => (
                <div key={index} className="relative w-28 h-28 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                  <FilteredImage
                    src={img}
                    filterType={imageFilters[index]}
                    className="w-28 h-28 rounded-lg object-cover"
                  />
                  <div className="absolute top-1 right-1 flex space-x-1">
                    <button
                      onClick={() => handleEditImage(index)}
                      className="bg-black/50 rounded-full p-1.5"
                    >
                      <Edit className="text-white" size={12} />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="bg-black/50 rounded-full p-1.5"
                    >
                      <X className="text-white" size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {images.length < MEDIA_LIMIT && (
                <button
                  onClick={() => setShowMediaOptions(true)}
                  className="w-28 h-28 rounded-lg border-2 border-dashed border-sky-300 flex flex-col items-center justify-center bg-sky-50 flex-shrink-0"
                >
                  <Plus className="text-sky-500" size={24} />
                  <span className="text-xs text-sky-500 mt-1 font-medium">Add More</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="px-4 py-2">
            <div className="text-sm text-gray-600 mb-2 font-medium">Tags in your post:</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div key={index} className="bg-blue-50 rounded-full px-3 py-1.5">
                  <span className="text-blue-600 text-sm">#{tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tags */}
        {/* <div className="px-4 py-3">
          <div className="text-sm text-gray-600 mb-2 font-medium">Popular hashtags:</div>
          <div className="flex flex-wrap gap-2">
            {trendyTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => addTag(tag)}
                className="bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors"
              >
                <span className="text-gray-800 text-sm">#{tag}</span>
              </button>
            ))}
          </div>
        </div> */}

        {/* Trending Tags */}

        <div className="px-4 py-3">
        <div className="text-sm text-gray-600 mb-2 font-medium">Popular hashtags:</div>

  {trendyTags.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {trendyTags.map((tag, index) => (
        <button
          key={index} 
          onClick={() => addTag(tag)}
          className="bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors"
        >
          <span className="text-gray-800 text-sm">#{tag}</span>
        </button>
      ))}
    </div>
  ) : (
    <div className="text-sm text-gray-500 italic">No trending tags found.</div>
  )}
</div>



        {/* Add to Post Options */}
        <div className="bg-white px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-3 font-medium">Add to your post:</div>
          <div className="flex justify-around">
            <button
              onClick={() => setShowMediaOptions(true)}
              disabled={images.length >= MEDIA_LIMIT}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                images.length >= MEDIA_LIMIT ? 'bg-gray-100' : 'bg-red-50 hover:bg-red-100'
              }`}>
                <Image className={images.length >= MEDIA_LIMIT ? 'text-gray-400' : 'text-red-500'} size={20} />
              </div>
              <span className={`text-xs mt-1 ${images.length >= MEDIA_LIMIT ? 'text-gray-400' : 'text-gray-600'}`}>
                Media
              </span>
            </button>

            <button onClick={() => setShowLocationModal(true)} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-50 cursor-pointer hover:bg-green-100 flex items-center justify-center">
                <MapPin className="text-green-500" size={20} />
              </div>
              <span className="text-xs mt-1 text-gray-600">Location</span>
            </button>

            <button onClick={() => setShowPeopleTagModal(true)} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 cursor-pointer hover:bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-500" size={20} />
              </div>
              <span className="text-xs mt-1 text-gray-600">Tag People</span>
            </button>

            <button onClick={() => setShowFeelingModal(true)} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 cursor-pointer hover:bg-indigo-100 flex items-center justify-center">
                <Smile className="text-indigo-500" size={20} />
              </div>
              <span className="text-xs mt-1 text-gray-600">Feeling</span>
            </button>
          </div>
        </div>

        {/* Validation Error */}
        {isOverLimit && (
          <div className="mx-4 my-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-red-600 text-sm font-medium">
              Your post exceeds the {MAX_CHAR_LIMIT} character limit. Please shorten your text to post.
            </span>
          </div>
        )}
      </div>

      {/* Media Options Modal */}
      {showMediaOptions && (
        <div className="fixed inset-0  bg-black/50  flex items-end z-50">
        {/* //  <div className=" inset-0   bg-gray/50  flex items-end z-50"> */}
          <div className="bg-white w-full max-w-2xl mx-auto rounded-lg p-4 m-8"> 
            {/* max-w-md mx-auto */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Media</h3>
              <button onClick={() => setShowMediaOptions(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                <Camera className="text-blue-500 mr-3" size={24} />
                <span>Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-2xl mx-auto rounded-lg p-4 m-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Location</h3>
              <button onClick={() => setShowLocationModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX'].map((loc, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <MapPin className="text-gray-400 mr-3" size={20} />
                    <span>{loc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* People Tag Modal */}
      {showPeopleTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-2xl mx-auto rounded-lg m-8 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tag People</h3>
              <button onClick={() => setShowPeopleTagModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {samplePeople.map((person, index) => (
                <button
                  key={index}
                  onClick={() => handlePeopleTag(person)}
                  className="w-full text-left cursor-pointer p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                    <span>{person}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feeling Modal */}
      {showFeelingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-2xl mx-auto rounded-lg m-8 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">How are you feeling?</h3>
              <button onClick={() => setShowFeelingModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {feelings.map((feeling, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedFeeling(feeling);
                    setShowFeelingModal(false);
                  }}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl mr-3">{feeling.icon}</span>
                  <span>{feeling.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {showImageEditor && editingImageIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-2xl mx-auto rounded-lg p-4 m-8 ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Image</h3>
              <button onClick={() => setShowImageEditor(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <FilteredImage
                src={images[editingImageIndex]}
                filterType={imageFilters[editingImageIndex]}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['none', 'sepia', 'grayscale', 'blur', 'brightness', 'contrast'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => applyImageFilter(filter)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm capitalize"
                >
                  {filter === 'none' ? 'Original' : filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;