
import { v4 as uuidv4 } from 'uuid';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  message: string;
  details?: string;
  taskId?: string;
  staffId?: string;
  severity: ErrorSeverity;
  resolved: boolean;
  component?: string;
  data?: Record<string, any>;
}

// In-memory error log cache (in a real app would be persisted)
const errorLogs: ErrorLog[] = [];

/**
 * Log a new error or warning
 */
export const logError = (
  message: string,
  severity: ErrorSeverity = 'error',
  options: {
    details?: string;
    taskId?: string;
    staffId?: string;
    component?: string;
    data?: Record<string, any>;
  } = {}
): string => {
  const log: ErrorLog = {
    id: uuidv4(),
    timestamp: new Date(),
    message,
    severity,
    resolved: false,
    ...options
  };
  
  errorLogs.unshift(log); // Add to beginning for chronological order
  
  // Limit cache size to prevent memory issues
  if (errorLogs.length > 100) {
    errorLogs.pop(); // Remove oldest entry
  }
  
  // Log to console as well for debugging
  if (severity === 'error') {
    console.error(message, options);
  } else if (severity === 'warning') {
    console.warn(message, options);
  } else {
    console.info(message, options);
  }
  
  return log.id;
};

/**
 * Mark an error as resolved
 */
export const resolveError = (errorId: string): boolean => {
  const error = errorLogs.find(log => log.id === errorId);
  if (error) {
    error.resolved = true;
    return true;
  }
  return false;
};

/**
 * Get all error logs (optionally filtered)
 */
export const getErrorLogs = (
  filter?: {
    resolved?: boolean;
    severity?: ErrorSeverity;
    component?: string;
    taskId?: string;
    staffId?: string;
  }
): ErrorLog[] => {
  if (!filter) return [...errorLogs];
  
  return errorLogs.filter(log => {
    if (filter.resolved !== undefined && log.resolved !== filter.resolved) return false;
    if (filter.severity && log.severity !== filter.severity) return false;
    if (filter.component && log.component !== filter.component) return false;
    if (filter.taskId && log.taskId !== filter.taskId) return false;
    if (filter.staffId && log.staffId !== filter.staffId) return false;
    return true;
  });
};

/**
 * Clear all resolved errors
 */
export const clearResolvedErrors = (): number => {
  const countBefore = errorLogs.length;
  
  // Remove all resolved errors
  for (let i = errorLogs.length - 1; i >= 0; i--) {
    if (errorLogs[i].resolved) {
      errorLogs.splice(i, 1);
    }
  }
  
  return countBefore - errorLogs.length;
};

/**
 * Clear all errors
 */
export const clearAllErrors = (): number => {
  const count = errorLogs.length;
  errorLogs.length = 0;
  return count;
};

export default {
  logError,
  resolveError,
  getErrorLogs,
  clearResolvedErrors,
  clearAllErrors
};
