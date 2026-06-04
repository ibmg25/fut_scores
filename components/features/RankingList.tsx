import PlayerAvatar from './PlayerAvatar'

interface LeaderboardEntry {
  id: string
  display_name: string
  total_points: number
  exact_results_count: number
}

interface Props {
  entries: LeaderboardEntry[]
  currentUserId: string
  startRank: number
  currentUserInTop3: boolean
}

export default function RankingList({ entries, currentUserId, startRank, currentUserInTop3 }: Props) {
  if (entries.length === 0 && !currentUserInTop3) return null

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {entries.map((entry, index) => {
        const rank = startRank + index
        const isCurrentUser = entry.id === currentUserId
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              isCurrentUser ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
            } ${index < entries.length - 1 ? 'border-b border-border' : ''}`}
          >
            <span className="text-muted-foreground text-sm w-6 shrink-0">#{rank}</span>
            <PlayerAvatar displayName={entry.display_name} rank="other" size="sm" />
            <span className="flex-1 text-sm font-medium truncate">
              {entry.display_name}
              {isCurrentUser && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
            </span>
            <span className="text-sm font-semibold shrink-0">{entry.total_points} pts</span>
          </div>
        )
      })}

      {currentUserInTop3 && entries.length > 0 && (
        <div className="px-4 py-2 border-t border-border text-xs text-center text-primary font-medium">
          You are in the top 3!
        </div>
      )}
    </div>
  )
}
