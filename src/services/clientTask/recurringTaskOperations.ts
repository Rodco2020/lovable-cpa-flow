/**
 * Client Task Service - Recurring Task Operations
 * 
 * Handles operations specific to recurring tasks with enhanced validation and persistence tracking
 */

import { supabase } from '@/lib/supabaseClient';
import { RecurringTask } from '@/types/task';
import { mapDatabaseToRecurringTask, mapRecurringTaskToDatabase } from './mappers';
import { validateStaffExists } from './staffValidationService';
import { debugAuthAndRLS, logOperationWithRLSContext } from './debugUtils';

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
 * Get a recurring task by ID with enhanced RLS debugging
 */
export const getRecurringTaskById = async (taskId: string): Promise<RecurringTask | null> => {
  try {
    console.log('🔍 [getRecurringTaskById] PHASE 4 - Starting with RLS debugging:', {
      taskId,
      timestamp: new Date().toISOString()
    });

    // Enhanced RLS debugging
    await logOperationWithRLSContext('getRecurringTaskById', { taskId });

    logSQLOperation('SELECT', 'recurring_tasks', '*', { id: taskId });

    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [getRecurringTaskById] PHASE 4 - No task found:', {
          taskId,
          error: error.code,
          timestamp: new Date().toISOString()
        });
        return null;
      }
      
      // Enhanced error logging for RLS issues
      if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
        console.error('🔒 [getRecurringTaskById] PHASE 4 - RLS policy blocked access:', {
          taskId,
          error,
          errorCode: error.code,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        });
        await debugAuthAndRLS('getRecurringTaskById_rls_error');
      }
      
      console.error('❌ [getRecurringTaskById] PHASE 4 - Database error:', {
        taskId,
        error,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    console.log('📋 [getRecurringTaskById] PHASE 4 - Raw database response:', {
      taskId,
      dbData: data,
      preferredStaffId: data.preferred_staff_id,
      preferredStaffIdType: typeof data.preferred_staff_id,
      timestamp: new Date().toISOString()
    });
    
    const mappedTask = mapDatabaseToRecurringTask(data);
    
    console.log('✅ [getRecurringTaskById] PHASE 4 - Task retrieval completed successfully:', {
      taskId,
      mappedTask,
      preferredStaffId: mappedTask.preferredStaffId,
      preferredStaffIdType: typeof mappedTask.preferredStaffId,
      timestamp: new Date().toISOString()
    });
    
    return mappedTask;
  } catch (error) {
    console.error('💥 [getRecurringTaskById] PHASE 4 - Unexpected error:', {
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
 * Enhanced verification function to re-fetch and validate persistence
 */
const verifyUpdatePersistence = async (taskId: string, expectedUpdates: any): Promise<boolean> => {
  try {
    console.log('🔍 [verifyUpdatePersistence] Starting persistence verification:', {
      taskId,
      expectedUpdates,
      timestamp: new Date().toISOString()
    });

    // Re-fetch the record to verify persistence
    const { data: verificationData, error: verificationError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (verificationError) {
      console.error('❌ [verifyUpdatePersistence] Failed to re-fetch record for verification:', {
        taskId,
        verificationError,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    console.log('📋 [verifyUpdatePersistence] Re-fetched record for verification:', {
      taskId,
      verificationData,
      actualPreferredStaffId: verificationData.preferred_staff_id,
      timestamp: new Date().toISOString()
    });

    // Verify each field that was updated
    let allFieldsMatch = true;
    const verificationResults: any = {};

    Object.keys(expectedUpdates).forEach(field => {
      const expectedValue = expectedUpdates[field];
      const actualValue = verificationData[field];
      const matches = expectedValue === actualValue;
      
      verificationResults[field] = {
        expected: expectedValue,
        actual: actualValue,
        matches
      };

      if (!matches) {
        allFieldsMatch = false;
        console.error(`❌ [verifyUpdatePersistence] Field '${field}' persistence failed:`, {
          taskId,
          field,
          expected: expectedValue,
          actual: actualValue,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`✅ [verifyUpdatePersistence] Field '${field}' persisted correctly:`, {
          taskId,
          field,
          value: actualValue,
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log('📊 [verifyUpdatePersistence] Complete verification results:', {
      taskId,
      allFieldsMatch,
      verificationResults,
      timestamp: new Date().toISOString()
    });

    return allFieldsMatch;
  } catch (error) {
    console.error('💥 [verifyUpdatePersistence] Verification process failed:', {
      taskId,
      error,
      timestamp: new Date().toISOString()
    });
    return false;
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
    console.log('🔄 [updateRecurringTask] PHASE 5 - Starting enhanced update with RLS debugging:', {
      taskId,
      updates,
      preferredStaffId: updates.preferredStaffId,
      preferredStaffIdType: typeof updates.preferredStaffId,
      hasPreferredStaffUpdate: 'preferredStaffId' in updates,
      timestamp: new Date().toISOString()
    });

    // Enhanced RLS debugging before operation
    await logOperationWithRLSContext('updateRecurringTask', { taskId, updates });

    // PHASE 5: Validate preferred staff exists before attempting update
    if ('preferredStaffId' in updates) {
      console.log('🔍 [updateRecurringTask] PHASE 5 - Validating preferred staff:', {
        taskId,
        preferredStaffId: updates.preferredStaffId,
        timestamp: new Date().toISOString()
      });

      const staffValidation = await validateStaffExists(updates.preferredStaffId);
      
      if (!staffValidation.isValid) {
        console.error('❌ [updateRecurringTask] PHASE 5 - Staff validation failed:', {
          taskId,
          preferredStaffId: updates.preferredStaffId,
          validationError: staffValidation.error,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Invalid preferred staff: ${staffValidation.error || 'Validation failed'}`);
      }

      console.log('✅ [updateRecurringTask] PHASE 5 - Staff validation passed:', {
        taskId,
        preferredStaffId: updates.preferredStaffId,
        staffName: staffValidation.staffName,
        timestamp: new Date().toISOString()
      });
    }

    // Map application data to database format
    const dbUpdates = mapRecurringTaskToDatabase(updates);
    
    console.log('🗂️ [updateRecurringTask] PHASE 5 - Database updates prepared:', {
      taskId,
      dbUpdates,
      preferredStaffId: dbUpdates.preferred_staff_id,
      preferredStaffIdType: typeof dbUpdates.preferred_staff_id,
      hasPreferredStaffUpdate: 'preferred_staff_id' in dbUpdates,
      timestamp: new Date().toISOString()
    });

    // Log the exact SQL operation being performed
    logSQLOperation('UPDATE', 'recurring_tasks', dbUpdates, { id: taskId });
    
    console.log('📤 [updateRecurringTask] PHASE 5 - Executing database update with RLS:', {
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
      // Enhanced RLS error handling
      if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
        console.error('🔒 [updateRecurringTask] PHASE 5 - RLS policy blocked update:', {
          taskId,
          error,
          errorCode: error.code,
          errorMessage: error.message,
          dbUpdates,
          timestamp: new Date().toISOString()
        });
        await debugAuthAndRLS('updateRecurringTask_rls_error');
        throw new Error(`Access denied: Unable to update task. Please ensure you are properly authenticated and have permission to modify this task.`);
      }
      
      console.error('❌ [updateRecurringTask] PHASE 5 - Database update failed:', {
        taskId,
        error,
        dbUpdates,
        errorCode: error.code,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Database update failed: ${error.message}`);
    }

    console.log('📋 [updateRecurringTask] PHASE 5 - Database update successful - raw response:', {
      taskId,
      dbResponse: data,
      preferredStaffId: data.preferred_staff_id,
      preferredStaffIdType: typeof data.preferred_staff_id,
      updatedAt: data.updated_at,
      timestamp: new Date().toISOString()
    });

    // Enhanced persistence verification
    console.log('🔍 [updateRecurringTask] PHASE 5 - Starting comprehensive persistence verification...');
    
    const persistenceVerified = await verifyUpdatePersistence(taskId, dbUpdates);
    
    if (!persistenceVerified) {
      console.error('💥 [updateRecurringTask] PHASE 5 - CRITICAL: Persistence verification failed!', {
        taskId,
        dbUpdates,
        timestamp: new Date().toISOString()
      });
      throw new Error('Critical persistence verification failed - data may not have been saved correctly');
    }

    // Additional focused verification for preferred_staff_id
    if ('preferred_staff_id' in dbUpdates) {
      const expectedValue = dbUpdates.preferred_staff_id;
      const actualValue = data.preferred_staff_id;
      const persistenceVerified = expectedValue === actualValue;

      console.log('🔍 [updateRecurringTask] PHASE 5 - Focused preferred_staff_id verification:', {
        taskId,
        expectedPreferredStaffId: expectedValue,
        actualPreferredStaffId: actualValue,
        persistenceVerified,
        valuesMatch: expectedValue === actualValue,
        bothAreNull: expectedValue === null && actualValue === null,
        bothAreStrings: typeof expectedValue === 'string' && typeof actualValue === 'string',
        timestamp: new Date().toISOString()
      });

      if (!persistenceVerified) {
        console.error('💥 [updateRecurringTask] PHASE 5 - Preferred staff persistence verification failed!', {
          taskId,
          expected: expectedValue,
          actual: actualValue,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Preferred staff persistence verification failed: expected ${expectedValue}, got ${actualValue}`);
      }

      console.log('✅ [updateRecurringTask] PHASE 5 - Preferred staff persistence verified successfully!', {
        taskId,
        preferredStaffId: actualValue,
        timestamp: new Date().toISOString()
      });
    }
    
    const mappedResult = mapDatabaseToRecurringTask(data);
    
    console.log('✅ [updateRecurringTask] PHASE 5 - Update operation completed successfully with RLS:', {
      taskId,
      mappedResult,
      preferredStaffId: mappedResult.preferredStaffId,
      preferredStaffIdType: typeof mappedResult.preferredStaffId,
      updateSuccess: true,
      persistenceVerified: true,
      timestamp: new Date().toISOString()
    });
    
    return mappedResult;
  } catch (error) {
    console.error('💥 [updateRecurringTask] PHASE 5 - Update operation failed:', {
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
        throw new Error(`Invalid preferred staff: ${staffValidation.error || 'Validation failed'}`);
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
