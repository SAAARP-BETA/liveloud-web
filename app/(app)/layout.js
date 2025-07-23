'use client'
import { useState, useEffect } from 'react';
import LeftSidebar from "@/Components/LeftSidebar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import PointsSidebar from "@/Components/PointsSidebar";

export default function AppLayout({ children }) {
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true);

  useEffect(() => {
  const handleWheel = (e) => {
    const mainContent = document.querySelector('.main-scroll-target');
    if (mainContent) {
      mainContent.scrollTop += e.deltaY;
    }
  };

  window.addEventListener('wheel', handleWheel, { passive: true });
  return () => window.removeEventListener('wheel', handleWheel);
}, []);
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden justify-center scroll-container">
        {/* Container to center the layout */}
        <div className="flex max-w-full">
          {/* Left Sidebar */}
          <LeftSidebar />
          
          {/* Main Content */}
          <main className="flex-1 w-full p-4 overflow-y-auto main-scroll-target custom-scrollbar">
  {children}
</main>
          
          {/* Right Sidebar - Points (Hidden on mobile) */}
          <PointsSidebar 
            isVisible={rightSidebarVisible}
            onClose={() => setRightSidebarVisible(false)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}