
import { BulkOperationResult } from './types';

/**
 * Result Manager Service
 * 
 * Handles the creation and management of bulk operation results.
 * This module provides utilities for initializing and finalizing
 * operation result objects.
 */

/**
 * Initialize a new bulk operation result
 * 
 * Creates a new result object with default values for tracking
 * the progress and outcome of bulk operations.
 * 
 * @returns Initialized bulk operation result
 */
export const initializeBulkResult = (): BulkOperationResult => {
  return {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    errors: [],
    processingTime: 0,
    results: []
  };
};

/**
 * Finalize bulk operation result
 * 
 * Updates the result with final processing time and performs
 * any cleanup or finalization tasks.
 * 
 * @param result - The result object to finalize
 * @param startTime - The operation start time
 */
export const finalizeBulkResult = (
  result: BulkOperationResult,
  startTime: number
): void => {
  result.processingTime = Date.now() - startTime;
};
