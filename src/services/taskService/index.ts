
/**
 * Task Service - Main Export Module
 * 
 * This module serves as the main entry point for all task-related operations.
 * It re-exports all functionality from the operations module to maintain
 * a clean separation of concerns.
 */

// Re-export all operations from the operations module
export {
  createRecurringTask,
  createTaskInstance,
  getTaskTemplates,
  getRecurringTasks,
  getTaskInstances,
  getUnscheduledTaskInstances,
  updateTaskInstance,
  deleteRecurringTaskAssignment,
  deleteTaskInstance,
  createTaskTemplate,
  TaskServiceError
} from './operations';
