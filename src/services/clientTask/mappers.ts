
/**
 * Client Task Service Mappers
 * 
 * Functions to map database results to our domain types
 */

import { TaskInstance, RecurringTask, TaskPriority, TaskCategory, RecurrencePattern, TaskStatus } from '@/types/task';

/**
 * Maps database recurring task data to RecurringTask domain object
 */
export const mapDatabaseToRecurringTask = (data: any): RecurringTask => {
  // Create recurrence pattern object from individual fields
  const recurrencePattern: RecurrencePattern = {
    type: data.recurrence_type as RecurrencePattern['type'],
    interval: data.recurrence_interval || undefined,
    weekdays: data.weekdays || undefined,
    dayOfMonth: data.day_of_month || undefined,
    monthOfYear: data.month_of_year || undefined,
    endDate: data.end_date ? new Date(data.end_date) : undefined,
    customOffsetDays: data.custom_offset_days || undefined,
  };
  
  return {
    id: data.id,
    templateId: data.template_id,
    clientId: data.client_id,
    name: data.name,
    description: data.description || '',
    estimatedHours: data.estimated_hours,
    requiredSkills: data.required_skills || [],
    priority: data.priority as TaskPriority,
    category: data.category as TaskCategory,
    status: data.status as TaskStatus,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    recurrencePattern,
    lastGeneratedDate: data.last_generated_date ? new Date(data.last_generated_date) : null,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    notes: data.notes
  };
};

/**
 * Maps database task instance data to TaskInstance domain object
 */
export const mapDatabaseToTaskInstance = (data: any): TaskInstance => {
  return {
    id: data.id,
    templateId: data.template_id,
    clientId: data.client_id,
    name: data.name,
    description: data.description || '',
    estimatedHours: data.estimated_hours,
    requiredSkills: data.required_skills || [],
    priority: data.priority as TaskPriority,
    category: data.category as TaskCategory,
    status: data.status as TaskStatus,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    assignedStaffId: data.assigned_staff_id,
    scheduledStartTime: data.scheduled_start_time ? new Date(data.scheduled_start_time) : undefined,
    scheduledEndTime: data.scheduled_end_time ? new Date(data.scheduled_end_time) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    notes: data.notes,
    recurringTaskId: data.recurring_task_id
  };
};
