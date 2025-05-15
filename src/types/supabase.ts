
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          legal_name: string
          primary_contact: string
          email: string
          phone: string
          billing_address: string
          industry: string
          status: string
          expected_monthly_revenue: number
          payment_terms: string
          billing_frequency: string
          default_task_priority: string
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legal_name: string
          primary_contact: string
          email: string
          phone: string
          billing_address: string
          industry: string
          status: string
          expected_monthly_revenue: number
          payment_terms: string
          billing_frequency: string
          default_task_priority: string
          notification_preferences: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          legal_name?: string
          primary_contact?: string
          email?: string
          phone?: string
          billing_address?: string
          industry?: string
          status?: string
          expected_monthly_revenue?: number
          payment_terms?: string
          billing_frequency?: string
          default_task_priority?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      task_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          default_estimated_hours: number
          required_skills: string[]
          default_priority: string
          category: string
          is_archived: boolean
          created_at: string
          updated_at: string
          version: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          default_estimated_hours: number
          required_skills: string[]
          default_priority: string
          category: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          default_estimated_hours?: number
          required_skills?: string[]
          default_priority?: string
          category?: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          version?: number
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          description: string | null
          cost_per_hour: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cost_per_hour: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          cost_per_hour?: number
          created_at?: string
          updated_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          assigned_skills: string[]
          cost_per_hour: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          assigned_skills: string[]
          cost_per_hour?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          assigned_skills?: string[]
          cost_per_hour?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      staff_availability: {
        Row: {
          id: string
          staff_id: string
          day_of_week: number
          time_slot: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          day_of_week: number
          time_slot: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          day_of_week?: number
          time_slot?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurring_tasks: {
        Row: {
          id: string
          template_id: string
          client_id: string
          name: string
          description: string | null
          estimated_hours: number
          required_skills: string[]
          priority: string
          category: string
          status: string
          due_date: string | null
          recurrence_type: string
          recurrence_interval: number | null
          weekdays: number[] | null
          day_of_month: number | null
          month_of_year: number | null
          end_date: string | null
          custom_offset_days: number | null
          last_generated_date: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          client_id: string
          name: string
          description?: string | null
          estimated_hours: number
          required_skills: string[]
          priority: string
          category: string
          status?: string
          due_date?: string | null
          recurrence_type: string
          recurrence_interval?: number | null
          weekdays?: number[] | null
          day_of_month?: number | null
          month_of_year?: number | null
          end_date?: string | null
          custom_offset_days?: number | null
          last_generated_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          client_id?: string
          name?: string
          description?: string | null
          estimated_hours?: number
          required_skills?: string[]
          priority?: string
          category?: string
          status?: string
          due_date?: string | null
          recurrence_type?: string
          recurrence_interval?: number | null
          weekdays?: number[] | null
          day_of_month?: number | null
          month_of_year?: number | null
          end_date?: string | null
          custom_offset_days?: number | null
          last_generated_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_instances: {
        Row: {
          id: string
          template_id: string
          recurring_task_id: string | null
          client_id: string
          name: string
          description: string | null
          estimated_hours: number
          required_skills: string[]
          priority: string
          category: string
          status: string
          due_date: string | null
          completed_at: string | null
          assigned_staff_id: string | null
          scheduled_start_time: string | null
          scheduled_end_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          recurring_task_id?: string | null
          client_id: string
          name: string
          description?: string | null
          estimated_hours: number
          required_skills: string[]
          priority: string
          category: string
          status?: string
          due_date?: string | null
          completed_at?: string | null
          assigned_staff_id?: string | null
          scheduled_start_time?: string | null
          scheduled_end_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          recurring_task_id?: string | null
          client_id?: string
          name?: string
          description?: string | null
          estimated_hours?: number
          required_skills?: string[]
          priority?: string
          category?: string
          status?: string
          due_date?: string | null
          completed_at?: string | null
          assigned_staff_id?: string | null
          scheduled_start_time?: string | null
          scheduled_end_time?: string | null
          notes?: string | null
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
  }
}
