
/**
 * Error Utilities
 * 
 * Handles error normalization and message extraction
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  name?: string;
}

/**
 * Safely extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Extract comprehensive error information
 */
export function getErrorInfo(error: unknown): ErrorInfo {
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  
  if (error && typeof error === 'object') {
    return {
      message: 'message' in error ? String(error.message) : 'Unknown error',
      stack: 'stack' in error ? String(error.stack) : undefined,
      name: 'name' in error ? String(error.name) : undefined
    };
  }
  
  return { message: 'An unknown error occurred' };
}

/**
 * Create a normalized Error object from any error type
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }
  
  return new Error('An unknown error occurred');
}
