export function formatKickoff(isoString: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(isoString))
}

export function isPredictionLocked(kickoffTime: string): boolean {
  const lockTime = new Date(kickoffTime).getTime() - 60 * 60 * 1000
  return Date.now() >= lockTime
}
