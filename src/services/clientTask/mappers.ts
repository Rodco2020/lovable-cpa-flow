
import { RecurringTask, RecurringTaskDB } from '@/types/task';

/**
 * Map database recurring task to application-level RecurringTask
 */
export const mapDatabaseToRecurringTask = (dbTask: RecurringTaskDB): RecurringTask => {
  console.log('🔄 [mapDatabaseToRecurringTask] Mapping database to application format:', {
    dbPreferredStaffId: dbTask.preferred_staff_id,
    dbPreferredStaffIdType: typeof dbTask.preferred_staff_id,
    taskId: dbTask.id,
    timestamp: new Date().toISOString()
  });

  const mapped = {
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
    preferredStaffId: dbTask.preferred_staff_id, // PHASE 1: Direct mapping with logging
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

  console.log('✅ [mapDatabaseToRecurringTask] Mapping completed:', {
    mappedPreferredStaffId: mapped.preferredStaffId,
    mappedPreferredStaffIdType: typeof mapped.preferredStaffId,
    taskId: mapped.id,
    timestamp: new Date().toISOString()
  });

  return mapped;
};

/**
 * Map application-level RecurringTask to database format for updates
 */
export const mapRecurringTaskToDatabase = (task: Partial<RecurringTask>) => {
  console.log('🔄 [mapRecurringTaskToDatabase] Mapping application to database format:', {
    appPreferredStaffId: task.preferredStaffId,
    appPreferredStaffIdType: typeof task.preferredStaffId,
    taskId: task.id,
    timestamp: new Date().toISOString()
  });

  const dbUpdate: any = {};
  
  if (task.name !== undefined) dbUpdate.name = task.name;
  if (task.description !== undefined) dbUpdate.description = task.description;
  if (task.estimatedHours !== undefined) dbUpdate.estimated_hours = task.estimatedHours;
  if (task.requiredSkills !== undefined) dbUpdate.required_skills = task.requiredSkills;
  if (task.priority !== undefined) dbUpdate.priority = task.priority;
  if (task.category !== undefined) dbUpdate.category = task.category;
  if (task.dueDate !== undefined) dbUpdate.due_date = task.dueDate?.toISOString() || null;
  if (task.preferredStaffId !== undefined) {
    dbUpdate.preferred_staff_id = task.preferredStaffId; // PHASE 1: Direct mapping with enhanced logging
    console.log('🎯 [mapRecurringTaskToDatabase] Preferred staff mapping:', {
      sourceValue: task.preferredStaffId,
      sourceType: typeof task.preferredStaffId,
      targetValue: dbUpdate.preferred_staff_id,
      targetType: typeof dbUpdate.preferred_staff_id,
      timestamp: new Date().toISOString()
    });
  }
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

  console.log('✅ [mapRecurringTaskToDatabase] Database mapping completed:', {
    finalDbUpdate: dbUpdate,
    preferredStaffId: dbUpdate.preferred_staff_id,
    preferredStaffIdType: typeof dbUpdate.preferred_staff_id,
    timestamp: new Date().toISOString()
  });
  
  return dbUpdate;
};
