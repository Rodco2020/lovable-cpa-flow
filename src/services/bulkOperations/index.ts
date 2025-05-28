
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

// Export utility functions for advanced use cases
export { createBatchOperations, calculateTotalOperations } from './operationCreator';
export { showCompletionToast, showErrorToast } from './notificationManager';
export { initializeBulkResult, finalizeBulkResult } from './resultManager';

// Export types for consumers
export type {
  BulkAssignment,
  BatchOperation,
  BulkOperationConfig,
  BatchProcessingConfig,
  BulkOperationResult,
  BulkOperationError,
  ProgressUpdate
} from './types';
