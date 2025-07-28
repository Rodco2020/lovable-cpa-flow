
/**
 * Client Task Service - Get All Recurring Tasks
 * 
 * Handles fetching all recurring tasks across the system
 */

import { supabase } from '@/lib/supabaseClient';
import { RecurringTask } from '@/types/task';
import { mapDatabaseToRecurringTask } from './mappers';

/**
 * Fetch all recurring tasks in the system
 */
export const getAllRecurringTasks = async (activeOnly: boolean = true): Promise<RecurringTask[]> => {
  try {
    let query = supabase
      .from('recurring_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching all recurring tasks:', error);
      throw error;
    }
    
    // Map the database results to our RecurringTask type
    return data.map(mapDatabaseToRecurringTask);
  } catch (error) {
    console.error('Error in getAllRecurringTasks:', error);
    throw error;
  }
};
