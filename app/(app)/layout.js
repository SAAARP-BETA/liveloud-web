// "use client";
// import { useState, useEffect } from "react";
// import LeftSidebar from "@/app/components/LeftSidebar";
// import ProtectedRoute from "@/app/components/routes/ProtectedRoute";
// import PointsSidebar from "@/app/components/PointsSidebar";

// export default function AppLayout({ children }) {
//   const [rightSidebarVisible, setRightSidebarVisible] = useState(true);

//   useEffect(() => {
//     const handleWheel = (e) => {
//       const mainContent = document.querySelector(".main-scroll-target");
//       if (mainContent) {
//         mainContent.scrollTop += e.deltaY;
//       }
//     };

//     window.addEventListener("wheel", handleWheel, { passive: true });
//     return () => window.removeEventListener("wheel", handleWheel);
//   }, []);

//   return (
//     <ProtectedRoute>
//       <div className="flex h-screen bg-gray-50 overflow-hidden justify-center scroll-container">
//         {/* Container to center the layout */}
//         <div className="flex max-w-full">
//           {/* Left Sidebar */}
//           <LeftSidebar />

//           {/* Main Content */}
//           <main className="flex-1 w-full p-4 overflow-y-auto main-scroll-target custom-scrollbar">
//             {children}
//           </main>

//           {/* Right Sidebar - Points (Hidden on mobile) */}
//           <PointsSidebar
//             isVisible={rightSidebarVisible}
//             onClose={() => setRightSidebarVisible(false)}
//           />
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import LeftSidebar from "@/app/components/LeftSidebar";
import ProtectedRoute from "@/app/components/routes/ProtectedRoute";
import PointsSidebar from "@/app/components/PointsSidebar";
import combinedLogo from "@/app/assets/Liveloud.png";
import { Search, Bell, LogOut } from "lucide-react";
import { API_ENDPOINTS } from "../utils/config";
import { useAuth } from "../context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AppLayout({ children }) {
  const { token, logout, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    try {
      if (isAuthenticated && token) {
        await fetch(`${API_ENDPOINTS.AUTH}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await logout();
      router.replace("/(auth)/login");
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    const handleWheel = (e) => {
      const mainContent = document.querySelector(".main-scroll-target");
      if (mainContent) {
        mainContent.scrollTop += e.deltaY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="flex items-center justify-between px-4 bg-white border-b border-gray-200 shadow-sm">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/home">
                <Image
                  src={combinedLogo}
                  alt="Logo"
                  width={200}
                  height={20}
                  className="object-contain ml-[-18] mr-26 md:mr-18 sm:mr-10"
                  priority
                />
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center">
              <Link href="/explore">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <Link href="/home">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
              </Link>

              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </header>
        )}

        {/* Main Layout Container */}
        <div className="flex flex-1 overflow-hidden justify-center">
          {/* Centered Container */}
          <div className="flex max-w-full">
            {/* Left Sidebar */}
            <LeftSidebar />

            <main className="flex-1 w-full overflow-y-auto main-scroll-target custom-scrollbar">
              {children}
            </main>

            {/* Right Sidebar - Points */}
            <PointsSidebar
              isVisible={rightSidebarVisible}
              onClose={() => setRightSidebarVisible(false)}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// export default function AppLayout({ children }) {
//

//   return (
//     <ProtectedRoute>
//       <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
//         {/* Mobile Header */}
//         {isMobile && (
//           <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
//             {/* Logo */}
//             <div className="flex items-center">
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
//                   <span className="text-white font-bold text-sm">LL</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-lg font-bold text-gray-900">
//                     LIVE<span className="text-blue-500">LOUD</span>
//                   </span>
//                   <span className="text-xs text-gray-500 -mt-1">say it all unfiltered</span>
//                 </div>
//               </div>
//             </div>

//             {/* Right Icons */}
//             <div className="flex items-center space-x-4">
//               <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//                 <Search className="w-5 h-5 text-gray-600" />
//               </button>
//               <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
//                 <Bell className="w-5 h-5 text-gray-600" />
//                 {/* Notification dot */}
//                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
//               </button>
//               <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//                 <Share className="w-5 h-5 text-gray-600" />
//               </button>
//             </div>
//           </header>
//         )}

//         {/* Main Layout */}
//         <div className="flex flex-1 overflow-hidden justify-center scroll-container">
//           {/* Container to center the layout */}
//           <div className="flex max-w-full w-full">
//             {/* Left Sidebar - Hidden on mobile */}
//             {!isMobile && <LeftSidebar />}

//             {/* Main Content */}
//             <main className="flex-1 w-full p-4 overflow-y-auto main-scroll-target custom-scrollbar">
//               {children}
//             </main>

//             {/* Right Sidebar - Points (Hidden on mobile) */}
//             {!isMobile && (
//               <PointsSidebar
//                 isVisible={rightSidebarVisible}
//                 onClose={() => setRightSidebarVisible(false)}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }
