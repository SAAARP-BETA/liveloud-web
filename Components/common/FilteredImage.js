"use client";

import React from "react";
import Image from "next/image";

const FilteredImage = ({
  source,
  filterType,
  style,
  imageStyle,
  objectFit = "cover",
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

  return (
    <div className={`relative overflow-hidden ${style || ""}`} {...props}>
      <Image
        src={typeof source === "string" ? source : source.uri}
        alt="Filtered image"
        className={`w-full h-full ${imageStyle || ""}`}
        style={{ objectFit, filter }}
        width={500} // Adjust based on your needs
        height={500} // Adjust based on your needs
        priority={false}
      />
      {filterType && <div className={`absolute inset-0 ${overlayClass}`} />}
    </div>
  );
};

export default FilteredImage;
