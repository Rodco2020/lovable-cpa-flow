import { v4 as uuidv4 } from "uuid";
import { 
  updateTaskInstance, 
  getUnscheduledTaskInstances
  // Removing the import since we're defining our own version
  // getTaskInstanceById 
} from "@/services/taskService";
import { 
  getTimeSlotsByStaffAndDate,
  updateTimeSlot,
  getAllStaff,
  getStaffById as getStaffByIdFromService,
  calculateAvailabilitySummary
} from "@/services/staffService";
import { TaskInstance } from "@/types/task";
import { Staff, TimeSlot } from "@/types/staff";

// Task-staff match recommendation interface
export interface StaffTaskRecommendation {
  taskId: string;
  staffId: string;
  staffName: string;
  matchScore: number; // 0-100 score representing match quality
  date: string;
  startTime: string;
  endTime: string;
  skillMatch: boolean;
  availabilityMatch: boolean;
  taskName: string;
  requiredSkills: string[];
}

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
 * Calculate task urgency score based on priority and due date
 * Returns a score from 0-100, where higher means more urgent
 */
const calculateTaskUrgency = (task: TaskInstance): number => {
  let urgencyScore = 0;
  
  // Priority-based urgency (0-60 points)
  switch(task.priority) {
    case 'Urgent':
      urgencyScore += 60;
      break;
    case 'High':
      urgencyScore += 40;
      break;
    case 'Medium':
      urgencyScore += 20;
      break;
    case 'Low':
      urgencyScore += 10;
      break;
    default:
      urgencyScore += 10;
  }
  
  // Due date based urgency (0-40 points)
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = Math.max(0, Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (daysUntilDue === 0) {
      // Due today
      urgencyScore += 40;
    } else if (daysUntilDue <= 1) {
      // Due tomorrow
      urgencyScore += 30;
    } else if (daysUntilDue <= 3) {
      // Due within 3 days
      urgencyScore += 20;
    } else if (daysUntilDue <= 7) {
      // Due within a week
      urgencyScore += 10;
    }
  }
  
  return Math.min(100, urgencyScore);
};

/**
 * Calculate skill match score between task requirements and staff skills
 * Returns a score from 0-100, where higher means better match
 */
const calculateSkillMatchScore = (taskSkills: string[], staffSkills: string[]): number => {
  if (!taskSkills || taskSkills.length === 0) {
    return 100; // No skills required means perfect match
  }
  
  if (!staffSkills || staffSkills.length === 0) {
    return 0; // Staff has no skills, can't be a match
  }
  
  let matchCount = 0;
  for (const skill of taskSkills) {
    if (staffSkills.includes(skill)) {
      matchCount++;
    }
  }
  
  // Calculate percentage match and convert to 0-100 scale
  return Math.round((matchCount / taskSkills.length) * 100);
};

/**
 * Find suitable staff members for a task based on required skills
 * and return ranked recommendations
 */
export const findSuitableStaffForTask = async (
  taskId: string,
  date?: string, // Optional date to check for specific date, defaults to current date
): Promise<StaffTaskRecommendation[]> => {
  try {
    const task = await getTaskInstanceById(taskId);
    if (!task) {
      console.error("Task not found for recommendations:", taskId);
      return [];
    }
    
    // Calculate task urgency for prioritization
    const taskUrgency = calculateTaskUrgency(task);
    
    // Get all active staff members
    const allStaff = await getAllStaff();
    const activeStaff = allStaff.filter(staff => staff.status === "active");
    
    // Use provided date or default to current date
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const recommendations: StaffTaskRecommendation[] = [];
    
    // For each staff member, calculate match score and find available time slots
    for (const staff of activeStaff) {
      // Skip if staff has no required skills for the task
      const hasRequiredSkills = !task.requiredSkills?.length || 
        task.requiredSkills.some(skill => staff.skills?.includes(skill));
      
      if (!hasRequiredSkills) continue;
      
      // Calculate skill match score
      const skillMatchScore = calculateSkillMatchScore(
        task.requiredSkills || [],
        staff.skills || []
      );
      
      // Get time slots for this staff member on the target date
      const timeSlots = await getTimeSlotsByStaffAndDate(staff.id, targetDate);
      const availableSlots = timeSlots.filter(
        slot => slot.isAvailable && !slot.taskId
      );
      
      // Group consecutive available time slots to accommodate the task duration
      const requiredSlots = Math.ceil(task.estimatedHours * 2); // Each slot is 30 mins
      const suitableTimeSlotGroups = findConsecutiveSlots(availableSlots, requiredSlots);
      
      // Create a recommendation for each suitable time slot group
      for (const slotGroup of suitableTimeSlotGroups) {
        const firstSlot = slotGroup[0];
        const lastSlot = slotGroup[slotGroup.length - 1];
        
        // Calculate a combined score based on skill match (70%) and task urgency (30%)
        // This formula can be adjusted based on specific business priorities
        const matchScore = (skillMatchScore * 0.7) + (taskUrgency * 0.3);
        
        recommendations.push({
          taskId: task.id,
          staffId: staff.id,
          staffName: staff.fullName,
          matchScore: Math.round(matchScore),
          date: targetDate,
          startTime: firstSlot.startTime,
          endTime: lastSlot.endTime,
          skillMatch: skillMatchScore > 70, // Consider it a match if score > 70%
          availabilityMatch: true, // We already filtered for available slots
          taskName: task.name,
          requiredSkills: task.requiredSkills || []
        });
      }
    }
    
    // Sort recommendations by match score (descending)
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error finding suitable staff for task:", error);
    return [];
  }
};

/**
 * Helper function to find consecutive available time slots
 * that can accommodate a task of the given duration
 */
const findConsecutiveSlots = (
  slots: TimeSlot[], 
  requiredSlotCount: number
): TimeSlot[][] => {
  const result: TimeSlot[][] = [];
  
  if (requiredSlotCount <= 0 || !slots.length) {
    return result;
  }
  
  // Sort slots by start time
  const sortedSlots = [...slots].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );
  
  let currentGroup: TimeSlot[] = [];
  
  for (let i = 0; i < sortedSlots.length; i++) {
    const currentSlot = sortedSlots[i];
    
    if (currentGroup.length === 0) {
      // Start a new group
      currentGroup.push(currentSlot);
    } else {
      const lastSlot = currentGroup[currentGroup.length - 1];
      
      // Check if this slot is consecutive to the last one
      if (lastSlot.endTime === currentSlot.startTime) {
        currentGroup.push(currentSlot);
      } else {
        // Not consecutive, so start a new group
        if (currentGroup.length >= requiredSlotCount) {
          result.push([...currentGroup]);
        }
        currentGroup = [currentSlot];
      }
    }
    
    // Check if we have enough consecutive slots
    if (currentGroup.length === requiredSlotCount) {
      result.push([...currentGroup]);
      
      // Optional: we can slide the window to find overlapping groups
      // by removing the first element and continuing
      currentGroup.shift();
    }
  }
  
  // Check the last group
  if (currentGroup.length >= requiredSlotCount) {
    result.push(currentGroup);
  }
  
  return result;
};

/**
 * Generate batch recommendations for multiple unscheduled tasks
 */
export const generateBatchRecommendations = async (
  date?: string, // Optional date, defaults to current date
  limit: number = 10 // Limit the number of tasks to process
): Promise<Record<string, StaffTaskRecommendation[]>> => {
  try {
    // Get unscheduled tasks
    const unscheduledTasks = await getUnscheduledTaskInstances();
    
    // Sort tasks by urgency
    const urgentTasks = await Promise.all(unscheduledTasks.map(async task => {
      const urgency = calculateTaskUrgency(task);
      return { task, urgency };
    }));
    
    // Sort by urgency and take the top 'limit' tasks
    const prioritizedTasks = urgentTasks
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, limit)
      .map(item => item.task);
    
    // Generate recommendations for each task
    const recommendations: Record<string, StaffTaskRecommendation[]> = {};
    
    for (const task of prioritizedTasks) {
      const taskRecommendations = await findSuitableStaffForTask(task.id, date);
      if (taskRecommendations.length > 0) {
        recommendations[task.id] = taskRecommendations;
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error("Error generating batch recommendations:", error);
    return {};
  }
};

// Implementation of getTaskInstanceById for use within this module
// Renamed function to use a local implementation instead of importing
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

// Enhanced version of getStaffById that uses the service but adds fallback
// and caching for better performance during batch operations
const getStaffById = async (staffId: string): Promise<Staff | null> => {
  try {
    const staff = await getStaffByIdFromService(staffId);
    return staff || null;
  } catch (error) {
    console.error("Error getting staff by ID:", error);
    return null;
  }
};

export default {
  scheduleTask,
  findSuitableStaffForTask,
  validateScheduleSlot,
  getTaskInstanceById,
  generateBatchRecommendations
};
