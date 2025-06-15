/**
 * Error Handling Service
 * 
 * Centralized error handling and recovery mechanisms for revenue calculations
 * and demand matrix operations. Provides fallback mechanisms, user-friendly
 * error messages, and comprehensive error tracking.
 */

export interface ErrorContext {
  operation: string;
  component: string;
  skillName?: string;
  clientName?: string;
  additionalData?: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

export interface ErrorRecoveryResult {
  success: boolean;
  fallbackValue?: any;
  message: string;
  recoveryMethod: string;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  actionable: boolean;
  suggestedActions: string[];
  technicalDetails?: string;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorLog: Array<{ error: Error; context: ErrorContext; timestamp: Date }> = [];
  private recoveryAttempts = new Map<string, number>();

  private constructor() {}

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Handle errors with context and attempt recovery
   */
  public handleError(
    error: Error,
    context: ErrorContext,
    attemptRecovery: boolean = true
  ): ErrorRecoveryResult {
    console.error(`❌ [ERROR HANDLER] ${context.component}.${context.operation}:`, error);

    // Log the error
    this.logError(error, context);

    // Generate user-friendly error
    const userError = this.generateUserFriendlyError(error, context);

    // Attempt recovery if enabled
    if (attemptRecovery) {
      return this.attemptRecovery(error, context);
    }

    return {
      success: false,
      message: userError.message,
      recoveryMethod: 'none'
    };
  }

  /**
   * Attempt to recover from error with fallback mechanisms
   */
  private attemptRecovery(error: Error, context: ErrorContext): ErrorRecoveryResult {
    const recoveryKey = `${context.component}_${context.operation}`;
    const attempts = this.recoveryAttempts.get(recoveryKey) || 0;

    if (attempts >= 3) {
      return {
        success: false,
        message: 'Maximum recovery attempts exceeded',
        recoveryMethod: 'abandoned'
      };
    }

    this.recoveryAttempts.set(recoveryKey, attempts + 1);

    // Try different recovery strategies based on operation type
    switch (context.operation) {
      case 'calculateSuggestedRevenue':
        return this.recoverSuggestedRevenueCalculation(error, context);
      
      case 'validateRevenueData':
        return this.recoverRevenueValidation(error, context);
      
      case 'generateDemandMatrix':
        return this.recoverDemandMatrixGeneration(error, context);
      
      case 'exportDemandMatrix':
        return this.recoverExportOperation(error, context);
      
      default:
        return this.genericRecovery(error, context);
    }
  }

  /**
   * Recover from suggested revenue calculation errors
   */
  private recoverSuggestedRevenueCalculation(
    error: Error,
    context: ErrorContext
  ): ErrorRecoveryResult {
    console.log('🔄 [RECOVERY] Attempting suggested revenue calculation recovery');

    try {
      // If skill rate is missing, use fallback rate
      if (error.message.includes('fee rate') && context.skillName) {
        const fallbackRate = this.getFallbackSkillRate(context.skillName);
        
        return {
          success: true,
          fallbackValue: fallbackRate,
          message: `Using fallback rate ($${fallbackRate}/hour) for skill "${context.skillName}"`,
          recoveryMethod: 'fallback_rate'
        };
      }

      // If hours are invalid, default to 0
      if (error.message.includes('hours') || error.message.includes('number')) {
        return {
          success: true,
          fallbackValue: 0,
          message: 'Using zero hours due to invalid input data',
          recoveryMethod: 'zero_fallback'
        };
      }

      return {
        success: false,
        message: 'Could not recover from revenue calculation error',
        recoveryMethod: 'failed'
      };

    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      return {
        success: false,
        message: 'Recovery attempt failed',
        recoveryMethod: 'recovery_failed'
      };
    }
  }

  /**
   * Recover from revenue validation errors
   */
  private recoverRevenueValidation(
    error: Error,
    context: ErrorContext
  ): ErrorRecoveryResult {
    console.log('🔄 [RECOVERY] Attempting revenue validation recovery');

    // For validation errors, we can often continue with warnings
    return {
      success: true,
      fallbackValue: {
        isValid: false,
        errors: [error.message],
        warnings: ['Validation completed with errors - some features may be limited'],
        suggestions: ['Review data quality and try again']
      },
      message: 'Validation completed with errors - proceeding with limited functionality',
      recoveryMethod: 'partial_validation'
    };
  }

  /**
   * Recover from demand matrix generation errors
   */
  private recoverDemandMatrixGeneration(
    error: Error,
    context: ErrorContext
  ): ErrorRecoveryResult {
    console.log('🔄 [RECOVERY] Attempting demand matrix generation recovery');

    // If it's a network/data error, suggest retry
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        success: false,
        message: 'Network error occurred - please retry the operation',
        recoveryMethod: 'retry_suggested'
      };
    }

    // If it's a data processing error, try with reduced scope
    return {
      success: false,
      message: 'Try reducing the date range or applying more filters',
      recoveryMethod: 'scope_reduction'
    };
  }

  /**
   * Recover from export operation errors
   */
  private recoverExportOperation(
    error: Error,
    context: ErrorContext
  ): ErrorRecoveryResult {
    console.log('🔄 [RECOVERY] Attempting export operation recovery');

    // For large datasets, suggest alternative format
    if (error.message.includes('size') || error.message.includes('memory')) {
      return {
        success: false,
        message: 'Dataset too large - try CSV format or reduce date range',
        recoveryMethod: 'format_suggestion'
      };
    }

    return {
      success: false,
      message: 'Export failed - try a different format or reduce the data size',
      recoveryMethod: 'alternative_suggested'
    };
  }

  /**
   * Generic recovery for unknown error types
   */
  private genericRecovery(error: Error, context: ErrorContext): ErrorRecoveryResult {
    console.log('🔄 [RECOVERY] Attempting generic recovery');

    return {
      success: false,
      message: 'An unexpected error occurred - please try again',
      recoveryMethod: 'generic_retry'
    };
  }

  /**
   * Generate user-friendly error messages
   */
  public generateUserFriendlyError(error: Error, context: ErrorContext): UserFriendlyError {
    const message = error.message.toLowerCase();

    // Revenue calculation errors
    if (context.operation.includes('Revenue') || message.includes('revenue')) {
      if (message.includes('fee rate') || message.includes('skill')) {
        return {
          title: 'Missing Skill Rate',
          message: `Fee rate not configured for skill "${context.skillName || 'unknown'}". Using fallback rate.`,
          severity: 'warning',
          actionable: true,
          suggestedActions: [
            'Configure fee rates in the Skills management section',
            'Review skill definitions and rates',
            'Contact administrator for rate configuration'
          ],
          technicalDetails: error.message
        };
      }

      return {
        title: 'Revenue Calculation Error',
        message: 'There was an issue calculating revenue values. Some features may be limited.',
        severity: 'error',
        actionable: true,
        suggestedActions: [
          'Verify client revenue data is properly configured',
          'Check skill fee rates are set up correctly',
          'Try refreshing the data'
        ],
        technicalDetails: error.message
      };
    }

    // Network/connectivity errors
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return {
        title: 'Connection Issue',
        message: 'Unable to load data due to a connection issue.',
        severity: 'error',
        actionable: true,
        suggestedActions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again'
        ],
        technicalDetails: error.message
      };
    }

    // Data validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        title: 'Data Quality Issue',
        message: 'Some data quality issues were detected. The system will continue with limited functionality.',
        severity: 'warning',
        actionable: true,
        suggestedActions: [
          'Review the data for inconsistencies',
          'Check client and task configurations',
          'Contact support if issues persist'
        ],
        technicalDetails: error.message
      };
    }

    // Generic error
    return {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please try again.',
      severity: 'error',
      actionable: true,
      suggestedActions: [
        'Try refreshing the page',
        'Clear browser cache if the problem persists',
        'Contact support for assistance'
      ],
      technicalDetails: error.message
    };
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(error: Error, context: ErrorContext): void {
    const errorEntry = {
      error,
      context,
      timestamp: new Date()
    };

    this.errorLog.push(errorEntry);

    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // Detailed logging for debugging
    console.group(`📋 [ERROR LOG] ${context.component}.${context.operation}`);
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Stack:', error.stack);
    console.groupEnd();
  }

  /**
   * Get fallback skill rate
   */
  private getFallbackSkillRate(skillName: string): number {
    const fallbackRates: Record<string, number> = {
      'Tax Preparation': 85.00,
      'Bookkeeping': 65.00,
      'Payroll Processing': 70.00,
      'Financial Analysis': 95.00,
      'Audit Support': 80.00,
      'Advisory Services': 120.00
    };

    return fallbackRates[skillName] || 75.00; // Default fallback rate
  }

  /**
   * Get recent error logs for debugging
   */
  public getRecentErrors(limit: number = 10): Array<{ error: Error; context: ErrorContext; timestamp: Date }> {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error logs
   */
  public clearErrorLog(): void {
    this.errorLog = [];
    this.recoveryAttempts.clear();
    console.log('🧹 [ERROR HANDLER] Error log cleared');
  }

  /**
   * Get error statistics
   */
  public getErrorStatistics(): {
    totalErrors: number;
    errorsByOperation: Record<string, number>;
    errorsByComponent: Record<string, number>;
    recoverySuccessRate: number;
  } {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByOperation: {} as Record<string, number>,
      errorsByComponent: {} as Record<string, number>,
      recoverySuccessRate: 0
    };

    this.errorLog.forEach(entry => {
      const op = entry.context.operation;
      const comp = entry.context.component;
      
      stats.errorsByOperation[op] = (stats.errorsByOperation[op] || 0) + 1;
      stats.errorsByComponent[comp] = (stats.errorsByComponent[comp] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance();
