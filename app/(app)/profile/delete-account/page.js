"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { API_ENDPOINTS } from "@/app/utils/config";
import { toast } from "react-hot-toast";
import { AlertTriangle, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [deleteUserDataOption, setDeleteUserDataOption] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

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

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      toast.success(data.message || "Account deleted successfully");
      await logout();
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Delete Account
          </h1>
        </div>

        {/* Warning Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Warning: This action cannot be undone
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Deleting your account will permanently remove:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
                <li>Your profile and account information</li>
                <li>All your posts and comments</li>
                <li>Your followers and following connections</li>
                <li>Your messages and conversations</li>
                <li>Your points and achievements</li>
                <li>All other data associated with your account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delete Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleDeleteAccount} className="space-y-6">
            {/* Delete User Data Option */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteUserDataOption}
                  onChange={(e) => setDeleteUserDataOption(e.target.checked)}
                  className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <div>
                  <span className="text-base font-medium text-gray-900 dark:text-white block">
                    Also delete my data
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Remove all posts, comments, and content you've created. If unchecked, your
                    content will be anonymized but remain visible.
                  </span>
                </div>
              </label>
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white outline-none transition"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/profile"
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || confirmText !== "DELETE"}
                className={`flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center ${
                  (submitting || confirmText !== "DELETE")
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {submitting ? "Deleting Account..." : "Delete Account Permanently"}
              </button>
            </div>
          </form>
        </div>

        {/* Alternative Actions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Not sure about deleting?
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
            Consider deactivating your account instead. You can reactivate it anytime by logging
            back in.
          </p>
          <Link
            href="/profile/deactivate-account"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Deactivate Account Instead →
          </Link>
        </div>
      </div>
    </div>
  );
}
