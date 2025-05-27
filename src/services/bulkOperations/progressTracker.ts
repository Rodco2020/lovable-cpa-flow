
import { ProgressUpdate } from './types';

/**
 * Progress Tracking Service
 * 
 * Handles progress calculations and time estimations for bulk operations.
 */

/**
 * Calculate estimated time remaining
 */
export const calculateEstimatedTime = (startTime: number, completed: number, total: number): number => {
  if (completed === 0) return 0;
  
  const elapsed = Date.now() - startTime;
  const avgTimePerOperation = elapsed / completed;
  const remaining = total - completed;
  
  return remaining * avgTimePerOperation;
};

/**
 * Create a progress update object
 */
export const createProgressUpdate = (
  completed: number,
  total: number,
  currentOperation: string,
  startTime: number
): ProgressUpdate => {
  return {
    completed,
    total,
    currentOperation,
    percentage: (completed / total) * 100,
    estimatedTimeRemaining: calculateEstimatedTime(startTime, completed, total)
  };
};
