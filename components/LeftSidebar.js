'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, PlusCircle, Wallet, User } from 'lucide-react'

const tabs = [
  { name: 'Home',   href: '/home',   icon: Home      },
  { name: 'Search', href: '/search', icon: Search    },
  { name: 'Create', href: '/create', icon: PlusCircle},
  { name: 'Wallet', href: '/wallet', icon: Wallet    },
  { name: 'Profile',href: '/profile',icon: User      },
]

export default function LeftSidebar() {
  const pathname = usePathname()

  return (
    < div className="ml-10 w-60 h-screen px-4 py-6 bg-white border-r fixed top-0 left-0">
      <nav className=" ml-6 mt-6 flex flex-col gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
