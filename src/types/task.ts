export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Client Work' | 'Internal' | 'Admin' | 'Sales' | 'Other';
export type TaskStatus = 'Unscheduled' | 'Scheduled' | 'In Progress' | 'Completed' | 'Blocked' | 'Cancelled';

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
  recurrenceType: string;
  recurrenceInterval?: number;
  nextDueDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferredStaffId?: string;
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
  preferred_staff_name?: string; // Added this property
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
