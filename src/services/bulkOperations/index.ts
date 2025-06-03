
import { processSingleAssignment, validateOperation } from './taskCreationService';
import { BulkOperationsLogger } from './loggingService';
import { BatchOperation, BatchProcessingConfig, BulkAssignment } from './types';

/**
 * Main Bulk Operations Service - Updated with enhanced error handling
 * 
 * Processes bulk task assignments with proper skill UUID handling and comprehensive logging.
 */

/**
 * Process bulk assignments with improved error handling and logging
 */
export const processBulkAssignments = async (
  bulkRequest: BulkAssignment,
  config: BatchProcessingConfig,
  progressCallback?: (progress: any) => void
): Promise<{
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  errors: Array<{ clientId: string; templateId: string; error: string }>;
  results: any[];
}> => {
  console.log('[BulkOperations] Starting bulk assignment process:', {
    templateCount: bulkRequest.templateIds.length,
    clientCount: bulkRequest.clientIds.length,
    taskType: bulkRequest.config.taskType
  });

  const operations: BatchOperation[] = [];
  const results: any[] = [];
  const errors: Array<{ clientId: string; templateId: string; error: string }> = [];

  // Generate all operations
  for (const templateId of bulkRequest.templateIds) {
    for (const clientId of bulkRequest.clientIds) {
      operations.push({
        id: `${clientId}-${templateId}`,
        templateId,
        clientId,
        config: bulkRequest.config
      });
    }
  }

  const totalOperations = operations.length;
  let successfulOperations = 0;
  let processedOperations = 0;

  BulkOperationsLogger.logOperationFlow('START', { totalOperations, config: bulkRequest.config });

  // Process operations in batches
  const batchSize = config.batchSize || 10;
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (operation) => {
        try {
          BulkOperationsLogger.logOperationFlow('PROCESSING', operation);
          
          // Validate operation before processing
          validateOperation(operation);
          
          // Process the assignment
          const result = await processSingleAssignment(operation);
          results.push(result);
          successfulOperations++;
          
          BulkOperationsLogger.logOperationFlow('SUCCESS', operation);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({
            clientId: operation.clientId,
            templateId: operation.templateId,
            error: errorMessage
          });
          
          BulkOperationsLogger.logValidationError('OPERATION_FAILED', error, operation);
        }
        
        processedOperations++;
        
        // Update progress
        if (progressCallback) {
          progressCallback({
            completed: processedOperations,
            total: totalOperations,
            percentage: Math.round((processedOperations / totalOperations) * 100),
            currentOperation: `Processing ${processedOperations}/${totalOperations}`,
            errors: errors.length
          });
        }
      })
    );
  }

  const finalResult = {
    totalOperations,
    successfulOperations,
    failedOperations: errors.length,
    errors,
    results
  };

  BulkOperationsLogger.logOperationFlow('COMPLETE', finalResult);

  console.log('[BulkOperations] Bulk assignment process completed:', finalResult);

  return finalResult;
};

export const getTemplatesForBulkOperations = async () => {
  // Mock templates for testing
  const templates = [
    { id: '1', name: 'Template 1', category: 'Tax' },
    { id: '2', name: 'Template 2', category: 'Audit' },
  ];
  return templates;
};

// Export validation function
export { validateBulkOperation } from './validationService';

// Re-export types for external use
export type {
  BulkAssignment,
  BatchOperation,
  BulkOperationConfig,
  BulkOperationResult,
  BulkOperationError,
  ProgressUpdate
} from './types';
