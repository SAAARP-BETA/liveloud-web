"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  PlusCircle,
  Wallet,
  User,
  LogOut,
  AlignEndHorizontal,
  MoreHorizontal,
  Crown,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../utils/config";
import { useEffect, useState } from "react";
import Image from "next/image";
import defaultPic from "../assets/avatar.png";
import combinedLogo from "@/app/assets/Liveloud.png";
import LogoLiveloud from "@/app/assets/LongLogo.png";
import mobileLogo from "@/app/assets/mobileLogo.png";
// import Logo from "@/app/assets/Liveloud.png"

const tabs = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Create", href: "/create", icon: PlusCircle },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Leaderboard", href: "/leaderboard", icon: AlignEndHorizontal },
  { name: "Premium", href: "/premium", icon: Crown },
  { name: "Referral", href: "/referral", icon: Users },
];

// Mobile tabs - only Home, Explore, Wallet, Create
const mobileTabs = tabs.filter((tab) =>
  ["Home", "Explore", "Create", "Wallet"].includes(tab.name)
);

export default function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, logout, isAuthenticated, user } = useAuth();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

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
      router.replace("/login");
    }
  };

  const TabButton = ({ tab }) => {
    const isActive = pathname === tab.href;
    const Icon = tab.icon;

    const iconAnimation = {
      rotate: isActive ? 360 : 0,
      scale: isActive ? 1.2 : 1,
    };

    const iconTransition = {
      type: "spring",
      stiffness: 300,
      damping: 20,
    };

    return (
      <>
        {/* Mobile Tab */}
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
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </AnimatePresence>
            <motion.div
              className="relative z-10 flex items-center justify-center mb-1"
              animate={iconAnimation}
              transition={iconTransition}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? "text-[#0EA5E9]" : "text-gray-400"
                }`}
              />
            </motion.div>
            <motion.span
              className={`text-[11px] font-medium relative z-10 text-center`}
              style={{
                maxWidth: "58px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                display: "inline-block",
                color: isActive ? "#0EA5E9" : "#6b7280",
              }}
              animate={{ scale: isActive ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              title={tab.name}
            >
              {tab.name}
            </motion.span>
          </Link>
        </div>

        {/* Desktop Tab */}
        <div className="hidden sm:block">
          <Link
            href={tab.href}
            className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive
                ? "bg-[rgba(14,165,233,0.1)] text-[#0EA5E9] font-semibold shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={iconAnimation}
              transition={iconTransition}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive
                    ? "text-[#0EA5E9]"
                    : "text-gray-500 group-hover:text-[#0EA5E9]"
                }`}
              />
            </motion.div>
            <motion.span
              className="text-base"
              style={{
                maxWidth: "160px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                display: "inline-block",
                color: isActive ? "#0EA5E9" : "#6b7280",
              }}
              transition={{ duration: 0.2 }}
              title={tab.name}
            >
              {tab.name}
            </motion.span>
          </Link>
        </div>
      </>
    );
  };

  const handleProfileClick = () => {
    router.push("/profile"); // own profile
  };

  const ProfileSection = () => {
    if (!isAuthenticated) return null;

    return (
      <>
        {/* Mobile Profile */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className="relative flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
          >
            <motion.div
              className="relative z-10 flex items-center justify-center mb-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {user?.profilePicture ? (
                <img
                  src={user?.profilePicture}
                  alt="Profile"
                  className="w-6 h-6 rounded-full border border-gray-300"
                  onClick={handleProfileClick}
                />
              ) : (
                <img
                  src={defaultPic.src}
                  alt="Profile"
                  className="w-6 h-6 rounded-full border border-gray-300"
                  onClick={handleProfileClick}
                />
              )}
            </motion.div>
            <motion.span
              className="text-[11px] font-medium relative z-10 text-gray-600 text-center"
              style={{
                maxWidth: "48px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                display: "inline-block",
              }}
              transition={{ duration: 0.2 }}
            >
              Me
            </motion.span>
          </button>
        </div>

        {/* Desktop Profile */}
        <div className="hidden sm:block relative">
          <button className="group  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-100 w-full">
            <motion.div
              className="flex items-center cursor-pointer justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                  onClick={handleProfileClick}
                />
              ) : (
                <img
                  src={defaultPic.src}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                  onClick={handleProfileClick} // Also added missing onClick
                />
              )}
            </motion.div>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.fullname || user?.username || "User"}
              </p>
              <p className="text-sm text-gray-500 truncate ">
                @{user?.username || "username"}
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <MoreHorizontal
                className="w-5  h-5 cursor-pointer text-gray-400 group-hover:text-gray-600"
                onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              />
            </motion.div>
          </button>

          {/* Logout Dropdown */}
          <AnimatePresence>
            {showLogoutMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute cursor-pointer bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
              >
                <button
                  onClick={handleLogout}
                  className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                  {/* <span className="text-sm font-medium">Logout @{user?.username || 'username'}</span> */}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backdrop to close menu */}
          {showLogoutMenu && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowLogoutMenu(false)}
            />
          )}
        </div>
      </>
    );
  };

  // const Logo = () => {
  //   const [isMobile, setIsMobile] = useState(false);

  //   useEffect(() => {
  //     const checkScreenSize = () => {
  //       setIsMobile(window.innerWidth < 769);
  //     };

  //     // Check initially
  //     checkScreenSize();

  //     // Add resize listener
  //     window.addEventListener("resize", checkScreenSize);
  //     return () => window.removeEventListener("resize", checkScreenSize);
  //   }, []);

  //   return (
  //     <div className="flex justify-center w-[350px] h-[40px] items-center mb-[-10] lg:w-[250px] lg:h-[30px] 5px] sm:h-[15px] sm:w-[150px] hover:bg-gray-100 rounded-xl">
  //      <Image
  //         src={isMobile ? mobileLogo : LongLogo}
  //         alt="Logo"
  //         width={isMobile ? 180 : 280}
  //         height={isMobile ? 80 : 60}
  //         className="object-contain"
  //         priority
  //       />
  //     </div>
  //   );
  // };

  const Logo = () => (
    <div className="flex justify-center w-[340px] h-[40px] items-center mb-[-10] lg:w-[280px] lg:h-[30px]  md:h-[25px] md:w-[200px] sm:h-[15px] sm:w-[150px]">
      <Link href="/home">
        <Image
          src={combinedLogo}
          // src={Logo}
          alt="Logo"
          width={250}
          height={20}
          className="object-contain ml-[-18] mr-26 md:mr-18 sm:mr-10"
          priority
        />
      </Link>
    </div>
  );
  return (
    <>
      {/* Mobile Bottom Nav */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-50 rounded-2xl overflow-hidden shadow-xl sm:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50">
          <div className="flex justify-around items-center px-2 py-3 safe-area-pb">
            {mobileTabs.map((tab, index) => (
              <motion.div
                key={tab.name}
                className="flex-1 truncate"
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
            {isAuthenticated && (
              <motion.div
                className="flex-1 truncate"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: mobileTabs.length * 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <ProfileSection />
              </motion.div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden custom-scrollbar sm:flex h-screen md:w-80 max-w-80 px-6 py-10 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-xl flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Logo />
        <nav className="flex flex-col gap-4 mt-10 flex-1">
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

        {isAuthenticated && (
          <motion.div
            className="mt-auto pt-4 border-t border-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (tabs.length + 1) * 0.1 }}
          >
            <ProfileSection />
          </motion.div>
        )}
      </motion.aside>

      {/* Mobile Top Logo */}
      {/* <motion.div
        className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 py-3 sm:hidden"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="flex items-center justify-center">

          <img
            src={Logo} // Replace with your mobile logo path
            alt="Logo"
            className="h-10 w-auto" // Adjust height as needed
          />
        </div>
      </motion.div>/ */}
    </>
  );
}
