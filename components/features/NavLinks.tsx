'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  isAdmin: boolean
}

export default function NavLinks({ isAdmin }: Props) {
  const pathname = usePathname()

  const links = [
    { href: '/home', label: 'Home' },
    { href: '/matches', label: 'Matches' },
    { href: '/leaderboard', label: 'Leaderboard' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <div className="flex items-center gap-1">
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              active
                ? 'text-foreground bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
