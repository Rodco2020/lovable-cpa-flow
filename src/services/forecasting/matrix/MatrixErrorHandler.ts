
import { MatrixErrorContext, MatrixErrorCode } from './types';
import { MATRIX_CONSTANTS } from './constants';
import { debugLog } from '../logger';

/**
 * Matrix Error Handler
 * Centralized error handling for matrix operations
 */
export class MatrixErrorHandler {
  /**
   * Handle and format matrix operation errors
   */
  static handleError(
    error: unknown, 
    context: MatrixErrorContext,
    errorCode?: MatrixErrorCode
  ): Error {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const code = errorCode || MATRIX_CONSTANTS.ERROR_CODES.DATA_FETCH_FAILED;
    
    // Log error with context
    console.error(`Matrix ${context.operation} failed [${code}]:`, {
      error: errorMessage,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Create structured error message
    const structuredMessage = this.createErrorMessage(errorMessage, context, code);
    
    return new Error(structuredMessage);
  }
  
  /**
   * Handle validation errors
   */
  static handleValidationError(issues: string[], context: MatrixErrorContext): Error {
    const errorMessage = `Validation failed: ${issues.join(', ')}`;
    
    debugLog('Matrix validation failed', {
      operation: context.operation,
      issueCount: issues.length,
      issues: issues.slice(0, 3) // Log first 3 issues
    });
    
    return this.handleError(
      new Error(errorMessage),
      context,
      MATRIX_CONSTANTS.ERROR_CODES.VALIDATION_FAILED
    );
  }
  
  /**
   * Handle timeout errors
   */
  static handleTimeout(context: MatrixErrorContext): Error {
    const errorMessage = `Operation timed out after ${MATRIX_CONSTANTS.PROCESSING_TIMEOUT_MS}ms`;
    
    return this.handleError(
      new Error(errorMessage),
      context,
      MATRIX_CONSTANTS.ERROR_CODES.PROCESSING_TIMEOUT
    );
  }
  
  /**
   * Handle cache errors (non-critical)
   */
  static handleCacheError(error: unknown, operation: string): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown cache error';
    
    // Cache errors are non-critical, so we just log them
    console.warn(`Matrix cache ${operation} failed:`, {
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Create formatted error message
   */
  private static createErrorMessage(
    originalError: string,
    context: MatrixErrorContext,
    code: MatrixErrorCode
  ): string {
    const parts = [
      `${context.operation} failed`,
      `Code: ${code}`,
      `Error: ${originalError}`
    ];
    
    if (context.forecastType) {
      parts.push(`Forecast Type: ${context.forecastType}`);
    }
    
    if (context.startDate) {
      parts.push(`Start Date: ${context.startDate.toISOString()}`);
    }
    
    if (context.additionalInfo) {
      const infoStr = Object.entries(context.additionalInfo)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      parts.push(`Additional Info: ${infoStr}`);
    }
    
    return parts.join(' | ');
  }
}
