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
      anomalies: {
        Row: {
          anomaly_type: string
          auto_ticket_id: string | null
          baseline_value: number | null
          detected_at: string
          dimension_attribution: Json | null
          id: string
          metadata: Json | null
          metric_name: string
          observed_value: number | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          tenant_id: string
          z_score: number | null
        }
        Insert: {
          anomaly_type: string
          auto_ticket_id?: string | null
          baseline_value?: number | null
          detected_at?: string
          dimension_attribution?: Json | null
          id?: string
          metadata?: Json | null
          metric_name: string
          observed_value?: number | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          tenant_id: string
          z_score?: number | null
        }
        Update: {
          anomaly_type?: string
          auto_ticket_id?: string | null
          baseline_value?: number | null
          detected_at?: string
          dimension_attribution?: Json | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          observed_value?: number | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          tenant_id?: string
          z_score?: number | null
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
      budget_alerts: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          budget_amount_usd: number
          budget_id: string
          current_spend_usd: number
          id: string
          metadata: Json | null
          percentage_used: number
          triggered_at: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          budget_amount_usd: number
          budget_id: string
          current_spend_usd: number
          id?: string
          metadata?: Json | null
          percentage_used: number
          triggered_at?: string
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          budget_amount_usd?: number
          budget_id?: string
          current_spend_usd?: number
          id?: string
          metadata?: Json | null
          percentage_used?: number
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_alerts_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          alert_channels: Json | null
          alert_threshold_pct: number
          budget_amount_usd: number
          budget_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          scope: string
          scope_id: string | null
          tenant_id: string
          updated_at: string
          window_hours: number
        }
        Insert: {
          alert_channels?: Json | null
          alert_threshold_pct?: number
          budget_amount_usd: number
          budget_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          scope: string
          scope_id?: string | null
          tenant_id: string
          updated_at?: string
          window_hours?: number
        }
        Update: {
          alert_channels?: Json | null
          alert_threshold_pct?: number
          budget_amount_usd?: number
          budget_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          scope?: string
          scope_id?: string | null
          tenant_id?: string
          updated_at?: string
          window_hours?: number
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          id: string
          issued_at: string
          learning_path_id: string
          user_id: string
          verification_url: string | null
        }
        Insert: {
          certificate_number: string
          id?: string
          issued_at?: string
          learning_path_id: string
          user_id: string
          verification_url?: string | null
        }
        Update: {
          certificate_number?: string
          id?: string
          issued_at?: string
          learning_path_id?: string
          user_id?: string
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          amount_usd: number
          balance_usd: number
          created_at: string
          credit_type: string
          expires_at: string | null
          id: string
          issued_by: string | null
          metadata: Json | null
          reason: string | null
          tenant_id: string
        }
        Insert: {
          amount_usd: number
          balance_usd: number
          created_at?: string
          credit_type?: string
          expires_at?: string | null
          id?: string
          issued_by?: string | null
          metadata?: Json | null
          reason?: string | null
          tenant_id: string
        }
        Update: {
          amount_usd?: number
          balance_usd?: number
          created_at?: string
          credit_type?: string
          expires_at?: string | null
          id?: string
          issued_by?: string | null
          metadata?: Json | null
          reason?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string
          discussion_id: string
          id: string
          is_instructor: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          is_instructor?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          is_instructor?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "learning_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          is_active: boolean
          metadata: Json | null
          plan_id: string | null
          quota_reset_day: number
          soft_limit: boolean
          tenant_id: string
          tps_cap: number | null
          tu_quota_monthly: number | null
          tu_used_current_period: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          plan_id?: string | null
          quota_reset_day?: number
          soft_limit?: boolean
          tenant_id: string
          tps_cap?: number | null
          tu_quota_monthly?: number | null
          tu_used_current_period?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          plan_id?: string | null
          quota_reset_day?: number
          soft_limit?: boolean
          tenant_id?: string
          tps_cap?: number | null
          tu_quota_monthly?: number | null
          tu_used_current_period?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
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
      invoice_items: {
        Row: {
          amount_usd: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          metadata: Json | null
          quantity: number
          unit_price_usd: number
        }
        Insert: {
          amount_usd: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          metadata?: Json | null
          quantity: number
          unit_price_usd: number
        }
        Update: {
          amount_usd?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          metadata?: Json | null
          quantity?: number
          unit_price_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          credits_applied_usd: number
          currency: string
          due_date: string | null
          finalized_at: string | null
          id: string
          invoice_number: string
          metadata: Json | null
          paid_at: string | null
          period_end: string
          period_start: string
          status: string
          stripe_invoice_id: string | null
          subtotal_usd: number
          tax_usd: number
          tenant_id: string
          total_usd: number
        }
        Insert: {
          created_at?: string
          credits_applied_usd?: number
          currency?: string
          due_date?: string | null
          finalized_at?: string | null
          id?: string
          invoice_number: string
          metadata?: Json | null
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: string
          stripe_invoice_id?: string | null
          subtotal_usd?: number
          tax_usd?: number
          tenant_id: string
          total_usd?: number
        }
        Update: {
          created_at?: string
          credits_applied_usd?: number
          currency?: string
          due_date?: string | null
          finalized_at?: string | null
          id?: string
          invoice_number?: string
          metadata?: Json | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          stripe_invoice_id?: string | null
          subtotal_usd?: number
          tax_usd?: number
          tenant_id?: string
          total_usd?: number
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
      learning_discussions: {
        Row: {
          content: string
          created_at: string
          id: string
          learning_path_id: string | null
          module_id: string | null
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          learning_path_id?: string | null
          module_id?: string | null
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          learning_path_id?: string | null
          module_id?: string | null
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_discussions_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_discussions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          color_gradient: string
          created_at: string
          description: string
          duration: string
          icon_name: string
          id: string
          level: string
          role: string
          title: string
          updated_at: string
        }
        Insert: {
          color_gradient: string
          created_at?: string
          description: string
          duration: string
          icon_name: string
          id?: string
          level: string
          role: string
          title: string
          updated_at?: string
        }
        Update: {
          color_gradient?: string
          created_at?: string
          description?: string
          duration?: string
          icon_name?: string
          id?: string
          level?: string
          role?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          module_id: string
          quiz_score: number | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          module_id: string
          quiz_score?: number | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          module_id?: string
          quiz_score?: number | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          content: Json | null
          created_at: string
          description: string
          duration: string
          id: string
          learning_path_id: string
          order_index: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          description: string
          duration: string
          id?: string
          learning_path_id: string
          order_index: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          description?: string
          duration?: string
          id?: string
          learning_path_id?: string
          order_index?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          base_price_usd: number | null
          billing_period: string
          created_at: string
          description: string | null
          display_order: number
          features: Json | null
          id: string
          included_tu: number | null
          is_active: boolean
          name: string
          plan_type: string
          price_per_1k_tu: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          base_price_usd?: number | null
          billing_period?: string
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json | null
          id?: string
          included_tu?: number | null
          is_active?: boolean
          name: string
          plan_type: string
          price_per_1k_tu?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          base_price_usd?: number | null
          billing_period?: string
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json | null
          id?: string
          included_tu?: number | null
          is_active?: boolean
          name?: string
          plan_type?: string
          price_per_1k_tu?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      policy_decisions: {
        Row: {
          call_id: string | null
          created_at: string
          explain: Json | null
          hedged: boolean
          id: string
          policy_id: string
          request_context: Json
          selected_route: string
          session_id: string | null
          telemetry_event_id: string | null
          tenant_id: string
          ts: string
          utility_score: number | null
          workflow_id: string | null
        }
        Insert: {
          call_id?: string | null
          created_at?: string
          explain?: Json | null
          hedged?: boolean
          id?: string
          policy_id: string
          request_context: Json
          selected_route: string
          session_id?: string | null
          telemetry_event_id?: string | null
          tenant_id: string
          ts?: string
          utility_score?: number | null
          workflow_id?: string | null
        }
        Update: {
          call_id?: string | null
          created_at?: string
          explain?: Json | null
          hedged?: boolean
          id?: string
          policy_id?: string
          request_context?: Json
          selected_route?: string
          session_id?: string | null
          telemetry_event_id?: string | null
          tenant_id?: string
          ts?: string
          utility_score?: number | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_decisions_telemetry_event_id_fkey"
            columns: ["telemetry_event_id"]
            isOneToOne: false
            referencedRelation: "telemetry_events"
            referencedColumns: ["id"]
          },
        ]
      }
      price_matrix: {
        Row: {
          created_at: string
          effective_from: string
          effective_until: string | null
          id: string
          in_cost_per_1k_tu: number
          metadata: Json | null
          model: string
          out_cost_per_1k_tu: number
          provider: string
          region: string
        }
        Insert: {
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          in_cost_per_1k_tu: number
          metadata?: Json | null
          model: string
          out_cost_per_1k_tu: number
          provider: string
          region?: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          in_cost_per_1k_tu?: number
          metadata?: Json | null
          model?: string
          out_cost_per_1k_tu?: number
          provider?: string
          region?: string
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
      route_candidates: {
        Row: {
          call_id: string
          created_at: string
          expected_cost_usd: number | null
          health_score: number | null
          id: string
          model: string
          predicted_p95_ms: number | null
          provider: string
          region: string
          selected: boolean
        }
        Insert: {
          call_id: string
          created_at?: string
          expected_cost_usd?: number | null
          health_score?: number | null
          id?: string
          model: string
          predicted_p95_ms?: number | null
          provider: string
          region: string
          selected?: boolean
        }
        Update: {
          call_id?: string
          created_at?: string
          expected_cost_usd?: number | null
          health_score?: number | null
          id?: string
          model?: string
          predicted_p95_ms?: number | null
          provider?: string
          region?: string
          selected?: boolean
        }
        Relationships: []
      }
      route_health: {
        Row: {
          health_score: number
          id: string
          is_healthy: boolean
          measured_at: string
          metadata: Json | null
          model: string
          p50_latency_ms: number
          p95_latency_ms: number
          p99_latency_ms: number
          provider: string
          region: string
          requests_count: number
          route_id: string
          success_rate: number
        }
        Insert: {
          health_score: number
          id?: string
          is_healthy?: boolean
          measured_at?: string
          metadata?: Json | null
          model: string
          p50_latency_ms: number
          p95_latency_ms: number
          p99_latency_ms: number
          provider: string
          region: string
          requests_count: number
          route_id: string
          success_rate: number
        }
        Update: {
          health_score?: number
          id?: string
          is_healthy?: boolean
          measured_at?: string
          metadata?: Json | null
          model?: string
          p50_latency_ms?: number
          p95_latency_ms?: number
          p99_latency_ms?: number
          provider?: string
          region?: string
          requests_count?: number
          route_id?: string
          success_rate?: number
        }
        Relationships: []
      }
      routing_policies: {
        Row: {
          admission: Json | null
          audit_config: Json | null
          canary_percent: number
          created_at: string
          created_by: string | null
          fallbacks: Json | null
          id: string
          is_active: boolean
          objectives: Json
          policy_id: string
          priority: string
          routes: Json
          scope: string
          shadow_mode: boolean
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          admission?: Json | null
          audit_config?: Json | null
          canary_percent?: number
          created_at?: string
          created_by?: string | null
          fallbacks?: Json | null
          id?: string
          is_active?: boolean
          objectives: Json
          policy_id: string
          priority?: string
          routes: Json
          scope: string
          shadow_mode?: boolean
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          admission?: Json | null
          audit_config?: Json | null
          canary_percent?: number
          created_at?: string
          created_by?: string | null
          fallbacks?: Json | null
          id?: string
          is_active?: boolean
          objectives?: Json
          policy_id?: string
          priority?: string
          routes?: Json
          scope?: string
          shadow_mode?: boolean
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      slo_burn_rates: {
        Row: {
          burn_rate: number
          conforming: boolean
          error_budget_remaining: number
          id: string
          measured_at: string
          metadata: Json | null
          slo_profile_id: string
          window_hours: number
        }
        Insert: {
          burn_rate: number
          conforming: boolean
          error_budget_remaining: number
          id?: string
          measured_at?: string
          metadata?: Json | null
          slo_profile_id: string
          window_hours: number
        }
        Update: {
          burn_rate?: number
          conforming?: boolean
          error_budget_remaining?: number
          id?: string
          measured_at?: string
          metadata?: Json | null
          slo_profile_id?: string
          window_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "slo_burn_rates_slo_profile_id_fkey"
            columns: ["slo_profile_id"]
            isOneToOne: false
            referencedRelation: "slo_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      slo_profiles: {
        Row: {
          budget_cpm_usd: number
          created_at: string
          error_budget_percent: number
          id: string
          is_active: boolean
          name: string
          owner_email: string | null
          p95_latency_ms: number
          success_rate: number
          tenant_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          budget_cpm_usd: number
          created_at?: string
          error_budget_percent?: number
          id?: string
          is_active?: boolean
          name: string
          owner_email?: string | null
          p95_latency_ms: number
          success_rate: number
          tenant_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          budget_cpm_usd?: number
          created_at?: string
          error_budget_percent?: number
          id?: string
          is_active?: boolean
          name?: string
          owner_email?: string | null
          p95_latency_ms?: number
          success_rate?: number
          tenant_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: []
      }
      telemetry_events: {
        Row: {
          cached: boolean
          call_id: string
          cost_in_usd: number | null
          cost_out_usd: number | null
          created_at: string
          duration_ms: number
          error_message: string | null
          http_status: number
          id: string
          input_tokens: number
          model: string
          output_tokens: number
          prompt_hash: string | null
          provider: string
          region: string
          retry_count: number
          session_id: string
          span_id: string | null
          tags: Json | null
          tenant_id: string
          total_cost_usd: number | null
          trace_id: string | null
          ts: string
          tu_calculated: number | null
          user_id: string | null
        }
        Insert: {
          cached?: boolean
          call_id: string
          cost_in_usd?: number | null
          cost_out_usd?: number | null
          created_at?: string
          duration_ms: number
          error_message?: string | null
          http_status?: number
          id?: string
          input_tokens: number
          model: string
          output_tokens: number
          prompt_hash?: string | null
          provider: string
          region?: string
          retry_count?: number
          session_id: string
          span_id?: string | null
          tags?: Json | null
          tenant_id: string
          total_cost_usd?: number | null
          trace_id?: string | null
          ts?: string
          tu_calculated?: number | null
          user_id?: string | null
        }
        Update: {
          cached?: boolean
          call_id?: string
          cost_in_usd?: number | null
          cost_out_usd?: number | null
          created_at?: string
          duration_ms?: number
          error_message?: string | null
          http_status?: number
          id?: string
          input_tokens?: number
          model?: string
          output_tokens?: number
          prompt_hash?: string | null
          provider?: string
          region?: string
          retry_count?: number
          session_id?: string
          span_id?: string | null
          tags?: Json | null
          tenant_id?: string
          total_cost_usd?: number | null
          trace_id?: string | null
          ts?: string
          tu_calculated?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      tu_config: {
        Row: {
          alpha: number
          created_at: string
          description: string | null
          id: string
          model: string
          provider: string
          updated_at: string
        }
        Insert: {
          alpha?: number
          created_at?: string
          description?: string | null
          id?: string
          model: string
          provider: string
          updated_at?: string
        }
        Update: {
          alpha?: number
          created_at?: string
          description?: string | null
          id?: string
          model?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_ledger: {
        Row: {
          amount_usd: number
          created_at: string
          evidence_ref: string | null
          id: string
          invoice_id: string | null
          invoiced: boolean
          latency_ms: number
          ledger_id: string
          pricing_snapshot_id: string
          telemetry_event_id: string | null
          tenant_id: string
          ts: string
          tu_in: number
          tu_out: number
          unit_price_usd: number
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          amount_usd: number
          created_at?: string
          evidence_ref?: string | null
          id?: string
          invoice_id?: string | null
          invoiced?: boolean
          latency_ms: number
          ledger_id: string
          pricing_snapshot_id: string
          telemetry_event_id?: string | null
          tenant_id: string
          ts?: string
          tu_in: number
          tu_out: number
          unit_price_usd: number
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          amount_usd?: number
          created_at?: string
          evidence_ref?: string | null
          id?: string
          invoice_id?: string | null
          invoiced?: boolean
          latency_ms?: number
          ledger_id?: string
          pricing_snapshot_id?: string
          telemetry_event_id?: string | null
          tenant_id?: string
          ts?: string
          tu_in?: number
          tu_out?: number
          unit_price_usd?: number
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_ledger_telemetry_event_id_fkey"
            columns: ["telemetry_event_id"]
            isOneToOne: false
            referencedRelation: "telemetry_events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_description: string
          achievement_name: string
          achievement_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_description: string
          achievement_name: string
          achievement_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_description?: string
          achievement_name?: string
          achievement_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_enrollments: {
        Row: {
          completed_at: string | null
          enrolled_at: string
          id: string
          learning_path_id: string
          progress_percentage: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          enrolled_at?: string
          id?: string
          learning_path_id: string
          progress_percentage?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          enrolled_at?: string
          id?: string
          learning_path_id?: string
          progress_percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_enrollments_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_tu: {
        Args: {
          p_input_tokens: number
          p_model: string
          p_output_tokens: number
          p_provider: string
        }
        Returns: number
      }
      generate_api_key: { Args: never; Returns: string }
      get_current_tenant_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_leaderboard_aggregates: { Args: never; Returns: undefined }
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
