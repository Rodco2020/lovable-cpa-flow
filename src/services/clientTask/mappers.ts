
import { RecurringTask, RecurringTaskDB } from '@/types/task';

/**
 * Validate if a string is a valid UUID format
 */
const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validate and normalize preferred staff ID
 */
const validateAndNormalizeStaffId = (staffId: unknown, context: string): string | null => {
  console.log(`🔍 [${context}] Validating staff ID:`, {
    rawValue: staffId,
    valueType: typeof staffId,
    isNull: staffId === null,
    isUndefined: staffId === undefined,
    timestamp: new Date().toISOString()
  });

  // Handle null/undefined cases
  if (staffId === null || staffId === undefined) {
    return null;
  }

  // Handle empty string case
  if (staffId === '') {
    console.log(`⚠️ [${context}] Empty string converted to null`);
    return null;
  }

  // Ensure it's a string
  if (typeof staffId !== 'string') {
    console.error(`❌ [${context}] Invalid staff ID type:`, {
      value: staffId,
      type: typeof staffId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Invalid preferred staff ID format: expected string or null, got ${typeof staffId}`);
  }

  // Validate UUID format
  if (!isValidUUID(staffId)) {
    console.error(`❌ [${context}] Invalid UUID format:`, {
      value: staffId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Invalid preferred staff ID format: ${staffId} is not a valid UUID`);
  }

  console.log(`✅ [${context}] Staff ID validation successful:`, {
    validatedValue: staffId,
    timestamp: new Date().toISOString()
  });

  return staffId;
};

/**
 * Map database recurring task to application-level RecurringTask
 */
export const mapDatabaseToRecurringTask = (dbTask: RecurringTaskDB): RecurringTask => {
  console.log('🔄 [mapDatabaseToRecurringTask] PHASE 3 - Starting mapping:', {
    taskId: dbTask.id,
    dbPreferredStaffId: dbTask.preferred_staff_id,
    dbPreferredStaffIdType: typeof dbTask.preferred_staff_id,
    timestamp: new Date().toISOString()
  });

  try {
    // PHASE 3: Enhanced staff ID validation and normalization
    const normalizedStaffId = validateAndNormalizeStaffId(
      dbTask.preferred_staff_id, 
      'mapDatabaseToRecurringTask'
    );

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
      preferredStaffId: normalizedStaffId, // PHASE 3: Use validated value
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

    console.log('✅ [mapDatabaseToRecurringTask] PHASE 3 - Mapping completed successfully:', {
      taskId: mapped.id,
      mappedPreferredStaffId: mapped.preferredStaffId,
      mappedPreferredStaffIdType: typeof mapped.preferredStaffId,
      timestamp: new Date().toISOString()
    });

    return mapped;
  } catch (error) {
    console.error('💥 [mapDatabaseToRecurringTask] PHASE 3 - Mapping failed:', {
      taskId: dbTask.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      dbPreferredStaffId: dbTask.preferred_staff_id,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Map application-level RecurringTask to database format for updates
 */
export const mapRecurringTaskToDatabase = (task: Partial<RecurringTask>) => {
  console.log('🔄 [mapRecurringTaskToDatabase] PHASE 3 - Starting database mapping:', {
    taskId: task.id,
    appPreferredStaffId: task.preferredStaffId,
    appPreferredStaffIdType: typeof task.preferredStaffId,
    timestamp: new Date().toISOString()
  });

  try {
    const dbUpdate: any = {};
    
    if (task.name !== undefined) dbUpdate.name = task.name;
    if (task.description !== undefined) dbUpdate.description = task.description;
    if (task.estimatedHours !== undefined) dbUpdate.estimated_hours = task.estimatedHours;
    if (task.requiredSkills !== undefined) dbUpdate.required_skills = task.requiredSkills;
    if (task.priority !== undefined) dbUpdate.priority = task.priority;
    if (task.category !== undefined) dbUpdate.category = task.category;
    if (task.dueDate !== undefined) dbUpdate.due_date = task.dueDate?.toISOString() || null;
    
    // PHASE 3: Enhanced preferred staff ID handling with validation
    if (task.preferredStaffId !== undefined) {
      const validatedStaffId = validateAndNormalizeStaffId(
        task.preferredStaffId, 
        'mapRecurringTaskToDatabase'
      );
      
      dbUpdate.preferred_staff_id = validatedStaffId;
      
      console.log('🎯 [mapRecurringTaskToDatabase] PHASE 3 - Preferred staff mapping completed:', {
        sourceValue: task.preferredStaffId,
        sourceType: typeof task.preferredStaffId,
        validatedValue: validatedStaffId,
        validatedType: typeof validatedStaffId,
        dbFieldValue: dbUpdate.preferred_staff_id,
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

    console.log('✅ [mapRecurringTaskToDatabase] PHASE 3 - Database mapping completed successfully:', {
      taskId: task.id,
      finalDbUpdate: dbUpdate,
      preferredStaffId: dbUpdate.preferred_staff_id,
      preferredStaffIdType: typeof dbUpdate.preferred_staff_id,
      hasPreferredStaffUpdate: 'preferred_staff_id' in dbUpdate,
      timestamp: new Date().toISOString()
    });
    
    return dbUpdate;
  } catch (error) {
    console.error('💥 [mapRecurringTaskToDatabase] PHASE 3 - Database mapping failed:', {
      taskId: task.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      appPreferredStaffId: task.preferredStaffId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
