
export type SkillType = "Junior" | "Senior" | "CPA" | "Tax Specialist" | "Audit" | "Advisory" | "Bookkeeping" | string;
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

// Client-assigned recurring task (subscription)
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

// Parameters for creating a recurring task
export interface RecurringTaskCreateParams {
  templateId: string;
  clientId: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: SkillType[];
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: Date;
  recurrencePattern: RecurrencePattern;
  status?: TaskStatus;
  isActive: boolean; // Add isActive field which was missing
}

// Parameters for creating an ad-hoc task
export interface AdHocTaskCreateParams {
  templateId: string;
  clientId: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: SkillType[];
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: Date;
  status?: TaskStatus;
}
