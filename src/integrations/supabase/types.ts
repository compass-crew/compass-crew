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
      ambassador_applications: {
        Row: {
          admin_notes: string | null
          branch: string | null
          college: string
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          linkedin_url: string | null
          phone: string | null
          prior_experience: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_by: string | null
          updated_at: string
          why_you: string
          year_of_study: string | null
        }
        Insert: {
          admin_notes?: string | null
          branch?: string | null
          college: string
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          prior_experience?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_by?: string | null
          updated_at?: string
          why_you: string
          year_of_study?: string | null
        }
        Update: {
          admin_notes?: string | null
          branch?: string | null
          college?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          prior_experience?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_by?: string | null
          updated_at?: string
          why_you?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
      ambassador_referrals: {
        Row: {
          ambassador_id: string
          created_at: string
          id: string
          note: string | null
          points_awarded: number
          referred_email: string | null
          referred_user_id: string | null
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          id?: string
          note?: string | null
          points_awarded?: number
          referred_email?: string | null
          referred_user_id?: string | null
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          id?: string
          note?: string | null
          points_awarded?: number
          referred_email?: string | null
          referred_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_referrals_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassadors"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassadors: {
        Row: {
          avatar_url: string | null
          college: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          full_name: string
          id: string
          points: number
          referral_code: string
          status: Database["public"]["Enums"]["content_status"]
          tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          full_name: string
          id?: string
          points?: number
          referral_code: string
          status?: Database["public"]["Enums"]["content_status"]
          tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          full_name?: string
          id?: string
          points?: number
          referral_code?: string
          status?: Database["public"]["Enums"]["content_status"]
          tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          body_md: string
          category: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          excerpt: string | null
          featured: boolean
          id: string
          published_at: string | null
          reading_minutes: number | null
          scheduled_for: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body_md?: string
          category?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          scheduled_for?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body_md?: string
          category?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          scheduled_for?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      careers: {
        Row: {
          apply_url: string | null
          body_md: string | null
          category: Database["public"]["Enums"]["career_category"]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          location: string | null
          mode: Database["public"]["Enums"]["event_mode"] | null
          published_at: string | null
          scheduled_for: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          apply_url?: string | null
          body_md?: string | null
          category?: Database["public"]["Enums"]["career_category"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          mode?: Database["public"]["Enums"]["event_mode"] | null
          published_at?: string | null
          scheduled_for?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          apply_url?: string | null
          body_md?: string | null
          category?: Database["public"]["Enums"]["career_category"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          mode?: Database["public"]["Enums"]["event_mode"] | null
          published_at?: string | null
          scheduled_for?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      cms_homepage_sections: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          data: Json
          deleted_at: string | null
          enabled: boolean
          id: string
          key: string
          media_url: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          data?: Json
          deleted_at?: string | null
          enabled?: boolean
          id?: string
          key: string
          media_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          data?: Json
          deleted_at?: string | null
          enabled?: boolean
          id?: string
          key?: string
          media_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          deleted_at: string | null
          email: string
          handled: boolean
          id: string
          message: string
          name: string
          subject: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
          subject: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          subject?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_provider_settings: {
        Row: {
          config: Json
          from_email: string
          from_name: string
          id: string
          is_active: boolean
          provider: string
          reply_to: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config?: Json
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean
          provider?: string
          reply_to?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean
          provider?: string
          reply_to?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_markdown: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          name: string
          subject: string
          updated_at: string
          updated_by: string | null
          variables: string[]
        }
        Insert: {
          body_markdown?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
          subject?: string
          updated_at?: string
          updated_by?: string | null
          variables?: string[]
        }
        Update: {
          body_markdown?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          subject?: string
          updated_at?: string
          updated_by?: string | null
          variables?: string[]
        }
        Relationships: []
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
      mentor_applications: {
        Row: {
          admin_notes: string | null
          availability: string | null
          company: string | null
          created_at: string
          deleted_at: string | null
          email: string
          expertise: string[]
          full_name: string
          id: string
          job_title: string | null
          linkedin_url: string | null
          motivation: string
          phone: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_by: string | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          availability?: string | null
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          expertise?: string[]
          full_name: string
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          motivation: string
          phone?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_by?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          availability?: string | null
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          expertise?: string[]
          full_name?: string
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          motivation?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_by?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      mentors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          expertise: string[]
          id: string
          linkedin_url: string | null
          name: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expertise?: string[]
          id?: string
          linkedin_url?: string | null
          name: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expertise?: string[]
          id?: string
          linkedin_url?: string | null
          name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
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
      partner_applications: {
        Row: {
          admin_notes: string | null
          contact_name: string
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          message: string
          org_name: string
          partnership_type: string | null
          phone: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_by: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          contact_name: string
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: string
          message: string
          org_name: string
          partnership_type?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_by?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          contact_name?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          message?: string
          org_name?: string
          partnership_type?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_by?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          blurb: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          kind: Database["public"]["Enums"]["partner_kind"]
          logo_url: string | null
          name: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          url: string | null
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["partner_kind"]
          logo_url?: string | null
          name: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          url?: string | null
        }
        Update: {
          blurb?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["partner_kind"]
          logo_url?: string | null
          name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          data: Json
          section: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data?: Json
          section: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          section?: string
          updated_at?: string
          updated_by?: string | null
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
          suspended_at: string | null
          suspended_reason: string | null
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
          suspended_at?: string | null
          suspended_reason?: string | null
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
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          username?: string | null
          year_of_study?: string | null
        }
        Relationships: []
      }
      public_form_events: {
        Row: {
          created_at: string
          form_kind: string
          id: string
          ip_hash: string
        }
        Insert: {
          created_at?: string
          form_kind: string
          id?: string
          ip_hash: string
        }
        Update: {
          created_at?: string
          form_kind?: string
          id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      public_judges: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_label: string | null
          id: string
          linkedin_url: string | null
          name: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_label?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_label?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
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
      resource_bookmarks: {
        Row: {
          created_at: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          download_url: string | null
          id: string
          is_external: boolean
          published_at: string | null
          scheduled_for: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          download_url?: string | null
          id?: string
          is_external?: boolean
          published_at?: string | null
          scheduled_for?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          download_url?: string | null
          id?: string
          is_external?: boolean
          published_at?: string | null
          scheduled_for?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
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
      site_announcements: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          expires_at: string | null
          id: string
          link_label: string | null
          link_url: string | null
          pinned: boolean
          published_at: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          link_label?: string | null
          link_url?: string | null
          pinned?: boolean
          published_at?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          link_label?: string | null
          link_url?: string | null
          pinned?: boolean
          published_at?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_events: {
        Row: {
          banner_url: string | null
          body_md: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          ends_at: string | null
          featured: boolean
          id: string
          kind: Database["public"]["Enums"]["event_kind"]
          location: string | null
          mode: Database["public"]["Enums"]["event_mode"]
          published_at: string | null
          registration_url: string | null
          resources: Json
          schedule: Json
          scheduled_for: string | null
          slug: string
          speakers: Json
          starts_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          body_md?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          kind?: Database["public"]["Enums"]["event_kind"]
          location?: string | null
          mode?: Database["public"]["Enums"]["event_mode"]
          published_at?: string | null
          registration_url?: string | null
          resources?: Json
          schedule?: Json
          scheduled_for?: string | null
          slug: string
          speakers?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          body_md?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          kind?: Database["public"]["Enums"]["event_kind"]
          location?: string | null
          mode?: Database["public"]["Enums"]["event_mode"]
          published_at?: string | null
          registration_url?: string | null
          resources?: Json
          schedule?: Json
          scheduled_for?: string | null
          slug?: string
          speakers?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          blurb: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          logo_url: string | null
          name: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          tier: Database["public"]["Enums"]["sponsor_tier"]
          updated_at: string
          url: string | null
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tier?: Database["public"]["Enums"]["sponsor_tier"]
          updated_at?: string
          url?: string | null
        }
        Update: {
          blurb?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tier?: Database["public"]["Enums"]["sponsor_tier"]
          updated_at?: string
          url?: string | null
        }
        Relationships: []
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
      admin_get_user: { Args: { _user_id: string }; Returns: Json }
      admin_global_search: {
        Args: { _limit?: number; _q: string }
        Returns: Json
      }
      admin_list_users: {
        Args: {
          _limit?: number
          _offset?: number
          _role?: string
          _search?: string
          _status?: string
        }
        Returns: Json
      }
      admin_security_overview: { Args: never; Returns: Json }
      admin_set_user_role: {
        Args: { _grant: boolean; _role: string; _user_id: string }
        Returns: undefined
      }
      admin_set_user_suspended: {
        Args: { _reason?: string; _suspended: boolean; _user_id: string }
        Returns: undefined
      }
      current_user_email: { Args: never; Returns: string }
      find_user_id_by_email: { Args: { _email: string }; Returns: string }
      get_admin_activity: { Args: { _limit?: number }; Returns: Json }
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
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_team_leader: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      verify_certificate: {
        Args: { _code: string }
        Returns: {
          code: string
          hackathon_slug: string
          hackathon_title: string
          issued_at: string
          recipient_name: string
          subtitle: string
          type: Database["public"]["Enums"]["certificate_type"]
        }[]
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
      application_status:
        | "pending"
        | "reviewing"
        | "approved"
        | "rejected"
        | "withdrawn"
      career_category:
        | "volunteer"
        | "ambassador"
        | "organizer"
        | "internship"
        | "full_time"
        | "future"
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
      content_status: "draft" | "scheduled" | "published" | "archived"
      event_kind:
        | "workshop"
        | "webinar"
        | "hackathon"
        | "bootcamp"
        | "meetup"
        | "ama"
      event_mode: "online" | "hybrid" | "in_person"
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
      partner_kind:
        | "academic"
        | "community"
        | "media"
        | "ecosystem"
        | "technology"
      registration_status:
        | "pending"
        | "approved"
        | "rejected"
        | "waitlist"
        | "withdrawn"
      sponsor_tier:
        | "title"
        | "platinum"
        | "gold"
        | "silver"
        | "bronze"
        | "community"
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
      application_status: [
        "pending",
        "reviewing",
        "approved",
        "rejected",
        "withdrawn",
      ],
      career_category: [
        "volunteer",
        "ambassador",
        "organizer",
        "internship",
        "full_time",
        "future",
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
      content_status: ["draft", "scheduled", "published", "archived"],
      event_kind: [
        "workshop",
        "webinar",
        "hackathon",
        "bootcamp",
        "meetup",
        "ama",
      ],
      event_mode: ["online", "hybrid", "in_person"],
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
      partner_kind: [
        "academic",
        "community",
        "media",
        "ecosystem",
        "technology",
      ],
      registration_status: [
        "pending",
        "approved",
        "rejected",
        "waitlist",
        "withdrawn",
      ],
      sponsor_tier: [
        "title",
        "platinum",
        "gold",
        "silver",
        "bronze",
        "community",
      ],
      submission_status: ["draft", "submitted", "disqualified"],
      team_member_role: ["leader", "member"],
      team_member_status: ["invited", "active", "left", "removed", "declined"],
    },
  },
} as const
