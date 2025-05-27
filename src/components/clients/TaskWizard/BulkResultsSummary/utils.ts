
/**
 * Bulk Results Summary Utilities
 * 
 * Utility functions for formatting and processing bulk operation results.
 */

import { BulkOperationResult } from '../types';

/**
 * Format processing time from milliseconds to human-readable string
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Calculate success rate percentage
 */
export const calculateSuccessRate = (result: BulkOperationResult): number => {
  return result.totalOperations > 0 
    ? (result.successfulOperations / result.totalOperations) * 100 
    : 0;
};

/**
 * Generate CSV data for bulk operation results
 */
export const generateCSVData = (result: BulkOperationResult): string => {
  const csvData = [
    ['Operation', 'Status', 'Client ID', 'Template ID', 'Error Message'],
    ...result.results.map((r, index) => [
      `Operation ${index + 1}`,
      'Success',
      r.client_id || '',
      r.template_id || '',
      ''
    ]),
    ...result.errors.map((error, index) => [
      `Error ${index + 1}`,
      'Failed',
      error.clientId || '',
      error.templateId || '',
      error.error
    ])
  ];

  return csvData.map(row => row.join(',')).join('\n');
};

/**
 * Download CSV file with results
 */
export const downloadResults = (result: BulkOperationResult): void => {
  const csv = generateCSVData(result);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bulk-operation-results.csv';
  a.click();
  URL.revokeObjectURL(url);
};
