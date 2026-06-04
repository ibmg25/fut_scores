import Link from 'next/link'

interface Group {
  id: string
  name: string
}

interface Props {
  groups: Group[]
  selectedGroupId: string | null
  showAllPlayers?: boolean
}

export default function GroupSelector({ groups, selectedGroupId, showAllPlayers = true }: Props) {
  if (groups.length === 0 && !showAllPlayers) return null
  if (groups.length === 0) return null

  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {showAllPlayers && (
        <Link
          href="/leaderboard"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedGroupId
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All Players
        </Link>
      )}
      {groups.map((g) => (
        <Link
          key={g.id}
          href={`/leaderboard?group=${g.id}`}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedGroupId === g.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {g.name}
        </Link>
      ))}
    </div>
  )
}
