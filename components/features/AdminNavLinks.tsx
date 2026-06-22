'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ALL_LINKS = [
  { href: '/admin/results', label: 'Match Results', superadminOnly: false },
  { href: '/admin/users',   label: 'Users',         superadminOnly: true  },
  { href: '/admin/groups',  label: 'Groups',        superadminOnly: false },
  { href: '/admin/sync',    label: 'Sync',          superadminOnly: true  },
]

export default function AdminNavLinks({ isSuperadmin }: { isSuperadmin: boolean }) {
  const pathname = usePathname()
  const links = ALL_LINKS.filter((l) => !l.superadminOnly || isSuperadmin)

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
