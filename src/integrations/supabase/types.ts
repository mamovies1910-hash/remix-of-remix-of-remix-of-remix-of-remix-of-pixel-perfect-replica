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
          currency: string
          fee_flat: number
          fee_percent: number
          id: number
          min_withdrawal: number
          updated_at: string
        }
        Insert: {
          currency?: string
          fee_flat?: number
          fee_percent?: number
          id?: number
          min_withdrawal?: number
          updated_at?: string
        }
        Update: {
          currency?: string
          fee_flat?: number
          fee_percent?: number
          id?: number
          min_withdrawal?: number
          updated_at?: string
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
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          reward_amount: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          reward_amount?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          reward_amount?: number
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
