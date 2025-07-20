export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          program_category: string
          program_name: string
          start_date: string
          study_mode: string
          highest_education: string
          previous_certifications: string | null
          years_experience: string
          current_employer: string | null
          current_position: string | null
          heard_about: string | null
          questions: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          program_category: string
          program_name: string
          start_date: string
          study_mode: string
          highest_education: string
          previous_certifications?: string | null
          years_experience: string
          current_employer?: string | null
          current_position?: string | null
          heard_about?: string | null
          questions?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          date_of_birth?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          program_category?: string
          program_name?: string
          start_date?: string
          study_mode?: string
          highest_education?: string
          previous_certifications?: string | null
          years_experience?: string
          current_employer?: string | null
          current_position?: string | null
          heard_about?: string | null
          questions?: string | null
          status?: string
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          application_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          application_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
        }
        Update: {
          id?: string
          created_at?: string
          application_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
        }
      }
      certifications: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          category: string
          level: string
          price: number
          slug: string
          duration: string | null // Added duration
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          category: string
          level: string
          price: number
          slug: string
          duration?: string | null // Added duration
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          category?: string
          level?: string
          price?: number
          slug?: string
          duration?: string | null // Added duration
        }
      }
      modules: {
        // New table
        Row: {
          id: string
          created_at: string
          certification_id: string
          title: string
          description: string | null
          order_num: number
        }
        Insert: {
          id?: string
          created_at?: string
          certification_id: string
          title: string
          description?: string | null
          order_num: number
        }
        Update: {
          id?: string
          created_at?: string
          certification_id?: string
          title?: string
          description?: string | null
          order_num?: number
        }
      }
      lessons: {
        // New table
        Row: {
          id: string
          created_at: string
          module_id: string
          title: string
          content: string | null
          order_num: number
        }
        Insert: {
          id?: string
          created_at?: string
          module_id: string
          title: string
          content?: string | null
          order_num: number
        }
        Update: {
          id?: string
          created_at?: string
          module_id?: string
          title?: string
          content?: string | null
          order_num?: number
        }
      }
      user_enrollments: {
        // Updated table
        Row: {
          id: string
          created_at: string
          user_id: string
          certification_id: string
          progress: number
          status: string
          enrolled_at: string
          started_at: string | null
          completed_at: string | null
          due_date: string | null // Added due_date
          certificate_issued: boolean // Added certificate_issued
          certificate_url: string | null // Added certificate_url
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          certification_id: string
          progress?: number
          status?: string
          enrolled_at?: string
          started_at?: string | null
          completed_at?: string | null
          due_date?: string | null
          certificate_issued?: boolean
          certificate_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          certification_id?: string
          progress?: number
          status?: string
          enrolled_at?: string
          started_at?: string | null
          completed_at?: string | null
          due_date?: string | null
          certificate_issued?: boolean
          certificate_url?: string | null
        }
      }
      user_modules: {
        // Updated table
        Row: {
          id: string
          created_at: string
          user_id: string
          course_id: string // This should ideally be certification_id
          module_id: string // New foreign key to modules table
          is_completed: boolean
          completion_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          course_id: string
          module_id: string
          is_completed?: boolean
          completion_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          course_id?: string
          module_id?: string
          is_completed?: boolean
          completion_date?: string | null
        }
      }
    }
  }
}
