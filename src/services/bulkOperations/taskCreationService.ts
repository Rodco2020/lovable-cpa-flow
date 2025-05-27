
import { supabase } from '@/lib/supabaseClient';
import { BatchOperation } from './types';

/**
 * Task Creation Service
 * 
 * Handles the actual creation of tasks in the database for bulk operations.
 * This service is responsible for creating both ad-hoc and recurring tasks
 * based on the configuration provided in each operation.
 */

/**
 * Process a single assignment operation
 * 
 * Creates either an ad-hoc task or recurring task based on the operation configuration.
 * This function handles the database interaction and returns the created task data.
 * 
 * @param operation - The batch operation to process
 * @returns Promise resolving to the created task data
 */
export const processSingleAssignment = async (operation: BatchOperation): Promise<any> => {
  console.log(`Processing assignment: ${operation.clientId} - ${operation.templateId}`);

  try {
    // Determine task type from config
    const taskType = operation.config.taskType || operation.config.assignmentType;
    
    if (taskType === 'recurring') {
      return await createRecurringTask(operation);
    } else {
      return await createAdHocTask(operation);
    }
  } catch (error) {
    console.error(`Failed to process assignment ${operation.id}:`, error);
    throw error;
  }
};

/**
 * Create a recurring task assignment
 */
const createRecurringTask = async (operation: BatchOperation): Promise<any> => {
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

  // Prepare recurring task data
  const recurringTaskData: any = {
    template_id: operation.templateId,
    client_id: operation.clientId,
    name: template.name,
    description: template.description,
    estimated_hours: operation.config.preserveEstimatedHours 
      ? template.default_estimated_hours 
      : (operation.config.estimatedHours || template.default_estimated_hours),
    required_skills: operation.config.preserveSkills 
      ? template.required_skills 
      : template.required_skills,
    priority: operation.config.priority || template.default_priority,
    category: template.category,
    recurrence_type: operation.config.recurrenceType || 'Monthly',
    recurrence_interval: operation.config.interval || 1,
    is_active: true,
    status: 'Unscheduled'
  };

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

/**
 * Create an ad-hoc task assignment
 */
const createAdHocTask = async (operation: BatchOperation): Promise<any> => {
  console.log(`Creating ad-hoc task for client ${operation.clientId}, template ${operation.templateId}`);

  // First, get the template details
  const { data: template, error: templateError } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', operation.templateId)
    .single();

  if (templateError) {
    throw new Error(`Failed to fetch template: ${templateError.message}`);
  }

  // Prepare task instance data
  const taskInstanceData: any = {
    template_id: operation.templateId,
    client_id: operation.clientId,
    name: template.name,
    description: template.description,
    estimated_hours: operation.config.preserveEstimatedHours 
      ? template.default_estimated_hours 
      : (operation.config.estimatedHours || template.default_estimated_hours),
    required_skills: operation.config.preserveSkills 
      ? template.required_skills 
      : template.required_skills,
    priority: operation.config.priority || template.default_priority,
    category: template.category,
    status: 'Unscheduled'
  };

  // Add due date if specified
  if (operation.config.dueDate) {
    taskInstanceData.due_date = operation.config.dueDate.toISOString();
  }

  // Insert task instance
  const { data: taskInstance, error: insertError } = await supabase
    .from('task_instances')
    .insert([taskInstanceData])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create task instance: ${insertError.message}`);
  }

  console.log(`Successfully created ad-hoc task: ${taskInstance.id}`);

  return {
    type: 'adhoc',
    client_id: operation.clientId,
    template_id: operation.templateId,
    task_id: taskInstance.id,
    task_name: taskInstance.name
  };
};

/**
 * Create a task instance from a recurring task
 */
const createTaskInstanceFromRecurring = async (recurringTask: any, operation: BatchOperation): Promise<any> => {
  console.log(`Creating task instance from recurring task: ${recurringTask.id}`);

  const taskInstanceData: any = {
    template_id: recurringTask.template_id,
    client_id: recurringTask.client_id,
    recurring_task_id: recurringTask.id,
    name: recurringTask.name,
    description: recurringTask.description,
    estimated_hours: recurringTask.estimated_hours,
    required_skills: recurringTask.required_skills,
    priority: recurringTask.priority,
    category: recurringTask.category,
    status: 'Unscheduled'
  };

  // Calculate due date based on recurrence pattern
  const dueDate = calculateNextDueDate(recurringTask);
  if (dueDate) {
    taskInstanceData.due_date = dueDate.toISOString();
  }

  // Insert task instance
  const { data: taskInstance, error: insertError } = await supabase
    .from('task_instances')
    .insert([taskInstanceData])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create task instance from recurring task: ${insertError.message}`);
  }

  console.log(`Successfully created task instance from recurring task: ${taskInstance.id}`);
  return taskInstance;
};

/**
 * Calculate next due date for a recurring task
 */
const calculateNextDueDate = (recurringTask: any): Date | null => {
  const now = new Date();
  
  switch (recurringTask.recurrence_type) {
    case 'Daily':
      return new Date(now.getTime() + (recurringTask.recurrence_interval || 1) * 24 * 60 * 60 * 1000);
    case 'Weekly':
      return new Date(now.getTime() + (recurringTask.recurrence_interval || 1) * 7 * 24 * 60 * 60 * 1000);
    case 'Monthly':
      const monthlyDate = new Date(now);
      monthlyDate.setMonth(monthlyDate.getMonth() + (recurringTask.recurrence_interval || 1));
      if (recurringTask.day_of_month) {
        monthlyDate.setDate(recurringTask.day_of_month);
      }
      return monthlyDate;
    case 'Quarterly':
      const quarterlyDate = new Date(now);
      quarterlyDate.setMonth(quarterlyDate.getMonth() + 3 * (recurringTask.recurrence_interval || 1));
      return quarterlyDate;
    case 'Annually':
      const annualDate = new Date(now);
      annualDate.setFullYear(annualDate.getFullYear() + (recurringTask.recurrence_interval || 1));
      if (recurringTask.month_of_year) {
        annualDate.setMonth(recurringTask.month_of_year - 1);
      }
      if (recurringTask.day_of_month) {
        annualDate.setDate(recurringTask.day_of_month);
      }
      return annualDate;
    default:
      return null;
  }
};
