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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      organ_donations: {
        Row: {
          blockchain_hash: string | null
          created_at: string
          doctor_verified_by: string | null
          donor_id: string
          id: string
          matched_request_id: string | null
          medical_clearance: boolean | null
          organ_type: Database["public"]["Enums"]["organ_type"]
          status: Database["public"]["Enums"]["donor_status"] | null
          updated_at: string
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string
          doctor_verified_by?: string | null
          donor_id: string
          id?: string
          matched_request_id?: string | null
          medical_clearance?: boolean | null
          organ_type: Database["public"]["Enums"]["organ_type"]
          status?: Database["public"]["Enums"]["donor_status"] | null
          updated_at?: string
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string
          doctor_verified_by?: string | null
          donor_id?: string
          id?: string
          matched_request_id?: string | null
          medical_clearance?: boolean | null
          organ_type?: Database["public"]["Enums"]["organ_type"]
          status?: Database["public"]["Enums"]["donor_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organ_donations_doctor_verified_by_fkey"
            columns: ["doctor_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organ_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organ_donations_matched_request_id_fkey"
            columns: ["matched_request_id"]
            isOneToOne: false
            referencedRelation: "organ_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      organ_requests: {
        Row: {
          blockchain_hash: string | null
          created_at: string
          doctor_notes: string | null
          id: string
          medical_condition: string
          organ_type: Database["public"]["Enums"]["organ_type"]
          patient_id: string
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string
          urgency_level: number | null
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string
          doctor_notes?: string | null
          id?: string
          medical_condition: string
          organ_type: Database["public"]["Enums"]["organ_type"]
          patient_id: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string
          urgency_level?: number | null
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string
          doctor_notes?: string | null
          id?: string
          medical_condition?: string
          organ_type?: Database["public"]["Enums"]["organ_type"]
          patient_id?: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string
          urgency_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organ_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          blood_type: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact: string | null
          full_name: string
          id: string
          medical_history: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          full_name: string
          id?: string
          medical_history?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          full_name?: string
          id?: string
          medical_history?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          blockchain_data: Json | null
          created_at: string
          from_user_id: string | null
          id: string
          organ_donation_id: string | null
          organ_request_id: string | null
          status: string | null
          to_user_id: string | null
          transaction_hash: string
          transaction_type: string
        }
        Insert: {
          blockchain_data?: Json | null
          created_at?: string
          from_user_id?: string | null
          id?: string
          organ_donation_id?: string | null
          organ_request_id?: string | null
          status?: string | null
          to_user_id?: string | null
          transaction_hash: string
          transaction_type: string
        }
        Update: {
          blockchain_data?: Json | null
          created_at?: string
          from_user_id?: string | null
          id?: string
          organ_donation_id?: string | null
          organ_request_id?: string | null
          status?: string | null
          to_user_id?: string | null
          transaction_hash?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_organ_donation_id_fkey"
            columns: ["organ_donation_id"]
            isOneToOne: false
            referencedRelation: "organ_donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_organ_request_id_fkey"
            columns: ["organ_request_id"]
            isOneToOne: false
            referencedRelation: "organ_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      donor_status:
        | "pending"
        | "verified"
        | "available"
        | "allocated"
        | "completed"
      organ_type:
        | "heart"
        | "kidney"
        | "liver"
        | "lung"
        | "pancreas"
        | "cornea"
        | "bone"
        | "skin"
      request_status:
        | "pending"
        | "approved"
        | "matched"
        | "transplanted"
        | "rejected"
      user_role: "patient" | "donor" | "doctor" | "admin"
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
      donor_status: [
        "pending",
        "verified",
        "available",
        "allocated",
        "completed",
      ],
      organ_type: [
        "heart",
        "kidney",
        "liver",
        "lung",
        "pancreas",
        "cornea",
        "bone",
        "skin",
      ],
      request_status: [
        "pending",
        "approved",
        "matched",
        "transplanted",
        "rejected",
      ],
      user_role: ["patient", "donor", "doctor", "admin"],
    },
  },
} as const
