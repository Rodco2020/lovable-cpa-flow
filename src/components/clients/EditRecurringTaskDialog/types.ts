
import { z } from 'zod';
import { RecurringTask, TaskPriority, TaskCategory, SkillType, RecurrenceType } from '@/types/task';

// Form schema for validation
export const EditTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  estimatedHours: z.number().positive('Hours must be greater than 0').min(0.25, 'Minimum hours is 0.25'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const),
  category: z.enum(['Client Work', 'Internal', 'Admin', 'Sales', 'Other', 'Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping'] as const),
  dueDate: z.date().optional(),
  isRecurring: z.boolean(),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  preferredStaffId: z.string().uuid('Invalid staff ID').optional().nullable()
    .refine(
      (value) => value === null || value === undefined || (typeof value === 'string' && value.trim() !== ''),
      { message: 'Preferred staff ID cannot be empty string' }
    ),
  recurrenceType: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom'] as const).optional(),
  interval: z.number().positive('Interval must be positive').min(1, 'Minimum interval is 1').optional(),
  weekdays: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1, 'Day must be between 1-31').max(31, 'Day must be between 1-31').optional(),
  monthOfYear: z.number().min(1, 'Month must be between 1-12').max(12, 'Month must be between 1-12').optional(),
  endDate: z.date().optional().nullable(),
  customOffsetDays: z.number().optional()
});

export type EditTaskFormValues = z.infer<typeof EditTaskSchema>;

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
  form: any;
  isSaving: boolean;
  formError: string | null;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  skillsError: string | null;
  toggleSkill: (skillId: string) => void;
  onSubmit: (data: EditTaskFormValues) => Promise<void>;
  resetForm: () => void;
}
