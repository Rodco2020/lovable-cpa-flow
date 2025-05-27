
/**
 * Bulk Operations Service - Main Module
 * 
 * Central export point for all bulk operations functionality.
 * This module provides a clean interface for bulk template assignments
 * and related operations.
 */

// Export main functions
export { processBulkAssignments } from './batchProcessor';
export { validateBulkOperation } from './validationService';
export { getTemplatesForBulkOperations } from './templateDataService';

// Export types for consumers
export type {
  BulkAssignment,
  BatchOperation,
  BulkOperationConfig,
  BulkOperationResult,
  BulkOperationError,
  ProgressUpdate
} from './types';
