
import { toast } from '@/hooks/use-toast';
import { BulkOperationResult } from './types';

/**
 * Notification Manager Service
 * 
 * Handles user notifications for bulk operations, providing feedback
 * on operation completion, errors, and important status updates.
 */

/**
 * Show completion notification with operation summary
 */
export const showCompletionToast = (result: BulkOperationResult): void => {
  const successRate = result.totalOperations > 0 
    ? (result.successfulOperations / result.totalOperations) * 100 
    : 0;

  if (result.failedOperations === 0) {
    // All operations successful
    toast({
      title: "Bulk Operation Completed",
      description: `Successfully processed ${result.successfulOperations} operations in ${(result.processingTime / 1000).toFixed(1)}s`,
    });
  } else if (result.successfulOperations === 0) {
    // All operations failed
    toast({
      title: "Bulk Operation Failed",
      description: `All ${result.totalOperations} operations failed. Please check the error details.`,
      variant: "destructive",
    });
  } else {
    // Partial success
    toast({
      title: "Bulk Operation Completed with Issues",
      description: `${result.successfulOperations} successful, ${result.failedOperations} failed (${successRate.toFixed(1)}% success rate)`,
      variant: "destructive",
    });
  }
};

/**
 * Show error notification for operation failures
 */
export const showErrorToast = (error: unknown): void => {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  toast({
    title: "Bulk Operation Error",
    description: errorMessage,
    variant: "destructive",
  });
};

/**
 * Show progress notification for long-running operations
 */
export const showProgressToast = (completed: number, total: number): void => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  if (percentage === 25 || percentage === 50 || percentage === 75) {
    toast({
      title: "Operation Progress",
      description: `${completed} of ${total} operations completed (${percentage.toFixed(0)}%)`,
    });
  }
};

/**
 * Show warning notification for large operations
 */
export const showLargeOperationWarning = (operationCount: number): void => {
  if (operationCount > 100) {
    toast({
      title: "Large Operation Detected",
      description: `You're about to process ${operationCount} operations. This may take several minutes.`,
    });
  }
};
