
import { supabase } from '@/integrations/supabase/client';
import { BatchOperation } from './types';

/**
 * Task Creation Service
 * 
 * Handles the creation of individual task instances from batch operations.
 */

/**
 * Process a single assignment operation
 */
export const processSingleAssignment = async (operation: BatchOperation) => {
  try {
    // Get the template details
    const { data: template, error: templateError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', operation.templateId)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${operation.templateId}`);
    }

    if (operation.config.assignmentType === 'ad-hoc') {
      return await createAdHocTask(operation, template);
    } else {
      return await createRecurringTask(operation, template);
    }
  } catch (error) {
    console.error('Error in single assignment:', error);
    throw error;
  }
};

/**
 * Create an ad-hoc task instance
 */
const createAdHocTask = async (operation: BatchOperation, template: any) => {
  const taskData = {
    template_id: operation.templateId,
    client_id: operation.clientId,
    name: template.name,
    description: template.description,
    estimated_hours: operation.config.estimatedHours || template.default_estimated_hours,
    required_skills: template.required_skills,
    priority: operation.config.priority || template.default_priority,
    category: template.category,
    status: 'Unscheduled',
    due_date: operation.config.dueDate ? operation.config.dueDate.toISOString() : null,
    notes: `Created via bulk assignment from template: ${template.name}`
  };

  const { data, error: insertError } = await supabase
    .from('task_instances')
    .insert(taskData)
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create task: ${insertError.message}`);
  }

  return data;
};

/**
 * Create a recurring task
 */
const createRecurringTask = async (operation: BatchOperation, template: any) => {
  const recurringTaskData = {
    template_id: operation.templateId,
    client_id: operation.clientId,
    name: template.name,
    description: template.description,
    estimated_hours: operation.config.estimatedHours || template.default_estimated_hours,
    required_skills: template.required_skills,
    priority: operation.config.priority || template.default_priority,
    category: template.category,
    status: 'Unscheduled',
    recurrence_type: operation.config.recurrencePattern?.type || 'Monthly',
    recurrence_interval: operation.config.recurrencePattern?.interval || 1,
    day_of_month: operation.config.recurrencePattern?.dayOfMonth || 1,
    weekdays: operation.config.recurrencePattern?.weekdays || null,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    is_active: true,
    notes: `Created via bulk assignment from template: ${template.name}`
  };

  const { data, error: recurringError } = await supabase
    .from('recurring_tasks')
    .insert(recurringTaskData)
    .select()
    .single();

  if (recurringError) {
    throw new Error(`Failed to create recurring task: ${recurringError.message}`);
  }

  return data;
};
