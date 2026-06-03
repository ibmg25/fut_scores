'use client'

export default function MatchesError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="text-center py-20">
      <p className="text-zinc-500 mb-4">Failed to load matches.</p>
      <button
        onClick={reset}
        className="text-sm text-zinc-600 underline hover:text-zinc-900"
      >
        Try again
      </button>
    </div>
  )
}
