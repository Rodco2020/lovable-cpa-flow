
import { RecurringTask, RecurringTaskDB } from '@/types/task';

/**
 * Map database recurring task to application-level RecurringTask
 * FIXED: Consistent field name mapping from snake_case to camelCase
 */
export const mapDatabaseToRecurringTask = (dbTask: RecurringTaskDB): RecurringTask => {
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
    // FIXED: Consistent camelCase field mapping - crucial for filter compatibility
    preferredStaffId: dbTask.preferred_staff_id,
    recurrencePattern: {
      type: dbTask.recurrence_type as any,
      interval: dbTask.recurrence_interval || undefined,
      weekdays: dbTask.weekdays || undefined,
      dayOfMonth: dbTask.day_of_month || undefined,
      monthOfYear: dbTask.month_of_year || undefined,
      endDate: dbTask.end_date ? new Date(dbTask.end_date) : undefined,
      customOffsetDays: dbTask.custom_offset_days || undefined
    },
    lastGeneratedDate: dbTask.last_generated_date ? new Date(dbTask.last_generated_date) : null,
    isActive: dbTask.is_active,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    notes: dbTask.notes || undefined
  };
};

/**
 * Map application-level RecurringTask to database format for updates
 * FIXED: Consistent field name mapping from camelCase to snake_case
 */
export const mapRecurringTaskToDatabase = (task: Partial<RecurringTask>) => {
  const dbUpdate: any = {};
  
  if (task.name !== undefined) dbUpdate.name = task.name;
  if (task.description !== undefined) dbUpdate.description = task.description;
  if (task.estimatedHours !== undefined) dbUpdate.estimated_hours = task.estimatedHours;
  if (task.requiredSkills !== undefined) dbUpdate.required_skills = task.requiredSkills;
  if (task.priority !== undefined) dbUpdate.priority = task.priority;
  if (task.category !== undefined) dbUpdate.category = task.category;
  if (task.dueDate !== undefined) dbUpdate.due_date = task.dueDate?.toISOString() || null;
  // FIXED: Consistent mapping from camelCase to snake_case for database operations
  if (task.preferredStaffId !== undefined) dbUpdate.preferred_staff_id = task.preferredStaffId;
  if (task.isActive !== undefined) dbUpdate.is_active = task.isActive;
  
  // Handle recurrence pattern
  if (task.recurrencePattern) {
    const pattern = task.recurrencePattern;
    if (pattern.type !== undefined) dbUpdate.recurrence_type = pattern.type;
    if (pattern.interval !== undefined) dbUpdate.recurrence_interval = pattern.interval;
    if (pattern.weekdays !== undefined) dbUpdate.weekdays = pattern.weekdays;
    if (pattern.dayOfMonth !== undefined) dbUpdate.day_of_month = pattern.dayOfMonth;
    if (pattern.monthOfYear !== undefined) dbUpdate.month_of_year = pattern.monthOfYear;
    if (pattern.endDate !== undefined) dbUpdate.end_date = pattern.endDate?.toISOString() || null;
    if (pattern.customOffsetDays !== undefined) dbUpdate.custom_offset_days = pattern.customOffsetDays;
  }
  
  dbUpdate.updated_at = new Date().toISOString();
  
  console.log('🔧 [MAPPER] Database update mapping verification:', {
    camelCase_preferredStaffId: task.preferredStaffId,
    snake_case_preferred_staff_id: dbUpdate.preferred_staff_id,
    mappingConsistent: true
  });
  
  return dbUpdate;
};
