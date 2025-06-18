
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
    console.log('🔍 [getRecurringTaskById] Fetching task:', {
      taskId,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [getRecurringTaskById] No task found:', {
          taskId,
          error: error.code,
          timestamp: new Date().toISOString()
        });
        return null;
      }
      console.error('❌ [getRecurringTaskById] Database error:', {
        taskId,
        error,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    console.log('📋 [getRecurringTaskById] Raw database data:', {
      taskId,
      dbData: data,
      preferredStaffId: data.preferred_staff_id,
      preferredStaffIdType: typeof data.preferred_staff_id,
      timestamp: new Date().toISOString()
    });
    
    const mappedTask = mapDatabaseToRecurringTask(data);
    
    console.log('✅ [getRecurringTaskById] Mapped task data:', {
      taskId,
      mappedTask,
      preferredStaffId: mappedTask.preferredStaffId,
      preferredStaffIdType: typeof mappedTask.preferredStaffId,
      timestamp: new Date().toISOString()
    });
    
    return mappedTask;
  } catch (error) {
    console.error('💥 [getRecurringTaskById] Unexpected error:', {
      taskId,
      error,
      timestamp: new Date().toISOString()
    });
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

/**
 * Update a recurring task with preferred staff support
 */
export const updateRecurringTask = async (
  taskId: string, 
  updates: Partial<RecurringTask>
): Promise<RecurringTask | null> => {
  try {
    console.log('🔄 [updateRecurringTask] Starting update operation:', {
      taskId,
      updates,
      preferredStaffId: updates.preferredStaffId,
      preferredStaffIdType: typeof updates.preferredStaffId,
      timestamp: new Date().toISOString()
    });

    const dbUpdates = mapRecurringTaskToDatabase(updates);
    
    console.log('🗂️ [updateRecurringTask] Mapped database updates:', {
      taskId,
      dbUpdates,
      preferredStaffId: dbUpdates.preferred_staff_id,
      preferredStaffIdType: typeof dbUpdates.preferred_staff_id,
      timestamp: new Date().toISOString()
    });
    
    console.log('📤 [updateRecurringTask] Executing database update:', {
      taskId,
      table: 'recurring_tasks',
      updateData: dbUpdates,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('recurring_tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .select()
      .single();
      
    if (error) {
      console.error('❌ [updateRecurringTask] Database update failed:', {
        taskId,
        error,
        dbUpdates,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    console.log('📋 [updateRecurringTask] Database update successful - raw response:', {
      taskId,
      dbResponse: data,
      preferredStaffId: data.preferred_staff_id,
      preferredStaffIdType: typeof data.preferred_staff_id,
      timestamp: new Date().toISOString()
    });
    
    const mappedResult = mapDatabaseToRecurringTask(data);
    
    console.log('✅ [updateRecurringTask] Final mapped result:', {
      taskId,
      mappedResult,
      preferredStaffId: mappedResult.preferredStaffId,
      preferredStaffIdType: typeof mappedResult.preferredStaffId,
      timestamp: new Date().toISOString()
    });
    
    return mappedResult;
  } catch (error) {
    console.error('💥 [updateRecurringTask] Unexpected error:', {
      taskId,
      error,
      updates,
      timestamp: new Date().toISOString()
    });
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
