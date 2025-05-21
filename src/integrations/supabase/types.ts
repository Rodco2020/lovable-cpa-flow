export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          billing_address: string
          billing_frequency: string
          created_at: string
          default_task_priority: string
          email: string
          expected_monthly_revenue: number
          id: string
          industry: string
          legal_name: string
          notification_preferences: Json
          payment_terms: string
          phone: string
          primary_contact: string
          staff_liaison_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          billing_address: string
          billing_frequency: string
          created_at?: string
          default_task_priority: string
          email: string
          expected_monthly_revenue: number
          id?: string
          industry: string
          legal_name: string
          notification_preferences?: Json
          payment_terms: string
          phone: string
          primary_contact: string
          staff_liaison_id?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          billing_address?: string
          billing_frequency?: string
          created_at?: string
          default_task_priority?: string
          email?: string
          expected_monthly_revenue?: number
          id?: string
          industry?: string
          legal_name?: string
          notification_preferences?: Json
          payment_terms?: string
          phone?: string
          primary_contact?: string
          staff_liaison_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client_staff_liaison"
            columns: ["staff_liaison_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_tasks: {
        Row: {
          category: string
          client_id: string
          created_at: string
          custom_offset_days: number | null
          day_of_month: number | null
          description: string | null
          due_date: string | null
          end_date: string | null
          estimated_hours: number
          id: string
          is_active: boolean
          last_generated_date: string | null
          month_of_year: number | null
          name: string
          notes: string | null
          priority: string
          recurrence_interval: number | null
          recurrence_type: string
          required_skills: string[]
          status: string
          template_id: string
          updated_at: string
          weekdays: number[] | null
        }
        Insert: {
          category: string
          client_id: string
          created_at?: string
          custom_offset_days?: number | null
          day_of_month?: number | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          estimated_hours: number
          id?: string
          is_active?: boolean
          last_generated_date?: string | null
          month_of_year?: number | null
          name: string
          notes?: string | null
          priority: string
          recurrence_interval?: number | null
          recurrence_type: string
          required_skills: string[]
          status?: string
          template_id: string
          updated_at?: string
          weekdays?: number[] | null
        }
        Update: {
          category?: string
          client_id?: string
          created_at?: string
          custom_offset_days?: number | null
          day_of_month?: number | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          estimated_hours?: number
          id?: string
          is_active?: boolean
          last_generated_date?: string | null
          month_of_year?: number | null
          name?: string
          notes?: string | null
          priority?: string
          recurrence_interval?: number | null
          recurrence_type?: string
          required_skills?: string[]
          status?: string
          template_id?: string
          updated_at?: string
          weekdays?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          cost_per_hour: number
          created_at: string
          description: string | null
          id: string
          name: string
          proficiency_level: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_per_hour: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          proficiency_level?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_per_hour?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          proficiency_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          assigned_skills: string[]
          cost_per_hour: number
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role_title: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_skills: string[]
          cost_per_hour?: number
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role_title?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_skills?: string[]
          cost_per_hour?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role_title?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_availability: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_available: boolean
          staff_id: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_available?: boolean
          staff_id: string
          time_slot: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_available?: boolean
          staff_id?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      task_instances: {
        Row: {
          assigned_staff_id: string | null
          category: string
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number
          id: string
          name: string
          notes: string | null
          priority: string
          recurring_task_id: string | null
          required_skills: string[]
          scheduled_end_time: string | null
          scheduled_start_time: string | null
          status: string
          template_id: string
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          category: string
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours: number
          id?: string
          name: string
          notes?: string | null
          priority: string
          recurring_task_id?: string | null
          required_skills: string[]
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          status?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          category?: string
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number
          id?: string
          name?: string
          notes?: string | null
          priority?: string
          recurring_task_id?: string | null
          required_skills?: string[]
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          status?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_instances_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_recurring_task_id_fkey"
            columns: ["recurring_task_id"]
            isOneToOne: false
            referencedRelation: "recurring_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string
          created_at: string
          default_estimated_hours: number
          default_priority: string
          description: string | null
          id: string
          is_archived: boolean
          name: string
          required_skills: string[]
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          created_at?: string
          default_estimated_hours: number
          default_priority: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          required_skills: string[]
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          created_at?: string
          default_estimated_hours?: number
          default_priority?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          required_skills?: string[]
          updated_at?: string
          version?: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
