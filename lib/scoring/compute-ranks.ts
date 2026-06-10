export function computeCompetitionRanks<T extends { total_points: number; exact_results_count: number }>(
  sorted: T[]
): (T & { rank: number })[] {
  let rank = 1
  return sorted.map((entry, i) => {
    if (i > 0) {
      const prev = sorted[i - 1]
      if (entry.total_points !== prev.total_points || entry.exact_results_count !== prev.exact_results_count) {
        rank = i + 1
      }
    }
    return { ...entry, rank }
  })
}
