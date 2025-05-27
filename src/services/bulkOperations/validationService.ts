
import { BulkAssignment, BulkOperationConfig } from './types';

/**
 * Validation Service
 * 
 * Handles validation of bulk operation requests before processing.
 */

/**
 * Validate bulk operation before processing
 */
export const validateBulkOperation = (
  assignment: BulkAssignment,
  config: BulkOperationConfig
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (assignment.clientIds.length === 0) {
    errors.push('At least one client must be selected');
  }

  if (assignment.templateIds.length === 0) {
    errors.push('At least one template must be selected');
  }

  if (config.batchSize < 1 || config.batchSize > 100) {
    errors.push('Batch size must be between 1 and 100');
  }

  if (config.concurrency < 1 || config.concurrency > 10) {
    errors.push('Concurrency must be between 1 and 10');
  }

  const totalOperations = assignment.clientIds.length * assignment.templateIds.length;
  if (totalOperations > 1000) {
    errors.push('Maximum 1000 operations allowed per bulk assignment');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
