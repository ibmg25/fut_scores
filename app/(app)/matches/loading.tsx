export default function MatchesLoading() {
  return (
    <div>
      <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse mb-6" />
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-zinc-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-zinc-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
