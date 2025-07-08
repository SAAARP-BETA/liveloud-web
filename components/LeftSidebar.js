"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Search,
  PlusCircle,
  Wallet,
  User,
  AlignEndHorizontal
} from "lucide-react"

const tabs = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Create", href: "/create", icon: PlusCircle },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Profile", href: "/profile", icon: User },
  {
    name: "Leaderboard", href: "/leaderboard", icon: AlignEndHorizontal
    
   },
]

export default function LeftSidebar() {
  const pathname = usePathname()

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
              className="relative z-10 flex items-center justify-center mb-1"
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
                className={`w-6 h-6 transition-colors duration-300 ${
                  isActive
                    ? "text-[#0EA5E9]"
                    : "text-gray-500 group-hover:text-[#0EA5E9]"
                }`}
              />
            </motion.div>
            <motion.span
              className="text-base transition-colors duration-200 group-hover:text-[#0EA5E9]"
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

  return (
    <>
      {/* Mobile Bottom Nav */}
      <motion.nav
        className="fixed bottom-3 left-3 right-3 z-50 rounded-2xl overflow-hidden shadow-xl sm:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full" />
          <div className="flex justify-around items-center px-2 py-3 safe-area-pb">
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
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />
        </div>
      </motion.nav>

      {/* Desktop Left Sidebar */}
      <motion.aside
        className="hidden sm:flex fixed top-0 left-0 h-screen w-64 px-6 py-8 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-xl z-50 flex-col"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className="flex flex-col gap-4 mt-10">
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
      </motion.aside>
    </>
  )
}
