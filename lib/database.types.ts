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
      special_applications: {
        Row: {
          id: string
          user_id: string
          certification_id: string
          application_type: string
          reason: string | null
          supporting_documents: Json | null
          status: string
          admin_comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_id: string
          application_type: string
          reason?: string | null
          supporting_documents?: Json | null
          status?: string
          admin_comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_id?: string
          application_type?: string
          reason?: string | null
          supporting_documents?: Json | null
          status?: string
          admin_comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_schedule: {
        Row: {
          id: string
          certification_id: string
          title: string
          description: string | null
          date: string
          time: string | null
          location: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certification_id: string
          title: string
          description?: string | null
          date: string
          time?: string | null
          location?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          certification_id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string | null
          location?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          category: string
          created_at: string
          description: string
          duration: string | null
          features: string[] | null
          id: string
          instructor: string | null
          instructor_bio: string | null
          level: string
          long_description: string | null
          price: number
          rating: number | null
          slug: string
          students: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          duration?: string | null
          features?: string[] | null
          id?: string
          instructor?: string | null
          instructor_bio?: string | null
          level: string
          long_description?: string | null
          price: number
          rating?: number | null
          slug: string
          students?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          duration?: string | null
          features?: string[] | null
          id?: string
          instructor?: string | null
          instructor_bio?: string | null
          level?: string
          long_description?: string | null
          price?: number
          rating?: number | null
          slug?: string
          students?: number | null
          title?: string
        }
        Relationships: []
      }
      learning_outcomes: {
        Row: {
          certification_id: string
          created_at: string
          id: string
          order_num: number
          outcome: string
        }
        Insert: {
          certification_id: string
          created_at?: string
          id?: string
          order_num: number
          outcome: string
        }
        Update: {
          certification_id?: string
          created_at?: string
          id?: string
          order_num?: number
          outcome?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_outcomes_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      prerequisites: {
        Row: {
          certification_id: string
          created_at: string
          id: string
          order_num: number
          prerequisite: string
        }
        Insert: {
          certification_id: string
          created_at?: string
          id?: string
          order_num: number
          prerequisite: string
        }
        Update: {
          certification_id?: string
          created_at?: string
          id?: string
          order_num?: number
          prerequisite?: string
        }
        Relationships: [
          {
            foreignKeyName: "prerequisites_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certification_reviews: {
        Row: {
          certification_id: string
          comment: string
          created_at: string
          id: string
          rating: number
          review_date: string
          student_name: string
        }
        Insert: {
          certification_id: string
          comment: string
          created_at?: string
          id?: string
          rating: number
          review_date: string
          student_name: string
        }
        Update: {
          certification_id?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          review_date?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "certification_reviews_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          certification_id: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          lessons_count: number | null
          order_num: number
          title: string
        }
        Insert: {
          certification_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          lessons_count?: number | null
          order_num: number
          title: string
        }
        Update: {
          certification_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          lessons_count?: number | null
          order_num?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          id: string
          module_id: string
          order_num: number
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          module_id: string
          order_num: number
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          module_id?: string
          order_num?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_enrollments: {
        Row: {
          certificate_issued: boolean
          certificate_url: string | null
          certificate_verification_code: string | null
          certification_id: string
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          payment_status: string
          progress: number
          status: string
          user_id: string
        }
        Insert: {
          certificate_issued?: boolean
          certificate_url?: string | null
          certificate_verification_code?: string | null
          certification_id: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          payment_status?: string
          progress?: number
          status?: string
          user_id: string
        }
        Update: {
          certificate_issued?: boolean
          certificate_url?: string | null
          certificate_verification_code?: string | null
          certification_id?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
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
          phone_number: string | null
          address: string | null
          profile_picture_url: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          is_admin?: boolean | null
          user_id: string
          phone_number?: string | null
          address?: string | null
          profile_picture_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          is_admin?: boolean | null
          user_id?: string
          phone_number?: string | null
          address?: string | null
          profile_picture_url?: string | null
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
\
export interface CertificationWithDetails extends Database["public"]["Tables"]["certifications"]["Row"] {
  learning_outcomes: Database["public"]["Tables"]["learning_outcomes"]["Row"][]
  prerequisites: Database["public"]["Tables"]["prerequisites"]["Row"][]
  modules: (Database["public"]["Tables"]["modules"]["Row"] & {
    lessons: Database["public"]["Tables"]["lessons"]["Row"][]
  })[]
  reviews: Database["public"]["Tables"]["certification_reviews"]["Row"][]
}
