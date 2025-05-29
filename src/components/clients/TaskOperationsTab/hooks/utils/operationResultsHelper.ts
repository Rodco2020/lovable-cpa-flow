
import { OperationResults } from './progressTracker';

/**
 * Helper function to create a complete OperationResults object
 * from basic operation data
 */
export const createOperationResults = (
  success: boolean,
  tasksCreated: number = 0,
  errors: string[] = [],
  processingTime: number = 0
): OperationResults => {
  return {
    success,
    tasksCreated,
    errors,
    totalOperations: tasksCreated + errors.length,
    successfulOperations: success ? tasksCreated : 0,
    failedOperations: errors.length,
    processingTime,
    results: success ? Array(tasksCreated).fill({}) : []
  };
};

/**
 * Helper function to create a failed operation result
 */
export const createFailedOperationResults = (
  errors: string[],
  processingTime: number = 0
): OperationResults => {
  return createOperationResults(false, 0, errors, processingTime);
};

/**
 * Helper function to create a successful operation result
 */
export const createSuccessfulOperationResults = (
  tasksCreated: number,
  processingTime: number = 0
): OperationResults => {
  return createOperationResults(true, tasksCreated, [], processingTime);
};
