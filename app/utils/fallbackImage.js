// utils/imageUtils.js
import defaultPic from "../assets/avatar.png";

export const getProfilePicture = (profilePic) => {
  if (!profilePic) return defaultPic.src || defaultPic;
  if (typeof profilePic === "object" && profilePic.src) return profilePic.src;
  return profilePic;
};
