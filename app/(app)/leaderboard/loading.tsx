export default function LeaderboardLoading() {
  return (
    <div>
      <div className="h-8 w-36 bg-zinc-200 rounded animate-pulse mb-6" />
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-100 border-b border-zinc-200 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
