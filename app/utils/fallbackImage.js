// utils/imageUtils.js
import defaultPic from "../assets/Profilepic1.png";

export const getProfilePicture = (profilePic) => {
  if (!profilePic) return defaultPic.src || defaultPic;
  if (typeof profilePic === "object" && profilePic.src) return profilePic.src;
  return profilePic;
};
