
// Re-export all existing operations for backward compatibility
export * from './operations';

// Export enhanced services for new functionality
export * from './recurringTaskService';
export * from './dataTransformationService';

// Export specific functions for common use cases
export {
  getRecurringTaskById,
  updateRecurringTask,
  createRecurringTask,
  deactivateRecurringTask,
  getClientRecurringTasks,
  RecurringTaskServiceError
} from './recurringTaskService';

export {
  transformDatabaseToApplication,
  transformApplicationToDatabase,
  validateTaskData,
  sanitizeTaskData,
  DataTransformationError
} from './dataTransformationService';
