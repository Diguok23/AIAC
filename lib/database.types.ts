export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          certification_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          certification_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          certification_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          description: string
          duration: string | null
          id: string
          level: string
          price: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          duration?: string | null
          id?: string
          level: string
          price: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          duration?: string | null
          id?: string
          level?: string
          price?: number
          title?: string
        }
        Relationships: []
      }
      user_enrollments: {
        Row: {
          certificate_issued: boolean
          certificate_url: string | null
          certification_id: string
          completed_at: string | null
          created_at: string
          id: string
          payment_status: string
          progress: number
          status: string
          user_id: string
        }
        Insert: {
          certificate_issued?: boolean
          certificate_url?: string | null
          certification_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_status?: string
          progress?: number
          status?: string
          user_id: string
        }
        Update: {
          certificate_issued?: boolean
          certificate_url?: string | null
          certification_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_status?: string
          progress?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_enrollments_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: number
          is_admin: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          is_admin?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          is_admin?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type EnrollmentWithCertification = Database["public"]["Tables"]["user_enrollments"]["Row"] & {
  certification: Database["public"]["Tables"]["certifications"]["Row"]
}

export type ApplicationWithCertification = Database["public"]["Tables"]["applications"]["Row"] & {
  certification: Database["public"]["Tables"]["certifications"]["Row"]
}

export interface DashboardStats {
  totalEnrollments: number
  activeEnrollments: number
  completedCertifications: number
  pendingApplications: number
}
