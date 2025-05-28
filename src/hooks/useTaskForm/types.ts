
import { TaskPriority, TaskCategory, TaskTemplate, RecurrencePattern, SkillType } from '@/types/task';

/**
 * Interface defining the structure of the task form data
 */
export interface TaskFormData {
  name: string;
  description: string;
  clientId: string;
  estimatedHours: number;
  priority: TaskPriority;
  category: TaskCategory;
  requiredSkills: SkillType[];
  dueDate: string;
  recurrenceType: RecurrencePattern['type'];
  interval: number;
  weekdays: number[];
  dayOfMonth: number;
  monthOfYear: number;
  endDate: string;
  customOffsetDays: number;
}

/**
 * Interface defining the return type of the useTaskForm hook
 */
export interface TaskFormHookReturn {
  taskForm: TaskFormData;
  selectedTemplate: TaskTemplate | null;
  formErrors: Record<string, string>;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTemplateSelect: (templateId: string, templates: TaskTemplate[]) => void;
  handleClientChange: (clientId: string) => void;
  handleWeekdayChange: (day: number, checked: boolean) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setFormErrors: (errors: Record<string, string>) => void;
  buildRecurrencePattern: () => RecurrencePattern;
}
