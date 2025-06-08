
export type SkillType = string;
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TaskCategory = "Tax" | "Audit" | "Advisory" | "Compliance" | "Bookkeeping" | "Other";
export type TaskStatus = "Unscheduled" | "Scheduled" | "In Progress" | "Completed" | "Canceled";

// Recurrence patterns for recurring tasks
export type RecurrencePattern = {
  type: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually" | "Custom";
  interval?: number; // Every X days/weeks/months/etc.
  weekdays?: number[]; // 0-6, where 0 is Sunday
  dayOfMonth?: number; // 1-31
  monthOfYear?: number; // 1-12
  endDate?: Date | null;
  customOffsetDays?: number; // For custom patterns (e.g., X days after month-end)
};

// Task Template definition
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  defaultEstimatedHours: number;
  requiredSkills: SkillType[];
  defaultPriority: TaskPriority;
  category: TaskCategory;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Base task interface (shared properties)
export interface BaseTask {
  id: string;
  templateId: string;
  clientId: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: SkillType[];
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// Database-level recurring task (matches actual database schema)
export interface RecurringTaskDB {
  id: string;
  template_id: string;
  client_id: string;
  name: string;
  description: string | null;
  estimated_hours: number;
  required_skills: SkillType[];
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  due_date: string | null;
  recurrence_type: string;
  recurrence_interval: number | null;
  weekdays: number[] | null;
  day_of_month: number | null;
  month_of_year: number | null;
  end_date: string | null;
  custom_offset_days: number | null;
  last_generated_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes: string | null;
  // Join data from clients table
  clients?: {
    id: string;
    legal_name: string;
  };
}

// Client-assigned recurring task (application-level interface)
export interface RecurringTask extends BaseTask {
  recurrencePattern: RecurrencePattern;
  lastGeneratedDate: Date | null;
  isActive: boolean;
}

// Individual task instance (can be from recurring or ad-hoc)
export interface TaskInstance extends BaseTask {
  recurringTaskId?: string; // If generated from a recurring task
  completedAt?: Date;
  assignedStaffId?: string;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
}
