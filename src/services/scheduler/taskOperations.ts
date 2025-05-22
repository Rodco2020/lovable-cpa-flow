
import { TaskInstance } from "@/types/task";
import { getUnscheduledTaskInstances, updateTaskInstance } from "@/services/taskService";
import { updateTimeSlot } from "@/services/staffService"; 
import { logError } from "@/services/errorLoggingService";
import { 
  taskCache, 
  clearAllCaches, 
  DEFAULT_CACHE_DURATION, 
  generateCacheKey 
} from "@/services/schedulerCacheService";
import {
  startSchedulingOperation,
  recordSuccessfulScheduling,
  recordFailedScheduling
} from "@/services/schedulingAnalyticsService";

/**
 * Get a task instance by ID with caching support
 */
export const getTaskInstanceById = async (taskId: string): Promise<TaskInstance | null> => {
  try {
    // Check cache first
    const cacheKey = `task:${taskId}`;
    const cachedTask = taskCache.get<TaskInstance>(cacheKey);
    
    if (cachedTask) {
      console.log(`[Cache] Using cached task ${taskId}`);
      return cachedTask;
    }
    
    // Not in cache, fetch from service
    const tasks = await getUnscheduledTaskInstances();
    const task = tasks.find(task => task.id === taskId);
    
    if (task) {
      // Store in cache
      taskCache.set(cacheKey, task, DEFAULT_CACHE_DURATION.TASKS);
    }
    
    return task || null;
  } catch (error) {
    console.error("Error getting task by ID:", error);
    return null;
  }
};

/**
 * Schedule a task for a specific staff member and time slot
 */
export const scheduleTask = async (
  taskId: string,
  staffId: string,
  date: string, // ISO date string
  startTime: string, // HH:MM format
  endTime: string, // HH:MM format
): Promise<TaskInstance> => {
  try {
    startSchedulingOperation();
    
    // Get the task first to validate
    const task = await getTaskInstanceById(taskId);
    if (!task) {
      const errorMsg = `Task not found with ID: ${taskId}`;
      logError(errorMsg, 'error', { taskId, component: 'schedulerService' });
      throw new Error(errorMsg);
    }

    // Get the time slots for the staff member on the given date
    const staffTimeSlots = await getStaffTimeSlotsForDate(staffId, date);
    
    // Find the starting time slot
    const startSlot = staffTimeSlots.find(slot => 
      slot.isAvailable && slot.startTime === startTime && !slot.taskId
    );
    
    if (!startSlot) {
      const errorMsg = "The selected time slot is not available";
      logError(errorMsg, 'error', { 
        taskId, 
        staffId, 
        component: 'schedulerService',
        data: { date, startTime, endTime }
      });
      throw new Error(errorMsg);
    }
    
    // Create a Date object for the start time
    const startDate = new Date(`${date}T${startTime}:00`);
    
    // Create a Date object for the end time
    const endDate = new Date(`${date}T${endTime}:00`);
    
    // Update the task with the scheduling information
    const taskUpdateData = {
      status: 'Scheduled',
      assignedStaffId: staffId,
      scheduledStartTime: startDate,
      scheduledEndTime: endDate
    } as Partial<TaskInstance>;
    
    // Make sure to await and capture the returned task instance
    const updatedTask = await updateTaskInstance(taskId, taskUpdateData);
    
    // Mark the time slot as assigned to this task
    await updateTimeSlot(startSlot.id, {
      taskId: taskId,
      isAvailable: false
    });
    
    // Record successful scheduling for analytics
    recordSuccessfulScheduling(updatedTask, staffId);
    
    // Clear any cached data that might be affected
    clearTaskCache(taskId);
    
    // Return the updated task
    return updatedTask;
  } catch (error) {
    console.error("Error scheduling task:", error);
    recordFailedScheduling(taskId, error instanceof Error ? error.message : String(error));
    throw error;
  }
};

/**
 * Helper function to get staff time slots for a specific date
 * This is separated to make the code more modular and testable
 */
const getStaffTimeSlotsForDate = async (staffId: string, date: string) => {
  const { getTimeSlotsByStaffAndDate } = await import('@/services/staffService');
  return getTimeSlotsByStaffAndDate(staffId, date);
};

/**
 * Helper function to clear task cache when data changes
 */
export const clearTaskCache = (taskId: string): void => {
  const cacheKey = `task:${taskId}`;
  taskCache.delete(cacheKey);
  
  // Also clear any recommendations involving this task
  const recommendationKeys = recommendationCache.keys().filter(
    key => key.includes(`recommendations:task:${taskId}`)
  );
  
  recommendationKeys.forEach(key => recommendationCache.delete(key));
};

/**
 * Import necessary cache services for task operations
 */
import { recommendationCache } from "@/services/scheduler/recommendationOperations";
