export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          user_id: string
          certification_id: string
          full_name: string
          email: string
          phone: string
          country: string
          education_level: string
          work_experience: string
          motivation: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_id: string
          full_name: string
          email: string
          phone: string
          country: string
          education_level: string
          work_experience: string
          motivation: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_id?: string
          full_name?: string
          email?: string
          phone?: string
          country?: string
          education_level?: string
          work_experience?: string
          motivation?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          duration: string
          level: string
          requirements: string[]
          learning_outcomes: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          duration: string
          level: string
          requirements: string[]
          learning_outcomes: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          duration?: string
          level?: string
          requirements?: string[]
          learning_outcomes?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          content: string
          video_url: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          content: string
          video_url?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          content?: string
          video_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          certification_id: string
          title: string
          description: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certification_id: string
          title: string
          description: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          certification_id?: string
          title?: string
          description?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_enrollments: {
        Row: {
          id: string
          user_id: string
          certification_id: string
          enrollment_date: string
          completion_date: string | null
          progress: number
          status: string
          payment_status: string
          payment_reference: string | null
          certificate_issued: boolean
          certificate_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_id: string
          enrollment_date?: string
          completion_date?: string | null
          progress?: number
          status?: string
          payment_status?: string
          payment_reference?: string | null
          certificate_issued?: boolean
          certificate_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_id?: string
          enrollment_date?: string
          completion_date?: string | null
          progress?: number
          status?: string
          payment_status?: string
          payment_reference?: string | null
          certificate_issued?: boolean
          certificate_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          phone: string | null
          country: string | null
          education_level: string | null
          work_experience: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          country?: string | null
          education_level?: string | null
          work_experience?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          country?: string | null
          education_level?: string | null
          work_experience?: string | null
          created_at?: string
          updated_at?: string
        }
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
