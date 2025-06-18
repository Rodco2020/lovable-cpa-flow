
import { supabase } from '@/lib/supabaseClient';
import { RecurringTask } from '@/types/task';
import { mapDatabaseToRecurringTask, mapRecurringTaskToDatabase } from '../clientTask/mappers';
import { skillValidationService } from '../skillValidationService';

/**
 * Recurring Task Service - Enhanced for unified type system
 * 
 * Handles CRUD operations for recurring tasks with proper data transformation
 * and validation integration.
 */

export class RecurringTaskServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(`RecurringTaskService: ${message}`);
    this.name = 'RecurringTaskServiceError';
  }
}

/**
 * Get a recurring task by ID with proper error handling
 */
export const getRecurringTaskById = async (taskId: string): Promise<RecurringTask | null> => {
  try {
    console.log(`[RecurringTaskService] Fetching task: ${taskId}`);
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[RecurringTaskService] Task not found: ${taskId}`);
        return null;
      }
      console.error('[RecurringTaskService] Database error:', error);
      throw new RecurringTaskServiceError(`Failed to fetch task: ${error.message}`, error.code);
    }
    
    const mappedTask = mapDatabaseToRecurringTask(data);
    console.log(`[RecurringTaskService] Task fetched successfully:`, mappedTask);
    
    return mappedTask;
  } catch (error) {
    console.error('[RecurringTaskService] Error in getRecurringTaskById:', error);
    if (error instanceof RecurringTaskServiceError) {
      throw error;
    }
    throw new RecurringTaskServiceError('Unexpected error fetching task');
  }
};

/**
 * Update a recurring task with comprehensive validation and data transformation
 */
export const updateRecurringTask = async (
  taskId: string, 
  updates: Partial<RecurringTask>
): Promise<RecurringTask | null> => {
  try {
    console.log(`[RecurringTaskService] Updating task ${taskId}:`, updates);
    
    // Validate required skills if provided
    if (updates.requiredSkills && updates.requiredSkills.length > 0) {
      console.log(`[RecurringTaskService] Validating ${updates.requiredSkills.length} skills`);
      
      const skillValidation = await skillValidationService.validateSkillIds(updates.requiredSkills);
      
      if (skillValidation.invalid.length > 0) {
        console.error('[RecurringTaskService] Invalid skills detected:', skillValidation.invalid);
        throw new RecurringTaskServiceError(
          `Invalid skill IDs: ${skillValidation.invalid.join(', ')}`,
          'INVALID_SKILLS'
        );
      }
      
      // Use validated skills in the update
      updates.requiredSkills = skillValidation.valid;
      console.log(`[RecurringTaskService] Skills validated successfully`);
    }
    
    // Transform application data to database format
    const dbUpdates = mapRecurringTaskToDatabase(updates);
    console.log(`[RecurringTaskService] Database updates:`, dbUpdates);
    
    // Perform the update
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .select()
      .single();
      
    if (error) {
      console.error('[RecurringTaskService] Database update error:', error);
      throw new RecurringTaskServiceError(`Failed to update task: ${error.message}`, error.code);
    }
    
    // Transform database response back to application format
    const updatedTask = mapDatabaseToRecurringTask(data);
    console.log(`[RecurringTaskService] Task updated successfully:`, updatedTask);
    
    return updatedTask;
  } catch (error) {
    console.error(`[RecurringTaskService] Error updating task ${taskId}:`, error);
    if (error instanceof RecurringTaskServiceError) {
      throw error;
    }
    throw new RecurringTaskServiceError('Unexpected error updating task');
  }
};

/**
 * Create a new recurring task with validation
 */
export const createRecurringTask = async (
  taskData: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RecurringTask | null> => {
  try {
    console.log(`[RecurringTaskService] Creating new task:`, taskData);
    
    // Validate required skills
    if (taskData.requiredSkills && taskData.requiredSkills.length > 0) {
      const skillValidation = await skillValidationService.validateSkillIds(taskData.requiredSkills);
      
      if (skillValidation.invalid.length > 0) {
        throw new RecurringTaskServiceError(
          `Invalid skill IDs: ${skillValidation.invalid.join(', ')}`,
          'INVALID_SKILLS'
        );
      }
      
      taskData.requiredSkills = skillValidation.valid;
    }
    
    // Transform to database format
    const dbTask = mapRecurringTaskToDatabase(taskData);
    
    // Set required creation fields
    dbTask.template_id = taskData.templateId;
    dbTask.client_id = taskData.clientId;
    dbTask.created_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert(dbTask)
      .select()
      .single();
      
    if (error) {
      console.error('[RecurringTaskService] Create error:', error);
      throw new RecurringTaskServiceError(`Failed to create task: ${error.message}`, error.code);
    }
    
    const createdTask = mapDatabaseToRecurringTask(data);
    console.log(`[RecurringTaskService] Task created successfully:`, createdTask);
    
    return createdTask;
  } catch (error) {
    console.error('[RecurringTaskService] Error creating task:', error);
    if (error instanceof RecurringTaskServiceError) {
      throw error;
    }
    throw new RecurringTaskServiceError('Unexpected error creating task');
  }
};

/**
 * Deactivate a recurring task
 */
export const deactivateRecurringTask = async (taskId: string): Promise<boolean> => {
  try {
    console.log(`[RecurringTaskService] Deactivating task: ${taskId}`);
    
    const { error } = await supabase
      .from('recurring_tasks')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('[RecurringTaskService] Deactivation error:', error);
      throw new RecurringTaskServiceError(`Failed to deactivate task: ${error.message}`, error.code);
    }

    console.log(`[RecurringTaskService] Task deactivated successfully: ${taskId}`);
    return true;
  } catch (error) {
    console.error(`[RecurringTaskService] Error deactivating task ${taskId}:`, error);
    if (error instanceof RecurringTaskServiceError) {
      throw error;
    }
    throw new RecurringTaskServiceError('Unexpected error deactivating task');
  }
};

/**
 * Fetch recurring tasks for a specific client
 */
export const getClientRecurringTasks = async (clientId: string): Promise<RecurringTask[]> => {
  try {
    console.log(`[RecurringTaskService] Fetching tasks for client: ${clientId}`);
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('[RecurringTaskService] Client tasks fetch error:', error);
      throw new RecurringTaskServiceError(`Failed to fetch client tasks: ${error.message}`, error.code);
    }
    
    // Map all database results to application format
    const mappedTasks = data.map(mapDatabaseToRecurringTask);
    console.log(`[RecurringTaskService] Fetched ${mappedTasks.length} tasks for client ${clientId}`);
    
    return mappedTasks;
  } catch (error) {
    console.error(`[RecurringTaskService] Error fetching client tasks for ${clientId}:`, error);
    if (error instanceof RecurringTaskServiceError) {
      throw error;
    }
    throw new RecurringTaskServiceError('Unexpected error fetching client tasks');
  }
};
