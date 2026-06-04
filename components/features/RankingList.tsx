import Link from 'next/link'
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
          <Link
            key={entry.id}
            href={`/players/${entry.id}`}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
              isCurrentUser ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
            } ${index < entries.length - 1 ? 'border-b border-border' : ''}`}
          >
            <span className="text-muted-foreground text-sm w-6 shrink-0">#{rank}</span>
            <PlayerAvatar displayName={entry.display_name} rank="other" size="sm" />
            <span className="flex-1 text-sm font-medium truncate">
              {entry.display_name}
              {isCurrentUser && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
            </span>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-sm font-semibold">{entry.total_points} pts</span>
              <span className="text-xs text-muted-foreground">{entry.exact_results_count} exact</span>
            </div>
          </Link>
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
