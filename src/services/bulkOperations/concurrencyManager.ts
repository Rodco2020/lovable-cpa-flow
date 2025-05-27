
import { BatchOperation, BulkOperationConfig, BulkOperationResult, BulkOperationError } from './types';
import { processSingleAssignment } from './taskCreationService';
import { updateProgressCallback } from './progressManager';

/**
 * Concurrency Manager Service
 * 
 * Handles the execution of batch operations with configurable concurrency control.
 * This module manages the parallel processing of operations while respecting
 * batch size and concurrency limits to prevent system overload.
 */

/**
 * Process batches with concurrency control
 * 
 * Executes batch operations in controlled chunks, managing concurrency to prevent
 * overwhelming the system while maximizing throughput.
 * 
 * @param operations - Array of batch operations to process
 * @param operationConfig - Configuration for batch processing
 * @param result - Result object to update with progress
 * @param startTime - Start time for progress calculations
 * @param onProgress - Optional progress callback function
 */
export const processBatchesWithConcurrency = async (
  operations: BatchOperation[],
  operationConfig: BulkOperationConfig,
  result: BulkOperationResult,
  startTime: number,
  onProgress?: (progress: any) => void
): Promise<void> => {
  const batchSize = operationConfig.batchSize;
  const concurrency = operationConfig.concurrency;
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    
    // Process batch with concurrency control
    const batchPromises = batch.map(async (operation, batchIndex) => {
      try {
        // Add delay for concurrency control
        if (batchIndex >= concurrency) {
          await addConcurrencyDelay(batchIndex, concurrency);
        }

        const operationResult = await processSingleAssignment(operation);
        result.successfulOperations++;
        result.results.push(operationResult);

        // Update progress
        updateProgressCallback(result, startTime, operation, onProgress, false);

        return operationResult;
      } catch (error) {
        handleOperationError(error, operation, result, startTime, onProgress);
        throw error;
      }
    });

    // Wait for batch to complete (continue on individual failures)
    await Promise.allSettled(batchPromises);
    
    // Small delay between batches to prevent overwhelming the system
    if (i + batchSize < operations.length) {
      await addBatchDelay();
    }
  }
};

/**
 * Add delay for concurrency control
 * 
 * @param batchIndex - Current batch index
 * @param concurrency - Maximum concurrency level
 */
const addConcurrencyDelay = async (batchIndex: number, concurrency: number): Promise<void> => {
  const delayMs = 100 * (batchIndex - concurrency + 1);
  await new Promise(resolve => setTimeout(resolve, delayMs));
};

/**
 * Add delay between batches
 */
const addBatchDelay = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 50));
};

/**
 * Handle operation error and update result
 * 
 * @param error - The error that occurred
 * @param operation - The operation that failed
 * @param result - Result object to update
 * @param startTime - Start time for progress calculations
 * @param onProgress - Optional progress callback function
 */
const handleOperationError = (
  error: unknown,
  operation: BatchOperation,
  result: BulkOperationResult,
  startTime: number,
  onProgress?: (progress: any) => void
): void => {
  result.failedOperations++;
  
  const errorDetail: BulkOperationError = {
    clientId: operation.clientId,
    templateId: operation.templateId,
    error: error instanceof Error ? error.message : String(error)
  };
  
  result.errors.push(errorDetail);

  // Update progress for failed operations too
  updateProgressCallback(result, startTime, operation, onProgress, true);
};
