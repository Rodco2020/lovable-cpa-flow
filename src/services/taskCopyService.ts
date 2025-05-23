
import { supabase } from '@/lib/supabaseClient';
import { TaskInstance, RecurringTask, TaskStatus } from '@/types/task';
import { getRecurringTaskById, getTaskInstanceById } from './clientTaskService';

/**
 * Task Copy Service
 * 
 * This service provides functionality for copying tasks between clients.
 * It supports copying individual tasks as well as bulk operations.
 */

/**
 * Formats a recurring task from database format to application type
 * @param data Database record
 * @returns Formatted RecurringTask object
 */
const formatRecurringTaskFromDB = (data: any): RecurringTask => {
  const recurrencePattern = {
    type: data.recurrence_type,
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
    priority: data.priority,
    category: data.category,
    status: data.status,
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
 * Formats a task instance from database format to application type
 * @param data Database record
 * @returns Formatted TaskInstance object
 */
const formatTaskInstanceFromDB = (data: any): TaskInstance => {
  return {
    id: data.id,
    templateId: data.template_id,
    clientId: data.client_id,
    name: data.name,
    description: data.description || '',
    estimatedHours: data.estimated_hours,
    requiredSkills: data.required_skills || [],
    priority: data.priority,
    category: data.category,
    status: data.status,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    notes: data.notes
  };
};

/**
 * Prepares a recurring task for database insertion
 * @param sourceTask Original task to copy
 * @param targetClientId Target client ID
 * @returns Object ready for database insert
 */
const prepareRecurringTaskForInsert = (sourceTask: RecurringTask, targetClientId: string) => {
  return {
    template_id: sourceTask.templateId,
    client_id: targetClientId,
    name: sourceTask.name,
    description: sourceTask.description || null,
    estimated_hours: sourceTask.estimatedHours,
    required_skills: sourceTask.requiredSkills,
    priority: sourceTask.priority,
    category: sourceTask.category,
    due_date: sourceTask.dueDate ? sourceTask.dueDate.toISOString() : null,
    recurrence_type: sourceTask.recurrencePattern.type,
    recurrence_interval: sourceTask.recurrencePattern.interval,
    weekdays: sourceTask.recurrencePattern.weekdays,
    day_of_month: sourceTask.recurrencePattern.dayOfMonth,
    month_of_year: sourceTask.recurrencePattern.monthOfYear,
    end_date: sourceTask.recurrencePattern.endDate ? sourceTask.recurrencePattern.endDate.toISOString() : null,
    custom_offset_days: sourceTask.recurrencePattern.customOffsetDays,
    notes: sourceTask.notes,
    is_active: true,
    status: 'Unscheduled' as TaskStatus
  };
};

/**
 * Prepares a task instance for database insertion
 * @param sourceTask Original task to copy
 * @param targetClientId Target client ID
 * @returns Object ready for database insert
 */
const prepareTaskInstanceForInsert = (sourceTask: TaskInstance, targetClientId: string) => {
  return {
    template_id: sourceTask.templateId,
    client_id: targetClientId,
    name: sourceTask.name,
    description: sourceTask.description || null,
    estimated_hours: sourceTask.estimatedHours,
    required_skills: sourceTask.requiredSkills,
    priority: sourceTask.priority,
    category: sourceTask.category,
    due_date: sourceTask.dueDate ? sourceTask.dueDate.toISOString() : null,
    notes: sourceTask.notes,
    status: 'Unscheduled' as TaskStatus
  };
};

/**
 * Copy a recurring task to another client
 * @param taskId ID of the recurring task to copy
 * @param targetClientId ID of the target client
 * @returns The newly created recurring task
 */
export const copyRecurringTask = async (taskId: string, targetClientId: string): Promise<RecurringTask> => {
  try {
    // First, get the source task
    const sourceTask = await getRecurringTaskById(taskId);
    
    if (!sourceTask) {
      throw new Error(`Recurring task with ID ${taskId} not found`);
    }
    
    // Create a new task based on the source task but with the target client ID
    const newTaskData = prepareRecurringTaskForInsert(sourceTask, targetClientId);
    
    // Create the new task in the database
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([newTaskData])
      .select()
      .single();
    
    if (error) {
      console.error('Error copying recurring task:', error);
      throw error;
    }
    
    // Convert the database response to our RecurringTask type
    return formatRecurringTaskFromDB(data);
  } catch (error) {
    console.error('Error in copyRecurringTask:', error);
    throw error;
  }
};

/**
 * Copy an ad-hoc task to another client
 * @param taskId ID of the task instance to copy
 * @param targetClientId ID of the target client
 * @returns The newly created task instance
 */
export const copyAdHocTask = async (taskId: string, targetClientId: string): Promise<TaskInstance> => {
  try {
    // First, get the source task
    const sourceTask = await getTaskInstanceById(taskId);
    
    if (!sourceTask) {
      throw new Error(`Ad-hoc task with ID ${taskId} not found`);
    }
    
    // Create a new task based on the source task but with the target client ID
    const newTaskData = prepareTaskInstanceForInsert(sourceTask, targetClientId);
    
    // Create the new task in the database
    const { data, error } = await supabase
      .from('task_instances')
      .insert([newTaskData])
      .select()
      .single();
    
    if (error) {
      console.error('Error copying ad-hoc task:', error);
      throw error;
    }
    
    // Convert the database response to our TaskInstance type
    return formatTaskInstanceFromDB(data);
  } catch (error) {
    console.error('Error in copyAdHocTask:', error);
    throw error;
  }
};

/**
 * Copy multiple tasks (both recurring and ad-hoc) to another client
 * @param recurringTaskIds Array of recurring task IDs to copy
 * @param adHocTaskIds Array of ad-hoc task IDs to copy
 * @param targetClientId ID of the target client
 * @returns Object containing arrays of copied recurring and ad-hoc tasks
 */
export const copyClientTasks = async (
  recurringTaskIds: string[],
  adHocTaskIds: string[],
  targetClientId: string
): Promise<{ recurring: RecurringTask[], adHoc: TaskInstance[] }> => {
  try {
    const copiedRecurringTasks: RecurringTask[] = [];
    const copiedAdHocTasks: TaskInstance[] = [];
    
    // Copy recurring tasks
    if (recurringTaskIds.length > 0) {
      for (const taskId of recurringTaskIds) {
        try {
          const copiedTask = await copyRecurringTask(taskId, targetClientId);
          copiedRecurringTasks.push(copiedTask);
        } catch (error) {
          console.error(`Failed to copy recurring task ${taskId}:`, error);
          // Continue with other tasks even if one fails
        }
      }
    }
    
    // Copy ad-hoc tasks
    if (adHocTaskIds.length > 0) {
      for (const taskId of adHocTaskIds) {
        try {
          const copiedTask = await copyAdHocTask(taskId, targetClientId);
          copiedAdHocTasks.push(copiedTask);
        } catch (error) {
          console.error(`Failed to copy ad-hoc task ${taskId}:`, error);
          // Continue with other tasks even if one fails
        }
      }
    }
    
    return {
      recurring: copiedRecurringTasks,
      adHoc: copiedAdHocTasks
    };
  } catch (error) {
    console.error('Error in copyClientTasks:', error);
    throw error;
  }
};
