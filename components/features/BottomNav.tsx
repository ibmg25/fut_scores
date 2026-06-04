'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, BarChart3, Settings } from 'lucide-react'

interface Props {
  isAdmin: boolean
}

const navItems = [
  { href: '/matches', label: 'Matches', icon: Trophy },
  { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
] as const

export default function BottomNav({ isAdmin }: Props) {
  const pathname = usePathname()

  const items = isAdmin
    ? [...navItems, { href: '/admin', label: 'Admin', icon: Settings } as const]
    : navItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t border-border flex items-center md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
