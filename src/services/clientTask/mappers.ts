
import { RecurringTaskDB, RecurringTask, RecurrencePattern } from '@/types/task';

/**
 * Map database recurring task to application RecurringTask interface
 */
export const mapDatabaseToRecurringTask = (dbTask: RecurringTaskDB): RecurringTask => {
  // Map recurrence pattern from database fields
  const recurrencePattern: RecurrencePattern = {
    type: mapRecurrenceType(dbTask.recurrence_type),
    interval: dbTask.recurrence_interval || 1,
    weekdays: dbTask.weekdays || undefined,
    dayOfMonth: dbTask.day_of_month || undefined,
    monthOfYear: dbTask.month_of_year || undefined,
    endDate: dbTask.end_date ? new Date(dbTask.end_date) : undefined,
    customOffsetDays: dbTask.custom_offset_days || undefined
  };

  return {
    id: dbTask.id,
    templateId: dbTask.template_id,
    clientId: dbTask.client_id,
    name: dbTask.name,
    description: dbTask.description || '',
    estimatedHours: Number(dbTask.estimated_hours),
    requiredSkills: dbTask.required_skills || [],
    priority: dbTask.priority,
    category: dbTask.category,
    status: dbTask.status,
    dueDate: dbTask.due_date ? new Date(dbTask.due_date) : null,
    recurrencePattern,
    lastGeneratedDate: dbTask.last_generated_date ? new Date(dbTask.last_generated_date) : null,
    isActive: dbTask.is_active,
    preferredStaffId: dbTask.preferred_staff_id,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    notes: dbTask.notes || undefined
  };
};

/**
 * Map application RecurringTask to database RecurringTaskDB interface
 */
export const mapRecurringTaskToDatabase = (task: RecurringTask): Omit<RecurringTaskDB, 'clients' | 'staff'> => {
  return {
    id: task.id,
    template_id: task.templateId,
    client_id: task.clientId,
    name: task.name,
    description: task.description || null,
    estimated_hours: task.estimatedHours,
    required_skills: task.requiredSkills,
    priority: task.priority,
    category: task.category,
    status: task.status,
    due_date: task.dueDate ? task.dueDate.toISOString() : null,
    recurrence_type: task.recurrencePattern.type.toLowerCase(),
    recurrence_interval: task.recurrencePattern.interval || null,
    weekdays: task.recurrencePattern.weekdays || null,
    day_of_month: task.recurrencePattern.dayOfMonth || null,
    month_of_year: task.recurrencePattern.monthOfYear || null,
    end_date: task.recurrencePattern.endDate ? task.recurrencePattern.endDate.toISOString() : null,
    custom_offset_days: task.recurrencePattern.customOffsetDays || null,
    last_generated_date: task.lastGeneratedDate ? task.lastGeneratedDate.toISOString() : null,
    is_active: task.isActive,
    preferred_staff_id: task.preferredStaffId || null,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
    notes: task.notes || null
  };
};

/**
 * Map partial application RecurringTask to partial database RecurringTaskDB interface
 * Used for updates where not all fields are provided
 */
export const mapPartialRecurringTaskToDatabase = (task: Partial<RecurringTask>): Partial<Omit<RecurringTaskDB, 'clients' | 'staff'>> => {
  const result: Partial<Omit<RecurringTaskDB, 'clients' | 'staff'>> = {};

  if (task.id !== undefined) result.id = task.id;
  if (task.templateId !== undefined) result.template_id = task.templateId;
  if (task.clientId !== undefined) result.client_id = task.clientId;
  if (task.name !== undefined) result.name = task.name;
  if (task.description !== undefined) result.description = task.description || null;
  if (task.estimatedHours !== undefined) result.estimated_hours = task.estimatedHours;
  if (task.requiredSkills !== undefined) result.required_skills = task.requiredSkills;
  if (task.priority !== undefined) result.priority = task.priority;
  if (task.category !== undefined) result.category = task.category;
  if (task.status !== undefined) result.status = task.status;
  if (task.dueDate !== undefined) result.due_date = task.dueDate ? task.dueDate.toISOString() : null;
  
  // Handle recurrence pattern only if it exists
  if (task.recurrencePattern !== undefined) {
    result.recurrence_type = task.recurrencePattern.type.toLowerCase();
    result.recurrence_interval = task.recurrencePattern.interval || null;
    result.weekdays = task.recurrencePattern.weekdays || null;
    result.day_of_month = task.recurrencePattern.dayOfMonth || null;
    result.month_of_year = task.recurrencePattern.monthOfYear || null;
    result.end_date = task.recurrencePattern.endDate ? task.recurrencePattern.endDate.toISOString() : null;
    result.custom_offset_days = task.recurrencePattern.customOffsetDays || null;
  }
  
  if (task.lastGeneratedDate !== undefined) result.last_generated_date = task.lastGeneratedDate ? task.lastGeneratedDate.toISOString() : null;
  if (task.isActive !== undefined) result.is_active = task.isActive;
  if (task.preferredStaffId !== undefined) result.preferred_staff_id = task.preferredStaffId || null;
  if (task.createdAt !== undefined) result.created_at = task.createdAt.toISOString();
  if (task.updatedAt !== undefined) result.updated_at = task.updatedAt.toISOString();
  if (task.notes !== undefined) result.notes = task.notes || null;

  return result;
};

/**
 * Map database recurrence_type to application RecurrencePattern.type
 */
const mapRecurrenceType = (dbType: string): RecurrencePattern['type'] => {
  switch (dbType.toLowerCase()) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'annually':
      return 'Annually';
    case 'custom':
      return 'Custom';
    default:
      return 'Monthly'; // Default fallback
  }
};
