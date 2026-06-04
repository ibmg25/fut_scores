export type MatchPhase =
  | 'group_a' | 'group_b' | 'group_c' | 'group_d' | 'group_e' | 'group_f'
  | 'group_g' | 'group_h' | 'group_i' | 'group_j' | 'group_k' | 'group_l'
  | 'r32' | 'r16' | 'qf' | 'sf' | 'third_place' | 'final'

export type MatchStatus = 'pending' | 'finished'
export type UserRole = 'user' | 'superadmin'

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          name: string
          year: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          year: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          year?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          flag_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          flag_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          flag_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          home_team_id: string
          away_team_id: string
          kickoff_time: string
          phase: MatchPhase
          is_knockout: boolean
          home_score: number | null
          away_score: number | null
          penalty_winner_team_id: string | null
          status: MatchStatus
          results_set_by: string | null
          results_set_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          home_team_id: string
          away_team_id: string
          kickoff_time: string
          phase: MatchPhase
          is_knockout?: boolean
          home_score?: number | null
          away_score?: number | null
          penalty_winner_team_id?: string | null
          status?: MatchStatus
          results_set_by?: string | null
          results_set_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          home_team_id?: string
          away_team_id?: string
          kickoff_time?: string
          phase?: MatchPhase
          is_knockout?: boolean
          home_score?: number | null
          away_score?: number | null
          penalty_winner_team_id?: string | null
          status?: MatchStatus
          results_set_by?: string | null
          results_set_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'matches_tournament_id_fkey'
            columns: ['tournament_id']
            isOneToOne: false
            referencedRelation: 'tournaments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_home_team_id_fkey'
            columns: ['home_team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_away_team_id_fkey'
            columns: ['away_team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_penalty_winner_team_id_fkey'
            columns: ['penalty_winner_team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      users_profiles: {
        Row: {
          id: string
          display_name: string
          role: UserRole
          must_change_password: boolean
          total_points: number
          exact_results_count: number
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          role?: UserRole
          must_change_password?: boolean
          total_points?: number
          exact_results_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          role?: UserRole
          must_change_password?: boolean
          total_points?: number
          exact_results_count?: number
          created_at?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          match_id: string
          predicted_home_score: number
          predicted_away_score: number
          predicted_penalty_winner_team_id: string | null
          points_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          predicted_home_score: number
          predicted_away_score: number
          predicted_penalty_winner_team_id?: string | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          predicted_home_score?: number
          predicted_away_score?: number
          predicted_penalty_winner_team_id?: string | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'predictions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'predictions_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      v_leaderboard: {
        Row: {
          id: string
          display_name: string
          total_points: number
          exact_results_count: number
        }
        Relationships: []
      }
      v_group_leaderboard: {
        Row: {
          group_id: string
          id: string
          display_name: string
          total_points: number
          exact_results_count: number
        }
        Relationships: []
      }
    }
    Functions: {
      finalize_match: {
        Args: {
          p_match_id: string
          p_home: number
          p_away: number
          p_penalty_winner?: string | null
        }
        Returns: number
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      match_phase: MatchPhase
      match_status: MatchStatus
      user_role: UserRole
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Tournament = Tables<'tournaments'>
export type Team = Tables<'teams'>
export type Match = Tables<'matches'>
export type UserProfile = Tables<'users_profiles'>
export type Prediction = Tables<'predictions'>
export type Group = Tables<'groups'>
export type GroupMember = Tables<'group_members'>

export type MatchWithTeams = Match & {
  home_team: Team
  away_team: Team
  penalty_winner_team?: Team | null
}
