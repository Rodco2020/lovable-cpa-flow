
/**
 * Client Task Service - Main Module
 * 
 * Central export point for all client task operations.
 * This module maintains backward compatibility while providing
 * a cleaner, more maintainable internal structure.
 */

// Export all operations with the same interface as before
export { getRecurringTaskById, getClientRecurringTasks } from './recurringTaskOperations';
export { getTaskInstanceById, getClientAdHocTasks } from './taskInstanceOperations';

// Re-export from taskService for backward compatibility
export { deleteRecurringTaskAssignment } from '../taskService';

// Export types for consumers who need them
export type { RecurringTaskData, TaskInstanceData } from './types';
