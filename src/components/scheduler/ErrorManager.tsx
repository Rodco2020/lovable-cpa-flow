
import React, { useState, useEffect } from 'react';
import { getErrorLogs, resolveError, clearAllErrors, clearResolvedErrors } from '@/services/errorLoggingService';
import { ErrorLogEntry } from '@/components/scheduler/SchedulerErrorHandler';

/**
 * Hook for managing scheduler error logs
 */
export const useErrorManager = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  
  // Load initial error logs
  useEffect(() => {
    const logs = getErrorLogs();
    setErrorLogs(logs as ErrorLogEntry[]);
    
    // Set up an interval to refresh error logs
    const intervalId = setInterval(() => {
      const freshLogs = getErrorLogs();
      setErrorLogs(freshLogs as ErrorLogEntry[]);
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Error handling functions
  const handleResolveError = (errorId: string) => {
    resolveError(errorId);
    // Refresh error logs
    setErrorLogs(getErrorLogs() as ErrorLogEntry[]);
  };
  
  const handleClearErrors = () => {
    clearResolvedErrors();
    // Refresh error logs
    setErrorLogs(getErrorLogs() as ErrorLogEntry[]);
  };
  
  const handleClearAllErrors = () => {
    clearAllErrors();
    // Refresh error logs
    setErrorLogs(getErrorLogs() as ErrorLogEntry[]);
  };
  
  return {
    errorLogs,
    setErrorLogs,
    handleResolveError,
    handleClearErrors,
    handleClearAllErrors
  };
};
