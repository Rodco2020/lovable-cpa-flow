
import { TaskInstance } from "@/types/task";
import { TimeSlot } from "@/types/staff";

/**
 * Calculate task urgency score based on priority and due date
 * Returns a score from 0-100, where higher means more urgent
 */
export const calculateTaskUrgency = (task: TaskInstance): number => {
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
export const calculateSkillMatchScore = (taskSkills: string[], staffSkills: string[]): number => {
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
 * Helper function to find consecutive available time slots
 * that can accommodate a task of the given duration
 */
export const findConsecutiveSlots = (
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
