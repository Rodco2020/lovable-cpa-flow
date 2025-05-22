
import { v4 as uuidv4 } from "uuid";
import { 
  updateTaskInstance, 
  getUnscheduledTaskInstances,
  getTaskInstanceById 
} from "@/services/taskService";
import { 
  getTimeSlotsByStaffAndDate,
  updateTimeSlot 
} from "@/services/staffService";
import { TaskInstance } from "@/types/task";
import { Staff } from "@/types/staff";

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
    // Get the time slots for the staff member on the given date
    const staffTimeSlots = await getTimeSlotsByStaffAndDate(staffId, date);
    
    // Find the starting time slot
    const startSlot = staffTimeSlots.find(slot => 
      slot.isAvailable && slot.startTime === startTime && !slot.taskId
    );
    
    if (!startSlot) {
      throw new Error("The selected time slot is not available");
    }
    
    // Create a Date object for the start time
    const startDate = new Date(`${date}T${startTime}:00`);
    
    // Create a Date object for the end time
    const endDate = new Date(`${date}T${endTime}:00`);
    
    // Update the task with the scheduling information
    const updatedTask = await updateTaskInstance(taskId, {
      status: 'Scheduled',
      assignedStaffId: staffId,
      scheduledStartTime: startDate,
      scheduledEndTime: endDate
    });
    
    // Mark the time slot as assigned to this task
    await updateTimeSlot(startSlot.id, {
      taskId: taskId,
      isAvailable: false
    });
    
    return updatedTask;
  } catch (error) {
    console.error("Error scheduling task:", error);
    throw error;
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
    // Get the task
    const task = await getTaskInstanceById(taskId);
    if (!task) {
      return {
        valid: false,
        message: "Task not found"
      };
    }
    
    // Check staff skills against task required skills
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
    
    // Check if the time slot is available
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
    return {
      valid: false,
      message: "Error validating schedule slot"
    };
  }
};

/**
 * Find suitable staff members for a task based on required skills
 */
export const findSuitableStaffForTask = async (
  taskId: string
): Promise<string[]> => {
  // This is a placeholder implementation
  // In a real app, this would query the database to find staff
  // with the required skills for the task
  return [];
};

// Mock function for getting staff by ID (replace with real implementation)
const getStaffById = async (staffId: string): Promise<Staff | null> => {
  // In a real app, this would fetch from a real API or database
  // This is just a placeholder
  return null;
};

// Mock function for getting a task instance by ID (replace with real implementation)
export const getTaskInstanceById = async (taskId: string): Promise<TaskInstance | null> => {
  // In a real app, this would fetch from a real API or database
  try {
    const tasks = await getUnscheduledTaskInstances();
    return tasks.find(task => task.id === taskId) || null;
  } catch (error) {
    console.error("Error getting task by ID:", error);
    return null;
  }
};

export default {
  scheduleTask,
  findSuitableStaffForTask,
  validateScheduleSlot,
  getTaskInstanceById
};
