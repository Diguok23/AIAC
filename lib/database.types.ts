export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          address: string | null
          certification_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          address?: string | null
          certification_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          address?: string | null
          certification_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
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
          description: string | null
          duration_days: number | null
          id: string
          image_url: string | null
          name: string | null
          price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          name?: string | null
          price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          name?: string | null
          price?: number | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          id: string
          module_id: string | null
          order_index: number | null
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          module_id?: string | null
          order_index?: number | null
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          module_id?: string | null
          order_index?: number | null
          title?: string | null
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
      modules: {
        Row: {
          certification_id: string | null
          created_at: string
          id: string
          name: string | null
          order_index: number | null
        }
        Insert: {
          certification_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          order_index?: number | null
        }
        Update: {
          certification_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          order_index?: number | null
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
      user_enrollments: {
        Row: {
          certificate_issued: boolean | null
          certificate_url: string | null
          created_at: string
          course_id: string | null
          due_date: string | null
          id: string
          progress: number | null
          status: Database["public"]["Enums"]["enrollment_status"]
          user_id: string | null
        }
        Insert: {
          certificate_issued?: boolean | null
          certificate_url?: string | null
          created_at?: string
          course_id?: string | null
          due_date?: string | null
          id?: string
          progress?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string | null
        }
        Update: {
          certificate_issued?: boolean | null
          certificate_url?: string | null
          created_at?: string
          course_id?: string | null
          due_date?: string | null
          id?: string
          progress?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_modules: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          module_id: string | null
          user_enrollment_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          module_id?: string | null
          user_enrollment_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          module_id?: string | null
          user_enrollment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_modules_user_enrollment_id_fkey"
            columns: ["user_enrollment_id"]
            isOneToOne: false
            referencedRelation: "user_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: number
          is_admin: boolean | null // Added is_admin
          phone_number: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          is_admin?: boolean | null // Added is_admin
          phone_number?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          is_admin?: boolean | null // Added is_admin
          phone_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
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
      application_status: "pending" | "approved" | "rejected"
      enrollment_status: "enrolled" | "completed" | "dropped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
