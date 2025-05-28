
import { BatchOperation, BulkOperationResult, ProgressUpdate, BatchProcessingConfig } from './types';
import { processSingleAssignment } from './taskCreationService';
import { addErrorToBulkResult } from './resultManager';

/**
 * Concurrency Manager Service
 * 
 * Handles batch processing with concurrency control to optimize performance
 * while preventing system overload. Manages the execution of operations
 * in controlled batches with configurable concurrency limits.
 */

/**
 * Process operations in batches with concurrency control
 * 
 * Takes a list of operations and processes them in controlled batches,
 * respecting concurrency limits to prevent overwhelming the system.
 * 
 * @param operations - Array of batch operations to process
 * @param config - Configuration for batch processing
 * @param result - Bulk result object to update with progress
 * @param startTime - Operation start time for progress calculation
 * @param onProgress - Optional progress callback
 */
export const processBatchesWithConcurrency = async (
  operations: BatchOperation[],
  config: BatchProcessingConfig,
  result: BulkOperationResult,
  startTime: number,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<void> => {
  console.log(`Processing ${operations.length} operations with concurrency ${config.concurrency}`);

  // Split operations into batches
  const batches = createBatches(operations, config.batchSize);
  let completedOperations = 0;

  // Process batches with concurrency control
  for (let i = 0; i < batches.length; i += config.concurrency) {
    const currentBatches = batches.slice(i, i + config.concurrency);
    
    // Process current batch group concurrently
    const batchPromises = currentBatches.map(batch => 
      processBatch(batch, result, completedOperations, operations.length, startTime, onProgress)
    );

    // Wait for all batches in current group to complete
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Update completed count
    batchResults.forEach(batchResult => {
      if (batchResult.status === 'fulfilled') {
        completedOperations += batchResult.value;
      } else {
        console.error('Batch processing failed:', batchResult.reason);
        // Add batch-level error to result
        addErrorToBulkResult(result, '', '', `Batch processing failed: ${batchResult.reason}`);
      }
    });

    // Report progress after each batch group
    if (onProgress) {
      const progress = createProgressUpdate(
        completedOperations,
        operations.length,
        'Processing batches...',
        startTime
      );
      onProgress(progress);
    }
  }

  console.log(`Completed processing ${completedOperations} operations`);
};

/**
 * Create batches from operations array
 */
const createBatches = (operations: BatchOperation[], batchSize: number): BatchOperation[][] => {
  const batches: BatchOperation[][] = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    batches.push(operations.slice(i, i + batchSize));
  }
  
  return batches;
};

/**
 * Process a single batch of operations
 */
const processBatch = async (
  batch: BatchOperation[],
  result: BulkOperationResult,
  currentCompleted: number,
  totalOperations: number,
  startTime: number,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<number> => {
  let batchCompleted = 0;

  for (const operation of batch) {
    try {
      // Update progress for current operation
      if (onProgress) {
        const progress = createProgressUpdate(
          currentCompleted + batchCompleted,
          totalOperations,
          `Processing ${operation.clientId} - ${operation.templateId}`,
          startTime
        );
        onProgress(progress);
      }

      // Process single assignment
      const operationResult = await processSingleAssignment(operation);
      
      // Add result to bulk result
      result.results.push(operationResult);
      result.successfulOperations++;
      
      console.log(`Successfully processed operation: ${operation.id}`);
      
    } catch (error) {
      console.error(`Failed to process operation ${operation.id}:`, error);
      
      // Add error to bulk result
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addErrorToBulkResult(result, operation.clientId, operation.templateId, errorMessage);
      result.failedOperations++;
    }
    
    batchCompleted++;
  }

  return batchCompleted;
};

/**
 * Create progress update object
 */
const createProgressUpdate = (
  completed: number,
  total: number,
  currentOperation: string,
  startTime: number
): ProgressUpdate => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const elapsedTime = Date.now() - startTime;
  const estimatedTotal = completed > 0 ? (elapsedTime / completed) * total : 0;
  const estimatedTimeRemaining = estimatedTotal - elapsedTime;

  return {
    completed,
    total,
    currentOperation,
    percentage,
    estimatedTimeRemaining: Math.max(0, estimatedTimeRemaining)
  };
};
