
import { BulkAssignment, BatchOperation } from './types';

/**
 * Operation Creator Service
 * 
 * Handles the creation and structuring of batch operations from bulk assignments.
 * This module is responsible for transforming high-level bulk assignment requests
 * into individual batch operations that can be processed sequentially.
 */

/**
 * Create batch operations from a bulk assignment
 * 
 * Takes a bulk assignment (which contains multiple clients and templates)
 * and creates individual operations for each client-template combination.
 * 
 * @param assignment - The bulk assignment containing clients, templates, and config
 * @returns Array of individual batch operations ready for processing
 */
export const createBatchOperations = (assignment: BulkAssignment): BatchOperation[] => {
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
 * Calculate total operations count for a bulk assignment
 * 
 * @param assignment - The bulk assignment to calculate operations for
 * @returns Total number of operations that will be created
 */
export const calculateTotalOperations = (assignment: BulkAssignment): number => {
  return assignment.clientIds.length * assignment.templateIds.length;
};
