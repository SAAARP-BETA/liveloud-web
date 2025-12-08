"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Camera,
  MapPin,
  Users,
  Smile,
  Image as ImageIcon,
  X,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Verified,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../utils/config";
import defaultPic from "../../assets/avatar.png";
import Image from "next/image";
import toast from "react-hot-toast";
import { debounce } from "lodash"; // Added for debouncing search
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { Icon } from "@iconify/react";
import * as MdIcons from "react-icons/md";
const FilteredImage = ({ src, filterType, className }) => {
  const filterStyles = {
    none: "",
    sepia: "sepia(100%)",
    grayscale: "grayscale(100%)",
    blur: "blur(2px)",
    brightness: "brightness(150%)",
    contrast: "contrast(150%)",
    vintage: "sepia(50%) contrast(120%) brightness(90%)",
    cold: "hue-rotate(180deg) saturate(120%)",
    warm: "hue-rotate(-30deg) saturate(130%)",
    "black-white": "grayscale(100%) contrast(150%)",
  };

  return (
    <img
      src={src}
      className={className}
      style={{ filter: filterStyles[filterType] || "" }}
      alt="Post content"
    />
  );
};

const CreatePost = () => {
  // Constants
  const MAX_CHAR_LIMIT = 1000;
  const MEDIA_LIMIT = 4;

  const PollModal = ({ onClose, onCreate }) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [expiresAt, setExpiresAt] = useState("");

    const handleOptionChange = (index, value) => {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
    };

    const addOption = () => {
      if (options.length < 5){
        setOptions([...options, ""]);
      }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
          setOptions(options.filter((_, i) => i !== index));
        }
      };

    const handleCreatePoll = () => {
        if (question.trim() && options.every(opt => opt.trim())) {
          onCreate({
            question: question.trim(),
            options: options.map(opt => ({ option: opt.trim() })),
            expiresAt: expiresAt || undefined,
          });
        } else {
          toast.error("Please fill out the poll question and all options.");
        }
      };

    return (
       <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
         <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 shadow-xl">
           <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create a Poll</h3>
           <div className="mb-4">
             <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium block">Poll Question</label>
             <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700" placeholder="e.g., What's your favorite color?" value={question} onChange={(e) => setQuestion(e.target.value)} />
           </div>
           <div className="mb-4">
             <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium block">Options</label>
             <div className="space-y-2">
               {options.map((option, index) => (
                 <div key={index} className="flex items-center">
                   <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700" placeholder={`Option ${index + 1}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} />
                   {options.length > 2 && (<button onClick={() => removeOption(index)} className="ml-2 text-red-500"><X className="h-6 w-6" /></button>)}
                 </div>
               ))}
             </div>
             {options.length < 5 && (<button onClick={addOption} className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">+ Add option</button>)}
           </div>
           <div className="mb-6">
             <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium block">Expires At (Optional)</label>
             <input type="datetime-local" className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
           </div>
           <div className="flex justify-end space-x-3">
             <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium">Cancel</button>
             <button onClick={handleCreatePoll} className="px-5 py-2.5 rounded-lg bg-blue-500 text-white font-medium">Create Poll</button>
           </div>
         </div>
       </div>
     );
   };

  // Sample feelings data - matching Expo version
 

  // Post content state
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [imageMetadata, setImageMetadata] = useState([]);
  const [imageFilters, setImageFilters] = useState([]);
  const [tags, setTags] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [taggedPeople, setTaggedPeople] = useState([]);
  const [selectedFeeling, setSelectedFeeling] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [trendyTags, setTrendyTags] = useState([
    "technology",
    "webdev",
    "coding",
    "javascript",
    "react",
    "design",
    "productivity",
    "motivation",
    "innovation",
    "startup",
    "ai",
    "future",
  ]);

  // Modal visibility state
  // const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState(""); // Replaced peopleSearch
  const [searchedUsers, setSearchedUsers] = useState([]); // Replaced filteredPeople
  const [randomUsers, setRandomUsers] = useState([]); // Replaced peopleSuggestions
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isLoadingRandomUsers, setIsLoadingRandomUsers] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPeopleTagModal, setShowPeopleTagModal] = useState(false);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [poll, setPoll] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);

  // User search state
  // const [userSearchQuery, setUserSearchQuery] = useState("");
  // const [searchedUsers, setSearchedUsers] = useState([]);
  // const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  // const [randomUsers, setRandomUsers] = useState([]);
  // const [isLoadingRandomUsers, setIsLoadingRandomUsers] = useState(false);

  // Location state
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [customLocationText, setCustomLocationText] = useState("");
  // const [locationSearch, setLocationSearch] = useState("");

  // Auth context
  const { user, token, isAuthenticated } = useAuth();

  // Refs for Google Places API (for web compatibility)
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  // Memoized values
  const charCount = useMemo(() => content.length, [content]);
  const isApproachingLimit = useMemo(
    () => charCount > MAX_CHAR_LIMIT * 0.8,
    [charCount]
  );
  const isOverLimit = useMemo(() => charCount > MAX_CHAR_LIMIT, [charCount]);
  const isSubmitDisabled = useMemo(
    () => loading || isOverLimit || !content.trim(),
    [loading, isOverLimit, content]
  );

  const feelings = [
  { name: 'Happy', icon: 'mdi:emoticon-happy-outline' },
  { name: 'Sad', icon: 'mdi:emoticon-sad-outline' },
  { name: 'Excited', icon: 'mdi:emoticon-excited-outline' },
  { name: 'Tired', icon: 'mdi:question-mark' },
  { name: 'Loved', icon: 'mdi:heart-outline' },
  { name: 'Angry', icon: 'mdi:emoticon-angry-outline' },
  { name: 'Working', icon: 'mdi:briefcase-outline' },
  { name: 'Celebrating', icon: 'mdi:party-popper' }
];

  // const [trendyTags, setTrendyTags] = useState([]);

  const gradientColors = useMemo(() => {
    if (isOverLimit) return ["#FF6B6B", "#FF0000"];
    if (isApproachingLimit) return ["#FFD166", "#FF9F1C"];
    return ["#06D6A0", "#1B9AAA"];
  }, [isOverLimit, isApproachingLimit]);

  const router = useRouter();

  // Extract hashtags from content and update character count
  useEffect(() => {
    if (!content) {
      setTags([]);
      return;
    }

    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex);
    setTags(matches ? matches.map((tag) => tag.substring(1)) : []);
  }, [content]);

  // Cleanup search state when modal closes
  useEffect(() => {
    if (!showPeopleTagModal) {
      console.log("Tag people modal closed - cleaning up state");
      setUserSearchQuery("");
      setSearchedUsers([]);
      setIsSearchingUsers(false);
      setRandomUsers([]);
      setIsLoadingRandomUsers(false);
    } else {
      console.log("Tag people modal opened - fetching random users");
      // Fetch random users when modal opens
      fetchRandomUsers();
    }
  }, [showPeopleTagModal]);

  // Check auth and fetch trending tags on mount
  useEffect(() => {
    if (!isAuthenticated) {
      if (
        window.confirm(
          "You need to be logged in to create a post. Do you want to login now?"
        )
      ) {
        router.push("/login");
      }
      return;
    }

    fetchTrendingTags();
  }, [isAuthenticated, router]);

  // API calls
  const fetchTrendingTags = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SOCIAL}/posts/tags/trending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTrendyTags(data.map((item) => item.tag));
        }
      }
    } catch (error) {
      console.error("Error fetching trending tags:", error);
    }
  }, [token]);


// User search functions
const fetchRandomUsers = useCallback(async () => {
  console.log("Fetching random users...");
  setIsLoadingRandomUsers(true);

  try {
    const currentUserId = user?.id || user?._id;

    const response = await fetch(
      `${API_ENDPOINTS.SEARCH}/profiles/random?${
        currentUserId ? `userId=${currentUserId}` : ""
      }`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log("API data:", data);
    // console.log("count", data.count);

    // Separate lists from backend
    let followerSuggestions = data?.followerUsers || [];
    let everyoneSuggestions = data?.everyoneUsers || [];

    // Filter each list separately (remove already tagged + current user)
    const filterList = (list) =>
      list.filter((randomUser) => {
        const randomUserId = randomUser.id || randomUser._id;

        return (
          !taggedPeople.some(
            (taggedUser) =>
              taggedUser.id === randomUserId ||
              taggedUser._id === randomUserId
          ) && randomUserId !== currentUserId
        );
      });

    followerSuggestions = filterList(followerSuggestions);
    everyoneSuggestions = filterList(everyoneSuggestions);

    // Shuffle both lists
    followerSuggestions = followerSuggestions.sort(() => 0.5 - Math.random());
    everyoneSuggestions = everyoneSuggestions.sort(() => 0.5 - Math.random());

    // Slice (optional: limit number to 6 each or combined)
    followerSuggestions = followerSuggestions.slice(0, 6);
    everyoneSuggestions = everyoneSuggestions.slice(0, 6);

    // Store separately in state (or combine if needed)
    
    const merged = [...followerSuggestions, ...everyoneSuggestions];
const uniqueUsers = Array.from(new Map(merged.map(u => [u._id, u])).values());

setRandomUsers(uniqueUsers);




    // console.log("Follower suggestions:", followerSuggestions);   
    // console.log("Everyone suggestions:", everyoneSuggestions);
  } catch (error) {
    console.error("Error fetching random users:", error);
    setRandomUsers({ followers: [], everyone: [] });
  } finally {
    setIsLoadingRandomUsers(false);
  }
}, [taggedPeople, user?.id, user?._id]);


//search user 
  const searchUsers = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchedUsers([]);
        setIsSearchingUsers(false);
        return;
      }

      setIsSearchingUsers(true);

      try {
        const response = await fetch(
          `${API_ENDPOINTS.SEARCH}/profiles/search?query=${encodeURIComponent(
            query.trim()
          )}&limit=20`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const users = data?.users || [];

        // Filter out already tagged users and current user
        const filteredUsers = users.filter((searchUser) => {
        const searchUserId = searchUser.id || searchUser._id;
        const currentUserId = user?.id || user?._id;

      // Skip already tagged users and self
      if (
        taggedPeople.some(
          (taggedUser) =>
            taggedUser.id === searchUserId ||
            taggedUser._id === searchUserId
        ) ||
        searchUserId === currentUserId
      ) {
        return false;
      }

      //  allowTagsFrom
      if (searchUser.allowTagsFrom === "everyone") {
        return true;
      }

      if (searchUser.allowTagsFrom === "followers") {
        // Check if currentUser is in searchUser's followers
        return searchUser.followersCount &&
          Array.isArray(searchUser.followers) &&
          searchUser.followers.includes(currentUserId);
      }

      if (searchUser.allowTagsFrom === "none") {
        return false;
      }

      return true; // fallback
});
        setSearchedUsers(filteredUsers);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchedUsers([]);
      } finally {
        setIsSearchingUsers(false);
      }
    },
    [taggedPeople, user?.id, user?._id]
  );

  const debouncedSearchUsers = useCallback(
    debounce(searchUsers, 300),
    [searchUsers]
  );

  const handleUserSearchChange = (text) => {
    setUserSearchQuery(text);

    if (text.trim() === "") {
      // Clear search results when search is cleared
      setSearchedUsers([]);
      setIsSearchingUsers(false);
      // Refresh random users if they're empty or low
      if (randomUsers.length <= 3) {
        fetchRandomUsers();
      }
    } else {
      debouncedSearchUsers(text);
    }
  };

  const handleTagUser = (selectedUser) => {
    console.log("Attempting to tag user:", selectedUser.username);
    // Check if user is already tagged
    const isAlreadyTagged = taggedPeople.some(
      (user) => user.id === selectedUser.id || user.id === selectedUser._id
    );

    if (!isAlreadyTagged) {
      console.log("Tagging user:", selectedUser.username);

      const newTaggedUser = {
        id: selectedUser.id || selectedUser._id,
        username: selectedUser.username,
        name: selectedUser.name || selectedUser.username,
        profilePicture: selectedUser.profilePicture,
      };

      setTaggedPeople((prevTagged) => [...prevTagged, newTaggedUser]);

      // Remove from random users if present
      setRandomUsers((prev) => {
        const filtered = prev.filter(
          (user) =>
            user.id !== selectedUser.id &&
            user._id !== selectedUser._id &&
            user.id !== selectedUser._id &&
            user._id !== selectedUser.id
        );
        console.log("Random users after removal:", filtered.length);
        return filtered;
      });

      // Remove from search results if present
      setSearchedUsers((prev) =>
        prev.filter(
          (user) =>
            user.id !== selectedUser.id &&
            user._id !== selectedUser._id &&
            user.id !== selectedUser._id &&
            user._id !== selectedUser.id
        )
      );

      // If we're in the random users view and running low on suggestions, fetch more
      if (userSearchQuery.trim() === "") {
        const remainingUsers = randomUsers.filter(
          (user) =>
            user.id !== selectedUser.id &&
            user._id !== selectedUser._id &&
            user.id !== selectedUser._id &&
            user._id !== selectedUser.id
        );
        console.log("Remaining random users after tag:", remainingUsers.length);
        if (remainingUsers.length <= 2) {
          console.log("Low on random users, fetching more...");
          // Delay to allow state updates to complete
          setTimeout(() => {
            fetchRandomUsers();
          }, 100);
        }
      }
    } else {
      console.log("User already tagged:", selectedUser.username);
    }
  };

  const handleRemoveTaggedUser = (userId) => {
    setTaggedPeople((prevTagged) =>
      prevTagged.filter((user) => user.id !== userId)
    );

    // If we're in the random users view, refresh suggestions to include more users
    if (userSearchQuery.trim() === "") {
      // Delay to allow state updates to complete
      setTimeout(() => {
        fetchRandomUsers();
      }, 100);
    }
  };

  // Location handlers
  const getCurrentLocation = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        return;
      }

      setUploading(true);
      setUploadProgress(10);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          };
          setLocation(locationData);
          setUploadProgress(50);

          // Try to get location name using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
              setLocationName(data.display_name.split(",").slice(0, 3).join(", "));
            } else {
              setLocationName("Current Location");
            }
          } catch (error) {
            console.error("Error getting location name:", error);
            setLocationName("Current Location");
          }

          setUploadProgress(100);
          setUploading(false);
          setShowLocationModal(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUploading(false);
          toast.error("Failed to get your location. Please try again.");
        }
      );
    } catch (error) {
      console.error("Error getting location:", error);
      setUploading(false);
      toast.error("Failed to get your location. Please try again.");
    }
  }, []);

  const handleCustomLocationSave = () => {
    if (customLocationText.trim()) {
      setLocationName(customLocationText.trim());
      setLocation({
        coords: {
          latitude: null,
          longitude: null,
        },
        isCustom: true,
      });
      setCustomLocationText("");
      setShowCustomLocationInput(false);
      setShowLocationModal(false);
    }
  };

  const clearLocation = useCallback(() => {
    setLocation(null);
    setLocationName("");
  }, []);

  // Image handlers
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (images.length + files.length > MEDIA_LIMIT) {
      toast.error(`You can only upload up to ${MEDIA_LIMIT} images per post.`);
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, e.target.result]);
        setImageFilters((prev) => [...prev, "none"]);
      };
      reader.readAsDataURL(file);
    });
    setShowMediaOptions(false);
  };

  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFilters((prev) => prev.filter((_, i) => i !== index));
    
    if (imageMetadata.length > 0) {
      setImageMetadata((prev) => prev.filter((_, i) => i !== index));
    }
  }, [imageMetadata]);

  const handleEditImage = (index) => {
    setEditingImageIndex(index);
    setShowImageEditor(true);
  };

  const applyImageFilter = (filterType) => {
    if (editingImageIndex !== null) {
      setImageFilters((prev) => {
        const newFilters = [...prev];
        newFilters[editingImageIndex] = filterType;
        return newFilters;
      });

      // Store filter information in metadata
      setImageMetadata((prev) => {
        const updatedMetadata = [...prev];
        if (!updatedMetadata[editingImageIndex]) {
          updatedMetadata[editingImageIndex] = {};
        }
        updatedMetadata[editingImageIndex].filter = filterType;
        return updatedMetadata;
      });
    }
    setShowImageEditor(false);
    setEditingImageIndex(null);
  };

  // Tag handlers
  const addTag = useCallback(
    (tag) => {
      if (!content.includes(`#${tag}`)) {
        setContent((prev) => {
          const newContent = prev.trim() + ` #${tag} `;
          return newContent;
        });
      }
    },
    [content]
  );

  // Image upload
  const uploadMedia = useCallback(async () => {
    if (images.length === 0) return { urls: [], metadata: [] };

    try {
      setUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);

      // First create an array of metadata objects with filter info
      const mediaMetadata = images.map((uri, index) => ({
        filter: imageFilters[index] || null,
        originalUri: uri,
      }));

      // Convert images to base64
      const base64Images = await Promise.all(
        images.map(async (uri, index) => {
          setUploadProgress((prev) => {
            const progressPerImage = 90 / images.length;
            const currentImageProgress = (index / images.length) * 90;
            return Math.min(currentImageProgress + progressPerImage * 0.5, 95);
          });

          // For web, the image is already in base64 format from FileReader
          return uri;
        })
      );

      // Construct the correct endpoint URL
      const uploadEndpoint = `${API_ENDPOINTS.MEDIA}/post`;

      // Send to upload service with metadata including filter info
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          images: base64Images,
          metadata: mediaMetadata, // Include filter info in the payload
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Upload failed:", errorData);
        throw new Error(
          errorData.message || `Upload failed with status ${response.status}`
        );
      }

      setUploadProgress(100);

      const data = await response.json();

      return {
        urls: data.imageUrls || [],
        metadata: data.metadata || [],
      };
    } catch (error) {
      console.error("Error uploading media:", error);
      throw new Error(`Failed to upload images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [images, imageFilters, token]);

  // Submit post
  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Login Required: Please login to create posts");
      return;
    }

    if (!content.trim() && images.length === 0) {
      toast.error("Empty Post: Please add some text or images to your post");
      return;
    }

    if (content.length > MAX_CHAR_LIMIT) {
      toast.error(
        `Content Too Long: Your post exceeds the ${MAX_CHAR_LIMIT} character limit.`
      );
      return;
    }

    setLoading(true);

    try {
      // Extract hashtags for the request body
      const extractedTags = tags.filter((tag) => tag.trim() !== "");

      // Upload media first if present
      let mediaUrls = [];

      if (images.length > 0) {
        try {
          const uploadResults = await uploadMedia();
          mediaUrls = uploadResults.urls;

          // Store the complete metadata including filter info
          setImageMetadata(uploadResults.metadata);
        } catch (error) {
          toast.error(`Upload Error: ${error.message}`);
          setLoading(false);
          return;
        }
      }

      // Prepare the post data
      const postData = {
        content: content.trim(),
        media: mediaUrls,
        tags: extractedTags,
        mediaMetadata: imageMetadata, // Changed from metadata to mediaMetadata
      };

      // If there's a poll, add it to the post data
      if (poll) {
        postData.poll = poll;
      }

      // Add location data if available
      if (location) {
        postData.location = {
          coordinates: [location.coords?.longitude || 0, location.coords?.latitude || 0],
          name: locationName,
        };
      }

      // Add tagged people if available
      if (taggedPeople.length > 0) {
        postData.taggedUsers = taggedPeople.map((person) => person.id);
      }

      // Add feeling if selected
      if (selectedFeeling) {
        postData.feeling = selectedFeeling.name;
      }

      // Create the post
      const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create post");
      }

      // Success
      toast.success("Post Created! Your post was published successfully.");
      router.push("/home");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(`Failed to create your post: ${error.message}`);
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
    router,
    uploadMedia,
    imageMetadata,
    poll,
  ]);

  if (loading) {
    return (
  <div className="w-xl min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Creating your post...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full md:min-w-[410px] lg:w-[610px] max-w-2xl px-4 flex-1 overflow-y-auto h-screen custom-scrollbar">
      {/* Header */}
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-2xl w-full rounded-md shadow-md shadow-blue-50 dark:shadow-gray-950 z-10 mx-auto">
        <div className="flex items-center justify-between px-4 py-3 mt-5">
          <button
            className="text-gray-600 transition-transform dark:border-gray-700 duration-200 cursor-pointer ease-in-out hover:rotate-180"
            onClick={() => setContent("")}
          >
            <RefreshCw size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Create New Post
          </h1>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ease-in-out
              ${
                isSubmitDisabled
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-200 cursor-not-allowed scale-100"
                  : "bg-primary text-white cursor-pointer hover:bg-primary hover:scale-105 active:scale-95"
              }`}
          >
            {uploading ? "Uploading..." : "Post"}
          </button>
        </div>
      </div>

      {/* Main Content */}
  <div className="bg-white dark:bg-gray-900 mt-4 rounded-lg max-w-2xl w-full mx-auto shadow-sm border border-gray-200 dark:border-gray-700">
        {/* User Info Header */}
        <div className="flex items-center px-4 pt-4">
          <Image
            src={user?.profilePicture || defaultPic}
            alt="Profile"
            width={48}
            height={48}
            className="rounded-full w-12 h-12 border-2 dark:border-gray-200 dark:bg-gray-200"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                {user?.username || "User"}
              </p>
              {user?.isVerified && (
                <Verified className="ml-1 text-blue-500" size={16} />
              )}
            </div>
          </div>

          {/* Character Counter */}
          {content.length > 0 && (
            <div className="flex items-center justify-center">
              <div
                className="rounded-full p-0.5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${gradientColors.join(
                    ", "
                  )})`,
                  width: 40,
                  height: 40,
                }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-full w-9 h-9 flex items-center justify-center">
                  <span
                    className={`text-xs font-medium ${
                      isOverLimit
                        ? "text-red-600"
                        : isApproachingLimit
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {MAX_CHAR_LIMIT - charCount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="px-4 py-4 min-h-[180px]">
          <textarea
            className="w-full text-base text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder:text-gray-400 outline-none resize-none"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={MAX_CHAR_LIMIT * 1.1}
            autoFocus={true}
          />
        </div>

        {/* Location Display */}
        {location && (
          <div className="px-4 mb-3">
            <div className="flex items-center bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
              <MapPin className="text-blue-600" size={16} />
              <span className="text-blue-600 ml-2 font-medium flex-1">
                {locationName}
              </span>
              <button
                onClick={clearLocation}
                className="ml-2 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Tagged People Display */}
        {taggedPeople.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex flex-wrap items-center bg-indigo-50 rounded-lg p-3">
              <Users className="text-indigo-600" size={16} />
              <span className="text-indigo-600 ml-2 mr-1 font-medium">
                With
              </span>
              {taggedPeople.map((person, index) => (
                <span key={person.id} className="text-indigo-600">
                  @{person.username}
                  {index < taggedPeople.length - 1 && ", "}
                </span>
              ))}
              <button
                onClick={() => {
                  setTaggedPeople([]);
                  setUserSearchQuery("");
                  setSearchedUsers([]);
                  // Refresh random users when clearing all tags
                  if (showPeopleTagModal) {
                    fetchRandomUsers();
                  }
                }}
                className="ml-2 text-indigo-500 hover:text-indigo-700"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Feeling Display */}
        {selectedFeeling && (
          <div className="px-4 mb-3">
            <div className="flex items-center bg-amber-50 rounded-lg p-3">
              <Icon
                icon={selectedFeeling.icon}
                width={24}
                height={24}
                color="orange"
              />
              <span className="text-amber-600 ml-2 font-medium">
                Feeling {selectedFeeling.name}
              </span>
              <button
                onClick={() => setSelectedFeeling(null)} className="ml-auto">
        <X className="text-amber-500 cursor-pointer" size={20} />
      </button>
    </div>
  </div>
)}

{poll && (
    <div className="px-4 mb-3">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">{poll.question}</h3>
            <div className="space-y-2">
                {poll.options.map((option, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-2 text-center">
                        {option.option}
                    </div>
                ))}
            </div>
            <button
                onClick={() => setPoll(null)}
                className="mt-4 text-red-500 text-sm"
            >
                Remove Poll
            </button>
        </div>
    </div>
)}

        {/* Image Preview Section */}
        {images.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex space-x-3 overflow-x-auto">
              {images.map((image, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <FilteredImage
                    src={image}
                    filterType={imageFilters[index] || "none"}
                    className="w-28 h-28 object-cover rounded-xl"
                  />
                  <div className="absolute top-1 right-1 flex space-x-1">
                    <button
                      onClick={() => handleEditImage(index)}
                      className="bg-black/50 rounded-full p-1.5 hover:bg-black/70"
                    >
                      <Edit size={14} className="text-white" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="bg-black/50 rounded-full p-1.5 hover:bg-black/70"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {images.length < MEDIA_LIMIT && (
                <button
                  onClick={() => setShowMediaOptions(true)}
                  className="w-28 h-28 rounded-xl border-2 border-dashed border-sky-300 flex flex-col items-center justify-center bg-sky-50 dark:bg-sky-900 hover:bg-sky-100 dark:hover:bg-sky-800 flex-shrink-0"
                >
                  <Plus size={32} className="text-sky-500" />
                  <span className="text-xs text-sky-500 dark:text-sky-300 mt-1 font-medium">
                    Add More
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="px-4 mb-3">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 dark:bg-sky-400 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Tags in your post:
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-50 rounded-full px-3 py-1.5 flex items-center"
                >
                  <span className="text-primary text-sm">#{tag}</span>
                  {/* <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary hover:text-blue-700 cursor-pointer"
                  >
                    <X size={14} className="cursor-pointer" />
                  </button> */}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tags */}
        <div className="px-4 py-3 mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
            Popular hashtags:
          </p>
          <div className="flex flex-wrap gap-2">
            {trendyTags.slice(0, 8).map((tag, index) => (
              <button
                key={index}
                onClick={() => addTag(tag)}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 dark:hover:bg-gray-950"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Post Options */}
        <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
    Add to your post:
  </p>
  <div className="flex justify-around">
    <button
      onClick={() => setShowMediaOptions(true)}
      disabled={images.length >= MEDIA_LIMIT}
      className="flex flex-col items-center justify-center disabled:opacity-50"
    >
      <div
        className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center ${
          images.length >= MEDIA_LIMIT
            ? "bg-gray-100 dark:bg-gray-800"
            : "bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800"
        }`}
      >
        <ImageIcon
          className={images.length >= MEDIA_LIMIT ? "text-gray-400 dark:text-gray-500" : "text-red-500"}
          size={20}
        />
      </div>
      <span
        className={`text-xs mt-1 ${
          images.length >= MEDIA_LIMIT
            ? "text-gray-400 dark:text-gray-500"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        Media
      </span>
    </button>

    <button
      onClick={() => setShowLocationModal(true)}
      className="flex flex-col items-center justify-center"
    >
      <div className="w-12 h-12 cursor-pointer rounded-full bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 flex items-center justify-center">
        <MapPin size={24} className="text-green-500 dark:text-green-300" />
      </div>
      <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Location</span>
    </button>

    <button
      onClick={() => setShowPeopleTagModal(true)}
      className="flex flex-col items-center justify-center"
    >
      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 flex items-center justify-center">
        <Users size={24} className="text-blue-500 dark:text-blue-300" />
      </div>
      <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Tag People</span>
    </button>

    <button
      onClick={() => setShowFeelingModal(true)}
      className="flex flex-col cursor-pointer items-center justify-center"
    >
      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-800 flex items-center justify-center">
        <Smile size={24} className="text-indigo-500 dark:text-indigo-300" />
      </div>
      <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Feeling</span>
    </button>

    <button
      onClick={() => setShowPollModal(true)}
      className="flex flex-col items-center justify-center"
    >
      <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-800 flex items-center justify-center">
        <Icon icon="mdi:poll" width={24} height={24} className="text-yellow-500 dark:text-yellow-300" />
      </div>
      <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Poll</span>
    </button>
  </div>
</div>

        {/* Error Message for Over Limit */}
        {isOverLimit && (
          <div className="mx-4 my-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-red-600 text-sm font-medium">
              Your post exceeds the {MAX_CHAR_LIMIT} character limit (excluding hashtags). Please shorten your text to post.
            </span>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Media Options Modal */}
      {showMediaOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
<div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg p-6">            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-6">Add Media</h3>
            
            <div className="space-y-3 dark:bg-gray-800">
              <label className="flex items-center bg-gray-50 p-4 rounded-xl dark:bg-gray-800 cursor-pointer ">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center mr-4">
                  <ImageIcon size={24} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1 dark:bg-gray-800">
                  <p className="font-medium text-gray-800 dark:bg-gray-800 dark:text-white">Choose from gallery</p>
                  <p className="text-sm text-gray-500">
                    Select up to {MEDIA_LIMIT} images
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={() => setShowMediaOptions(false)}
              className="w-full bg-gray-100 py-4 cursor-pointer mt-6 rounded-xl font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {
      showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
<div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg p-6">            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-6">Add Location</h3>

            <div className="space-y-3 cursor-pointer">
              <button
                onClick={getCurrentLocation}
                disabled={uploading}
                className="flex items-center bg-gray-50 p-4 dark:bg-gray-800 dark:text-white  rounded-xl w-full hover:bg-black"
              >
                <div className="w-12  cursor-pointer h-12 rounded-full dark:bg-gray-800 dark:text-white bg-green-50 flex items-center justify-center mr-4">
                  <MapPin size={24} className="text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium dark:text-white text-gray-800">
                    Use current location
                  </p>
                  <p className="text-sm text-gray-500">
                    Allow location access to add your current position
                  </p>
                </div>
              </button>

              <button
                onClick={() => setShowCustomLocationInput(true)}
                className="flex items-center dark:bg-gray-800 bg-gray-50 p-4 rounded-xl w-full hover:bg-black"
              >
                <div className="w-12 h-12 rounded-full dark:text-white dark:bg-gray-800 bg-sky-50 flex items-center justify-center mr-4">
                  <Search size={24} className="text-sky-500  dark:text-sky-300" />
                </div>
                <div className="flex-1 text-left dark:text-white ">
                  <p className="font-medium text-gray-800 dark:text-white">
                    Add custom location
                  </p>
                  <p className="text-sm text-gray-500">
                    Enter a location name manually
                  </p>
                </div>
              </button>

              {showCustomLocationInput && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sky-600 mb-3 font-medium">
                    Enter location name:
                  </p>
                  <input
                    type="text"
                    className="w-full bg-white text-gray-800 rounded-lg px-4 py-3 mb-4 border border-blue-200"
                    placeholder="e.g., Times Square, New York"
                    value={customLocationText}
                    onChange={(e) => setCustomLocationText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowCustomLocationInput(false);
                        setCustomLocationText("");
                      }}
                      className="px-4 py-2 cursor-pointer rounded-lg bg-gray-200 text-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCustomLocationSave}
                      disabled={!customLocationText.trim()}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        customLocationText.trim()
                          ? "bg-sky-500 text-white"
                          : "bg-gray-300 text-gray-500"
                      }`}
                    >
                      Add Location
                    </button>
                  </div>
                </div>
              )}

              {!showCustomLocationInput && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-3 font-medium">
                    Recent locations:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Home", "Office", "Gym", "Coffee Shop"].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setLocationName(loc);
                          setLocation({
                            coords: { latitude: null, longitude: null },
                            isCustom: true,
                          });
                          setShowLocationModal(false);
                        }}
                        className="bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowLocationModal(false);
                setShowCustomLocationInput(false);
                setCustomLocationText("");
              }}
              className="w-full bg-gray-100 cursor-pointer py-4 mt-6 rounded-xl font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

 {/* People Tag Modal */}
      {showPeopleTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[85vh] min-h-[70vh] flex flex-col">
            <div className="p-6 pb-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold dark:text-white">Tag People</h3>
                <button
                  onClick={() => setShowPeopleTagModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-300 cursor-pointer" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700"
                  placeholder="Search for people..."
                  value={userSearchQuery}
                  onChange={(e) => handleUserSearchChange(e.target.value)}
                />
                {isSearchingUsers && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 dark:border-gray-400"></div>
                  </div>
                )}
              </div>

              {/* Currently Tagged */}
              {taggedPeople.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                    Tagged ({taggedPeople.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {taggedPeople.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center bg-blue-50 dark:bg-blue-900 rounded-full px-3 py-2 border border-blue-200 dark:border-blue-700"
                      >
                        <Image
                          src={person.profilePicture || defaultPic}
                          alt={person.username}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                          @{person.username}
                        </span>
                        <button
                          onClick={() => handleRemoveTaggedUser(person.id)}
                          className="ml-2 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center"
                        >
                          <X size={12} className="text-blue-700 dark:text-blue-300" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {userSearchQuery.trim() === "" ? (
                /* Random Users */
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Suggested People:
                    </p>
                    {!isLoadingRandomUsers && (
                      <button
                        onClick={fetchRandomUsers}
                        className="flex items-center text-gray-600 dark:text-gray-400"
                      >
                        <RefreshCw size={20} className="cursor-pointer" />
                        <span className="text-xs ml-1">Refresh</span>
                      </button>
                    )}
                  </div>

                  {isLoadingRandomUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
                    </div>
                  ) : randomUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No users to suggest</p>
                      <button
                        onClick={fetchRandomUsers}
                        className="mt-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {randomUsers.map((user) => (
                        <button
                          key={user.id || user._id}
                          onClick={() => handleTagUser(user)}
                          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Image
                            src={user.profilePicture || defaultPic}
                            alt={user.username || "unknown user"}
                            width={64}
                            height={64}
                            className="rounded-full mx-auto mb-3"
                          />
                          <div className="flex items-center justify-center mb-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                              @{user.username}
                            </p>
                            {user.isVerified && (
                              <Verified className="ml-1 text-blue-500" size={14} />
                            )}
                          </div>
                          {user.bio && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                          <div className="mt-3 bg-blue-500 px-3 py-1 rounded-full">
                            <span className="text-white text-xs font-medium">
                              Tag
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Search Results */
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                    Search Results:
                  </p>

                  {isSearchingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
                    </div>
                  ) : searchedUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Search size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No users found for "{userSearchQuery}"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchedUsers.map((user) => (
                        <button
                          key={user.id || user._id}
                          onClick={() => handleTagUser(user)}
                          className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-3 w-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Image
                            src={user.profilePicture || defaultPic}
                            alt={user.username}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <div className="ml-3 flex-1 text-left">
                            <div className="flex items-center">
                              <p className="font-medium text-gray-800 dark:text-white">
                                @{user.username}
                              </p>
                              {user.isVerified && (
                                <Verified className="ml-1 text-blue-500" size={16} />
                              )}
                            </div>
                            {user.bio && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {user.bio}
                              </p>
                            )}
                          </div>
                          <div className="bg-blue-500 px-3 py-1 rounded-full">
                            <span className="text-white text-sm font-medium">
                              Tag
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feeling Modal */}
      {showFeelingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg p-6">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-6 dark:text-white">How are you feeling?</h3>

            <div className="grid grid-cols-2 gap-3">
              {feelings.map((feeling, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedFeeling(feeling);
                    setShowFeelingModal(false);
                  }}
                  className="flex items-center justify-center flex-col p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900 flex items-center justify-center mb-2">
                    <Icon icon={feeling.icon} width={24} height={24} color="orange" />
                  </div>
                  <span className="text-gray-800 dark:text-white font-medium">{feeling.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFeelingModal(false)}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-4 rounded-xl mt-6 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Image Editor Modal */}
      {showImageEditor && editingImageIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 m-4">
            <h3 className="text-xl font-bold mb-4">Edit Image</h3>
            
            <div className="mb-6">
              <FilteredImage
                src={images[editingImageIndex]}
                filterType={imageFilters[editingImageIndex] || "none"}
                className="w-full h-64 object-contain rounded-lg"
              />
            </div>

            <p className="text-sm text-gray-600 mb-3 font-medium">
              Select Filter:
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                "none",
                "sepia",
                "grayscale",
                "blur",
                "brightness",
                "contrast",
                "vintage",
                "cold",
                "warm",
                "black-white",
              ].map((filter) => (
                <button
                  key={filter}
                  onClick={() => applyImageFilter(filter)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    imageFilters[editingImageIndex] === filter
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter === "none" ? "Original" : filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowImageEditor(false);
                setEditingImageIndex(null);
              }}
              className="w-full bg-gray-100 py-3 rounded-xl font-medium text-gray-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {showPollModal && (
        <PollModal
            onClose={() => setShowPollModal(false)}
            onCreate={(newPoll) => {
                setPoll(newPoll);
                setShowPollModal(false);
            }}
        />
      )}
    </div>
  );
};
export default CreatePost;