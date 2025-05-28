
import { supabase } from '@/lib/supabaseClient';
import { resolveSkillNames } from './skillResolver';
import { createTaskInstanceFromRecurring } from './taskInstanceGenerator';
import { BatchOperation } from './types';

/**
 * Recurring Task Creator Service
 * 
 * Handles the creation of recurring task assignments from batch operations.
 * This service manages the database interaction and configuration for recurring tasks.
 */

/**
 * Create a recurring task assignment
 * 
 * @param operation - The batch operation containing task and client information
 * @returns Promise resolving to the created task data
 */
export const createRecurringTask = async (operation: BatchOperation): Promise<any> => {
  console.log(`Creating recurring task for client ${operation.clientId}, template ${operation.templateId}`);

  // First, get the template details
  const { data: template, error: templateError } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', operation.templateId)
    .single();

  if (templateError) {
    throw new Error(`Failed to fetch template: ${templateError.message}`);
  }

  // Resolve skill IDs to names
  const templateSkills = operation.config.preserveSkills 
    ? template.required_skills 
    : template.required_skills;
  const resolvedSkills = await resolveSkillNames(templateSkills || []);

  // Prepare recurring task data
  const recurringTaskData: any = {
    template_id: operation.templateId,
    client_id: operation.clientId,
    name: template.name,
    description: template.description,
    estimated_hours: operation.config.preserveEstimatedHours 
      ? template.default_estimated_hours 
      : (operation.config.estimatedHours || template.default_estimated_hours),
    required_skills: resolvedSkills, // Store skill names instead of IDs
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

  // Insert recurring task
  const { data: recurringTask, error: insertError } = await supabase
    .from('recurring_tasks')
    .insert([recurringTaskData])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create recurring task: ${insertError.message}`);
  }

  console.log(`Successfully created recurring task: ${recurringTask.id}`);

  // If configured to generate immediately, create the first instance
  if (operation.config.generateImmediately) {
    await createTaskInstanceFromRecurring(recurringTask, operation);
  }

  return {
    type: 'recurring',
    client_id: operation.clientId,
    template_id: operation.templateId,
    task_id: recurringTask.id,
    task_name: recurringTask.name
  };
};
