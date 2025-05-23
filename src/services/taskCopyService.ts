
import { supabase } from '@/lib/supabaseClient';
import { TaskInstance, RecurringTask, TaskStatus } from '@/types/task';
import { getRecurringTaskById, getTaskInstanceById } from './clientTaskService';

/**
 * Task Copy Service
 * 
 * Specialized functionality for copying tasks between clients:
 * - Copy individual recurring tasks
 * - Copy individual ad-hoc tasks
 * - Bulk copy multiple tasks
 */

/**
 * Copy a recurring task to another client
 */
export const copyRecurringTask = async (taskId: string, targetClientId: string): Promise<RecurringTask> => {
  try {
    // First, get the source task
    const sourceTask = await getRecurringTaskById(taskId);
    
    if (!sourceTask) {
      throw new Error(`Recurring task with ID ${taskId} not found`);
    }
    
    // Create a new task based on the source task but with the target client ID
    const newTaskData = {
      templateId: sourceTask.templateId,
      clientId: targetClientId,
      name: sourceTask.name,
      description: sourceTask.description,
      estimatedHours: sourceTask.estimatedHours,
      requiredSkills: sourceTask.requiredSkills,
      priority: sourceTask.priority,
      category: sourceTask.category,
      dueDate: sourceTask.dueDate,
      recurrencePattern: {
        type: sourceTask.recurrencePattern.type,
        interval: sourceTask.recurrencePattern.interval,
        weekdays: sourceTask.recurrencePattern.weekdays,
        dayOfMonth: sourceTask.recurrencePattern.dayOfMonth,
        monthOfYear: sourceTask.recurrencePattern.monthOfYear,
        endDate: sourceTask.recurrencePattern.endDate,
        customOffsetDays: sourceTask.recurrencePattern.customOffsetDays,
      },
      notes: sourceTask.notes
    };
    
    // Create the new task in the database
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([{
        template_id: newTaskData.templateId,
        client_id: newTaskData.clientId,
        name: newTaskData.name,
        description: newTaskData.description,
        estimated_hours: newTaskData.estimatedHours,
        required_skills: newTaskData.requiredSkills,
        priority: newTaskData.priority,
        category: newTaskData.category,
        due_date: newTaskData.dueDate ? newTaskData.dueDate.toISOString() : null,
        recurrence_type: newTaskData.recurrencePattern.type,
        recurrence_interval: newTaskData.recurrencePattern.interval,
        weekdays: newTaskData.recurrencePattern.weekdays,
        day_of_month: newTaskData.recurrencePattern.dayOfMonth,
        month_of_year: newTaskData.recurrencePattern.monthOfYear,
        end_date: newTaskData.recurrencePattern.endDate ? newTaskData.recurrencePattern.endDate.toISOString() : null,
        custom_offset_days: newTaskData.recurrencePattern.customOffsetDays,
        notes: newTaskData.notes,
        is_active: true,
        status: 'Unscheduled' as TaskStatus
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error copying recurring task:', error);
      throw error;
    }
    
    // Convert the database response to our RecurringTask type
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
  } catch (error) {
    console.error('Error in copyRecurringTask:', error);
    throw error;
  }
};

/**
 * Copy an ad-hoc task to another client
 */
export const copyAdHocTask = async (taskId: string, targetClientId: string): Promise<TaskInstance> => {
  try {
    // First, get the source task
    const sourceTask = await getTaskInstanceById(taskId);
    
    if (!sourceTask) {
      throw new Error(`Ad-hoc task with ID ${taskId} not found`);
    }
    
    // Create a new task based on the source task but with the target client ID
    const newTaskData = {
      templateId: sourceTask.templateId,
      clientId: targetClientId,
      name: sourceTask.name,
      description: sourceTask.description,
      estimatedHours: sourceTask.estimatedHours,
      requiredSkills: sourceTask.requiredSkills,
      priority: sourceTask.priority,
      category: sourceTask.category,
      dueDate: sourceTask.dueDate,
      notes: sourceTask.notes
    };
    
    // Create the new task in the database
    const { data, error } = await supabase
      .from('task_instances')
      .insert([{
        template_id: newTaskData.templateId,
        client_id: newTaskData.clientId,
        name: newTaskData.name,
        description: newTaskData.description,
        estimated_hours: newTaskData.estimatedHours,
        required_skills: newTaskData.requiredSkills,
        priority: newTaskData.priority,
        category: newTaskData.category,
        due_date: newTaskData.dueDate ? newTaskData.dueDate.toISOString() : null,
        notes: newTaskData.notes,
        status: 'Unscheduled' as TaskStatus
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error copying ad-hoc task:', error);
      throw error;
    }
    
    // Convert the database response to our TaskInstance type
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
  } catch (error) {
    console.error('Error in copyAdHocTask:', error);
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
