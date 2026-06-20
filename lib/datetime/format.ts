/**
 * Converts a UTC ISO string to the `YYYY-MM-DDTHH:mm` local-time value
 * expected by <input type="datetime-local">. Uses local-time Date methods so
 * the displayed time matches what the user's browser shows in LocalKickoffTime.
 */
export function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Converts the `YYYY-MM-DDTHH:mm` string produced by a datetime-local input
 * back to a UTC ISO string suitable for storing in the DB.
 * A string without a timezone designator is interpreted as local time by
 * modern browsers and Node.js (ECMA-262 §21.4.3.2), so constructing a Date
 * from it and calling toISOString() correctly round-trips via the local tz.
 */
export function datetimeLocalToUtcIso(localValue: string): string {
  return new Date(localValue).toISOString()
}

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
