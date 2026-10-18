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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          announcement: string | null
          currency: string
          fee_flat: number
          fee_percent: number
          id: number
          min_withdrawal: number
          updated_at: string
        }
        Insert: {
          announcement?: string | null
          currency?: string
          fee_flat?: number
          fee_percent?: number
          id?: number
          min_withdrawal?: number
          updated_at?: string
        }
        Update: {
          announcement?: string | null
          currency?: string
          fee_flat?: number
          fee_percent?: number
          id?: number
          min_withdrawal?: number
          updated_at?: string
        }
        Relationships: []
      }
      balance_adjustments: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      firebase_identity_links: {
        Row: {
          created_at: string
          firebase_uid: string
          user_id: string
        }
        Insert: {
          created_at?: string
          firebase_uid: string
          user_id: string
        }
        Update: {
          created_at?: string
          firebase_uid?: string
          user_id?: string
        }
        Relationships: []
      }
      invest_plans: {
        Row: {
          created_at: string
          daily_percent: number
          description: string | null
          duration_days: number
          emoji: string
          id: string
          is_active: boolean
          max_amount: number
          min_amount: number
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          daily_percent?: number
          description?: string | null
          duration_days?: number
          emoji?: string
          id?: string
          is_active?: boolean
          max_amount?: number
          min_amount?: number
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          daily_percent?: number
          description?: string | null
          duration_days?: number
          emoji?: string
          id?: string
          is_active?: boolean
          max_amount?: number
          min_amount?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          daily_percent: number
          duration_days: number
          id: string
          plan_id: string
          plan_name: string
          started_at: string
          user_id: string
        }
        Insert: {
          amount: number
          daily_percent: number
          duration_days: number
          id?: string
          plan_id: string
          plan_name: string
          started_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          daily_percent?: number
          duration_days?: number
          id?: string
          plan_id?: string
          plan_name?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "invest_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          kind: string
          sort_order: number
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind: string
          sort_order?: number
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          sort_order?: number
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      payout_methods: {
        Row: {
          account_number: string | null
          bank_name: string | null
          created_at: string
          holder_name: string
          id: string
          ifsc: string | null
          method_type: string
          upi_id: string | null
          user_id: string
          verification_status: string
        }
        Insert: {
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          holder_name: string
          id?: string
          ifsc?: string | null
          method_type: string
          upi_id?: string | null
          user_id: string
          verification_status?: string
        }
        Update: {
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          holder_name?: string
          id?: string
          ifsc?: string | null
          method_type?: string
          upi_id?: string | null
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_seen_at: string | null
          phone: string | null
          preferred_language: string | null
          profile_completed: boolean
          updated_at: string
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_seen_at?: string | null
          phone?: string | null
          preferred_language?: string | null
          profile_completed?: boolean
          updated_at?: string
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          phone?: string | null
          preferred_language?: string | null
          profile_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      reward_options: {
        Row: {
          amount: number
          brand: string
          created_at: string
          daily_limit_per_user: number | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
        }
        Insert: {
          amount: number
          brand: string
          created_at?: string
          daily_limit_per_user?: number | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          amount?: number
          brand?: string
          created_at?: string
          daily_limit_per_user?: number | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          evidence: string | null
          id: string
          reviewed_at: string | null
          reward_amount: number
          status: string
          submitted_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          evidence?: string | null
          id?: string
          reviewed_at?: string | null
          reward_amount?: number
          status?: string
          submitted_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          evidence?: string | null
          id?: string
          reviewed_at?: string | null
          reward_amount?: number
          status?: string
          submitted_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          action_type: string
          action_url: string | null
          button_label: string | null
          created_at: string
          description: string | null
          duration_seconds: number
          id: string
          is_active: boolean
          reward_amount: number
          sort_order: number
          title: string
        }
        Insert: {
          action_type?: string
          action_url?: string | null
          button_label?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number
          id?: string
          is_active?: boolean
          reward_amount?: number
          sort_order?: number
          title: string
        }
        Update: {
          action_type?: string
          action_url?: string | null
          button_label?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number
          id?: string
          is_active?: boolean
          reward_amount?: number
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          currency: string
          fee: number
          id: string
          payout_method_id: string | null
          provider_reference: string | null
          reward_label: string | null
          reward_option_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          fee?: number
          id?: string
          payout_method_id?: string | null
          provider_reference?: string | null
          reward_label?: string | null
          reward_option_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          fee?: number
          id?: string
          payout_method_id?: string | null
          provider_reference?: string | null
          reward_label?: string | null
          reward_option_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_payout_method_id_fkey"
            columns: ["payout_method_id"]
            isOneToOne: false
            referencedRelation: "payout_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_reward_option_id_fkey"
            columns: ["reward_option_id"]
            isOneToOne: false
            referencedRelation: "reward_options"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_user_balances: {
        Args: never
        Returns: {
          adjusted: number
          earned: number
          held: number
          user_id: string
          withdrawn: number
        }[]
      }
      get_my_balances: {
        Args: never
        Returns: {
          available: number
          pending: number
          total_earned: number
          withdrawn: number
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      invest_delta: { Args: { _uid: string }; Returns: number }
      invest_now: {
        Args: { _amount: number; _plan_id: string }
        Returns: undefined
      }
      request_redeem: { Args: { _option_id: string }; Returns: undefined }
      request_withdrawal: {
        Args: { _amount: number; _payout_method_id: string }
        Returns: undefined
      }
      submit_task: {
        Args: { _evidence: string; _task_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
