
/**
 * Scheduler Service
 * 
 * This file serves as the main entry point for all scheduler-related operations.
 * It exports the public API for the scheduler module, while the actual implementation
 * is organized into specialized files for better maintainability.
 */

// Re-export types for external consumers
export type { StaffTaskRecommendation } from './scheduler/recommendationOperations';

// Export public API functions
import { scheduleTask, getTaskInstanceById } from './scheduler/taskOperations';
import { validateScheduleSlot } from './scheduler/staffOperations';
import { findSuitableStaffForTask, generateBatchRecommendations } from './scheduler/recommendationOperations';

export {
  // Task Operations
  scheduleTask,
  getTaskInstanceById,
  
  // Staff Operations
  validateScheduleSlot,
  
  // Recommendation Operations
  findSuitableStaffForTask,
  generateBatchRecommendations
};

// Default export for backwards compatibility
export default {
  scheduleTask,
  findSuitableStaffForTask,
  validateScheduleSlot,
  getTaskInstanceById,
  generateBatchRecommendations
};
