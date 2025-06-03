
import { supabase } from '@/lib/supabaseClient';
import { BatchOperation } from './types';

/**
 * Recurring Task Creator Service
 * 
 * Handles the creation of recurring task assignments from batch operations.
 * This service manages the database interaction and configuration for recurring tasks.
 * 
 * IMPORTANT: Skills are stored as UUIDs in the database and resolved to names only for display.
 */

/**
 * Create a recurring task assignment
 * 
 * @param operation - The batch operation containing task and client information
 * @returns Promise resolving to the created task data
 */
export const createRecurringTask = async (operation: BatchOperation): Promise<any> => {
  console.log(`[RecurringTaskCreator] Creating recurring task for client ${operation.clientId}, template ${operation.templateId}`);

  // First, get the template details
  const { data: template, error: templateError } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', operation.templateId)
    .single();

  if (templateError) {
    console.error('[RecurringTaskCreator] Failed to fetch template:', templateError);
    throw new Error(`Failed to fetch template: ${templateError.message}`);
  }

  console.log('[RecurringTaskCreator] Template fetched:', {
    templateId: template.id,
    requiredSkills: template.required_skills,
    skillsType: typeof template.required_skills,
    skillsLength: template.required_skills?.length
  });

  // CRITICAL FIX: Store skill UUIDs directly, do NOT resolve to names
  // The database schema expects UUIDs in the required_skills array
  const skillUuids = operation.config.preserveSkills 
    ? template.required_skills 
    : template.required_skills;

  console.log('[RecurringTaskCreator] Skills to store (UUIDs):', skillUuids);

  // Prepare recurring task data with skill UUIDs
  const recurringTaskData: any = {
    template_id: operation.templateId,
    client_id: operation.clientId,
    name: template.name,
    description: template.description,
    estimated_hours: operation.config.preserveEstimatedHours 
      ? template.default_estimated_hours 
      : (operation.config.estimatedHours || template.default_estimated_hours),
    required_skills: skillUuids, // Store UUIDs, NOT resolved names
    priority: operation.config.priority || template.default_priority,
    category: template.category,
    recurrence_type: operation.config.recurrenceType || 'Monthly',
    recurrence_interval: operation.config.interval || 1,
    is_active: true,
    status: 'Unscheduled'
  };

  // Add due date if specified in config
  if (operation.config.dueDate) {
    recurringTaskData.due_date = operation.config.dueDate.toISOString();
  }

  // Add recurrence-specific fields
  if (operation.config.recurrenceType === 'Weekly' && operation.config.weekdays) {
    recurringTaskData.weekdays = operation.config.weekdays;
  } else if (operation.config.recurrenceType === 'Monthly' && operation.config.dayOfMonth) {
    recurringTaskData.day_of_month = operation.config.dayOfMonth;
  } else if (operation.config.recurrenceType === 'Annually') {
    recurringTaskData.day_of_month = operation.config.dayOfMonth || 1;
    recurringTaskData.month_of_year = operation.config.monthOfYear || 1;
  }

  console.log('[RecurringTaskCreator] Inserting recurring task data:', recurringTaskData);

  // Insert recurring task
  const { data: recurringTask, error: insertError } = await supabase
    .from('recurring_tasks')
    .insert([recurringTaskData])
    .select()
    .single();

  if (insertError) {
    console.error('[RecurringTaskCreator] Failed to create recurring task:', insertError);
    throw new Error(`Failed to create recurring task: ${insertError.message}`);
  }

  console.log(`[RecurringTaskCreator] Successfully created recurring task: ${recurringTask.id}`);

  return {
    type: 'recurring',
    client_id: operation.clientId,
    template_id: operation.templateId,
    task_id: recurringTask.id,
    task_name: recurringTask.name
  };
};
