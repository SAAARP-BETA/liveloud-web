"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import logo from "../public/liveloud-logo.svg"
import {
  Home,
  Search,
  PlusCircle,
  Wallet,
  User,
  LogOut,
  AlignEndHorizontal
} from "lucide-react"
import { useAuth } from "../app/context/AuthContext" // Adjust path as needed
import { API_ENDPOINTS } from "../app/utils/config" // Adjust path as needed

const tabs = [
  
  { name: "Home", href: "/home", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Create", href: "/create", icon: PlusCircle },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Profile", href: "/profile", icon: User },
  {
    name: "Leaderboarddddddddddddddddddddddddddd", href: "/leaderboard", icon: AlignEndHorizontal
    
   },
]

export default function LeftSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { token, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    try {
      // Show loading state or disable button here if needed
      console.log("Logging out...")
      
      // Call logout API if user is authenticated and has a token
      if (isAuthenticated && token) {
        try {
          await fetch(`${API_ENDPOINTS.AUTH}/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (apiError) {
          console.error('Error during API logout:', apiError);
          // Continue with local logout even if API fails
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always log out locally regardless of API response
      await logout();
      
      // Show success message (you can replace with your preferred notification method)
      // For web, you might want to use a toast notification instead of alert
      // if (typeof window !== 'undefined' && window.alert) {
      //   window.alert('Logout Successful - You have been logged out.');
      // }
      
      // Redirect to login page
      router.replace('/(auth)/login');
    }
  }

  const TabButton = ({ tab }) => {
    const isActive = pathname === tab.href
    const Icon = tab.icon

    const iconAnimation = {
      rotate: isActive ? 360 : 0,
      scale: isActive ? 1.2 : 1,
    }

    const iconTransition = {
      type: "spring",
      stiffness: 300,
      damping: 20,
      rotate: { duration: 0.6, ease: "easeInOut" },
    }

    const iconClass = `w-6 h-6 transition-colors duration-300 ${
      isActive ? "text-[#0EA5E9]" : "text-gray-400"
    }`

    return (
      <>
        {/* Mobile tab */}
        <div className="sm:hidden">
          <Link
            href={tab.href}
            className="relative flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="mobile-active-pill"
                  className="absolute inset-0 bg-[rgba(14,165,233,0.15)] rounded-2xl shadow-sm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    opacity: { duration: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>
            <motion.div
              className="relative z-10 flex items-center justify-center h-6"
              animate={iconAnimation}
              transition={iconTransition}
            >
              <Icon className={iconClass} />
            </motion.div>
            <motion.span
              className={`text-xs font-medium relative z-10 transition-all duration-300 ${
                isActive ? "text-[#0EA5E9]" : "text-gray-500"
              }`}
              animate={{
                scale: isActive ? 1.05 : 1,
                fontWeight: isActive ? 600 : 500,
              }}
              transition={{ duration: 0.2 }}
            >
              {tab.name}
            </motion.span>
          </Link>
        </div>

        {/* Desktop tab */}
        <div className="hidden sm:block">
          <Link
            href={tab.href}
            className={`group flex items-center gap-2 pl-1 lg:pl-4 pr-4 py-2.5 rounded-xl transition-all duration-300 ${
              isActive
                ? "bg-[rgba(14,165,233,0.1)] text-[#0EA5E9] font-semibold shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <motion.div
              className="flex items-center justify-center w-6 h-6"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={iconAnimation}
              transition={iconTransition}
            >
              <Icon
                className={`w-6 h-6 transition-colors duration-300 ${
                  isActive
                    ? "text-[#0EA5E9]"
                    : "text-gray-500 group-hover:text-[#0EA5E9]"
                }`}
              />
            </motion.div>
            <motion.span
              className="text-base transition-colors duration-200 group-hover:text-[#0EA5E9] sm:hidden lg:inline"
              animate={{
                color: isActive ? "#0EA5E9" : "#6b7280",
              }}
              transition={{ duration: 0.2 }}
            >
              {tab.name}
            </motion.span>
          </Link>
        </div>
      </>
    )
  }

  const LogoutButton = () => {
    // Don't show logout button if user is not authenticated
    if (!isAuthenticated) return null;
    
    return (
      <>
        {/* Mobile logout button */}
        {/* Mobile logout button */}
<div className="sm:hidden">
  <button
    onClick={handleLogout}
    className="relsative flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
  >
    <motion.div
      className="relative z-10 flex items-center justify-center h-6"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{ rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <LogOut className="w-6 h-6 text-red-500 transition-colors duration-300" />
    </motion.div>
    <motion.span
      className="text-xs font-medium relative z-10 text-red-500 transition-all duration-300"
      animate={{ scale: 1, fontWeight: 500 }}
      transition={{ duration: 0.2 }}
    >
      Logout
    </motion.span>
  </button>
</div>


        {/* Desktop logout button */}
        <div className="">
          <button
            onClick={handleLogout}
            className="group sm:flex items-center gap-4 px-2 lg:px-4 py-3 rounded-xl transition-all duration-300 text-red-600 hover:bg-red-50 w-full hidden"
          >
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-6 h-6 transition-colors duration-300 text-red-500 group-hover:text-red-600" />
            </motion.div>
            <span className="text-base transition-colors duration-200 group-hover:text-red-600  hidden lg:block">
              Logout
            </span>
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Bottom Nav */}
      <motion.nav
        className="fixed bottom-3 left-3 right-3 z-50 rounded-2xl overflow-hidden shadow-xl md:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full" />
          <div className="flex justify-center items-center px-2 py-3 safe-area-pb">
            {tabs.map((tab, index) => (
              <motion.div
                key={tab.name}
                className="flex-1"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <TabButton tab={tab} />
              </motion.div>
            ))}
            {/* Logout button for mobile - only show if authenticated */}
            {isAuthenticated && (
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: tabs.length * 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <LogoutButton />
              </motion.div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />
        </div>
      </motion.nav>

      {/* Desktop Left Sidebar */}
      <motion.aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-20 lg:w-64 px-6 py-8 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-xl z-50 flex-col"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Image src={logo} alt="logo" width={180} className="h-auto hidden lg:flex"/>
        <nav className="flex flex-col gap-4 mt-5 flex-1">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TabButton tab={tab} />
            </motion.div>
          ))}
        </nav>
        
        {/* Logout button at the bottom of desktop sidebar - only show if authenticated */}
        {isAuthenticated && (
          <motion.div
            className="mt-auto pt-4 border-t border-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (tabs.length + 1) * 0.1 }}
          >
            <LogoutButton />
          </motion.div>
        )}
      </motion.aside>
    </>
  )
}