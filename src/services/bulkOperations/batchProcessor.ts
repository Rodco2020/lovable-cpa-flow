
import { toast } from '@/hooks/use-toast';
import { BulkAssignment, BulkOperationConfig, BulkOperationResult, BulkOperationError, ProgressUpdate, BatchOperation } from './types';
import { processSingleAssignment } from './taskCreationService';
import { createProgressUpdate } from './progressTracker';

/**
 * Batch Processing Service
 * 
 * Handles the core batch processing logic for bulk operations.
 */

/**
 * Process bulk template assignments with progress tracking
 */
export const processBulkAssignments = async (
  assignment: BulkAssignment,
  operationConfig: BulkOperationConfig,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<BulkOperationResult> => {
  const startTime = Date.now();
  const result: BulkOperationResult = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    errors: [],
    processingTime: 0,
    results: []
  };

  try {
    // Create batch operations
    const operations = createBatchOperations(assignment);
    result.totalOperations = operations.length;

    // Process operations in batches
    await processBatchesWithConcurrency(
      operations,
      operationConfig,
      result,
      startTime,
      onProgress
    );

    result.processingTime = Date.now() - startTime;
    showCompletionToast(result);

    return result;
  } catch (error) {
    console.error('Error in bulk assignments:', error);
    result.processingTime = Date.now() - startTime;
    
    toast({
      title: "Bulk Assignment Failed",
      description: "An unexpected error occurred during bulk processing.",
      variant: "destructive",
    });

    return result;
  }
};

/**
 * Create batch operations from assignment
 */
const createBatchOperations = (assignment: BulkAssignment): BatchOperation[] => {
  const operations: BatchOperation[] = [];
  assignment.clientIds.forEach(clientId => {
    assignment.templateIds.forEach(templateId => {
      operations.push({
        id: `${clientId}-${templateId}`,
        clientId,
        templateId,
        config: assignment.config
      });
    });
  });
  return operations;
};

/**
 * Process batches with concurrency control
 */
const processBatchesWithConcurrency = async (
  operations: BatchOperation[],
  operationConfig: BulkOperationConfig,
  result: BulkOperationResult,
  startTime: number,
  onProgress?: (progress: ProgressUpdate) => void
) => {
  const batchSize = operationConfig.batchSize;
  const concurrency = operationConfig.concurrency;
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    
    // Process batch with concurrency control
    const batchPromises = batch.map(async (operation, batchIndex) => {
      try {
        // Add delay for concurrency control
        if (batchIndex >= concurrency) {
          await new Promise(resolve => setTimeout(resolve, 100 * (batchIndex - concurrency + 1)));
        }

        const operationResult = await processSingleAssignment(operation);
        result.successfulOperations++;
        result.results.push(operationResult);

        // Update progress
        updateProgress(result, startTime, operation, onProgress);

        return operationResult;
      } catch (error) {
        result.failedOperations++;
        const errorDetail: BulkOperationError = {
          clientId: operation.clientId,
          templateId: operation.templateId,
          error: error instanceof Error ? error.message : String(error)
        };
        result.errors.push(errorDetail);

        // Update progress for failed operations too
        updateProgress(result, startTime, operation, onProgress, true);

        throw error;
      }
    });

    // Wait for batch to complete (continue on individual failures)
    await Promise.allSettled(batchPromises);
    
    // Small delay between batches to prevent overwhelming the system
    if (i + batchSize < operations.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
};

/**
 * Update progress and notify callback
 */
const updateProgress = (
  result: BulkOperationResult,
  startTime: number,
  operation: BatchOperation,
  onProgress?: (progress: ProgressUpdate) => void,
  isError: boolean = false
) => {
  if (onProgress) {
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
  }
};

/**
 * Show completion toast based on results
 */
const showCompletionToast = (result: BulkOperationResult) => {
  if (result.failedOperations === 0) {
    toast({
      title: "Bulk Assignment Completed",
      description: `Successfully processed ${result.successfulOperations} assignments.`,
    });
  } else {
    toast({
      title: "Bulk Assignment Completed with Errors",
      description: `${result.successfulOperations} successful, ${result.failedOperations} failed.`,
      variant: "destructive",
    });
  }
};
