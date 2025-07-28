"use client";
import React, { useState, useEffect } from "react";
import { reportReasons, handleReportPost } from "../../utils/postFunctions";
import toast from "react-hot-toast";
import { getProfilePicture } from "@/app/utils/fallbackImage";

// Flag icon component to replace Feather icons
const FlagIcon = ({ size = 20, color = "#64748B" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const ReportModal = ({ visible, onClose, post, token, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedReason(null);
      setCustomReason("");
      setShowCustomInput(false);
    }
  }, [visible]);

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    if (reason.text === "Other") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      submitReport(reason.text);
    }
  };

  const submitReport = async (reasonText) => {
    if (!post || !token) {
      toast.error("Unable to report post. Please try again later.");
      onClose();
      return;
    }

    if (reasonText === "Other") {
      if (!customReason.trim()) {
        toast.error("Please provide details for your report.");
        return;
      }
      reasonText = `Other: ${customReason.trim()}`;
    }

    setIsSubmitting(true);
    try {
      await handleReportPost(post.id, reasonText, token);
      toast.success("Report submitted. Our team will review it shortly.");
      if (onSuccess) onSuccess(post.id);
      onClose();
    } catch (error) {
      toast.error(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 opacity-100 flex items-center justify-center z-50">
      <div
        className="absolute cursor-pointer inset-0 opacity-100"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      <div className="bg-white w-full max-w-md max-h-[90%] rounded-[20px] overflow-hidden shadow-lg z-20 flex flex-col">
        <div className="w-full flex items-center justify-center pt-3 pb-3">
          <div className="w-10 h-[5px] rounded-[3px] bg-gray-300" />
        </div>

        <div className="p-4">
          <h2 className="text-lg text-gray-800 mb-2 cursor-pointer">
            Report Post
          </h2>
          <p className="text-base text-gray-500 mb-4 cursor-pointer">
            Why are you reporting this post?
          </p>

          {post && (
            <div className="flex flex-row items-center p-3 mb-4 bg-gray-50 rounded-xl">
              <img
                src={getProfilePicture(post.profilePic)}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />

              <div className="ml-3 flex-1">
                <p className="text-base text-gray-800 mb-0.5">
                  {post.username}
                </p>
                <p className="text-sm text-gray-500">
                  {post.content?.substring(0, 60) ||
                    post.text?.substring(0, 60)}
                  {post.content?.length > 60 || post.text?.length > 60
                    ? "..."
                    : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {isSubmitting ? (
          <div className="p-8 flex items-center justify-center flex-col">
            <div className="w-8 h-8 border-3 border-gray-300 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-base text-gray-500">Submitting report...</p>
          </div>
        ) : showCustomInput ? (
          <div className="p-4">
            <label className="text-base text-gray-800 mb-2 block">
              Please provide details:
            </label>
            <textarea
              className="bg-gray-100 rounded-xl p-4 min-h-[100px] text-base resize-y w-full border-none outline-none"
              placeholder="Explain why you're reporting this post..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              autoFocus
              rows={4}
            />
            <div className="flex flex-row mt-4">
              <button
                className="bg-gray-300 rounded-xl py-3 px-5 mr-3"
                onClick={() => {
                  setShowCustomInput(false);
                  setSelectedReason(null);
                }}
              >
                <span className="text-gray-600 text-base cursor-pointer">
                  Back
                </span>
              </button>
              <button
                className="bg-primary rounded-xl py-3 px-5"
                onClick={() => submitReport("Other")}
              >
                <span className="text-white text-base cursor-pointer">
                  Submit Report
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {reportReasons.map((reason) => (
              <button
                key={reason.id}
                className="flex flex-row cursor-pointer items-center py-4 px-6 border-t border-gray-200 hover:bg-gray-100 w-full text-left"
                onClick={() => handleReasonSelect(reason)}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <FlagIcon size={20} color="#64748B" />
                </div>
                <span className="text-base text-gray-800">{reason.text}</span>
              </button>
            ))}
          </div>
        )}

        <button
          className="bg-gray-100 cursor-pointer hover:bg-gray-200 p-4 flex items-center justify-center mt-2"
          onClick={onClose}
        >
          <span className="text-base text-gray-600">Cancel</span>
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
