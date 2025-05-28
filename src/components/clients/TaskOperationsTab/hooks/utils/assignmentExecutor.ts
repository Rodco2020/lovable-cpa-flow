
import { TaskTemplate } from '@/types/task';
import { AssignmentConfig } from '../../../TaskWizard/AssignmentConfiguration';
import { processBulkAssignments } from '@/services/bulkOperations';
import { BatchProcessingConfig } from '@/services/bulkOperations/types';
import { OperationProgress, OperationResults } from './progressTracker';

/**
 * Executes template assignment operations
 */
export const executeTemplateAssignment = async (
  selectedTemplateIds: string[],
  selectedClientIds: string[],
  assignmentConfig: AssignmentConfig,
  availableTemplates: TaskTemplate[],
  setProgress: (progress: OperationProgress) => void
): Promise<OperationResults> => {
  const startTime = Date.now();
  const totalOperations = selectedTemplateIds.length * selectedClientIds.length;

  // Initialize progress
  setProgress({
    completed: 0,
    total: totalOperations,
    percentage: 0,
    currentOperation: 'Initializing assignment...',
    operations: [],
    errors: []
  });

  try {
    // Create bulk assignment request
    const bulkAssignment = {
      templateIds: selectedTemplateIds,
      clientIds: selectedClientIds,
      config: assignmentConfig
    };

    // Configure batch processing settings
    const processingConfig: BatchProcessingConfig = {
      operationType: 'template-assignment',
      batchSize: 10,
      concurrency: 3
    };

    // Execute bulk assignment with progress tracking
    const result = await processBulkAssignments(
      bulkAssignment,
      processingConfig,
      (progressUpdate) => {
        setProgress({
          completed: progressUpdate.completed,
          total: progressUpdate.total,
          percentage: progressUpdate.percentage,
          currentOperation: progressUpdate.currentOperation,
          estimatedTimeRemaining: progressUpdate.estimatedTimeRemaining,
          operations: [],
          errors: []
        });
      }
    );

    // Convert to operation results format
    const operationResults: OperationResults = {
      success: result.failedOperations === 0,
      totalOperations: result.totalOperations,
      successfulOperations: result.successfulOperations,
      failedOperations: result.failedOperations,
      errors: result.errors.map(e => `${e.clientId} - ${e.templateId}: ${e.error}`),
      processingTime: Date.now() - startTime,
      results: result.results
    };

    return operationResults;

  } catch (error) {
    console.error('Assignment execution failed:', error);
    
    const operationResults: OperationResults = {
      success: false,
      totalOperations,
      successfulOperations: 0,
      failedOperations: totalOperations,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      processingTime: Date.now() - startTime,
      results: []
    };

    return operationResults;
  }
};
