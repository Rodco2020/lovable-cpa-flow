
import { Staff } from "@/types/staff";
import { getStaffById as getStaffByIdFromService } from "@/services/staffService";
import { logError } from "@/services/errorLoggingService";
import { 
  staffCache, 
  DEFAULT_CACHE_DURATION 
} from "@/services/schedulerCacheService";

/**
 * Enhanced version of getStaffById that uses the service but adds caching
 * and error handling for better performance during batch operations
 */
export const getStaffById = async (staffId: string): Promise<Staff | null> => {
  try {
    // Check cache first
    const cacheKey = `staff:${staffId}`;
    const cachedStaff = staffCache.get<Staff>(cacheKey);
    
    if (cachedStaff) {
      console.log(`[Cache] Using cached staff ${staffId}`);
      return cachedStaff;
    }
    
    // Not in cache, fetch from service
    const staff = await getStaffByIdFromService(staffId);
    
    if (staff) {
      // Store in cache
      staffCache.set(cacheKey, staff, DEFAULT_CACHE_DURATION.STAFF);
    }
    
    return staff || null;
  } catch (error) {
    console.error("Error getting staff by ID:", error);
    logError(
      "Failed to fetch staff details",
      'warning',
      {
        staffId,
        component: 'schedulerService',
        details: error instanceof Error ? error.message : String(error)
      }
    );
    return null;
  }
};

/**
 * Validate if a task can be scheduled for a time slot (for drag-and-drop validation)
 */
export const validateScheduleSlot = async (
  taskId: string,
  staffId: string,
  date: string,
  startTime: string,
): Promise<{
  valid: boolean;
  message?: string;
}> => {
  try {
    // Get the task - use cached version if available
    const { getTaskInstanceById } = await import('./taskOperations');
    const task = await getTaskInstanceById(taskId);
    
    if (!task) {
      return {
        valid: false,
        message: "Task not found"
      };
    }
    
    // Check staff skills against task required skills - use cached version if available
    const staff = await getStaffById(staffId);
    if (!staff) {
      return {
        valid: false,
        message: "Staff member not found"
      };
    }
    
    // Verify that staff has the required skills
    if (task.requiredSkills && task.requiredSkills.length > 0) {
      const hasRequiredSkills = task.requiredSkills.some(skill => 
        staff.skills && staff.skills.includes(skill)
      );
      
      if (!hasRequiredSkills) {
        return {
          valid: false,
          message: "Staff member doesn't have the required skills for this task"
        };
      }
    }
    
    // Check if the time slot is available - always fetch fresh data here
    // as availability can change frequently
    const { getTimeSlotsByStaffAndDate } = await import('@/services/staffService');
    const timeSlots = await getTimeSlotsByStaffAndDate(staffId, date);
    const startSlot = timeSlots.find(slot => 
      slot.startTime === startTime
    );
    
    if (!startSlot || !startSlot.isAvailable || startSlot.taskId) {
      return {
        valid: false,
        message: "Time slot is not available"
      };
    }
    
    return { valid: true };
  } catch (error) {
    console.error("Error validating schedule slot:", error);
    logError(
      "Error validating schedule slot", 
      'warning', 
      { 
        taskId, 
        staffId, 
        component: 'schedulerService',
        details: error instanceof Error ? error.message : String(error)
      }
    );
    
    return {
      valid: false,
      message: "Error validating schedule slot"
    };
  }
};
