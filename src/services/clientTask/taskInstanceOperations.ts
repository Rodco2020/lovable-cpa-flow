
/**
 * Client Task Service - Task Instance Operations
 * 
 * Handles operations specific to task instances
 */

import { supabase } from '@/lib/supabaseClient';
import { TaskInstance } from '@/types/task';
import { mapDatabaseToTaskInstance } from './mappers';

/**
 * Get a task instance by ID
 */
export const getTaskInstanceById = async (taskId: string): Promise<TaskInstance | null> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching task instance:', error);
      throw error;
    }
    
    return mapDatabaseToTaskInstance(data);
  } catch (error) {
    console.error('Error in getTaskInstanceById:', error);
    throw error;
  }
};

/**
 * Fetch ad-hoc tasks for a specific client
 */
export const getClientAdHocTasks = async (clientId: string): Promise<TaskInstance[]> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('client_id', clientId)
      .is('recurring_task_id', null)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching client ad-hoc tasks:', error);
      throw error;
    }
    
    // Map the database results to our TaskInstance type
    return data.map(mapDatabaseToTaskInstance);
  } catch (error) {
    console.error('Error in getClientAdHocTasks:', error);
    throw error;
  }
};
