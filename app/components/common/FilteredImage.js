"use client";

import React from "react";
import Image from "next/image";

const FilteredImage = ({
  src,
  filterType,
  style,
  imageStyle,
  objectFit = "contain",//fit the entire image within the container
  ...props
}) => {
  // Get filter and overlay styles based on filter type
  const getFilterStyles = () => {
    if (!filterType) return { filter: "", overlayClass: "" };

    switch (filterType) {
      case "grayscale":
        return {
          filter: "grayscale(100%)",
          overlayClass: "bg-black/10 opacity-50",
        };
      case "sepia":
        return {
          filter: "sepia(100%)",
          overlayClass: "bg-[rgba(255,188,107,0.3)] opacity-60",
        };
      default:
        return { filter: "", overlayClass: "" };
    }
  };

  const { filter, overlayClass } = getFilterStyles();

  // Validate the source
  const validSrc = typeof src === "string" ? src.trim() : src?.uri?.trim();
  console.log("FilteredImage src:", validSrc, "filterType:", filterType); // Debug source

  if (!validSrc) {
    console.warn("Invalid src in FilteredImage:", src);
    return null; // Don't render anything if src is empty
  }

  return (
    <div
      className={`relative overflow-hidden ${style || ""}`}
      style={{ width: "100%", height: "100%", ...style }} // Enforce dimensions
      {...props}
    >
      <Image
        src={validSrc}
        alt="Filtered image"
        fill
        className={`w-full h-full ${imageStyle || ""}`}
        style={{ objectFit, filter, position: "absolute" }} // Explicit positioning
        sizes="(max-width: 768px) 100vw, 50vw"
        onError={(e) => console.error("Image load error:", validSrc, e)}
        onLoad={() => console.log("Image loaded:", validSrc)}
      />
      {filterType && <div className={`absolute inset-0 ${overlayClass}`} />}
    </div>
  );
};

export default FilteredImage;