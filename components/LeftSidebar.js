"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, Search, PlusCircle, Wallet, User } from "lucide-react"

const tabs = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Create", href: "/create", icon: PlusCircle },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Profile", href: "/profile", icon: User },
]

export default function LeftSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 px-6 py-8 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-md z-50">
      <nav className="flex flex-col gap-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-semibold shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <motion.div
                initial={false}
                animate={
                  isActive
                    ? { rotate: 360, scale: 1.2 }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-9 h-9 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
                }`}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              <span className="text-base transition-colors duration-200 group-hover:text-blue-500">
                {tab.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
