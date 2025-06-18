
import { RecurringTask, RecurringTaskDB } from '@/types/task';

/**
 * Data Transformation Service
 * 
 * Provides comprehensive bidirectional transformation between database and application schemas.
 * Handles all edge cases including null values, optional fields, and data validation.
 */

export class DataTransformationError extends Error {
  constructor(message: string, public field?: string) {
    super(`DataTransformation: ${message}`);
    this.name = 'DataTransformationError';
  }
}

/**
 * Transform database recurring task to application format
 * Handles all edge cases and provides comprehensive data mapping
 */
export const transformDatabaseToApplication = (dbTask: RecurringTaskDB): RecurringTask => {
  try {
    console.log('[DataTransformation] Transforming database to application:', dbTask);
    
    // Validate required fields
    if (!dbTask.id) throw new DataTransformationError('Missing task ID', 'id');
    if (!dbTask.name) throw new DataTransformationError('Missing task name', 'name');
    if (!dbTask.template_id) throw new DataTransformationError('Missing template ID', 'template_id');
    if (!dbTask.client_id) throw new DataTransformationError('Missing client ID', 'client_id');

    const transformed = {
      id: dbTask.id,
      templateId: dbTask.template_id,
      clientId: dbTask.client_id,
      name: dbTask.name,
      description: dbTask.description || '',
      estimatedHours: Number(dbTask.estimated_hours) || 0,
      requiredSkills: Array.isArray(dbTask.required_skills) ? dbTask.required_skills : [],
      priority: dbTask.priority,
      category: dbTask.category,
      status: dbTask.status,
      dueDate: dbTask.due_date ? new Date(dbTask.due_date) : null,
      preferredStaffId: dbTask.preferred_staff_id || null,
      recurrencePattern: {
        type: dbTask.recurrence_type as any,
        interval: dbTask.recurrence_interval || undefined,
        weekdays: Array.isArray(dbTask.weekdays) ? dbTask.weekdays : undefined,
        dayOfMonth: dbTask.day_of_month || undefined,
        monthOfYear: dbTask.month_of_year || undefined,
        endDate: dbTask.end_date ? new Date(dbTask.end_date) : undefined,
        customOffsetDays: dbTask.custom_offset_days || undefined
      },
      lastGeneratedDate: dbTask.last_generated_date ? new Date(dbTask.last_generated_date) : null,
      isActive: Boolean(dbTask.is_active),
      createdAt: new Date(dbTask.created_at),
      updatedAt: new Date(dbTask.updated_at),
      notes: dbTask.notes || undefined
    };
    
    console.log('[DataTransformation] Transformed to application format:', transformed);
    console.log('[DataTransformation] Preferred staff ID mapped to:', transformed.preferredStaffId);
    
    return transformed;
  } catch (error) {
    console.error('[DataTransformation] Error transforming database to application:', error);
    if (error instanceof DataTransformationError) {
      throw error;
    }
    throw new DataTransformationError(`Failed to transform database record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Transform application recurring task to database format
 * Handles partial updates and all edge cases with enhanced logging
 */
export const transformApplicationToDatabase = (appTask: Partial<RecurringTask>) => {
  try {
    console.log('[DataTransformation] Starting transformation to database format');
    console.log('[DataTransformation] Input data:', JSON.stringify(appTask, null, 2));
    
    const dbUpdate: any = {};
    
    // Handle basic fields with proper null/undefined handling
    if (appTask.name !== undefined) {
      dbUpdate.name = appTask.name;
      console.log('[DataTransformation] Setting name:', appTask.name);
    }
    
    if (appTask.description !== undefined) {
      dbUpdate.description = appTask.description || null;
      console.log('[DataTransformation] Setting description:', appTask.description);
    }
    
    if (appTask.estimatedHours !== undefined) {
      dbUpdate.estimated_hours = Number(appTask.estimatedHours);
      console.log('[DataTransformation] Setting estimated_hours:', appTask.estimatedHours);
    }
    
    if (appTask.priority !== undefined) {
      dbUpdate.priority = appTask.priority;
      console.log('[DataTransformation] Setting priority:', appTask.priority);
    }
    
    if (appTask.category !== undefined) {
      dbUpdate.category = appTask.category;
      console.log('[DataTransformation] Setting category:', appTask.category);
    }
    
    if (appTask.status !== undefined) {
      dbUpdate.status = appTask.status;
      console.log('[DataTransformation] Setting status:', appTask.status);
    }
    
    if (appTask.isActive !== undefined) {
      dbUpdate.is_active = Boolean(appTask.isActive);
      console.log('[DataTransformation] Setting is_active:', appTask.isActive);
    }
    
    // Handle arrays with proper validation
    if (appTask.requiredSkills !== undefined) {
      dbUpdate.required_skills = Array.isArray(appTask.requiredSkills) ? appTask.requiredSkills : [];
      console.log('[DataTransformation] Setting required_skills:', appTask.requiredSkills);
    }
    
    // Handle date fields with proper ISO string conversion
    if (appTask.dueDate !== undefined) {
      dbUpdate.due_date = appTask.dueDate ? appTask.dueDate.toISOString() : null;
      console.log('[DataTransformation] Setting due_date:', appTask.dueDate);
    }
    
    // CRITICAL FIX: Handle preferred staff with explicit logging and proper null handling
    if (appTask.preferredStaffId !== undefined) {
      console.log('[DataTransformation] PREFERRED STAFF PROCESSING:');
      console.log('[DataTransformation] - Input preferredStaffId:', appTask.preferredStaffId);
      console.log('[DataTransformation] - Type:', typeof appTask.preferredStaffId);
      console.log('[DataTransformation] - Is null:', appTask.preferredStaffId === null);
      console.log('[DataTransformation] - Is empty string:', appTask.preferredStaffId === '');
      
      // Handle both null and empty string as null in database
      if (appTask.preferredStaffId === null || appTask.preferredStaffId === '') {
        dbUpdate.preferred_staff_id = null;
        console.log('[DataTransformation] - Setting preferred_staff_id to null');
      } else {
        dbUpdate.preferred_staff_id = appTask.preferredStaffId;
        console.log('[DataTransformation] - Setting preferred_staff_id to:', appTask.preferredStaffId);
      }
    } else {
      console.log('[DataTransformation] - preferredStaffId not provided in update (undefined)');
    }
    
    // Handle recurrence pattern with comprehensive mapping
    if (appTask.recurrencePattern) {
      const pattern = appTask.recurrencePattern;
      console.log('[DataTransformation] Processing recurrence pattern:', pattern);
      
      if (pattern.type !== undefined) dbUpdate.recurrence_type = pattern.type;
      if (pattern.interval !== undefined) dbUpdate.recurrence_interval = pattern.interval;
      if (pattern.weekdays !== undefined) {
        dbUpdate.weekdays = Array.isArray(pattern.weekdays) ? pattern.weekdays : null;
      }
      if (pattern.dayOfMonth !== undefined) dbUpdate.day_of_month = pattern.dayOfMonth;
      if (pattern.monthOfYear !== undefined) dbUpdate.month_of_year = pattern.monthOfYear;
      if (pattern.endDate !== undefined) {
        dbUpdate.end_date = pattern.endDate ? pattern.endDate.toISOString() : null;
      }
      if (pattern.customOffsetDays !== undefined) dbUpdate.custom_offset_days = pattern.customOffsetDays;
    }
    
    // Handle other date fields
    if (appTask.lastGeneratedDate !== undefined) {
      dbUpdate.last_generated_date = appTask.lastGeneratedDate ? appTask.lastGeneratedDate.toISOString() : null;
    }
    
    // Handle notes
    if (appTask.notes !== undefined) {
      dbUpdate.notes = appTask.notes || null;
    }
    
    // Always update the timestamp
    dbUpdate.updated_at = new Date().toISOString();
    
    console.log('[DataTransformation] Final database update object:', JSON.stringify(dbUpdate, null, 2));
    console.log('[DataTransformation] CRITICAL - preferred_staff_id in final object:', dbUpdate.preferred_staff_id);
    
    return dbUpdate;
  } catch (error) {
    console.error('[DataTransformation] Error transforming application to database:', error);
    throw new DataTransformationError(`Failed to transform application data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate recurring task data consistency
 */
export const validateTaskData = (task: Partial<RecurringTask>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate estimated hours
  if (task.estimatedHours !== undefined && (task.estimatedHours <= 0 || !Number.isFinite(task.estimatedHours))) {
    errors.push('Estimated hours must be a positive number');
  }
  
  // Validate required skills
  if (task.requiredSkills !== undefined) {
    if (!Array.isArray(task.requiredSkills)) {
      errors.push('Required skills must be an array');
    } else if (task.requiredSkills.length === 0) {
      errors.push('At least one skill is required');
    }
  }
  
  // Validate recurrence pattern
  if (task.recurrencePattern) {
    const pattern = task.recurrencePattern;
    
    if (pattern.interval !== undefined && (pattern.interval <= 0 || !Number.isInteger(pattern.interval))) {
      errors.push('Recurrence interval must be a positive integer');
    }
    
    if (pattern.dayOfMonth !== undefined && (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31)) {
      errors.push('Day of month must be between 1 and 31');
    }
    
    if (pattern.monthOfYear !== undefined && (pattern.monthOfYear < 1 || pattern.monthOfYear > 12)) {
      errors.push('Month of year must be between 1 and 12');
    }
    
    if (pattern.weekdays !== undefined && Array.isArray(pattern.weekdays)) {
      const invalidWeekdays = pattern.weekdays.filter(day => day < 0 || day > 6);
      if (invalidWeekdays.length > 0) {
        errors.push('Weekdays must be between 0 (Sunday) and 6 (Saturday)');
      }
    }
  }
  
  // Validate dates
  if (task.dueDate !== undefined && task.dueDate !== null && !(task.dueDate instanceof Date)) {
    errors.push('Due date must be a valid Date object');
  }
  
  if (task.recurrencePattern?.endDate !== undefined && 
      task.recurrencePattern.endDate !== null && 
      !(task.recurrencePattern.endDate instanceof Date)) {
    errors.push('End date must be a valid Date object');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize task data for safe database operations
 */
export const sanitizeTaskData = (task: Partial<RecurringTask>): Partial<RecurringTask> => {
  const sanitized = { ...task };
  
  // Ensure numeric fields are properly typed
  if (sanitized.estimatedHours !== undefined) {
    sanitized.estimatedHours = Number(sanitized.estimatedHours) || 0.25;
  }
  
  // Ensure arrays are properly initialized
  if (sanitized.requiredSkills !== undefined && !Array.isArray(sanitized.requiredSkills)) {
    sanitized.requiredSkills = [];
  }
  
  // Sanitize string fields
  if (sanitized.name !== undefined) {
    sanitized.name = String(sanitized.name).trim();
  }
  
  if (sanitized.description !== undefined) {
    sanitized.description = sanitized.description ? String(sanitized.description).trim() : '';
  }
  
  // Ensure proper null handling for optional fields
  if (sanitized.preferredStaffId === '') {
    sanitized.preferredStaffId = null;
  }
  
  return sanitized;
};
