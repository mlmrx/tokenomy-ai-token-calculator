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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alert_thresholds: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string | null
          gpu_uuid: string | null
          id: string
          is_enabled: boolean | null
          metric_name: string
          notification_email: string | null
          threshold_value: number
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          gpu_uuid?: string | null
          id?: string
          is_enabled?: boolean | null
          metric_name: string
          notification_email?: string | null
          threshold_value: number
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          gpu_uuid?: string | null
          id?: string
          is_enabled?: boolean | null
          metric_name?: string
          notification_email?: string | null
          threshold_value?: number
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key_hash: string
          api_key_prefix: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          permissions: Json | null
          rate_limit_per_hour: number | null
          user_id: string
        }
        Insert: {
          api_key_hash: string
          api_key_prefix: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          permissions?: Json | null
          rate_limit_per_hour?: number | null
          user_id: string
        }
        Update: {
          api_key_hash?: string
          api_key_prefix?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          permissions?: Json | null
          rate_limit_per_hour?: number | null
          user_id?: string
        }
        Relationships: []
      }
      community_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          post_count: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          post_count?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          post_count?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          downvote_count: number | null
          id: string
          is_edited: boolean | null
          is_solution: boolean | null
          parent_id: string | null
          post_id: string
          updated_at: string
          upvote_count: number | null
          user_id: string
          vote_score: number | null
        }
        Insert: {
          content: string
          created_at?: string
          downvote_count?: number | null
          id?: string
          is_edited?: boolean | null
          is_solution?: boolean | null
          parent_id?: string | null
          post_id: string
          updated_at?: string
          upvote_count?: number | null
          user_id: string
          vote_score?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          downvote_count?: number | null
          id?: string
          is_edited?: boolean | null
          is_solution?: boolean | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          upvote_count?: number | null
          user_id?: string
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      community_notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          post_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category_id: string
          comment_count: number | null
          content: string
          created_at: string
          downvote_count: number | null
          excerpt: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          metadata: Json | null
          post_type: Database["public"]["Enums"]["post_type"]
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          tags: string[] | null
          title: string
          updated_at: string
          upvote_count: number | null
          user_id: string
          view_count: number | null
          vote_score: number | null
        }
        Insert: {
          category_id: string
          comment_count?: number | null
          content: string
          created_at?: string
          downvote_count?: number | null
          excerpt?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          metadata?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"]
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          upvote_count?: number | null
          user_id: string
          view_count?: number | null
          vote_score?: number | null
        }
        Update: {
          category_id?: string
          comment_count?: number | null
          content?: string
          created_at?: string
          downvote_count?: number | null
          excerpt?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          metadata?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"]
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvote_count?: number | null
          user_id?: string
          view_count?: number | null
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
          vote_type: number
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
          vote_type: number
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      configuration_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      file_configurations: {
        Row: {
          applied_at: string | null
          configuration_data: Json
          file_hash: string
          file_size_bytes: number
          filename: string
          id: string
          is_applied: boolean | null
          uploaded_at: string | null
          user_id: string
          validation_errors: Json | null
          validation_status: string | null
        }
        Insert: {
          applied_at?: string | null
          configuration_data: Json
          file_hash: string
          file_size_bytes: number
          filename: string
          id?: string
          is_applied?: boolean | null
          uploaded_at?: string | null
          user_id: string
          validation_errors?: Json | null
          validation_status?: string | null
        }
        Update: {
          applied_at?: string | null
          configuration_data?: Json
          file_hash?: string
          file_size_bytes?: number
          filename?: string
          id?: string
          is_applied?: boolean | null
          uploaded_at?: string | null
          user_id?: string
          validation_errors?: Json | null
          validation_status?: string | null
        }
        Relationships: []
      }
      gpu_configurations: {
        Row: {
          created_at: string | null
          display_name: string | null
          efficiency_threshold: number | null
          gpu_sku: Database["public"]["Enums"]["gpu_sku"]
          gpu_uuid: string
          hourly_cost_usd: number | null
          id: string
          is_active: boolean | null
          max_memory_mb: number | null
          max_power_draw_watts: number | null
          max_temperature_c: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          efficiency_threshold?: number | null
          gpu_sku?: Database["public"]["Enums"]["gpu_sku"]
          gpu_uuid: string
          hourly_cost_usd?: number | null
          id?: string
          is_active?: boolean | null
          max_memory_mb?: number | null
          max_power_draw_watts?: number | null
          max_temperature_c?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          efficiency_threshold?: number | null
          gpu_sku?: Database["public"]["Enums"]["gpu_sku"]
          gpu_uuid?: string
          hourly_cost_usd?: number | null
          id?: string
          is_active?: boolean | null
          max_memory_mb?: number | null
          max_power_draw_watts?: number | null
          max_temperature_c?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_token_metrics: {
        Row: {
          co2_grams_per_million_tokens: number | null
          cost_per_million_tokens: number | null
          created_at: string
          id: string
          kwh_per_million_tokens: number | null
          max_tokens_per_second: number
          recorded_at: string
          source_type: string | null
          source_url: string | null
          tokens_per_month: number
          tokens_per_query_avg: number | null
          vendor_id: string
        }
        Insert: {
          co2_grams_per_million_tokens?: number | null
          cost_per_million_tokens?: number | null
          created_at?: string
          id?: string
          kwh_per_million_tokens?: number | null
          max_tokens_per_second: number
          recorded_at?: string
          source_type?: string | null
          source_url?: string | null
          tokens_per_month: number
          tokens_per_query_avg?: number | null
          vendor_id: string
        }
        Update: {
          co2_grams_per_million_tokens?: number | null
          cost_per_million_tokens?: number | null
          created_at?: string
          id?: string
          kwh_per_million_tokens?: number | null
          max_tokens_per_second?: number
          recorded_at?: string
          source_type?: string | null
          source_url?: string | null
          tokens_per_month?: number
          tokens_per_query_avg?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_token_metrics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_user_data: {
        Row: {
          app_name: string
          co2_grams_per_million_tokens: number | null
          cost_per_million_tokens: number | null
          created_at: string
          expires_at: string
          id: string
          kwh_per_million_tokens: number | null
          max_tokens_per_second: number | null
          session_id: string
          tokens_per_month: number | null
          tokens_per_query_avg: number | null
          user_id: string | null
        }
        Insert: {
          app_name: string
          co2_grams_per_million_tokens?: number | null
          cost_per_million_tokens?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          kwh_per_million_tokens?: number | null
          max_tokens_per_second?: number | null
          session_id: string
          tokens_per_month?: number | null
          tokens_per_query_avg?: number | null
          user_id?: string | null
        }
        Update: {
          app_name?: string
          co2_grams_per_million_tokens?: number | null
          cost_per_million_tokens?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          kwh_per_million_tokens?: number | null
          max_tokens_per_second?: number | null
          session_id?: string
          tokens_per_month?: number | null
          tokens_per_query_avg?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      leaderboard_vendor_profiles: {
        Row: {
          created_at: string
          description: string | null
          founded_year: number | null
          headquarters: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      pricing_models: {
        Row: {
          cost_per_hour_usd: number | null
          cost_per_token_usd: number | null
          created_at: string | null
          description: string | null
          energy_cost_per_kwh_usd: number | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cost_per_hour_usd?: number | null
          cost_per_token_usd?: number | null
          created_at?: string | null
          description?: string | null
          energy_cost_per_kwh_usd?: number | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cost_per_hour_usd?: number | null
          cost_per_token_usd?: number | null
          created_at?: string | null
          description?: string | null
          energy_cost_per_kwh_usd?: number | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          achievements: Json | null
          badges: Database["public"]["Enums"]["user_badge"][] | null
          comment_count: number | null
          created_at: string
          downvotes_received: number | null
          id: string
          last_active_date: string | null
          post_count: number | null
          solution_count: number | null
          streak_days: number | null
          total_score: number | null
          updated_at: string
          upvotes_received: number | null
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          badges?: Database["public"]["Enums"]["user_badge"][] | null
          comment_count?: number | null
          created_at?: string
          downvotes_received?: number | null
          id?: string
          last_active_date?: string | null
          post_count?: number | null
          solution_count?: number | null
          streak_days?: number | null
          total_score?: number | null
          updated_at?: string
          upvotes_received?: number | null
          user_id: string
        }
        Update: {
          achievements?: Json | null
          badges?: Database["public"]["Enums"]["user_badge"][] | null
          comment_count?: number | null
          created_at?: string
          downvotes_received?: number | null
          id?: string
          last_active_date?: string | null
          post_count?: number | null
          solution_count?: number | null
          streak_days?: number | null
          total_score?: number | null
          updated_at?: string
          upvotes_received?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_daily_aggregates: {
        Row: {
          avg_co2_per_million: number | null
          avg_cost_per_million: number | null
          avg_kwh_per_million: number | null
          avg_monthly_tokens: number | null
          avg_tokens_per_query: number | null
          data_points: number | null
          day: string | null
          peak_tps: number | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_token_metrics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_leaderboard_aggregates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      alert_type: "critical" | "warning" | "info"
      gpu_sku:
        | "A100"
        | "V100"
        | "H100"
        | "RTX4090"
        | "RTX3090"
        | "A6000"
        | "Custom"
      notification_type:
        | "mention"
        | "reply"
        | "vote"
        | "achievement"
        | "follow"
        | "post_featured"
      post_status: "draft" | "published" | "archived" | "featured"
      post_type:
        | "discussion"
        | "question"
        | "tutorial"
        | "showcase"
        | "announcement"
      user_badge:
        | "contributor"
        | "expert"
        | "mentor"
        | "moderator"
        | "pioneer"
        | "helpful"
        | "solver"
        | "teacher"
      user_role: "admin" | "user" | "viewer"
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
      alert_type: ["critical", "warning", "info"],
      gpu_sku: [
        "A100",
        "V100",
        "H100",
        "RTX4090",
        "RTX3090",
        "A6000",
        "Custom",
      ],
      notification_type: [
        "mention",
        "reply",
        "vote",
        "achievement",
        "follow",
        "post_featured",
      ],
      post_status: ["draft", "published", "archived", "featured"],
      post_type: [
        "discussion",
        "question",
        "tutorial",
        "showcase",
        "announcement",
      ],
      user_badge: [
        "contributor",
        "expert",
        "mentor",
        "moderator",
        "pioneer",
        "helpful",
        "solver",
        "teacher",
      ],
      user_role: ["admin", "user", "viewer"],
    },
  },
} as const
