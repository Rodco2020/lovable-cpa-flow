
import { supabase } from '@/lib/supabaseClient';
import { createRecurringTask } from './recurringTaskCreator';
import { createAdHocTask } from './adHocTaskCreator';
import { BatchOperation } from './types';

/**
 * Task Creation Service - Updated for UUID-based skill system
 * 
 * Central service for creating tasks from batch operations.
 * Handles both ad-hoc and recurring task creation with proper UUID skill storage.
 */

/**
 * Process a single assignment operation
 * 
 * @param operation - The batch operation to process
 * @returns Promise resolving to the created task data
 */
export const processSingleAssignment = async (operation: BatchOperation): Promise<any> => {
  console.log(`[TaskCreationService] Processing assignment:`, {
    clientId: operation.clientId,
    templateId: operation.templateId,
    taskType: operation.config.taskType
  });

  try {
    let result;

    if (operation.config.taskType === 'recurring') {
      result = await createRecurringTask(operation);
    } else {
      result = await createAdHocTask(operation);
    }

    console.log(`[TaskCreationService] Successfully processed assignment:`, result);
    return result;

  } catch (error) {
    console.error('[TaskCreationService] Failed to process assignment:', error);
    throw new Error(`Failed to create ${operation.config.taskType} task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate operation before processing
 * 
 * @param operation - The batch operation to validate
 * @returns true if valid, throws error if invalid
 */
export const validateOperation = (operation: BatchOperation): boolean => {
  if (!operation.clientId) {
    throw new Error('Client ID is required');
  }

  if (!operation.templateId) {
    throw new Error('Template ID is required');
  }

  if (!operation.config.taskType) {
    throw new Error('Task type is required');
  }

  return true;
};
