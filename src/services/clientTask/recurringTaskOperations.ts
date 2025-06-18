
/**
 * Client Task Service - Recurring Task Operations
 * 
 * Handles operations specific to recurring tasks with enhanced validation and persistence tracking
 */

import { supabase } from '@/lib/supabaseClient';
import { RecurringTask } from '@/types/task';
import { mapDatabaseToRecurringTask, mapRecurringTaskToDatabase } from './mappers';
import { validateStaffExists } from './staffValidationService';

/**
 * Enhanced SQL execution logging for database operations
 */
const logSQLOperation = (operation: string, table: string, data: any, conditions?: any) => {
  console.log(`📤 [SQL] PHASE 3 - ${operation} operation:`, {
    operation,
    table,
    data,
    conditions,
    timestamp: new Date().toISOString()
  });
};

/**
 * Get a recurring task by ID
 */
export const getRecurringTaskById = async (taskId: string): Promise<RecurringTask | null> => {
  try {
    console.log('🔍 [getRecurringTaskById] PHASE 3 - Fetching task:', {
      taskId,
      timestamp: new Date().toISOString()
    });

    logSQLOperation('SELECT', 'recurring_tasks', '*', { id: taskId });

    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [getRecurringTaskById] PHASE 3 - No task found:', {
          taskId,
          error: error.code,
          timestamp: new Date().toISOString()
        });
        return null;
      }
      console.error('❌ [getRecurringTaskById] PHASE 3 - Database error:', {
        taskId,
        error,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    console.log('📋 [getRecurringTaskById] PHASE 3 - Raw database response:', {
      taskId,
      dbData: data,
      preferredStaffId: data.preferred_staff_id,
      preferredStaffIdType: typeof data.preferred_staff_id,
      timestamp: new Date().toISOString()
    });
    
    const mappedTask = mapDatabaseToRecurringTask(data);
    
    console.log('✅ [getRecurringTaskById] PHASE 3 - Task retrieval completed:', {
      taskId,
      mappedTask,
      preferredStaffId: mappedTask.preferredStaffId,
      preferredStaffIdType: typeof mappedTask.preferredStaffId,
      timestamp: new Date().toISOString()
    });
    
    return mappedTask;
  } catch (error) {
    console.error('💥 [getRecurringTaskById] PHASE 3 - Unexpected error:', {
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
    console.log('🔍 [getClientRecurringTasks] PHASE 3 - Fetching client tasks:', {
      clientId,
      timestamp: new Date().toISOString()
    });

    logSQLOperation('SELECT', 'recurring_tasks', '*', { client_id: clientId });

    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ [getClientRecurringTasks] PHASE 3 - Database error:', {
        clientId,
        error,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
    
    console.log('📋 [getClientRecurringTasks] PHASE 3 - Raw database response:', {
      clientId,
      taskCount: data.length,
      tasksWithPreferredStaff: data.filter(t => t.preferred_staff_id).length,
      timestamp: new Date().toISOString()
    });
    
    // Map the database results to our RecurringTask type
    const mappedTasks = data.map(mapDatabaseToRecurringTask);
    
    console.log('✅ [getClientRecurringTasks] PHASE 3 - Tasks retrieval completed:', {
      clientId,
      mappedTaskCount: mappedTasks.length,
      timestamp: new Date().toISOString()
    });
    
    return mappedTasks;
  } catch (error) {
    console.error('💥 [getClientRecurringTasks] PHASE 3 - Unexpected error:', {
      clientId,
      error,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Update a recurring task with enhanced validation and persistence tracking
 */
export const updateRecurringTask = async (
  taskId: string, 
  updates: Partial<RecurringTask>
): Promise<RecurringTask | null> => {
  try {
    console.log('🔄 [updateRecurringTask] PHASE 3 - Starting enhanced update operation:', {
      taskId,
      updates,
      preferredStaffId: updates.preferredStaffId,
      preferredStaffIdType: typeof updates.preferredStaffId,
      hasPreferredStaffUpdate: 'preferredStaffId' in updates,
      timestamp: new Date().toISOString()
    });

    // PHASE 3: Validate preferred staff exists before attempting update
    if ('preferredStaffId' in updates) {
      console.log('🔍 [updateRecurringTask] PHASE 3 - Validating preferred staff:', {
        taskId,
        preferredStaffId: updates.preferredStaffId,
        timestamp: new Date().toISOString()
      });

      const staffValidation = await validateStaffExists(updates.preferredStaffId);
      
      if (!staffValidation.isValid) {
        console.error('❌ [updateRecurringTask] PHASE 3 - Staff validation failed:', {
          taskId,
          preferredStaffId: updates.preferredStaffId,
          validationError: staffValidation.error,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Invalid preferred staff: ${staffValidation.error}`);
      }

      console.log('✅ [updateRecurringTask] PHASE 3 - Staff validation passed:', {
        taskId,
        preferredStaffId: updates.preferredStaffId,
        staffName: staffValidation.staffName,
        timestamp: new Date().toISOString()
      });
    }

    // Map application data to database format
    const dbUpdates = mapRecurringTaskToDatabase(updates);
    
    console.log('🗂️ [updateRecurringTask] PHASE 3 - Database updates prepared:', {
      taskId,
      dbUpdates,
      preferredStaffId: dbUpdates.preferred_staff_id,
      preferredStaffIdType: typeof dbUpdates.preferred_staff_id,
      hasPreferredStaffUpdate: 'preferred_staff_id' in dbUpdates,
      timestamp: new Date().toISOString()
    });
    
    // Log the exact SQL operation being performed
    logSQLOperation('UPDATE', 'recurring_tasks', dbUpdates, { id: taskId });
    
    console.log('📤 [updateRecurringTask] PHASE 3 - Executing database update:', {
      taskId,
      table: 'recurring_tasks',
      updateData: dbUpdates,
      sqlCondition: `id = ${taskId}`,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('recurring_tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .select()
      .single();
      
    if (error) {
      console.error('❌ [updateRecurringTask] PHASE 3 - Database update failed:', {
        taskId,
        error,
        dbUpdates,
        errorCode: error.code,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Database update failed: ${error.message}`);
    }

    console.log('📋 [updateRecurringTask] PHASE 3 - Database update successful - raw response:', {
      taskId,
      dbResponse: data,
      preferredStaffId: data.preferred_staff_id,
      preferredStaffIdType: typeof data.preferred_staff_id,
      updatedAt: data.updated_at,
      timestamp: new Date().toISOString()
    });

    // PHASE 3: Verify the update was persisted correctly
    if ('preferred_staff_id' in dbUpdates) {
      const expectedValue = dbUpdates.preferred_staff_id;
      const actualValue = data.preferred_staff_id;
      const persistenceVerified = expectedValue === actualValue;

      console.log('🔍 [updateRecurringTask] PHASE 3 - Persistence verification:', {
        taskId,
        expectedPreferredStaffId: expectedValue,
        actualPreferredStaffId: actualValue,
        persistenceVerified,
        valuesMatch: expectedValue === actualValue,
        timestamp: new Date().toISOString()
      });

      if (!persistenceVerified) {
        console.error('💥 [updateRecurringTask] PHASE 3 - Persistence verification failed!', {
          taskId,
          expected: expectedValue,
          actual: actualValue,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Persistence verification failed: expected ${expectedValue}, got ${actualValue}`);
      }
    }
    
    const mappedResult = mapDatabaseToRecurringTask(data);
    
    console.log('✅ [updateRecurringTask] PHASE 3 - Update operation completed successfully:', {
      taskId,
      mappedResult,
      preferredStaffId: mappedResult.preferredStaffId,
      preferredStaffIdType: typeof mappedResult.preferredStaffId,
      updateSuccess: true,
      timestamp: new Date().toISOString()
    });
    
    return mappedResult;
  } catch (error) {
    console.error('💥 [updateRecurringTask] PHASE 3 - Update operation failed:', {
      taskId,
      error,
      updates,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Create a new recurring task with enhanced validation
 */
export const createRecurringTask = async (
  taskData: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RecurringTask | null> => {
  try {
    console.log('🔄 [createRecurringTask] PHASE 3 - Starting task creation:', {
      taskData,
      preferredStaffId: taskData.preferredStaffId,
      timestamp: new Date().toISOString()
    });

    // PHASE 3: Validate preferred staff exists before creation
    if (taskData.preferredStaffId) {
      const staffValidation = await validateStaffExists(taskData.preferredStaffId);
      
      if (!staffValidation.isValid) {
        console.error('❌ [createRecurringTask] PHASE 3 - Staff validation failed:', {
          preferredStaffId: taskData.preferredStaffId,
          validationError: staffValidation.error,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Invalid preferred staff: ${staffValidation.error}`);
      }
    }

    const dbTask = mapRecurringTaskToDatabase(taskData);
    
    // Set required fields for creation
    dbTask.template_id = taskData.templateId;
    dbTask.client_id = taskData.clientId;
    dbTask.created_at = new Date().toISOString();
    
    logSQLOperation('INSERT', 'recurring_tasks', dbTask);
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert(dbTask)
      .select()
      .single();
      
    if (error) {
      console.error('❌ [createRecurringTask] PHASE 3 - Database insert failed:', {
        error,
        dbTask,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
    
    const mappedResult = mapDatabaseToRecurringTask(data);
    
    console.log('✅ [createRecurringTask] PHASE 3 - Task creation completed:', {
      createdTaskId: mappedResult.id,
      preferredStaffId: mappedResult.preferredStaffId,
      timestamp: new Date().toISOString()
    });
    
    return mappedResult;
  } catch (error) {
    console.error('💥 [createRecurringTask] PHASE 3 - Task creation failed:', {
      error,
      taskData,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
