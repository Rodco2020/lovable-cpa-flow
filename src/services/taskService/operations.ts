import { supabase } from '@/lib/supabaseClient';
import { TaskTemplate, RecurringTask, TaskInstance } from '@/types/task';
import { mapRecurringTaskToDatabase } from '../clientTask/mappers';

export class TaskServiceError extends Error {
  constructor(message: string) {
    super(`TaskServiceError: ${message}`);
    this.name = 'TaskServiceError';
  }
}

/**
 * Create a new recurring task
 */
export const createRecurringTask = async (task: Omit<RecurringTask, 'id'>): Promise<RecurringTask> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Failed to create recurring task:', error);
      throw new TaskServiceError(`Failed to create recurring task: ${error.message}`);
    }

    return data as RecurringTask;
  } catch (error) {
    console.error('Error creating recurring task:', error);
    throw error;
  }
};

/**
 * Create a new task instance
 */
export const createTaskInstance = async (task: Omit<TaskInstance, 'id'>): Promise<TaskInstance> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Failed to create task instance:', error);
      throw new TaskServiceError(`Failed to create task instance: ${error.message}`);
    }

    return data as TaskInstance;
  } catch (error) {
    console.error('Error creating task instance:', error);
    throw error;
  }
};

/**
 * Get all task templates
 */
export const getTaskTemplates = async (): Promise<TaskTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*');

    if (error) {
      console.error('Failed to fetch task templates:', error);
      throw new TaskServiceError(`Failed to fetch task templates: ${error.message}`);
    }

    return data as TaskTemplate[];
  } catch (error) {
    console.error('Error fetching task templates:', error);
    throw error;
  }
};

/**
 * Get all recurring tasks
 */
export const getRecurringTasks = async (): Promise<RecurringTask[]> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*');

    if (error) {
      console.error('Failed to fetch recurring tasks:', error);
      throw new TaskServiceError(`Failed to fetch recurring tasks: ${error.message}`);
    }

    return data as RecurringTask[];
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    throw error;
  }
};

/**
 * Get all task instances
 */
export const getTaskInstances = async (): Promise<TaskInstance[]> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*');

    if (error) {
      console.error('Failed to fetch task instances:', error);
      throw new TaskServiceError(`Failed to fetch task instances: ${error.message}`);
    }

    return data as TaskInstance[];
  } catch (error) {
    console.error('Error fetching task instances:', error);
    throw error;
  }
};

/**
 * Get all unscheduled task instances
 */
export const getUnscheduledTaskInstances = async (): Promise<TaskInstance[]> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('status', 'Unscheduled');

    if (error) {
      console.error('Failed to fetch unscheduled task instances:', error);
      throw new TaskServiceError(`Failed to fetch unscheduled task instances: ${error.message}`);
    }

    return data as TaskInstance[];
  } catch (error) {
    console.error('Error fetching unscheduled task instances:', error);
    throw error;
  }
};

/**
 * Update a task instance
 */
export const updateTaskInstance = async (taskId: string, updates: Partial<TaskInstance>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('task_instances')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error(`Failed to update task instance ${taskId}:`, error);
      throw new TaskServiceError(`Failed to update task instance: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error updating task instance ${taskId}:`, error);
    throw error;
  }
};

/**
 * Delete a recurring task assignment
 */
export const deleteRecurringTaskAssignment = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('recurring_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error(`Failed to delete recurring task ${taskId}:`, error);
      throw new TaskServiceError(`Failed to delete recurring task: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting recurring task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Delete a task instance
 */
export const deleteTaskInstance = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('task_instances')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error(`Failed to delete task instance ${taskId}:`, error);
      throw new TaskServiceError(`Failed to delete task instance: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting task instance ${taskId}:`, error);
    throw error;
  }
};

/**
 * Create a new task template
 */
export const createTaskTemplate = async (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<TaskTemplate> => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .insert([template])
      .select()
      .single();

    if (error) {
      console.error('Failed to create task template:', error);
      throw new TaskServiceError(`Failed to create task template: ${error.message}`);
    }

    return data as TaskTemplate;
  } catch (error) {
    console.error('Error creating task template:', error);
    throw error;
  }
};

/**
 * Update a task template
 */
export const updateTaskTemplate = async (templateId: string, updates: Partial<TaskTemplate>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('task_templates')
      .update(updates)
      .eq('id', templateId);

    if (error) {
      console.error(`Failed to update task template ${templateId}:`, error);
      throw new TaskServiceError(`Failed to update task template: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error updating task template ${templateId}:`, error);
    throw error;
  }
};

/**
 * Archive a task template
 */
export const archiveTaskTemplate = async (templateId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('task_templates')
      .update({ is_archived: true })
      .eq('id', templateId);

    if (error) {
      console.error(`Failed to archive task template ${templateId}:`, error);
      throw new TaskServiceError(`Failed to archive task template: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error archiving task template ${templateId}:`, error);
    throw error;
  }
};

/**
 * Update a recurring task assignment
 */
export const updateRecurringTask = async (taskId: string, updates: Partial<RecurringTask>): Promise<boolean> => {
  try {
    console.log(`[TaskService] Updating recurring task ${taskId}:`, updates);
    
    // Map the updates to database format
    const dbUpdates = mapRecurringTaskToDatabase(updates);
    
    console.log(`[TaskService] Database updates for recurring task ${taskId}:`, dbUpdates);
    
    const { error } = await supabase
      .from('recurring_tasks')
      .update(dbUpdates)
      .eq('id', taskId);

    if (error) {
      console.error(`[TaskService] Failed to update recurring task ${taskId}:`, error);
      throw new Error(`Failed to update recurring task: ${error.message}`);
    }

    console.log(`[TaskService] Successfully updated recurring task ${taskId}`);
    return true;
  } catch (error) {
    console.error(`[TaskService] Error updating recurring task ${taskId}:`, error);
    throw error;
  }
};

export {
  createRecurringTask,
  createTaskInstance,
  getTaskTemplates,
  getRecurringTasks,
  getTaskInstances,
  getUnscheduledTaskInstances,
  updateTaskInstance,
  deleteRecurringTaskAssignment,
  deleteTaskInstance,
  createTaskTemplate,
  updateTaskTemplate,
  archiveTaskTemplate,
  TaskServiceError
};
