
import { v4 as uuidv4 } from "uuid";
import { 
  updateTaskInstance, 
  getUnscheduledTaskInstances 
} from "@/services/taskService";
import { 
  getTimeSlotsByStaffAndDate,
  updateTimeSlot 
} from "@/services/staffService";
import { TaskInstance } from "@/types/task";

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

export default {
  scheduleTask,
  findSuitableStaffForTask
};
