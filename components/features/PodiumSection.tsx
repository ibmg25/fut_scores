import Link from 'next/link'
import { Crown } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar'

interface LeaderboardEntry {
  id: string
  display_name: string
  total_points: number
  exact_results_count: number
}

interface Props {
  top3: LeaderboardEntry[]
}

const podiumConfig = [
  { rank: 2 as const, height: 'h-20', colorVar: '--silver' },
  { rank: 1 as const, height: 'h-28', colorVar: '--gold', crown: true },
  { rank: 3 as const, height: 'h-16', colorVar: '--bronze' },
]

export default function PodiumSection({ top3 }: Props) {
  // Map rank order to display order: [2nd, 1st, 3rd]
  const displayOrder = [2, 1, 3] as const
  const entries = displayOrder.map((rank) => ({
    rank,
    entry: top3[rank - 1] ?? null,
    config: podiumConfig.find((c) => c.rank === rank)!,
  }))

  return (
    <div className="flex items-end justify-center gap-2 mb-8">
      {entries.map(({ rank, entry, config }) => {
        if (!entry) return null
        return (
          <Link
            key={rank}
            href={`/players/${entry.id}`}
            aria-label={`Rank ${rank}: ${entry.display_name}`}
            className="flex flex-col items-center gap-2 flex-1 max-w-[140px] hover:opacity-80 transition-opacity"
          >
            {config.crown && <Crown className="w-6 h-6 text-[var(--gold)]" />}
            <PlayerAvatar displayName={entry.display_name} rank={rank} size="lg" />
            <div className="text-center">
              <p className="text-sm font-semibold truncate max-w-[100px]">{entry.display_name}</p>
              <p className="text-xs text-muted-foreground">{entry.total_points} pts</p>
              <p className="text-xs text-muted-foreground">{entry.exact_results_count} exact</p>
            </div>
            <div
              className={`w-full ${config.height} border border-border border-t-2 rounded-t-lg`}
              style={{
                borderTopColor: `var(${config.colorVar})`,
                background: `linear-gradient(to bottom, color-mix(in oklch, var(${config.colorVar}), transparent 78%), transparent)`,
              }}
            />
          </Link>
        )
      })}
    </div>
  )
}
