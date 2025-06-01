
/**
 * Client Task Service - Legacy Compatibility Layer
 * 
 * This file maintains backward compatibility for existing imports
 * while delegating to the new modular structure.
 * 
 * @deprecated Use '@/services/clientTask' instead for new code
 */

// Re-export everything from the new modular structure
export {
  getRecurringTaskById,
  getClientRecurringTasks,
  getTaskInstanceById,
  getClientAdHocTasks,
  deleteRecurringTaskAssignment,
  getAllRecurringTasks
} from './clientTask';

// Legacy re-exports for backward compatibility
export type { RecurringTaskData, TaskInstanceData } from './clientTask';
