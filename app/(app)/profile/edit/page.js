"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import { fonts } from "../../../utils/fonts";
import { API_ENDPOINTS } from "../../../utils/config";
import { motion } from 'framer-motion';

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
} from "lucide-react";
import defaultCover from '../../../assets/Profilepic1.png';
const PROFILE_IMAGE_MAX_SIZE = 120;
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
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [imageActionType, setImageActionType] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user || !token) {
      console.log("Not authenticated or missing user/token, redirecting to login");
      alert("Not Authorized, please login to edit your profile");
      router.push("/login");
      return;
    }
    loadUserProfile();
  }, [isAuthenticated, authLoading, router, user, token]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.USER}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Session expired, redirecting to login");
          alert("Session expired. Please login again.");
          router.push("/login");
          return;
        }
        if (response.status === 404) {
          console.log("Profile not found, setting default profile");
          setProfileData({
            username: user?.username || "",
            fullname: user?.fullname || "",
            bio: user?.bio || "",
            location: "",
            website: "",
            dob: new Date(1990, 0, 1),
            email: user?.email || "",
            phone: "",
            gender: "",
            isPrivate: false,
            interests: [],
            occupation: "",
            education: "",
            profilePicture: user?.profilePicture || null,
            coverPicture: null,
          });
          setProfileImage(user?.profilePicture || null);
          setCoverImage(null);
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profile data loaded:", data);

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
        coverPicture: data.coverPicture || null,
      });
      setProfileImage(data.profilePicture || null);
      setCoverImage(data.coverPicture || null);
    } catch (error) {
      console.error("Error loading profile:", error);
      alert("Error: Failed to load profile information. " + error.message);
      router.push("/login");
    } finally {
      setLoading(false);
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
      alert(`Error uploading ${type} image: ${error.message}`);
      return null;
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
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

    try {
      let updatedProfilePicture = profileData.profilePicture;
      let updatedCoverPicture = profileData.coverPicture;

      if (profileImage && typeof profileImage === "object") {
        updatedProfilePicture = await uploadImage(profileImage, "profile");
        if (!updatedProfilePicture) return;
      }
      if (coverImage && typeof coverImage === "object") {
        updatedCoverPicture = await uploadImage(coverImage, "cover");
        if (!updatedCoverPicture) return;
      }

      const updateData = {
        bio: profileData.bio || "",
        location: profileData.location || "",
        website: profileData.website || "",
        fullname: profileData.fullname || "",
        phone: profileData.phone || "",
        gender: profileData.gender || "",
        occupation: profileData.occupation || "",
        education: profileData.education || "",
        isPrivate: profileData.isPrivate || false,
        interests: profileData.interests || [],
        profilePicture: updatedProfilePicture,
        coverPicture: updatedCoverPicture,
      };

      if (profileData.dob) {
        updateData.dob = profileData.dob.toISOString();
      }

      console.log("Sending PUT request to:", `${API_ENDPOINTS.USER}/profiles`);
      console.log("Request body:", JSON.stringify(updateData, null, 2));

      const response = await fetch(`${API_ENDPOINTS.USER}/profiles`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Server error" }));
        console.error("PUT response error:", errorData);
        if (errorData.code === "INVALID_ID") {
          alert("Invalid user ID. Please login again.");
          router.push("/login");
          return;
        }
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }

      const updatedUserData = await response.json();
      console.log("Profile update response:", updatedUserData);

      setProfileData((prevData) => ({
        ...prevData,
        ...updatedUserData,
        dob: updatedUserData.dob ? new Date(updatedUserData.dob) : prevData.dob,
      }));
      setProfileImage(updatedUserData.profilePicture || null);
      setCoverImage(updatedUserData.coverPicture || null);

      alert("Success: Profile updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error: " + (error.message || "Failed to update profile"));
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
      alert("Please select an image file");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type);
      alert("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    if (file.size > maxSize) {
      console.error("File too large:", file.size);
      alert("Image file must be smaller than 5MB");
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
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-10">
        <div className="bg-white rounded-t-2xl p-4 w-full max-w-2xl max-h-[70vh] overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col items-center mb-4">
            <div className="w-10 h-1 bg-gray-300 rounded mb-3" />
            <div className="flex justify-between items-center w-full">
              <h2
                className="text-xl font-bold text-gray-800 flex-1 text-center"
                style={{ fontFamily: fonts.Bold }}
              >
                {imageActionType === "profile"
                  ? "Change Profile Picture"
                  : "Change Cover Picture"}
              </h2>
              <button
                onClick={() => setIsBottomSheetVisible(false)}
                className="p-1 ml-4"
              >
                <X className="text-gray-600 w-6 h-6" />
              </button>
            </div>
          </div>

          <label className="flex flex-row items-center py-3 px-4 mb-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelection}
              className="hidden"
            />
            <Camera className="text-blue-700 w-6 h-6" />
            <span
              className="ml-3 text-blue-700 font-medium text-base"
              style={{ fontFamily: fonts.Medium }}
            >
              Choose from Gallery
            </span>
          </label>

          {(imageActionType === "profile" && profileImage) ||
            (imageActionType === "cover" && coverImage) ? (
            <button
              className="flex flex-row items-center py-3 px-4 mb-3 bg-red-50 rounded-xl w-full text-left hover:bg-red-100 transition-colors"
              onClick={() => {
                if (imageActionType === "profile") setProfileImage(null);
                else setCoverImage(null);
                setIsBottomSheetVisible(false);
              }}
            >
              <X className="text-red-500 w-6 h-6" />
              <span
                className="ml-3 text-red-500 font-medium text-base"
                style={{ fontFamily: fonts.Medium }}
              >
                Remove Photo
              </span>
            </button>
          ) : null}

          <button
            className="flex items-center justify-center py-3 px-4 mt-4 bg-gray-100 rounded-xl w-full hover:bg-gray-200 transition-colors"
            onClick={() => setIsBottomSheetVisible(false)}
          >
            <span
              className="text-gray-700 font-medium text-base"
              style={{ fontFamily: fonts.Medium }}
            >
              Cancel
            </span>
          </button>
        </div>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-gray-600" style={{ fontFamily: fonts.Medium }}>
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="mt-3 text-gray-600" style={{ fontFamily: fonts.Medium }}>
          No profile data found
        </p>
        <button
          className="mt-4 py-2 px-4 bg-sky-500 rounded-lg text-white hover:bg-sky-600 transition-colors"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-2xl bg-white">
        <header className="flex flex-row items-center justify-between py-3 px-4 bg-white border-b border-gray-100 sticky top-0 z-10">

          <h1
            className="text-lg text-gray-900"
            style={{ fontFamily: fonts.Bold }}
          >
            Edit Profile
          </h1>
          <button
            className={`py-2 px-4 bg-sky-500 rounded-full hover:bg-sky-600 transition-colors ${submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            onClick={handleUpdateProfile}
            disabled={submitting}
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span
                className="text-white text-sm"
                style={{ fontFamily: fonts.Medium }}
              >
                Save
              </span>
            )}
          </button>
        </header>
        <div className="relative w-full h-40">
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
      src={user?.coverPhoto || defaultCover}
      alt="Cover"
      className="w-full h-full object-cover"
      width={800}
      height={160}
      onError={(e) => {
        console.error("Failed to load cover picture");
        e.currentTarget.src = defaultCover.src; // ✅ important fix here
      }}
      priority
    />
  ) : (
    <Image
      src={defaultCover}
      alt="Default Cover"
      className="w-full h-full object-cover"
      width={800}
      height={160}
      priority
    />
  )}

  
</div>

        


        <div className="flex justify-center -mt-12 mb-6">
          <div className="relative rounded-full border-4 border-white overflow-hidden">
            {profileImage && typeof profileImage === "object" ? (
              <Image
                src={URL.createObjectURL(profileImage)}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
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
                onError={() => console.error("Failed to load profile picture")}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span
                  className="text-3xl text-gray-400"
                  style={{ fontFamily: fonts.Bold }}
                >
                  {profileData.fullname
                    ? profileData.fullname.substring(0, 2).toUpperCase()
                    : "U"}
                </span>
              </div>
            )}
            <button
              className="absolute right-0 bottom-0 bg-sky-500 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white hover:bg-sky-600 transition-colors"
              onClick={() => openImagePicker("profile")}
            >
              <Camera className="text-white w-4 h-4" />
            </button>
          </div>
        </div>

        <form className="p-4 space-y-4" onSubmit={handleUpdateProfile}>
          <div>
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Username
            </label>
            <div
              className={`flex flex-row items-center bg-gray-50 border rounded-xl overflow-hidden ${profileErrors.username ? "border-red-500" : "border-gray-200"
                }`}
            >
              <AtSign className="text-gray-400 w-5 h-5 ml-3" />
              <input
                className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                style={{ fontFamily: fonts.Regular }}
                value={profileData.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Your username"
                autoCapitalize="none"
              />
            </div>
            {profileErrors.username && (
              <p
                className="text-red-500 text-xs mt-1"
                style={{ fontFamily: fonts.Regular }}
              >
                {profileErrors.username}
              </p>
            )}
          </div>

          <div>
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Name
            </label>
            <div
              className={`flex flex-row items-center bg-gray-50 border rounded-xl overflow-hidden ${profileErrors.fullname ? "border-red-500" : "border-gray-200"
                }`}
            >
              <User className="text-gray-400 w-5 h-5 ml-3" />
              <input
                className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                style={{ fontFamily: fonts.Regular }}
                value={profileData.fullname || ""}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            {profileErrors.fullname && (
              <p
                className="text-red-500 text-xs mt-1"
                style={{ fontFamily: fonts.Regular }}
              >
                {profileErrors.fullname}
              </p>
            )}
          </div>

          <div>
            <div className="flex flex-row justify-between items-center mb-1.5">
              <label
                className="text-sm text-gray-500"
                style={{ fontFamily: fonts.Medium }}
              >
                Bio
              </label>
              <span
                className="text-xs text-gray-400"
                style={{ fontFamily: fonts.Regular }}
              >
                {profileData.bio?.length || 0}/250
              </span>
            </div>
            <textarea
              className={`bg-gray-50 border rounded-xl p-3 h-24 text-gray-800 w-full resize-none ${profileErrors.bio ? "border-red-500" : "border-gray-200"
                }`}
              style={{ fontFamily: fonts.Regular }}
              value={profileData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell others about yourself"
              maxLength={250}
            />
            {profileErrors.bio && (
              <p
                className="text-red-500 text-xs mt-1"
                style={{ fontFamily: fonts.Regular }}
              >
                {profileErrors.bio}
              </p>
            )}
          </div>

          <div>
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Location
            </label>
            <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <MapPin className="text-gray-400 w-5 h-5 ml-3" />
              <input
                className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                style={{ fontFamily: fonts.Regular }}
                value={profileData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Your location"
              />
            </div>
          </div>

          <div>
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Website
            </label>
            <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <LinkIcon className="text-gray-400 w-5 h-5 ml-3" />
              <input
                className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                style={{ fontFamily: fonts.Regular }}
                value={profileData.website || ""}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="Your website"
                autoCapitalize="none"
                type="url"
              />
            </div>
          </div>

          <div>
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Date of Birth
            </label>
            <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Calendar className="text-gray-400 w-5 h-5 ml-3" />
              <input
                type="date"
                className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                style={{ fontFamily: fonts.Regular }}
                value={
                  profileData.dob
                    ? profileData.dob.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleInputChange("dob", new Date(e.target.value))
                }
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div>
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Email
            </label>
            <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Mail className="text-gray-400 w-5 h-5 ml-3" />
              <input
                className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                style={{ fontFamily: fonts.Regular }}
                value={profileData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Your email"
                autoCapitalize="none"
                type="email"
              />
            </div>
          </div>

          <div>
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Phone
            </label>
            <div className="flex flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Phone className="text-gray-400 w-5 h-5 ml-3" />
              <input
                className="flex-1 py-3 px-2 text-gray-800 outline-none bg-transparent"
                style={{ fontFamily: fonts.Regular }}
                value={profileData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Your phone number"
                type="tel"
              />
            </div>
          </div>

          <div>
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Gender
            </label>
            <div className="flex flex-row flex-wrap gap-2">
              {["Male", "Female", "Non-binary", "Prefer not to say"].map(
                (gender) => (
                  <button
                    key={gender}
                    type="button"
                    className={`px-4 py-2 rounded-full transition-colors ${profileData.gender === gender
                        ? "bg-sky-500 text-white"
                        : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    onClick={() => handleInputChange("gender", gender)}
                  >
                    <span style={{ fontFamily: fonts.Medium }}>{gender}</span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex flex-row justify-between items-center bg-white p-4 rounded-xl">
              <div className="flex-1 pr-4">
                <p
                  className="text-gray-800 mb-1"
                  style={{ fontFamily: fonts.Medium }}
                >
                  Private Account
                </p>
                <p
                  className="text-gray-500 text-xs"
                  style={{ fontFamily: fonts.Regular }}
                >
                  When your account is private, only people you approve can see
                  your photos and videos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.isPrivate}
                  onChange={(e) =>
                    handleInputChange("isPrivate", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Occupation
            </label>
            <div className="flex flex-row items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
              <Briefcase className="text-gray-400 w-5 h-5 ml-3" />
              <input
                className="flex-1 py-3 px-2 text-gray-800 outline-none"
                style={{ fontFamily: fonts.Regular }}
                value={profileData.occupation || ""}
                onChange={(e) =>
                  handleInputChange("occupation", e.target.value)
                }
                placeholder="Your occupation"
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              className="text-sm text-gray-500 mb-1.5 block"
              style={{ fontFamily: fonts.Medium }}
            >
              Education
            </label>
            <div className="flex flex-row items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
              <Book className="text-gray-400 w-5 h-5 ml-3" />
              <input
                className="flex-1 py-3 px-2 text-gray-800 outline-none"
                style={{ fontFamily: fonts.Regular }}
                value={profileData.education || ""}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="Your education"
              />
            </div>
          </div>

          {handleCustomBottomSheet()}
        </form>
      </div>
    </div>
  );
};

export default EditPage;