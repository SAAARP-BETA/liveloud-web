'use client'
import { useState } from 'react';
import LeftSidebar from "@/Components/LeftSidebar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import PointsSidebar from "@/Components/PointsSidebar"; // Add this import

export default function AppLayout({ children }) {
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className={`flex-1 lg:ml-70 p-4 transition-all duration-300 ${rightSidebarVisible ? 'lg:mr-80' : 'lg:mr-0'
          }`}>
          {children}
        </main>

        {/* Right Sidebar - Points (Hidden on mobile) */}
        <PointsSidebar
          isVisible={rightSidebarVisible}
          onClose={() => setRightSidebarVisible(false)}
        />
      </div>
    </ProtectedRoute>
  );
}