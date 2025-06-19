
export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Client Work' | 'Internal' | 'Admin' | 'Sales' | 'Other' | 'Tax' | 'Audit' | 'Advisory' | 'Compliance' | 'Bookkeeping';
export type TaskStatus = 'Unscheduled' | 'Scheduled' | 'In Progress' | 'Completed' | 'Blocked' | 'Cancelled' | 'Canceled';
export type SkillType = string; // Define as string for now, can be made more specific later

export interface RecurrencePattern {
  type: string;
  interval?: number;
  frequency?: number;
  weekdays?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  customOffsetDays?: number;
  endDate?: Date; // Added missing endDate property
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  dueDate?: Date | null;
  clientId?: string;
  staffId?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface TaskInstance {
  id: string;
  name: string;
  description?: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  dueDate?: Date | null;
  clientId?: string;
  staffId?: string;
  createdAt: Date;
  updatedAt: Date;
  recurringTaskId: string;
  notes?: string;
  templateId?: string;
}

export interface RecurringTask {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  recurrenceType: string; // Added missing recurrenceType property
  recurrenceInterval?: number;
  nextDueDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferredStaffId?: string;
  dueDate?: Date | null;
  recurrencePattern?: RecurrencePattern;
  notes?: string;
  templateId?: string;
  lastGeneratedDate?: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  defaultEstimatedHours: number;
  requiredSkills: string[];
  defaultPriority: TaskPriority;
  category: TaskCategory;
  version?: number;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringTaskDB {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  estimated_hours: number;
  required_skills: string[];
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  recurrence_type: string;
  recurrence_interval?: number;
  next_due_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  preferred_staff_id?: string;
  preferred_staff_name?: string;
  template_id?: string;
  due_date?: string;
  notes?: string;
  last_generated_date?: string;
  // Added missing database fields for recurrence pattern
  weekdays?: number[];
  day_of_month?: number;
  month_of_year?: number;
  clients?: {
    id: string;
    legal_name: string;
    expected_monthly_revenue?: number;
  };
  staff?: {
    id: string;
    full_name: string;
  };
}

export interface TaskFilter {
  skill?: string;
  client?: string;
  taskName?: string;
  dueDate?: Date;
  priority?: string;
  category?: string;
  status?: string;
}

export interface TaskBreakdownItem {
  task: RecurringTaskDB;
  monthlyHours: number;
  suggestedRevenue?: number;
}
