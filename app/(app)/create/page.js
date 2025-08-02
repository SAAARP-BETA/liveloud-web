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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../utils/config";
import defaultPic from "../../assets/avatar.png";
import Image from "next/image";
// import toast from 'react-hot-toast';
import toast from "react-hot-toast";

const FilteredImage = ({ src, filterType, className }) => {
  const filterStyles = {
    none: "",
    sepia: "sepia(100%)",
    grayscale: "grayscale(100%)",
    blur: "blur(2px)",
    brightness: "brightness(150%)",
    contrast: "contrast(150%)",
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

  // State
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [imageMetadata, setImageMetadata] = useState([]);
  const [imageFilters, setImageFilters] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [taggedPeople, setTaggedPeople] = useState([]);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [peopleSearch, setPeopleSearch] = useState("");
  const [peopleSuggestions, setPeopleSuggestions] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [locationResults, setLocationResults] = useState([]);

  // UI State
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPeopleTagModal, setShowPeopleTagModal] = useState(false);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState(null);

  // useAuth
  const { user, token, isAuthenticated } = useAuth();

  const router = useRouter();
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  // Calculate word count excluding hashtags
  const charCount = useMemo(() => {
    const words = content.trim().split(/\s+/);
    const nonHashtagWords = words.filter((word) => !word.startsWith("#"));
    return nonHashtagWords.join(" ").length;
  }, [content]);

  const locations = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
  ];
  const filteredLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Memoized values
  const isApproachingLimit = useMemo(
    () => charCount > MAX_CHAR_LIMIT * 0.8,
    [charCount]
  );

  const isOverLimit = useMemo(() => charCount > MAX_CHAR_LIMIT, [charCount]);

  const isSubmitDisabled = useMemo(
    () =>
      loading ||
      isOverLimit ||
      (!content.trim() && images.length === 0 && tags.length === 0),
    [loading, isOverLimit, content, images, tags]
  );

  const feelings = [
    { name: "Happy", icon: "😊" },
    { name: "Excited", icon: "🎉" },
    { name: "Grateful", icon: "🙏" },
    { name: "Relaxed", icon: "😌" },
    { name: "Motivated", icon: "💪" },
    { name: "Creative", icon: "🎨" },
  ];

  const [trendyTags, setTrendyTags] = useState([]);

  const gradientColors = useMemo(() => {
    if (isOverLimit) return ["#FF6B6B", "#FF0000"];
    if (isApproachingLimit) return ["#FFD166", "#FF9F1C"];
    return ["#06D6A0", "#1B9AAA"];
  }, [isOverLimit, isApproachingLimit]);

  // Initialize Google Places API
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.google &&
      !autocompleteService.current
    ) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }
  }, []);

  // Handle content change and extract hashtags on space or enter
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check if the last character is a space or new line
    if (newContent.endsWith(" ") || newContent.endsWith("\n")) {
      const words = newContent.trim().split(/[\s\n]+/);
      const lastWord = words[words.length - 1];
      if (lastWord.startsWith("#") && lastWord.length > 1) {
        const newTag = lastWord.substring(1);
        setContent(newContent.replace(lastWord, "").trim() + " ");
        if (!tags.includes(newTag)) {
          setTags((prev) => [...prev, newTag]);
        }
      }
    }
  };

  // Remove tag without adding back to content
  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Fetch people suggestions when modal opens
  useEffect(() => {
    if (showPeopleTagModal) {
      const fetchPeopleSuggestions = async () => {
        try {
          const response = await fetch(
            `${API_ENDPOINTS.USER}/users/suggestions`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setPeopleSuggestions(data);
            setFilteredPeople(data);
          }
        } catch (error) {
          console.error("Error fetching people suggestions:", error);
          toast.error("Failed to load people suggestions");
        }
      };
      fetchPeopleSuggestions();
    }
  }, [showPeopleTagModal, token]);

  // Search people when typing
  useEffect(() => {
    const searchPeople = () => {
      if (peopleSearch.trim() === "") {
        setFilteredPeople(peopleSuggestions);
        return;
      }

      // Filter locally based on the search term
      const filtered = peopleSuggestions.filter(
        (person) =>
          (person.username &&
            person.username
              .toLowerCase()
              .includes(peopleSearch.toLowerCase())) ||
          (person.name &&
            person.name.toLowerCase().includes(peopleSearch.toLowerCase()))
      );
      setFilteredPeople(filtered);
    };

    searchPeople();
  }, [peopleSearch, peopleSuggestions]);

  // Search locations when typing
  useEffect(() => {
    if (!autocompleteService.current || !locationSearch.trim()) {
      setLocationResults([]);
      return;
    }

    const searchLocations = () => {
      autocompleteService.current.getPlacePredictions(
        { input: locationSearch },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setLocationResults(predictions);
          } else {
            setLocationResults([]);
          }
        }
      );
    };

    const debounceSearch = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounceSearch);
  }, [locationSearch]);

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

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      const shouldLogin = window.confirm(
        "You need to be logged in to create a post. Do you want to login now?"
      );

      if (shouldLogin) {
        router.push("/login");
      }

      return;
    }

    fetchTrendingTags();
  }, [isAuthenticated, loading, router, fetchTrendingTags]);

  // Handlers
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (images.length < MEDIA_LIMIT) {
          setImages((prev) => [...prev, e.target.result]);
          setImageFilters((prev) => [...prev, "none"]);
        }
      };
      reader.readAsDataURL(file);
    });
    setShowMediaOptions(false);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFilters((prev) => prev.filter((_, i) => i !== index));
  };

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
    }
    setShowImageEditor(false);
    setEditingImageIndex(null);
  };

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationName("");
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setLocationName(loc);
    setShowLocationModal(false);
    setLocationSearch("");
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
    setLocationSearch("");
    setLocationResults([]);
  };

  const handlePeopleTag = (person) => {
    if (!person || !person._id) {
      toast.error("Invalid person selected");
      return;
    }
    if (!taggedPeople.find((p) => p.id === person._id)) {
      setTaggedPeople((prev) => [
        ...prev,
        { id: person._id, name: person.name || person.username },
      ]);
    }
    setShowPeopleTagModal(false);
    setPeopleSearch("");
    setFilteredPeople(peopleSuggestions); // Reset filtered people
  };

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

      const mediaMetadata = images.map((uri, index) => ({
        filter: imageFilters[index] || null,
        originalUri: uri,
      }));

      const base64Images = await Promise.all(
        images.map(async (uri, index) => {
          setUploadProgress((prev) => {
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

      const uploadEndpoint = `${API_ENDPOINTS.MEDIA}/post`;

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          images: base64Images,
          metadata: mediaMetadata,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Login Required: Please login to create posts");
      return;
    }

    if (!content.trim() && images.length === 0 && tags.length === 0) {
      toast.error(
        "Empty Post: Please add some text, images, or tags to your post"
      );
      return;
    }

    if (charCount > MAX_CHAR_LIMIT) {
      toast.error(
        `Content Too Long: Your post exceeds the ${MAX_CHAR_LIMIT} character limit (excluding hashtags).`
      );
      return;
    }

    setLoading(true);

    try {
      const extractedTags = tags.filter((tag) => tag.trim() !== "");

      let mediaUrls = [];
      let mediaIds = [];

      if (images.length > 0) {
        try {
          const uploadResults = await uploadMedia();
          mediaUrls = uploadResults.urls;
          mediaIds = uploadResults.metadata.map((item) => item.publicId);
          setImageMetadata(uploadResults.metadata);
        } catch (error) {
          toast.error(`Upload Error: ${error.message}`);
          setLoading(false);
          return;
        }
      }

      const postData = {
        content: content.trim(),
        media: mediaUrls,
        mediaIds: mediaIds,
        tags: extractedTags,
        metadata: imageMetadata,
      };

      if (location) {
        postData.location = {
          coordinates: [
            location.coords?.longitude || 0,
            location.coords?.latitude || 0,
          ],
          name: locationName,
        };
      }

      if (taggedPeople.length > 0) {
        postData.taggedUsers = taggedPeople.map((person) => person.id);
      }

      if (selectedFeeling) {
        postData.feeling = selectedFeeling.name;
      }

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

      toast.success("Post Created!\nYour post was published successfully.");
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
    uploadMedia,
    imageMetadata,
    charCount,
  ]);

  if (loading) {
    return (
      <div className="w-xl min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:w-xl sm:w-120 w-90 bg-gray-50 p-4 flex-1 overflow-y-auto h-screen custom-scrollbar">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 max-w-2xl w-full rounded-md shadow-md shadow-blue-50 z-10 mx-auto">
        <div className="flex items-center justify-between px-4 py-3 mt-5">
          <button
            className="text-gray-600 transition-transform duration-200 cursor-pointer ease-in-out hover:rotate-180"
            onClick={() => (
              setContent(""),
              setImages([]),
              setImageFilters([]),
              setLocation(null),
              setLocationName(""),
              setTaggedPeople([]),
              setSelectedFeeling(null),
              setTags([]),
              setTagInput("")
            )}
          >
            <RefreshCw size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Create New Post
          </h1>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ease-in-out
              ${isSubmitDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed scale-100"
                : "bg-primary text-white cursor-pointer hover:bg-primary hover:scale-105 active:scale-95"
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
          <Image
            src={user?.profilePicture || defaultPic}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full w-[40] h-[40]"
          />
          <div className="ml-3">
            <p className="text-sm text-gray-900">
              {user?.name || user?.username || "User"}
            </p>
          </div>
        </div>

        {/* Character Counter */}
        {content.length > 0 && (
          <div className="flex items-center justify-center pt-4">
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
              <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center">
                <span
                  className={`text-xs font-medium ${isOverLimit
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

        {/* Input Box */}
        <div className="px-4 py-4">
          <textarea
            className="w-full text-base text-gray-800 placeholder-gray-400 outline-none resize-none"
            placeholder="What's on your mind?"
            value={content}
            onChange={handleContentChange}
            rows={6}
            maxLength={MAX_CHAR_LIMIT * 1.1}
          />
        </div>

        {/* Location Display */}
        {location && (
          <div className="px-4 mb-3">
            <div className="flex items-center bg-primary rounded-lg p-3">
              <MapPin className="text-primary" size={20} />
              <span className="text-primary ml-2 font-medium">
                {locationName}
              </span>
              <button onClick={clearLocation} className="ml-auto">
                <X className="text-primary" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Tagged People Display */}
        {taggedPeople.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex flex-wrap items-center bg-indigo-50 rounded-lg p-3">
              <Users className="text-indigo-500" size={20} />
              <span className="text-indigo-600 ml-2 mr-1 font-medium">
                With
              </span>
              {taggedPeople.map((person, index) => (
                <span key={person.id} className="text-indigo-600">
                  {person.name}
                  {index < taggedPeople.length - 1 ? ", " : ""}
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
              <span className="text-amber-600 ml-2 font-medium">
                Feeling {selectedFeeling.name}
              </span>
              <button
                onClick={() => setSelectedFeeling(null)}
                className="ml-auto"
              >
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
                <div
                  key={index}
                  className="relative w-28 h-28 rounded-lg overflow-hidden shadow-sm flex-shrink-0"
                >
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
                  className="w-28 h-28 rounded-lg border-2 border-dashed border-primary flex flex-col items-center justify-center bg-sky-50 flex-shrink-0"
                >
                  <Plus className="text-primary" size={24} />
                  <span className="text-xs text-primary mt-1 font-medium">
                    Add More
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="px-4 py-2">
            <div className="text-sm text-gray-600 mb-2 font-medium">
              Tags in your post:
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-full px-3 py-1.5 flex items-center"
                >
                  <span className="text-primary text-sm">#{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary hover:text-blue-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tags */}
        <div className="px-4 py-3">
          <div className="text-sm text-gray-600 mb-2 font-medium">
            Popular hashtags:
          </div>
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
            <div className="text-sm text-gray-500 italic">
              No trending tags found.
            </div>
          )}
        </div>

        {/* Add to Post Options */}
        <div className="bg-white px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            Add to your post:
          </div>
          <div className="flex justify-around">
            <button
              onClick={() => setShowMediaOptions(true)}
              disabled={images.length >= MEDIA_LIMIT}
              className="flex flex-col items-center cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${images.length >= MEDIA_LIMIT
                    ? "bg-gray-100"
                    : "bg-red-50 hover:bg-red-100"
                  }`}
              >
                <ImageIcon
                  className={
                    images.length >= MEDIA_LIMIT
                      ? "text-gray-400"
                      : "text-red-500"
                  }
                  size={20}
                />
              </div>
              <span
                className={`text-xs mt-1 ${images.length >= MEDIA_LIMIT
                    ? "text-gray-400"
                    : "text-gray-600"
                  }`}
              >
                Media
              </span>
            </button>

            <button
              onClick={() => setShowLocationModal(true)}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-green-50 cursor-pointer hover:bg-green-100 flex items-center justify-center">
                <MapPin className="text-green-500" size={20} />
              </div>
              <span className="text-xs mt-1 text-gray-600">Location</span>
            </button>

            <button
              onClick={() => setShowPeopleTagModal(true)}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 cursor-pointer hover:bg-blue-100 flex items-center justify-center">
                <Users className="text-primary" size={20} />
              </div>
              <span className="text-xs mt-1 text-gray-600">Tag People</span>
            </button>

            <button
              onClick={() => setShowFeelingModal(true)}
              className="flex flex-col items-center"
            >
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
              Your post exceeds the {MAX_CHAR_LIMIT} character limit (excluding
              hashtags). Please shorten your text to post.
            </span>
          </div>
        )}
      </div>

      {/* Media Options Modal */}
      {showMediaOptions && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowMediaOptions(false)}
          ></div>
          <div className="relative z-60">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Media</h3>
                <button
                  onClick={() => setShowMediaOptions(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-3">
                <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <Camera className="text-primary mr-3" size={24} />
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
        </>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeLocationModal}
          ></div>
          <div className="relative z-60">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Location</h3>
                <button
                  onClick={closeLocationModal}
                  className="text-gray-600 cursor-pointer hover:text-gray-900"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full text-base text-gray-800 placeholder-gray-400 outline-none border-b border-gray-200 py-1 pl-10"
                    placeholder="Search locations"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                  <Search
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc, index) => (
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
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No locations found
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* People Tag Modal */}
      {showPeopleTagModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowPeopleTagModal(false)}
          ></div>
          <div className="relative z-60">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tag People</h3>
                <button
                  onClick={() => setShowPeopleTagModal(false)}
                  className="text-gray-600 cursor-pointer hover:text-gray-900"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full text-base text-gray-800 placeholder-gray-400 outline-none border-b border-gray-200 py-1 pl-10"
                    placeholder="Search people"
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                  />
                  <Search
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((person) => (
                    <button
                      key={person._id}
                      onClick={() => handlePeopleTag(person)}
                      className="flex items-center space-x-3 w-full text-left p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <img
                        src={person.profilePicture || defaultPic}
                        alt={person.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">
                          {person.name || person.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {person.bio || "No bio"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No people found
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Feeling Modal */}
      {showFeelingModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowFeelingModal(false)}
          ></div>
          <div className="relative z-60">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">How are you feeling?</h3>
                <button
                  onClick={() => setShowFeelingModal(false)}
                  className="text-gray-600 cursor-pointer hover:text-gray-900"
                >
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
        </>
      )}

      {/* Image Editor Modal */}
      {showImageEditor && editingImageIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-2xl mx-auto rounded-lg p-4 m-8">
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
              {[
                "none",
                "sepia",
                "grayscale",
                "blur",
                "brightness",
                "contrast",
              ].map((filter) => (
                <button
                  key={filter}
                  onClick={() => applyImageFilter(filter)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm capitalize"
                >
                  {filter === "none" ? "Original" : filter}
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
