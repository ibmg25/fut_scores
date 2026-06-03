import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-zinc-500 mb-6">Page not found</p>
        <Link href="/matches" className="text-sm text-zinc-600 underline hover:text-zinc-900">
          Back to matches
        </Link>
      </div>
    </div>
  )
}
