
import { BulkOperationResult, BulkOperationError } from './types';

/**
 * Result Manager Service
 * 
 * Manages the creation, updating, and finalization of bulk operation results.
 * Provides utilities for tracking operation progress and aggregating final results.
 */

/**
 * Initialize a new bulk operation result
 */
export const initializeBulkResult = (): BulkOperationResult => {
  return {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    errors: [],
    processingTime: 0,
    results: []
  };
};

/**
 * Add an error to the bulk operation result
 */
export const addErrorToBulkResult = (
  result: BulkOperationResult,
  clientId: string,
  templateId: string,
  errorMessage: string,
  details?: any
): void => {
  const error: BulkOperationError = {
    clientId,
    templateId,
    error: errorMessage,
    details
  };
  
  result.errors.push(error);
};

/**
 * Add a successful operation result
 */
export const addSuccessToResult = (
  result: BulkOperationResult,
  operationResult: any
): void => {
  result.results.push(operationResult);
  result.successfulOperations++;
};

/**
 * Finalize the bulk operation result
 */
export const finalizeBulkResult = (
  result: BulkOperationResult,
  startTime: number
): void => {
  result.processingTime = Date.now() - startTime;
  
  // Ensure counts are consistent
  result.failedOperations = result.errors.length;
  result.successfulOperations = result.results.length;
  result.totalOperations = result.successfulOperations + result.failedOperations;
  
  console.log('Bulk operation result finalized:', {
    total: result.totalOperations,
    successful: result.successfulOperations,
    failed: result.failedOperations,
    processingTime: result.processingTime
  });
};

/**
 * Create a summary of the bulk operation result
 */
export const createResultSummary = (result: BulkOperationResult): string => {
  const successRate = result.totalOperations > 0 
    ? (result.successfulOperations / result.totalOperations) * 100 
    : 0;
    
  return `Processed ${result.totalOperations} operations: ${result.successfulOperations} successful, ${result.failedOperations} failed (${successRate.toFixed(1)}% success rate) in ${(result.processingTime / 1000).toFixed(1)}s`;
};

/**
 * Check if the bulk operation was successful
 */
export const isBulkOperationSuccessful = (result: BulkOperationResult): boolean => {
  return result.failedOperations === 0 && result.successfulOperations > 0;
};

/**
 * Get operation statistics
 */
export const getOperationStats = (result: BulkOperationResult) => {
  const successRate = result.totalOperations > 0 
    ? (result.successfulOperations / result.totalOperations) * 100 
    : 0;
    
  const averageTimePerOperation = result.totalOperations > 0 
    ? result.processingTime / result.totalOperations 
    : 0;
    
  return {
    successRate,
    averageTimePerOperation,
    throughputPerSecond: result.processingTime > 0 
      ? (result.totalOperations / (result.processingTime / 1000)) 
      : 0
  };
};
