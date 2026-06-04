import type { MatchPhase } from '@/lib/supabase/types'

export const PHASE_LABELS: Record<MatchPhase, string> = {
  group_a: 'Group A', group_b: 'Group B', group_c: 'Group C', group_d: 'Group D',
  group_e: 'Group E', group_f: 'Group F', group_g: 'Group G', group_h: 'Group H',
  group_i: 'Group I', group_j: 'Group J', group_k: 'Group K', group_l: 'Group L',
  r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-finals',
  sf: 'Semi-finals', third_place: '3rd Place', final: 'Final',
}

export const PHASE_ORDER: MatchPhase[] = [
  'group_a', 'group_b', 'group_c', 'group_d', 'group_e', 'group_f',
  'group_g', 'group_h', 'group_i', 'group_j', 'group_k', 'group_l',
  'r32', 'r16', 'qf', 'sf', 'third_place', 'final',
]
