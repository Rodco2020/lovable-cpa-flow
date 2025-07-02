
/**
 * Client Task Service - Recurring Task Operations
 * 
 * Handles operations specific to recurring tasks
 */

import { supabase } from '@/lib/supabaseClient';
import { RecurringTask } from '@/types/task';
import { mapDatabaseToRecurringTask, mapRecurringTaskToDatabase } from './mappers';

/**
 * Get a recurring task by ID
 */
export const getRecurringTaskById = async (taskId: string): Promise<RecurringTask | null> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching recurring task:', error);
      throw error;
    }
    
    return mapDatabaseToRecurringTask(data);
  } catch (error) {
    console.error('Error in getRecurringTaskById:', error);
    throw error;
  }
};

/**
 * Fetch recurring tasks for a specific client
 */
export const getClientRecurringTasks = async (clientId: string): Promise<RecurringTask[]> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*, preferred_staff:staff!recurring_tasks_preferred_staff_id_fkey(id, full_name)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching client recurring tasks:', error);
      throw error;
    }
    
    // Map the database results to our RecurringTask type
    return data.map(mapDatabaseToRecurringTask);
  } catch (error) {
    console.error('Error in getClientRecurringTasks:', error);
    throw error;
  }
};

/**
 * Update a recurring task with preferred staff support
 */
export const updateRecurringTask = async (
  taskId: string, 
  updates: Partial<RecurringTask>
): Promise<RecurringTask | null> => {
  try {
    const dbUpdates = mapRecurringTaskToDatabase(updates);
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating recurring task:', error);
      throw error;
    }
    
    return mapDatabaseToRecurringTask(data);
  } catch (error) {
    console.error('Error in updateRecurringTask:', error);
    throw error;
  }
};

/**
 * Create a new recurring task with preferred staff support
 */
export const createRecurringTask = async (
  taskData: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RecurringTask | null> => {
  try {
    const dbTask = mapRecurringTaskToDatabase(taskData);
    
    // Set required fields for creation
    dbTask.template_id = taskData.templateId;
    dbTask.client_id = taskData.clientId;
    dbTask.created_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert(dbTask)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating recurring task:', error);
      throw error;
    }
    
    return mapDatabaseToRecurringTask(data);
  } catch (error) {
    console.error('Error in createRecurringTask:', error);
    throw error;
  }
};
