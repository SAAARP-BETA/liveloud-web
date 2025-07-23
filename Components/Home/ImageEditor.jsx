"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// Constants
const FRAME_WIDTH = 400;
const FRAME_HEIGHT = 300;
const MIN_SCALE = 1;
const MAX_SCALE = 3;

const ImageEditor = ({
  visible,
  onClose,
  imageUri,
  onSave,
  uploading = false,
  uploadProgress = 0,
  setUploading,
  setUploadProgress,
}) => {
  // Transform state
  const [transform, setTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });

  // Editing state
  const [editOptions, setEditOptions] = useState({
    rotate: 0,
    flip: { horizontal: false, vertical: false },
    filter: null,
  });

  // Gesture state
  const gestureState = useRef({
    isPanning: false,
    isZooming: false,
    lastX: 0,
    lastY: 0,
    initialDistance: 0,
    initialScale: 1,
  });

  // Reset transforms when image changes
  useEffect(() => {
    if (visible) {
      resetTransforms();
    }
  }, [visible, imageUri]);

  // Touch/Mouse event handlers
  const handleStart = (e) => {
    e.preventDefault();

    if (e.touches && e.touches.length === 2) {
      // Two finger touch - pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      gestureState.current.isZooming = true;
      gestureState.current.initialDistance = distance;
      gestureState.current.initialScale = transform.scale;
    } else {
      // Single touch/mouse - pan
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      gestureState.current.isPanning = true;
      gestureState.current.lastX = clientX;
      gestureState.current.lastY = clientY;
    }
  };

  const handleMove = (e) => {
    e.preventDefault();

    if (gestureState.current.isZooming && e.touches && e.touches.length === 2) {
      // Handle pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (gestureState.current.initialDistance > 0) {
        const scale =
          gestureState.current.initialScale *
          (distance / gestureState.current.initialDistance);
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

        setTransform((prev) => ({
          ...prev,
          scale: newScale,
        }));
      }
    } else if (gestureState.current.isPanning && transform.scale > 1) {
      // Handle pan only when zoomed
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - gestureState.current.lastX;
      const deltaY = clientY - gestureState.current.lastY;

      // Calculate bounds
      const scaledWidth = FRAME_WIDTH * transform.scale;
      const scaledHeight = FRAME_HEIGHT * transform.scale;

      const horizontalBound = Math.max(0, (scaledWidth - FRAME_WIDTH) / 2);
      const verticalBound = Math.max(0, (scaledHeight - FRAME_HEIGHT) / 2);

      const newX = Math.max(
        -horizontalBound,
        Math.min(horizontalBound, transform.x + deltaX)
      );
      const newY = Math.max(
        -verticalBound,
        Math.min(verticalBound, transform.y + deltaY)
      );

      setTransform((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));

      gestureState.current.lastX = clientX;
      gestureState.current.lastY = clientY;
    }
  };

  const handleEnd = (e) => {
    e.preventDefault();

    gestureState.current.isPanning = false;
    gestureState.current.isZooming = false;
    gestureState.current.initialDistance = 0;
  };

  // Handle wheel zoom
  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();

      const delta = event.deltaY;
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, transform.scale - delta * 0.001)
      );

      setTransform((prev) => ({
        ...prev,
        scale: newScale,
      }));
    },
    [transform.scale]
  );

  // Reset transforms
  const resetTransforms = () => {
    setTransform({
      scale: 1,
      x: 0,
      y: 0,
    });

    setEditOptions({
      rotate: 0,
      flip: { horizontal: false, vertical: false },
      filter: null,
    });
  };

  // Rotate the image
  const rotateImage = (degrees) => {
    setEditOptions((prev) => ({
      ...prev,
      rotate: (prev.rotate + degrees) % 360,
    }));
  };

  // Flip the image
  const flipImage = (direction) => {
    setEditOptions((prev) => ({
      ...prev,
      flip: {
        ...prev.flip,
        [direction]: !prev.flip[direction],
      },
    }));
  };

  // Apply filter
  const applyFilter = (filterType) => {
    setEditOptions((prev) => ({
      ...prev,
      filter: filterType,
    }));
  };

  // Get filter style for preview
  const getFilterStyle = () => {
    switch (editOptions.filter) {
      case "grayscale":
        return { filter: "grayscale(100%)" };
      case "sepia":
        return { filter: "sepia(100%)" };
      case "highContrast":
        return { filter: "contrast(150%)" };
      case "vintage":
        return { filter: "sepia(50%) saturate(120%)" };
      case "cool":
        return { filter: "hue-rotate(180deg)" };
      case "warm":
        return { filter: "hue-rotate(30deg) saturate(120%)" };
      default:
        return {};
    }
  };

  // Save edited image (simplified for web)
  const saveImage = async () => {
    try {
      if (setUploading) setUploading(true);
      if (setUploadProgress) setUploadProgress(10);

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (setUploadProgress) setUploadProgress(50);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (setUploadProgress) setUploadProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Pass the image URI and filter back to parent
      onSave(imageUri, editOptions.filter);

      if (setUploadProgress) setUploadProgress(100);
    } catch (error) {
      console.error("Error saving edited image:", error);
    } finally {
      if (setUploading) setUploading(false);
    }
  };

  if (!visible) return null;

  const transformStyle = {
    transform: `scale(${transform.scale}) translate(${transform.x}px, ${
      transform.y
    }px) rotate(${editOptions.rotate}deg) scaleX(${
      editOptions.flip.horizontal ? -1 : 1
    }) scaleY(${editOptions.flip.vertical ? -1 : 1})`,
    transition:
      gestureState.current.isPanning || gestureState.current.isZooming
        ? "none"
        : "transform 0.2s ease-out",
    ...getFilterStyle(),
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transform: visible ? "translateY(0%)" : "translateY(100%)",
        transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-lg font-bold">Fit to Frame</h2>

        <button
          onClick={saveImage}
          className="px-4 py-2 text-primary hover:text-sky-600 font-medium transition-colors"
        >
          Done
        </button>
      </div>

      {/* Image Preview Frame */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative border border-gray-600 rounded-lg overflow-hidden"
          style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
        >
          <div
            className="w-full h-full select-none"
            style={{
              cursor: transform.scale > 1 ? "move" : "grab",
              touchAction: "none",
              ...transformStyle,
            }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onWheel={handleWheel}
          >
            <img
              src={imageUri}
              alt="Edit preview"
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Edit Controls */}
      <div className="bg-gray-800 p-4 rounded-t-3xl">
        {/* Rotation Controls */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-medium mb-3">Adjust</h3>
          <div className="flex justify-around">
            <button
              onClick={() => rotateImage(-90)}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-1 group-hover:bg-gray-600 transition-colors">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-300">Left</span>
            </button>

            <button
              onClick={() => rotateImage(90)}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-1 group-hover:bg-gray-600 transition-colors">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-300">Right</span>
            </button>

            <button
              onClick={() => flipImage("horizontal")}
              className="flex flex-col items-center group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-colors ${
                  editOptions.flip.horizontal
                    ? "bg-primary"
                    : "bg-gray-700 group-hover:bg-gray-600"
                }`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-300">Flip H</span>
            </button>

            <button
              onClick={() => flipImage("vertical")}
              className="flex flex-col items-center group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-colors ${
                  editOptions.flip.vertical
                    ? "bg-primary"
                    : "bg-gray-700 group-hover:bg-gray-600"
                }`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-300">Flip V</span>
            </button>

            <button
              onClick={resetTransforms}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-1 group-hover:bg-gray-600 transition-colors">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-300">Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div>
          <h3 className="text-white text-lg font-medium mb-3">Filters</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              { name: "Normal", filter: null },
              { name: "B&W", filter: "grayscale" },
              { name: "Sepia", filter: "sepia" },
              { name: "Contrast", filter: "highContrast" },
              { name: "Vintage", filter: "vintage" },
              { name: "Cool", filter: "cool" },
              { name: "Warm", filter: "warm" },
            ].map(({ name, filter }) => (
              <button
                key={name}
                onClick={() => applyFilter(filter)}
                className="flex flex-col items-center group flex-shrink-0"
              >
                <div
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    editOptions.filter === filter
                      ? "border-primary"
                      : "border-gray-600"
                  }`}
                >
                  <img
                    src={imageUri}
                    alt={name}
                    className="w-full h-full object-cover"
                    style={filter ? getFilterStyle() : {}}
                  />
                </div>
                <span className="text-xs text-gray-300 mt-1">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-white mt-3 text-lg font-medium">
            Processing image...
          </p>
          <div className="w-64 h-2 bg-gray-700 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
