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
          processing_time: string
          support_email: string
          updated_at: string
        }
        Insert: {
          currency?: string
          fee_flat?: number
          fee_percent?: number
          id?: number
          min_withdrawal?: number
          processing_time?: string
          support_email?: string
          updated_at?: string
        }
        Update: {
          currency?: string
          fee_flat?: number
          fee_percent?: number
          id?: number
          min_withdrawal?: number
          processing_time?: string
          support_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: string | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: string | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: string | null
          id?: string
          target_id?: string | null
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
          user_id?: string
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
        }
        Relationships: []
      }
      reward_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          note: string | null
          task_id: string | null
          user_id: string
          withdrawal_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind: string
          note?: string | null
          task_id?: string | null
          user_id: string
          withdrawal_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          task_id?: string | null
          user_id?: string
          withdrawal_id?: string | null
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          evidence: string
          id: string
          review_reason: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          evidence?: string
          id?: string
          review_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          evidence?: string
          id?: string
          review_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
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
          category: string
          created_at: string
          deadline: string | null
          description: string
          eligibility: string
          estimated_minutes: number
          id: string
          instructions: string
          is_active: boolean
          reward_amount: number
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string
          eligibility?: string
          estimated_minutes?: number
          id?: string
          instructions?: string
          is_active?: boolean
          reward_amount?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string
          eligibility?: string
          estimated_minutes?: number
          id?: string
          instructions?: string
          is_active?: boolean
          reward_amount?: number
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          is_featured: boolean
          is_published: boolean
          language: string
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          language?: string
          thumbnail_url?: string | null
          title: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          language?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          currency: string
          fees: number
          id: string
          net_amount: number
          payout_label: string | null
          payout_method_id: string | null
          provider_reference: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          currency: string
          fees: number
          id?: string
          net_amount: number
          payout_label?: string | null
          payout_method_id?: string | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          currency?: string
          fees?: number
          id?: string
          net_amount?: number
          payout_label?: string | null
          payout_method_id?: string | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
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
      admin_review_submission: {
        Args: { _approve: boolean; _id: string; _reason: string }
        Returns: undefined
      }
      admin_set_user_status: {
        Args: { _status: string; _user: string }
        Returns: undefined
      }
      admin_update_withdrawal: {
        Args: {
          _id: string
          _note: string
          _reference: string
          _status: Database["public"]["Enums"]["withdrawal_status"]
        }
        Returns: undefined
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      request_withdrawal: {
        Args: { _amount: number; _payout_method_id: string }
        Returns: string
      }
      submit_task: {
        Args: { _evidence: string; _task_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      submission_status: "submitted" | "under_review" | "approved" | "rejected"
      withdrawal_status:
        | "pending"
        | "under_review"
        | "approved"
        | "processing"
        | "paid"
        | "rejected"
        | "failed"
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
    Enums: {
      app_role: ["admin", "user"],
      submission_status: ["submitted", "under_review", "approved", "rejected"],
      withdrawal_status: [
        "pending",
        "under_review",
        "approved",
        "processing",
        "paid",
        "rejected",
        "failed",
      ],
    },
  },
} as const
