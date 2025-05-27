
import { BulkAssignment, BulkOperationConfig, BulkOperationResult, ProgressUpdate } from './types';
import { createBatchOperations } from './operationCreator';
import { processBatchesWithConcurrency } from './concurrencyManager';
import { showCompletionToast, showErrorToast } from './notificationManager';
import { initializeBulkResult, finalizeBulkResult } from './resultManager';

/**
 * Batch Processing Service
 * 
 * Main orchestrator for bulk operations processing. This module coordinates
 * the execution of bulk assignments by managing the workflow from operation
 * creation through completion notification.
 * 
 * Key responsibilities:
 * - Orchestrating the overall bulk processing workflow
 * - Coordinating between different service modules
 * - Managing error handling at the highest level
 * - Ensuring consistent result reporting
 */

/**
 * Process bulk template assignments with progress tracking
 * 
 * Main entry point for bulk assignment processing. Orchestrates the entire
 * workflow from operation creation to completion notification.
 * 
 * Workflow:
 * 1. Initialize result tracking
 * 2. Create individual batch operations from bulk assignment
 * 3. Process operations with concurrency control
 * 4. Finalize results and notify user
 * 
 * @param assignment - The bulk assignment containing clients, templates, and configuration
 * @param operationConfig - Configuration for batch processing (batch size, concurrency)
 * @param onProgress - Optional callback function for progress updates
 * @returns Promise resolving to the complete operation result
 */
export const processBulkAssignments = async (
  assignment: BulkAssignment,
  operationConfig: BulkOperationConfig,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<BulkOperationResult> => {
  const startTime = Date.now();
  const result = initializeBulkResult();

  try {
    // Create batch operations from the bulk assignment
    const operations = createBatchOperations(assignment);
    result.totalOperations = operations.length;

    // Process operations with concurrency control
    await processBatchesWithConcurrency(
      operations,
      operationConfig,
      result,
      startTime,
      onProgress
    );

    // Finalize results and show completion notification
    finalizeBulkResult(result, startTime);
    showCompletionToast(result);

    return result;
  } catch (error) {
    console.error('Error in bulk assignments:', error);
    
    // Ensure processing time is recorded even on failure
    finalizeBulkResult(result, startTime);
    showErrorToast(error);

    return result;
  }
};
