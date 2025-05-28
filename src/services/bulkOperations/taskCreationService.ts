
import { createRecurringTask } from './recurringTaskCreator';
import { createAdHocTask } from './adHocTaskCreator';
import { BatchOperation } from './types';

/**
 * Task Creation Service - Main Orchestrator
 * 
 * This service coordinates task creation by delegating to specialized
 * creation services based on the operation configuration.
 * 
 * Maintains the exact same public API as the original service while
 * providing improved internal structure and maintainability.
 */

/**
 * Process a single assignment operation
 * 
 * Creates either an ad-hoc task or recurring task based on the operation configuration.
 * This function handles the delegation to appropriate creation services.
 * 
 * @param operation - The batch operation to process
 * @returns Promise resolving to the created task data
 */
export const processSingleAssignment = async (operation: BatchOperation): Promise<any> => {
  console.log(`Processing assignment: ${operation.clientId} - ${operation.templateId}`);

  try {
    // Determine task type from config
    const taskType = operation.config.taskType || operation.config.assignmentType;
    
    if (taskType === 'recurring') {
      return await createRecurringTask(operation);
    } else {
      return await createAdHocTask(operation);
    }
  } catch (error) {
    console.error(`Failed to process assignment ${operation.id}:`, error);
    throw error;
  }
};

// Re-export specialized functions for direct use if needed
export { createRecurringTask } from './recurringTaskCreator';
export { createAdHocTask } from './adHocTaskCreator';
export { createTaskInstanceFromRecurring } from './taskInstanceGenerator';
export { calculateNextDueDate } from './dueDateCalculator';
export { resolveSkillNames } from './skillResolver';
