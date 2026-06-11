interface Props {
  displayName: string
  rank: 1 | 2 | 3 | 'other'
  size?: 'sm' | 'md' | 'lg'
}

const rankStyles: Record<1 | 2 | 3, string> = {
  1: 'ring-2 ring-[var(--gold)] bg-[oklch(0.78_0.14_88/0.15)]',
  2: 'ring-2 ring-[var(--silver)] bg-[oklch(0.70_0.01_240/0.15)]',
  3: 'ring-2 ring-[var(--bronze)] bg-[oklch(0.62_0.10_52/0.15)]',
}

const sizeStyles = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
}

export default function PlayerAvatar({ displayName, rank, size = 'md' }: Props) {
  const initial = displayName.charAt(0).toUpperCase()
  const ringStyle = rank !== 'other' ? rankStyles[rank] : 'bg-secondary'
  const sizeStyle = sizeStyles[size]

  return (
    <div
      translate="no"
      className={`${sizeStyle} ${ringStyle} rounded-full flex items-center justify-center font-bold text-foreground shrink-0`}
    >
      {initial}
    </div>
  )
}
