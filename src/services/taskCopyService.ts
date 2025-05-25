
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
 */
export const copyRecurringTask = async (taskId: string, targetClientId: string): Promise<RecurringTask> => {
  try {
    console.log(`taskCopyService: Copying recurring task ${taskId} to client ${targetClientId}`);
    
    // First, get the source task
    const sourceTask = await getRecurringTaskById(taskId);
    
    if (!sourceTask) {
      const error = `Recurring task with ID ${taskId} not found`;
      console.error('taskCopyService:', error);
      throw new Error(error);
    }
    
    console.log('taskCopyService: Source recurring task found:', sourceTask.name);
    
    // Create a new task based on the source task but with the target client ID
    const newTaskData = prepareRecurringTaskForInsert(sourceTask, targetClientId);
    
    console.log('taskCopyService: Prepared recurring task data for insertion:', {
      name: newTaskData.name,
      client_id: newTaskData.client_id,
      recurrence_type: newTaskData.recurrence_type
    });
    
    // Create the new task in the database
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([newTaskData])
      .select()
      .single();
    
    if (error) {
      console.error('taskCopyService: Error inserting recurring task:', error);
      throw error;
    }
    
    console.log('taskCopyService: Successfully copied recurring task:', data.id);
    
    // Convert the database response to our RecurringTask type
    return formatRecurringTaskFromDB(data);
  } catch (error) {
    console.error('taskCopyService: Error in copyRecurringTask:', error);
    throw error;
  }
};

/**
 * Copy an ad-hoc task to another client
 */
export const copyAdHocTask = async (taskId: string, targetClientId: string): Promise<TaskInstance> => {
  try {
    console.log(`taskCopyService: Copying ad-hoc task ${taskId} to client ${targetClientId}`);
    
    // First, get the source task
    const sourceTask = await getTaskInstanceById(taskId);
    
    if (!sourceTask) {
      const error = `Ad-hoc task with ID ${taskId} not found`;
      console.error('taskCopyService:', error);
      throw new Error(error);
    }
    
    console.log('taskCopyService: Source ad-hoc task found:', sourceTask.name);
    
    // Create a new task based on the source task but with the target client ID
    const newTaskData = prepareTaskInstanceForInsert(sourceTask, targetClientId);
    
    console.log('taskCopyService: Prepared ad-hoc task data for insertion:', {
      name: newTaskData.name,
      client_id: newTaskData.client_id
    });
    
    // Create the new task in the database
    const { data, error } = await supabase
      .from('task_instances')
      .insert([newTaskData])
      .select()
      .single();
    
    if (error) {
      console.error('taskCopyService: Error inserting ad-hoc task:', error);
      throw error;
    }
    
    console.log('taskCopyService: Successfully copied ad-hoc task:', data.id);
    
    // Convert the database response to our TaskInstance type
    return formatTaskInstanceFromDB(data);
  } catch (error) {
    console.error('taskCopyService: Error in copyAdHocTask:', error);
    throw error;
  }
};

/**
 * Copy multiple tasks (both recurring and ad-hoc) to another client
 */
export const copyClientTasks = async (
  recurringTaskIds: string[],
  adHocTaskIds: string[],
  targetClientId: string
): Promise<{ recurring: RecurringTask[], adHoc: TaskInstance[] }> => {
  try {
    console.log('taskCopyService: Starting bulk copy operation', {
      recurringCount: recurringTaskIds.length,
      adHocCount: adHocTaskIds.length,
      targetClientId
    });
    
    const copiedRecurringTasks: RecurringTask[] = [];
    const copiedAdHocTasks: TaskInstance[] = [];
    const errors: string[] = [];
    
    // Copy recurring tasks
    if (recurringTaskIds.length > 0) {
      console.log('taskCopyService: Copying recurring tasks...');
      for (const taskId of recurringTaskIds) {
        try {
          const copiedTask = await copyRecurringTask(taskId, targetClientId);
          copiedRecurringTasks.push(copiedTask);
          console.log(`taskCopyService: Successfully copied recurring task: ${copiedTask.name}`);
        } catch (error) {
          const errorMsg = `Failed to copy recurring task ${taskId}: ${error}`;
          console.error('taskCopyService:', errorMsg);
          errors.push(errorMsg);
        }
      }
    }
    
    // Copy ad-hoc tasks
    if (adHocTaskIds.length > 0) {
      console.log('taskCopyService: Copying ad-hoc tasks...');
      for (const taskId of adHocTaskIds) {
        try {
          const copiedTask = await copyAdHocTask(taskId, targetClientId);
          copiedAdHocTasks.push(copiedTask);
          console.log(`taskCopyService: Successfully copied ad-hoc task: ${copiedTask.name}`);
        } catch (error) {
          const errorMsg = `Failed to copy ad-hoc task ${taskId}: ${error}`;
          console.error('taskCopyService:', errorMsg);
          errors.push(errorMsg);
        }
      }
    }
    
    console.log('taskCopyService: Bulk copy operation completed', {
      recurringCopied: copiedRecurringTasks.length,
      adHocCopied: copiedAdHocTasks.length,
      errors: errors.length
    });
    
    // If there were errors but some tasks were copied, log them but don't fail
    if (errors.length > 0) {
      console.warn('taskCopyService: Some tasks failed to copy:', errors);
      
      // If ALL tasks failed, throw an error
      if (copiedRecurringTasks.length === 0 && copiedAdHocTasks.length === 0) {
        throw new Error(`All copy operations failed: ${errors.join(', ')}`);
      }
    }
    
    return {
      recurring: copiedRecurringTasks,
      adHoc: copiedAdHocTasks
    };
  } catch (error) {
    console.error('taskCopyService: Error in copyClientTasks:', error);
    throw error;
  }
};
