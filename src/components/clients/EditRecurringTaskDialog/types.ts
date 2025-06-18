
import { z } from 'zod';
import { RecurringTask, TaskPriority, TaskCategory, SkillType } from '@/types/task';
import { UseFormReturn } from 'react-hook-form';

// Unified Form Schema - Single source of truth for all edit task form validation
// This schema aligns with the RecurringTask interface and includes ALL required properties
export const EditTaskSchema = z.object({
  // Basic Task Information
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  estimatedHours: z.number().positive('Hours must be greater than 0').min(0.25, 'Minimum hours is 0.25'),
  
  // Task Classification
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const),
  category: z.enum(['Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other'] as const),
  
  // Skills and Staff Assignment
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  preferredStaffId: z.string().uuid('Invalid staff ID').optional().nullable()
    .refine(
      (value) => value === null || value === undefined || (typeof value === 'string' && value.trim() !== ''),
      { message: 'Preferred staff ID cannot be empty string' }
    ),
  
  // Scheduling
  dueDate: z.date().optional(),
  isRecurring: z.boolean().default(true), // Always true for recurring tasks
  
  // Recurrence Configuration - matches RecurrencePattern from task.ts
  recurrenceType: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom'] as const),
  interval: z.number().positive('Interval must be positive').min(1, 'Minimum interval is 1').optional(),
  weekdays: z.array(z.number().min(0).max(6)).optional(), // 0-6, where 0 is Sunday
  dayOfMonth: z.number().min(1, 'Day must be between 1-31').max(31, 'Day must be between 1-31').optional(),
  monthOfYear: z.number().min(1, 'Month must be between 1-12').max(12, 'Month must be between 1-12').optional(),
  endDate: z.date().optional().nullable(),
  customOffsetDays: z.number().optional()
});

// Form values type derived from the unified schema
export type EditTaskFormValues = z.infer<typeof EditTaskSchema>;

// Database to Form property mapping documentation
// This helps maintain consistency between database schema and form interface
export const PROPERTY_MAPPING = {
  // Database property -> Form property
  estimated_hours: 'estimatedHours',
  required_skills: 'requiredSkills', 
  preferred_staff_id: 'preferredStaffId',
  recurrence_type: 'recurrenceType',
  recurrence_interval: 'interval',
  day_of_month: 'dayOfMonth',
  month_of_year: 'monthOfYear',
  end_date: 'endDate',
  custom_offset_days: 'customOffsetDays',
  due_date: 'dueDate'
} as const;

// Component Props Interfaces
export interface EditRecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: RecurringTask | null;
  onSave: (updatedTask: Partial<RecurringTask>) => Promise<void>;
  isLoading?: boolean; 
  loadError?: string | null;
  attemptedLoad?: boolean;
}

export interface UseEditTaskFormOptions {
  task: RecurringTask | null;
  onSave: (updatedTask: Partial<RecurringTask>) => Promise<void>;
  onSuccess: () => void;
}

export interface UseEditTaskFormReturn {
  form: UseFormReturn<EditTaskFormValues>;
  isSaving: boolean;
  formError: string | null;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  skillsError: string | null;
  toggleSkill: (skillId: string) => void;
  onSubmit: (data: EditTaskFormValues) => Promise<void>;
  resetForm: () => void;
}
