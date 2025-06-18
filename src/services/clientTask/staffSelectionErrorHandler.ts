
/**
 * Staff Selection Error Handler Service
 * 
 * Provides comprehensive error handling and recovery for staff selection operations
 */

import { toast } from 'sonner';

export interface StaffSelectionError {
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  recoverable: boolean;
  retryable: boolean;
  staffId?: string | null;
  context?: Record<string, any>;
}

export interface ErrorRecoveryOptions {
  fallbackStaffId?: string | null;
  showToast?: boolean;
  logError?: boolean;
}

export class StaffSelectionErrorHandler {
  /**
   * Classify and handle staff selection errors
   */
  public static handleError(
    error: Error | unknown,
    context: Record<string, any> = {},
    options: ErrorRecoveryOptions = {}
  ): StaffSelectionError {
    console.log('🚨 [StaffSelectionErrorHandler] PHASE 4 - Handling error:', {
      error,
      context,
      options,
      timestamp: new Date().toISOString()
    });

    const classifiedError = this.classifyError(error, context);
    
    if (options.logError !== false) {
      this.logError(classifiedError, context);
    }
    
    if (options.showToast !== false) {
      this.showErrorToast(classifiedError);
    }
    
    return classifiedError;
  }

  /**
   * Classify the type of error for appropriate handling
   */
  private static classifyError(
    error: Error | unknown,
    context: Record<string, any>
  ): StaffSelectionError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Network/API errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('connection')) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection.',
        recoverable: true,
        retryable: true,
        context
      };
    }
    
    // Staff not found errors
    if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
      return {
        type: 'NOT_FOUND',
        message: 'The selected staff member is no longer available.',
        recoverable: true,
        retryable: false,
        staffId: context.staffId as string || null,
        context
      };
    }
    
    // Validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('format')) {
      return {
        type: 'VALIDATION_ERROR',
        message: 'Invalid staff selection. Please choose a different staff member.',
        recoverable: true,
        retryable: false,
        staffId: context.staffId as string || null,
        context
      };
    }
    
    // Permission errors
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
      return {
        type: 'PERMISSION_ERROR',
        message: 'You do not have permission to assign this staff member.',
        recoverable: false,
        retryable: false,
        staffId: context.staffId as string || null,
        context
      };
    }
    
    // Unknown errors
    return {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      recoverable: true,
      retryable: true,
      context
    };
  }

  /**
   * Show appropriate error toast based on error type
   */
  private static showErrorToast(error: StaffSelectionError): void {
    const toastOptions = {
      duration: error.retryable ? 5000 : 7000,
    };

    switch (error.type) {
      case 'NETWORK_ERROR':
        toast.error(error.message, {
          ...toastOptions,
          description: 'Click retry to attempt reconnection.'
        });
        break;
        
      case 'NOT_FOUND':
        toast.warning(error.message, {
          ...toastOptions,
          description: 'Please select a different staff member.'
        });
        break;
        
      case 'VALIDATION_ERROR':
        toast.error(error.message, {
          ...toastOptions,
          description: 'The staff selection contains invalid data.'
        });
        break;
        
      case 'PERMISSION_ERROR':
        toast.error(error.message, {
          ...toastOptions,
          description: 'Contact your administrator for access.'
        });
        break;
        
      default:
        toast.error(error.message, toastOptions);
        break;
    }
  }

  /**
   * Log detailed error information for debugging
   */
  private static logError(error: StaffSelectionError, context: Record<string, any>): void {
    console.error('💥 [StaffSelectionErrorHandler] PHASE 4 - Error details:', {
      errorType: error.type,
      message: error.message,
      recoverable: error.recoverable,
      retryable: error.retryable,
      staffId: error.staffId,
      context: error.context,
      originalContext: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  /**
   * Provide recovery suggestions based on error type
   */
  public static getRecoverySuggestion(error: StaffSelectionError): string {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return 'Check your internet connection and try again.';
        
      case 'NOT_FOUND':
        return 'Select a different staff member from the available options.';
        
      case 'VALIDATION_ERROR':
        return 'Clear the selection and choose a valid staff member.';
        
      case 'PERMISSION_ERROR':
        return 'Contact your administrator to request access to this staff member.';
        
      default:
        return 'Try refreshing the page or contact support if the problem persists.';
    }
  }

  /**
   * Determine if automatic retry should be attempted
   */
  public static shouldAutoRetry(error: StaffSelectionError, attemptCount: number): boolean {
    if (!error.retryable || attemptCount >= 3) {
      return false;
    }
    
    // Only auto-retry network errors
    return error.type === 'NETWORK_ERROR';
  }

  /**
   * Get retry delay based on error type and attempt count
   */
  public static getRetryDelay(error: StaffSelectionError, attemptCount: number): number {
    if (!error.retryable) {
      return 0;
    }
    
    // Exponential backoff for network errors
    if (error.type === 'NETWORK_ERROR') {
      return Math.min(1000 * Math.pow(2, attemptCount), 10000);
    }
    
    return 2000; // Default delay
  }
}
