export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: Database["public"]["Enums"]["announcement_audience"]
          author_id: string
          body: string
          created_at: string
          hackathon_id: string
          id: string
          title: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["announcement_audience"]
          author_id: string
          body: string
          created_at?: string
          hackathon_id: string
          id?: string
          title: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["announcement_audience"]
          author_id?: string
          body?: string
          created_at?: string
          hackathon_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          code: string
          created_at: string
          hackathon_id: string | null
          id: string
          issued_at: string
          pdf_url: string | null
          recipient_name: string
          subtitle: string | null
          title: string
          type: Database["public"]["Enums"]["certificate_type"]
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          hackathon_id?: string | null
          id?: string
          issued_at?: string
          pdf_url?: string | null
          recipient_name: string
          subtitle?: string | null
          title: string
          type?: Database["public"]["Enums"]["certificate_type"]
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          hackathon_id?: string | null
          id?: string
          issued_at?: string
          pdf_url?: string | null
          recipient_name?: string
          subtitle?: string | null
          title?: string
          type?: Database["public"]["Enums"]["certificate_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_tracks: {
        Row: {
          created_at: string
          description: string | null
          hackathon_id: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          hackathon_id: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          hackathon_id?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_tracks_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathons: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string
          description: string | null
          eligibility: string | null
          ends_at: string | null
          faqs: Json
          id: string
          is_featured: boolean
          leaderboard_frozen: boolean
          location: string | null
          max_team_size: number
          min_team_size: number
          mode: Database["public"]["Enums"]["hackathon_mode"]
          prizes: Json
          registration_closes_at: string | null
          registration_opens_at: string | null
          resources_content: Json
          results_at: string | null
          results_published_at: string | null
          rules: string | null
          slug: string
          sponsors_content: Json
          starts_at: string | null
          status: Database["public"]["Enums"]["hackathon_status"]
          submission_deadline: string | null
          tagline: string | null
          theme: string | null
          title: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          eligibility?: string | null
          ends_at?: string | null
          faqs?: Json
          id?: string
          is_featured?: boolean
          leaderboard_frozen?: boolean
          location?: string | null
          max_team_size?: number
          min_team_size?: number
          mode?: Database["public"]["Enums"]["hackathon_mode"]
          prizes?: Json
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          resources_content?: Json
          results_at?: string | null
          results_published_at?: string | null
          rules?: string | null
          slug: string
          sponsors_content?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["hackathon_status"]
          submission_deadline?: string | null
          tagline?: string | null
          theme?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          eligibility?: string | null
          ends_at?: string | null
          faqs?: Json
          id?: string
          is_featured?: boolean
          leaderboard_frozen?: boolean
          location?: string | null
          max_team_size?: number
          min_team_size?: number
          mode?: Database["public"]["Enums"]["hackathon_mode"]
          prizes?: Json
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          resources_content?: Json
          results_at?: string | null
          results_published_at?: string | null
          rules?: string | null
          slug?: string
          sponsors_content?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["hackathon_status"]
          submission_deadline?: string | null
          tagline?: string | null
          theme?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      judge_assignments: {
        Row: {
          created_at: string
          hackathon_id: string
          id: string
          judge_id: string
          submission_id: string | null
        }
        Insert: {
          created_at?: string
          hackathon_id: string
          id?: string
          judge_id: string
          submission_id?: string | null
        }
        Update: {
          created_at?: string
          hackathon_id?: string
          id?: string
          judge_id?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "judge_assignments_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "judge_assignments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          branch: string | null
          college: string | null
          country: string | null
          created_at: string
          degree: string | null
          full_name: string | null
          github_url: string | null
          id: string
          is_public: boolean
          linkedin_url: string | null
          newsletter_opt_in: boolean
          portfolio_url: string | null
          skills: string[]
          state: string | null
          updated_at: string
          username: string | null
          year_of_study: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          branch?: string | null
          college?: string | null
          country?: string | null
          created_at?: string
          degree?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          is_public?: boolean
          linkedin_url?: string | null
          newsletter_opt_in?: boolean
          portfolio_url?: string | null
          skills?: string[]
          state?: string | null
          updated_at?: string
          username?: string | null
          year_of_study?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          branch?: string | null
          college?: string | null
          country?: string | null
          created_at?: string
          degree?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          is_public?: boolean
          linkedin_url?: string | null
          newsletter_opt_in?: boolean
          portfolio_url?: string | null
          skills?: string[]
          state?: string | null
          updated_at?: string
          username?: string | null
          year_of_study?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          hackathon_id: string
          id: string
          motivation: string | null
          referral: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hackathon_id: string
          id?: string
          motivation?: string | null
          referral?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hackathon_id?: string
          id?: string
          motivation?: string | null
          referral?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          comment: string | null
          created_at: string
          criterion_id: string
          id: string
          is_final: boolean
          judge_id: string
          score: number
          submission_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          criterion_id: string
          id?: string
          is_final?: boolean
          judge_id: string
          score: number
          submission_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          criterion_id?: string
          id?: string
          is_final?: boolean
          judge_id?: string
          score?: number
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "scoring_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_criteria: {
        Row: {
          created_at: string
          description: string | null
          hackathon_id: string
          id: string
          max_score: number
          name: string
          sort_order: number
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          hackathon_id: string
          id?: string
          max_score?: number
          name: string
          sort_order?: number
          weight?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          hackathon_id?: string
          id?: string
          max_score?: number
          name?: string
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "scoring_criteria_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          ai_models: string[]
          award: string | null
          created_at: string
          description: string | null
          final_rank: number | null
          future_scope: string | null
          github_url: string | null
          hackathon_id: string
          id: string
          live_url: string | null
          name: string
          presentation_url: string | null
          problem_statement: string | null
          solution: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          tagline: string | null
          team_id: string
          tech_stack: string[]
          track_id: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ai_models?: string[]
          award?: string | null
          created_at?: string
          description?: string | null
          final_rank?: number | null
          future_scope?: string | null
          github_url?: string | null
          hackathon_id: string
          id?: string
          live_url?: string | null
          name: string
          presentation_url?: string | null
          problem_statement?: string | null
          solution?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          tagline?: string | null
          team_id: string
          tech_stack?: string[]
          track_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ai_models?: string[]
          award?: string | null
          created_at?: string
          description?: string | null
          final_rank?: number | null
          future_scope?: string | null
          github_url?: string | null
          hackathon_id?: string
          id?: string
          live_url?: string | null
          name?: string
          presentation_url?: string | null
          problem_statement?: string | null
          solution?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          tagline?: string | null
          team_id?: string
          tech_stack?: string[]
          track_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "hackathon_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          responded_at: string | null
          status: string
          team_id: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          responded_at?: string | null
          status?: string
          team_id: string
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          responded_at?: string | null
          status?: string
          team_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          invited_email: string | null
          role: Database["public"]["Enums"]["team_member_role"]
          status: Database["public"]["Enums"]["team_member_status"]
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          hackathon_id: string
          id: string
          invite_code: string
          is_locked: boolean
          is_open: boolean
          leader_id: string
          name: string
          tagline: string | null
          track_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hackathon_id: string
          id?: string
          invite_code?: string
          is_locked?: boolean
          is_open?: boolean
          leader_id: string
          name: string
          tagline?: string | null
          track_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hackathon_id?: string
          id?: string
          invite_code?: string
          is_locked?: boolean
          is_open?: boolean
          leader_id?: string
          name?: string
          tagline?: string | null
          track_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "hackathon_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_email: { Args: never; Returns: string }
      find_user_id_by_email: { Args: { _email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hackathon_judge: {
        Args: { _hackathon_id: string; _user_id: string }
        Returns: boolean
      }
      is_hackathon_organizer: {
        Args: { _hackathon_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_leader: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      announcement_audience:
        | "all"
        | "participants"
        | "teams"
        | "judges"
        | "mentors"
      app_role:
        | "super_admin"
        | "organizer"
        | "judge"
        | "mentor"
        | "campus_ambassador"
        | "participant"
        | "guest"
      certificate_type:
        | "participation"
        | "winner"
        | "runner_up"
        | "mentor"
        | "judge"
        | "organizer"
        | "campus_ambassador"
        | "special_mention"
        | "volunteer"
      hackathon_mode: "online" | "hybrid" | "in_person"
      hackathon_status:
        | "draft"
        | "published"
        | "registrations_open"
        | "ongoing"
        | "judging"
        | "completed"
        | "archived"
      notification_type:
        | "registration_approved"
        | "registration_rejected"
        | "invite_received"
        | "invite_accepted"
        | "invite_declined"
        | "submission_reminder"
        | "hackathon_started"
        | "results_published"
        | "certificate_ready"
        | "announcement"
        | "generic"
        | "scores_published"
        | "judge_assigned"
      registration_status:
        | "pending"
        | "approved"
        | "rejected"
        | "waitlist"
        | "withdrawn"
      submission_status: "draft" | "submitted" | "disqualified"
      team_member_role: "leader" | "member"
      team_member_status: "invited" | "active" | "left" | "removed" | "declined"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_audience: [
        "all",
        "participants",
        "teams",
        "judges",
        "mentors",
      ],
      app_role: [
        "super_admin",
        "organizer",
        "judge",
        "mentor",
        "campus_ambassador",
        "participant",
        "guest",
      ],
      certificate_type: [
        "participation",
        "winner",
        "runner_up",
        "mentor",
        "judge",
        "organizer",
        "campus_ambassador",
        "special_mention",
        "volunteer",
      ],
      hackathon_mode: ["online", "hybrid", "in_person"],
      hackathon_status: [
        "draft",
        "published",
        "registrations_open",
        "ongoing",
        "judging",
        "completed",
        "archived",
      ],
      notification_type: [
        "registration_approved",
        "registration_rejected",
        "invite_received",
        "invite_accepted",
        "invite_declined",
        "submission_reminder",
        "hackathon_started",
        "results_published",
        "certificate_ready",
        "announcement",
        "generic",
        "scores_published",
        "judge_assigned",
      ],
      registration_status: [
        "pending",
        "approved",
        "rejected",
        "waitlist",
        "withdrawn",
      ],
      submission_status: ["draft", "submitted", "disqualified"],
      team_member_role: ["leader", "member"],
      team_member_status: ["invited", "active", "left", "removed", "declined"],
    },
  },
} as const
