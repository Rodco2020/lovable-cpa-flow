
/**
 * Bulk Operations Service - Legacy Compatibility Layer
 * 
 * This file maintains backward compatibility for existing imports
 * while delegating to the new modular structure.
 * 
 * @deprecated Use '@/services/bulkOperations' instead for new code
 */

// Re-export everything from the new modular structure
export {
  processBulkAssignments,
  validateBulkOperation,
  getTemplatesForBulkOperations
} from './bulkOperations';

// Re-export types for backward compatibility
export type {
  BulkAssignment,
  BatchOperation,
  BulkOperationConfig,
  BulkOperationResult,
  BulkOperationError,
  ProgressUpdate
} from './bulkOperations/types';
