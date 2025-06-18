
/**
 * Client Task Service - Main Module
 * 
 * Central export point for all client task operations providing a clean,
 * maintainable API surface for client task management functionality.
 * 
 * This module maintains backward compatibility while organizing functionality
 * into focused, single-responsibility modules.
 * 
 * @module ClientTaskService
 */

// Core task operations - CRUD operations for recurring tasks and task instances
export { 
  getRecurringTaskById, 
  getClientRecurringTasks,
  updateRecurringTask,
  createRecurringTask 
} from './recurringTaskOperations';

export { 
  getTaskInstanceById, 
  getClientAdHocTasks 
} from './taskInstanceOperations';

export { 
  getAllRecurringTasks 
} from './getAllRecurringTasks';

// Staff validation services - Validation utilities for preferred staff functionality
export { 
  validateStaffExists, 
  validateMultipleStaff 
} from './staffValidationService';

// Legacy compatibility exports - Maintained for existing code compatibility
export { 
  deleteRecurringTaskAssignment,
  deleteTaskInstance 
} from '../taskService';

// Type exports for consumers
export type { 
  RecurringTaskData, 
  TaskInstanceData 
} from './types';

export type { 
  StaffValidationResult 
} from './staffValidationService';

/**
 * API Overview:
 * 
 * Recurring Tasks:
 * - getRecurringTaskById(id): Get single recurring task
 * - getClientRecurringTasks(clientId): Get all recurring tasks for client
 * - updateRecurringTask(id, data): Update recurring task (includes preferred staff)
 * - createRecurringTask(data): Create new recurring task
 * - getAllRecurringTasks(): Get all recurring tasks across system
 * 
 * Task Instances:
 * - getTaskInstanceById(id): Get single task instance
 * - getClientAdHocTasks(clientId): Get ad-hoc tasks for client
 * 
 * Staff Validation:
 * - validateStaffExists(staffId): Validate single staff member
 * - validateMultipleStaff(staffIds): Validate multiple staff members
 * 
 * Legacy Operations:
 * - deleteRecurringTaskAssignment(id): Delete recurring task
 * - deleteTaskInstance(id): Delete task instance
 */
