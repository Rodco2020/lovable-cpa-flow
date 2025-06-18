
import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';
import { RecurringTask, TaskPriority, TaskCategory, RecurrenceType } from '@/types/task';

// PHASE 2: Enhanced schema with better preferred staff validation
export const EditTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  estimatedHours: z.number().min(0.25, 'Estimated hours must be at least 0.25'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  category: z.enum(['Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other']),
  dueDate: z.date().optional(),
  isRecurring: z.boolean(),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  // PHASE 2: Enhanced preferred staff validation - null or valid UUID string
  preferredStaffId: z.string().uuid().nullable().optional().or(z.literal(null)),
  recurrenceType: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom']).optional(),
  interval: z.number().min(1).optional(),
  weekdays: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  monthOfYear: z.number().min(1).max(12).optional(),
  endDate: z.date().nullable().optional(),
  customOffsetDays: z.number().optional()
}).refine((data) => {
  // PHASE 2: Enhanced validation - if preferredStaffId is provided, it must be a valid UUID or null
  if (data.preferredStaffId !== null && data.preferredStaffId !== undefined) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(data.preferredStaffId);
  }
  return true;
}, {
  message: "Preferred staff ID must be a valid UUID or null",
  path: ["preferredStaffId"]
});

export type EditTaskFormValues = z.infer<typeof EditTaskSchema>;

// PHASE 2: Enhanced interface with stricter typing
export interface UseEditTaskFormOptions {
  task: RecurringTask | null;
  onSave: (task: Partial<RecurringTask>) => Promise<void>;
  onSuccess: () => void;
}

// PHASE 2: Enhanced return type with better type safety
export interface UseEditTaskFormReturn {
  form: UseFormReturn<EditTaskFormValues>;
  isSaving: boolean;
  formError: string | null;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  skillsError: string | null;
  toggleSkill: (skillId: string) => void;
  onSubmit: (data: EditTaskFormValues) => Promise<void>;
}

export interface EditRecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: RecurringTask | null;
  onSave: (task: Partial<RecurringTask>) => Promise<void>;
  isLoading?: boolean;
  loadError?: string | null;
  attemptedLoad?: boolean;
}

// PHASE 2: Enhanced type guard for preferred staff validation
export const isValidPreferredStaffId = (value: unknown): value is string | null => {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'string') return false;
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

// PHASE 2: Helper type for ensuring null safety
export type NullableString = string | null;

// PHASE 2: Type assertion helper for form values
export const assertValidFormValues = (data: EditTaskFormValues): EditTaskFormValues => {
  // Ensure preferredStaffId is properly typed
  if (data.preferredStaffId !== null && data.preferredStaffId !== undefined) {
    if (!isValidPreferredStaffId(data.preferredStaffId)) {
      throw new Error(`Invalid preferred staff ID: ${data.preferredStaffId}`);
    }
  }
  
  return data;
};
