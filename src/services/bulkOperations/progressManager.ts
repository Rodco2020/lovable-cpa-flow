
import { BulkOperationResult, BatchOperation, ProgressUpdate } from './types';
import { createProgressUpdate } from './progressTracker';

/**
 * Progress Manager Service
 * 
 * Handles progress tracking and callback management for bulk operations.
 * This module centralizes all progress-related functionality and ensures
 * consistent progress reporting across the application.
 */

/**
 * Update progress and notify callback
 * 
 * Creates a progress update and invokes the callback if provided.
 * Handles both successful and failed operations consistently.
 * 
 * @param result - Current operation result state
 * @param startTime - Operation start time for calculations
 * @param operation - Current operation being processed
 * @param onProgress - Optional progress callback function
 * @param isError - Whether this update is for a failed operation
 */
export const updateProgressCallback = (
  result: BulkOperationResult,
  startTime: number,
  operation: BatchOperation,
  onProgress?: (progress: ProgressUpdate) => void,
  isError: boolean = false
): void => {
  if (!onProgress) return;
  
  const currentOperation = isError 
    ? `Error processing ${operation.clientId} - ${operation.templateId}`
    : `Processing ${operation.clientId} - ${operation.templateId}`;
  
  const progress = createProgressUpdate(
    result.successfulOperations + result.failedOperations,
    result.totalOperations,
    currentOperation,
    startTime
  );
  
  onProgress(progress);
};
