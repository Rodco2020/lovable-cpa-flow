
/**
 * Client Task Service - Recurring Task Operations
 * 
 * Handles operations specific to recurring tasks
 */

import { supabase } from '@/lib/supabaseClient';
import { RecurringTask } from '@/types/task';
import { mapDatabaseToRecurringTask } from './mappers';

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
      .select('*')
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
