'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin/results', label: 'Match Results' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/groups', label: 'Groups' },
]

export default function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 text-sm">
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              active
                ? 'text-foreground bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
