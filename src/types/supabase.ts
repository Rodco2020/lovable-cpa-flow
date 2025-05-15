
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
