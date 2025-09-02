"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
// import { fonts } from "../../../utils/fonts";
import { API_ENDPOINTS } from "../../../utils/config";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import CustomModal from "../../../components/ui/Modal";
import {
  Camera,
  AtSign,
  User,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Book,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import defaultCover from "../../../assets/Profilepic1.png";
import defaultPic from "../../../assets/avatar.png";
const PROFILE_IMAGE_MAX_SIZE = 120;

// Custom Calendar Component
const CustomCalendar = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [viewDate, setViewDate] = useState(
    new Date(selectedDate || new Date())
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + direction);
    setViewDate(newDate);
  };

  const navigateYear = (direction) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(viewDate.getFullYear() + direction);
    setViewDate(newDate);
  };

  const handleDateClick = (date) => {
    setCurrentDate(date);
    onDateSelect(date);
    onClose();
  };

  const isSelectedDate = (date) => {
    if (!date || !currentDate) return false;
    return date.toDateString() === currentDate.toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFutureDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {/* Month/Year Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateYear(-1)}
              className="px-3 py-1 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-sm text-gray-600">←</span>
            </button>
            <span className="text-lg font-medium text-gray-800 min-w-[200px] text-center">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={() => navigateYear(1)}
              className="px-3 py-1 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-sm text-gray-600">→</span>
            </button>
          </div>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <button
              key={index}
              onClick={() =>
                date && !isFutureDate(date) && handleDateClick(date)
              }
              disabled={!date || isFutureDate(date)}
              className={`
                h-10 w-10 rounded-lg text-sm font-medium transition-colors
                ${!date ? "invisible" : ""}
                ${
                  isFutureDate(date)
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }
                ${
                  isSelectedDate(date)
                    ? "bg-primary text-white hover:bg-sky-600"
                    : ""
                }
                ${
                  isToday(date) && !isSelectedDate(date)
                    ? "bg-gray-100 text-sky-600"
                    : ""
                }
                ${
                  date &&
                  !isSelectedDate(date) &&
                  !isToday(date) &&
                  !isFutureDate(date)
                    ? "text-gray-700"
                    : ""
                }
              `}
            >
              {date ? date.getDate() : ""}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              const today = new Date();
              handleDateClick(today);
            }}
            className="px-4 py-2 text-sm text-primary hover:bg-sky-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility to convert file to base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // Remove data URL prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const EditPage = () => {
  const router = useRouter();
  const {
    user,
    token,
    logout,
    isAuthenticated,
    loading: authLoading,
    updateUserInfo,
  } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [imageActionType, setImageActionType] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deleteUserDataOption, setDeleteUserDataOption] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user || !token) {
      console.log(
        "Not authenticated or missing user/token, redirecting to login"
      );
      toast.error("Not Authorized, please login to edit your profile");
      router.push("/login");
      return;
    }
    loadUserProfile();
  }, [isAuthenticated, authLoading, router, user, token]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.USER}/profiles/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Session expired, redirecting to login");
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        }
        if (response.status === 404) {
          console.log("Profile not found, setting default profile");
          setProfileData({
  username: data.username || user?.username || "",
  fullname: data.fullname || "",
  bio: data.bio || "",
  location: data.location || "",
  website: data.website || "",
  dob: data.dob ? new Date(data.dob) : new Date(1990, 0, 1),
  email: data.email || user?.email || "",
  phone: data.phone || "",
  gender: data.gender || "",
  isPrivate: data.isPrivate || false,
  interests: data.interests || [],
  occupation: data.occupation || "",
  education: data.education || "",
  profilePicture: data.profilePicture || null,
  coverPhoto: data.coverPhoto || null,
  allowTagsFrom: data.allowTagsFrom || "everyone",
});
          setProfileImage(data.profilePicture || null);
          setCoverImage(data.coverPhoto || null);
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      // console.log("Profile data loaded:", data);

      setProfileData({
        username: data.username || user?.username || "",
        fullname: data.fullname || "",
        bio: data.bio || "",
        location: data.location || "",
        website: data.website || "",
        dob: data.dob ? new Date(data.dob) : new Date(1990, 0, 1),
        email: data.email || user?.email || "",
        phone: data.phone || "",
        gender: data.gender || "",
        isPrivate: data.isPrivate || false,
        interests: data.interests || [],
        occupation: data.occupation || "",
        education: data.education || "",
        profilePicture: user?.profilePicture || null,
        coverPicture: user?.coverPhoto || null,
        allowTagsFrom: data.allowTagsFrom || "everyone",
      });
      setProfileImage(user?.profilePicture || null);
      setCoverImage(user?.coverPhoto || null);

      // console.log('Profile data being sent:', profileData);
// console.log('allowTagsFrom value:', profileData.allowTagsFrom);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error(
        "Error: Failed to load profile information. " + error.message
      );
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };
    // Delete account handler
  const handleDeleteAccount = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_ENDPOINTS.AUTH}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deleteUserData: deleteUserDataOption }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete account");
      router.push("/login");
      toast.success(data.message);
      
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setSubmitting(false);
      setShowDeleteDialog(false);
    }
  };
  const handleDeactivateAccount = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_ENDPOINTS.AUTH}/deactivate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to deactivate account");
      toast.success(data.message);
      await logout();
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "Failed to deactivate account");
    } finally {
      setSubmitting(false);
      setShowDeactivateDialog(false);
    }
  };

  const uploadImage = async (file, type) => {
    try {
      const base64Image = await fileToBase64(file);
      const response = await fetch(`${API_ENDPOINTS.MEDIA}/upload/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image, type }),
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${type} image: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Uploaded ${type} image, URL:`, data.imageUrl);
      return data.imageUrl;
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      toast.error(`Error uploading ${type} image: ${error.message}`);
      return null;
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Basic validation
      const errors = {};
      if (!profileData.username) errors.username = "Username is required";
      if (!profileData.fullname) errors.fullname = "Name is required";
      if (profileData.bio && profileData.bio.length > 250)
        errors.bio = "Bio must be 250 characters or less";

      if (Object.keys(errors).length > 0) {
        setProfileErrors(errors);
        return;
      }

      setSubmitting(true);
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Not available in web

      // Prepare form data for image upload
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (
          key !== "profilePicture" &&
          key !== "coverPhoto" &&
          profileData[key] !== null
        ) {
          if (key === "dob") {
            formData.append(key, profileData[key].toISOString());
          } else if (key === "interests" && Array.isArray(profileData[key])) {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });

      // Add profile image if changed
      if (profileImage && profileImage !== profileData.profilePicture) {
        try {
          // For web, profileImage would be a File object or blob URL
          if (profileImage instanceof File) {
            console.log(
              `Adding profile picture: ${profileImage.name} (${profileImage.type})`
            );
            formData.append("profilePicture", profileImage);
          } else {
            // Handle blob URL case
            const response = await fetch(profileImage);
            const blob = await response.blob();
            const fileName = `profile.${blob.type.split("/")[1] || "jpeg"}`;
            console.log(`Adding profile picture: ${fileName} (${blob.type})`);
            formData.append("profilePicture", blob, fileName);
          }
        } catch (error) {
          console.error("Error preparing profile image:", error);
          toast.error("Failed to prepare profile image for upload");
        }
      }

      // Add cover image if changed
      if (coverImage && coverImage !== profileData.coverPhoto) {
        try {
          // For web, coverImage would be a File object or blob URL
          if (coverImage instanceof File) {
            console.log(
              `Adding cover photo: ${coverImage.name} (${coverImage.type})`
            );
            formData.append("coverPhoto", coverImage);
          } else {
            // Handle blob URL case
            const response = await fetch(coverImage);
            const blob = await response.blob();
            const fileName = `cover.${blob.type.split("/")[1] || "jpeg"}`;
            console.log(`Adding cover photo: ${fileName} (${blob.type})`);
            formData.append("coverPhoto", blob, fileName);
          }
        } catch (error) {
          console.error("Error preparing cover image:", error);
          toast.error("Failed to prepare cover image for upload");
        }
      }

      // When sending the request, make sure you don't set any additional headers
      // that would interfere with the content-type boundary
      const response = await fetch(`${API_ENDPOINTS.USER}/profiles`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set 'Content-Type' here - Browser will set it
          // correctly with the boundary for multipart/form-data
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUserData = await response.json();
      // updateUserInfo(updatedUserData);
      // console.log('Profile data being sent:', profileData);
      // console.log('allowTagsFrom value:', profileData.allowTagsFrom);
      toast.success("Profile updated successfully");
      // Update the auth context with new user data if this is the current user's profile
      if (
        updatedUserData.user &&
        user &&
        updatedUserData.user._id === user._id
      ) {
        console.log("Updating auth context with new user data");
        await updateUserInfo(updatedUserData.user);
      }
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[field];
        return updatedErrors;
      });
    }
  };

  const openImagePicker = (type) => {
    setImageActionType(type);
    setIsBottomSheetVisible(true);
  };

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.error("No file selected for upload");
      toast.error("Please select an image file");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type);
      toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    if (file.size > maxSize) {
      console.error("File too large:", file.size);
      toast.error("Image file must be smaller than 5MB");
      return;
    }
    console.log("Selected file:", file.name, file.type, file.size);
    if (imageActionType === "profile") setProfileImage(file);
    else if (imageActionType === "cover") setCoverImage(file);
    setIsBottomSheetVisible(false);
  };

  const handleCustomBottomSheet = () => {
    if (!isBottomSheetVisible) return null;
    return (
      <div className="fixed inset-0 bg-black/50 opacity-100 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-4 w-full max-w-2xl max-h-[70vh] overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col items-center mb-4">
            <div className="w-10 h-1 bg-gray-300 rounded mb-3" />
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-bold text-gray-800 flex-1 text-center">
                {imageActionType === "profile"
                  ? "Change Profile Picture"
                  : "Change Cover Picture"}
              </h2>
              <button
                onClick={() => setIsBottomSheetVisible(false)}
                className="p-1 ml-4"
              >
                <X className="text-gray-600 cursor-pointer w-6 h-6" />
              </button>
            </div>
          </div>

          <label className="flex flex-row items-center py-3 px-4 mb-3 bg-sky-50 rounded-xl cursor-pointer hover:bg-sky-100 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelection}
              className="hidden"
            />
            <Camera className="text-primary w-6 h-6" />
            <span className="ml-3 text-primary font-medium text-base">
              Choose from Gallery
            </span>
          </label>

          {(imageActionType === "profile" && profileImage) ||
          (imageActionType === "cover" && coverImage) ? (
            <button
              className="flex flex-row items-center py-3  cursor-pointer px-4 mb-3 bg-red-50 rounded-xl w-full text-left hover:bg-red-100 transition-colors"
              onClick={() => {
                if (imageActionType === "profile") setProfileImage(null);
                else setCoverImage(null);
                setIsBottomSheetVisible(false);
              }}
            >
              <X className="text-red-500 w-6 h-6 cursor-pointer" />
              <span className="ml-3 text-red-500 font-medium text-base">
                Remove Photo
              </span>
            </button>
          ) : null}

          <button
            className="flex items-center cursor-pointer justify-center py-3 px-4 mt-4 bg-gray-100 rounded-xl w-full hover:bg-gray-200 transition-colors"
            onClick={() => setIsBottomSheetVisible(false)}
          >
            <span className="text-gray-700 font-medium text-base cursor-pointer">
              Cancel
            </span>
          </button>
        </div>
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="flex mt-3 w-xl items-center justify-center  text-gray-600">
          Loading profile
        </p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="mt-3 text-gray-600">No profile data found</p>
        <button
          className="mt-4 py-2 px-4 bg-primary cursor-pointer rounded-lg text-white hover:bg-sky-600 transition-colors"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto h-screen custom-scrollbar relative">
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full sm:w-md md:max-w-lg lg:w-xl bg-white">
          <header className="flex flex-row items-center justify-between py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 fixed sm:sticky max-sm:top-15 top-0 left-0 right-0 sm:left-auto sm:right-auto z-50 backdrop-blur-sm bg-white/95 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
            {" "}
            <h1 className="text-base sm:text-lg text-gray-900">Edit Profile</h1>
            <button
              className={`py-2 px-4 cursor-pointer bg-primary rounded-full hover:bg-sky-600 transition-colors ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleUpdateProfile}
              disabled={submitting}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-white cursor-pointer text-sm">Save</span>
              )}
            </button>
          </header>

          <div className="relative w-full h-32 sm:h-40 md:h-48">
            {coverImage && typeof coverImage === "object" ? (
              <Image
                src={URL.createObjectURL(coverImage)}
                alt="Cover"
                className="w-full h-full object-cover"
                width={800}
                height={160}
                onError={() => console.error("Failed to load cover image")}
              />
            ) : profileData.coverPicture ? (
              <Image
                src={profileData.coverPicture}
                alt="Cover"
                className="w-full h-full object-cover cursor-pointer"
                width={800}
                height={160}
                onError={(e) => {
                  console.error("Failed to load cover picture");
                  e.currentTarget.src = defaultCover.src;
                }}
                priority
              />
            ) : (
              <Image
                src={defaultCover}
                alt="Default Cover"
                className="w-full h-full cursor-pointer object-cover"
                width={800}
                height={160}
                priority
              />
            )}

            {/* Add cover edit button */}
            <button
              className="absolute top-4 cursor-pointer right-4 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              onClick={() => openImagePicker("cover")}
            >
              <Camera className="text-white w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center -mt-10 sm:-mt-12 mb-4 sm:mb-6">
            <div className="relative rounded-full border-2 sm:border-4 border-white overflow-hidden">
              {profileImage && typeof profileImage === "object" ? (
                <Image
                  src={URL.createObjectURL(profileImage)}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                  width={96}
                  height={96}
                  onError={() => console.error("Failed to load profile image")}
                />
              ) : profileData.profilePicture ? (
                <Image
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  width={96}
                  height={96}
                  onError={() =>
                    console.error("Failed to load profile picture")
                  }
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-400">
                    {profileData.fullname
                      ? profileData.fullname.substring(0, 2).toUpperCase()
                      : "U"}
                  </span>
                </div>
              )}
              <button
                className="absolute right-8 cursor-pointer bottom-8 bg-primary w-8 h-8 rounded-full flex items-center justify-center border-2 border-white hover:bg-sky-600 transition-colors"
                onClick={() => openImagePicker("profile")}
              >
                <Camera className="text-white w-4 h-4" />
              </button>
            </div>
          </div>

          <form
            className="p-2 sm:p-4 space-y-3 sm:space-y-4"
            onSubmit={handleUpdateProfile}
          >
            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Username
              </label>
              <div
                className={`flex flex-row items-center bg-gray-50 border rounded-xl overflow-hidden ${
                  profileErrors.username ? "border-red-500" : "border-gray-200"
                }`}
              >
                <AtSign className="text-gray-400 w-5 h-5 ml-3" />
                <input
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                  value={profileData.username || ""}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Your username"
                  autoCapitalize="none"
                />
              </div>
              {profileErrors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {profileErrors.username}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">Name</label>
              <div
                className={`flex flex-row items-center bg-gray-50 border rounded-xl overflow-hidden ${
                  profileErrors.fullname ? "border-red-500" : "border-gray-200"
                }`}
              >
                <User className="text-gray-400 cursor-pointer w-5 h-5 ml-3" />
                <input
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                  value={profileData.fullname || ""}
                  onChange={(e) =>
                    handleInputChange("fullname", e.target.value)
                  }
                  placeholder="Your full name"
                />
              </div>
              {profileErrors.fullname && (
                <p className="text-red-500 text-xs mt-1">
                  {profileErrors.fullname}
                </p>
              )}
            </div>

            <div>
              <div className="flex flex-row justify-between items-center mb-1.5">
                <label className="text-sm text-gray-500">Bio</label>
                <span className="text-xs text-gray-400">
                  {profileData.bio?.length || 0}/250
                </span>
              </div>
              <textarea
                className={`bg-gray-50 border rounded-xl p-3 h-24 text-gray-800 w-full resize-none ${
                  profileErrors.bio ? "border-red-500" : "border-gray-200"
                }`}
                value={profileData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell others about yourself"
                maxLength={250}
              />
              {profileErrors.bio && (
                <p className="text-red-500 text-xs mt-1">{profileErrors.bio}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Location
              </label>
              <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <MapPin className="text-gray-400 cursor-pointer w-5 h-5 ml-3" />
                <input
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                  value={profileData.location || ""}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Your location"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Website
              </label>
              <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <LinkIcon className="text-gray-400 cursor-pointer w-5 h-5 ml-3" />
                <input
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                  value={profileData.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="Your website"
                  autoCapitalize="none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Date of Birth
              </label>
              <button
                type="button"
                className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden w-full"
                onClick={() => setIsCalendarVisible(true)}
              >
                <Calendar className="text-gray-400 w-5 h-5 ml-3" />
                <span className="flex-1 py-3 px-2 text-gray-800 text-left">
                  {profileData.dob
                    ? formatDate(profileData.dob)
                    : "Select your date of birth"}
                </span>
              </button>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Email
              </label>
              <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <Mail className="text-gray-400 cursor-pointer w-5 h-5 ml-3" />
                <input
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                  value={profileData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Phone
              </label>
              <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <Phone className="text-gray-400 cursor-pointer w-5 h-5 ml-3" />
                <input
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                  value={profileData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Your phone number"
                  keyboardType="phone-pad"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Gender
              </label>
              <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <User className="text-gray-400 w-5 h-5 ml-3" />
                <select
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent cursor-pointer"
                  value={profileData.gender || ""}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Occupation
              </label>
              <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <Briefcase className="text-gray-400 w-5 h-5 ml-3" />
                <input
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                  value={profileData.occupation || ""}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                  placeholder="Your occupation"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Education
              </label>
              <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <Book className="text-gray-400 w-5 h-5 ml-3" />
                <input
                  className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                  value={profileData.education || ""}
                  onChange={(e) =>
                    handleInputChange("education", e.target.value)
                  }
                  placeholder="Your education"
                />
              </div>
            </div>

            <div>
  <label className="text-sm text-gray-500 mb-1.5 block">
    Who can tag you in posts
  </label>
  <div className="flex flex-row items-center bg-gray-50 border border-gray-200  rounded-xl overflow-hidden">
    <Shield className="text-gray-400 w-5 h-5 ml-3" />
    <select
      className="flex-1 py-3 px-2 text-gray-800 cursor-pointer outline-none bg-transparent "
      value={profileData.allowTagsFrom || "everyone"}
      onChange={(e) => handleInputChange("allowTagsFrom", e.target.value)}
    >
      <option value="everyone">Everyone</option>
      <option value="followers">Only followers</option>
    </select>
  </div>
</div>
            
            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                Interests
              </label>
              <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <input
                  className="flex-1 py-3 px-3 text-gray-800 outline-none bg-transparent"
                  value={profileData.interests?.join(", ") || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "interests",
                      e.target.value.split(", ").filter(Boolean)
                    )
                  }
                  placeholder="Your interests (comma separated)"
                />
              </div>
            </div>
          </form>

          {/* Custom Calendar Modal */}
          {isCalendarVisible && (
            <CustomCalendar
              selectedDate={profileData.dob}
              onDateSelect={(date) => handleInputChange("dob", date)}
              onClose={() => setIsCalendarVisible(false)}
            />
          )}

          {/* Image Picker Bottom Sheet */}
          {handleCustomBottomSheet()}
          <div className="mt-8 px-4 pb-8 flex flex-col gap-4">
  <button
    className="w-full py-3 flex items-center justify-center gap-2 bg-amber-200 text-gray-900 rounded-lg font-semibold hover:bg-amber-300 transition-colors cursor-pointer"
    onClick={() => setShowDeactivateDialog(true)}
  >
    Deactivate Account
  </button>
  
  <button
    className="w-full py-3 flex items-center justify-center gap-2 bg-rose-400 text-white rounded-lg font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
    onClick={() => setShowDeleteDialog(true)}
  >
    Delete Account
  </button>
</div>

{/* Delete Account Modal */}
<CustomModal
  visible={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  title="Delete Account"
>
  <div className="py-4 px-6">
    <div className="flex items-center mb-4">
      <span className="text-lg font-semibold text-rose-500">Delete Account</span>
    </div>
    <p className="mb-4 text-gray-700">
      Are you sure you want to <span className="font-bold text-rose-400">delete</span> your account? This action <span className="font-bold">cannot be undone</span>.
    </p>
    <div className="mb-4">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={deleteUserDataOption}
          onChange={e => setDeleteUserDataOption(e.target.checked)}
          className="cursor-pointer"
        />
        <span className="text-gray-700">Also delete my data</span>
      </label>
    </div>
    <div className="flex justify-end space-x-3 mt-6">
      <button
        className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition"
        onClick={() => setShowDeleteDialog(false)}
      >
        Cancel
      </button>
      <button
        className="px-4 py-2 rounded bg-rose-400 text-white font-semibold cursor-pointer hover:bg-rose-500 transition"
        onClick={handleDeleteAccount}
        disabled={submitting}
      >
        {submitting ? "Deleting..." : "Delete"}
      </button>
    </div>
  </div>
</CustomModal>

{/* Deactivate Account Modal */}
<CustomModal
  visible={showDeactivateDialog}
  onClose={() => setShowDeactivateDialog(false)}
  title="Deactivate Account"
>
  <div className="py-4 px-6">
    <div className="flex items-center mb-4">
      <span className="text-lg font-semibold text-amber-500">Deactivate Account</span>
    </div>
    <p className="mb-4 text-gray-700">
      Are you sure you want to <span className="font-bold text-amber-400">deactivate</span> your account? You can reactivate it by logging in again.
    </p>
    <div className="flex justify-end space-x-3 mt-6">
      <button
        className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition"
        onClick={() => setShowDeactivateDialog(false)}
      >
        Cancel
      </button>
      <button
        className="px-4 py-2 rounded bg-amber-200 text-gray-900 font-semibold cursor-pointer hover:bg-amber-300 transition"
        onClick={handleDeactivateAccount}
        disabled={submitting}
      >
        {submitting ? "Deactivating..." : "Deactivate"}
      </button>
    </div>
  </div>
</CustomModal>
        </div>
      </div>
    </div>
  );
};

export default EditPage;
