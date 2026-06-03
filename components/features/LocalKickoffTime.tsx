'use client'

import { formatKickoff } from '@/lib/datetime/format'

export default function LocalKickoffTime({ isoString }: { isoString: string }) {
  return <time dateTime={isoString}>{formatKickoff(isoString)}</time>
}
