
import { toast } from '@/hooks/use-toast';
import { BulkOperationResult } from './types';

/**
 * Notification Manager Service
 * 
 * Handles user notifications for bulk operations, including success messages,
 * error notifications, and completion summaries. This module centralizes
 * all user-facing notification logic.
 */

/**
 * Show completion toast based on operation results
 * 
 * Analyzes the operation results and displays an appropriate toast notification
 * to inform the user of the operation outcome.
 * 
 * @param result - The completed operation result
 */
export const showCompletionToast = (result: BulkOperationResult): void => {
  if (result.failedOperations === 0) {
    showSuccessToast(result);
  } else {
    showPartialSuccessToast(result);
  }
};

/**
 * Show success toast for completely successful operations
 * 
 * @param result - The operation result
 */
const showSuccessToast = (result: BulkOperationResult): void => {
  toast({
    title: "Bulk Assignment Completed",
    description: `Successfully processed ${result.successfulOperations} assignments.`,
  });
};

/**
 * Show partial success toast for operations with some failures
 * 
 * @param result - The operation result
 */
const showPartialSuccessToast = (result: BulkOperationResult): void => {
  toast({
    title: "Bulk Assignment Completed with Errors",
    description: `${result.successfulOperations} successful, ${result.failedOperations} failed.`,
    variant: "destructive",
  });
};

/**
 * Show error toast for completely failed operations
 * 
 * @param error - The error that occurred
 */
export const showErrorToast = (error?: unknown): void => {
  toast({
    title: "Bulk Assignment Failed",
    description: "An unexpected error occurred during bulk processing.",
    variant: "destructive",
  });
};
