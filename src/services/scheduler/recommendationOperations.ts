
import { TaskInstance } from "@/types/task";
import { Staff } from "@/types/staff";
import { 
  getAllStaff,
  getTimeSlotsByStaffAndDate
} from "@/services/staffService";
import { getUnscheduledTaskInstances } from "@/services/taskService";
import { logError } from "@/services/errorLoggingService";
import { 
  DEFAULT_CACHE_DURATION, 
  generateCacheKey, 
  CacheStore
} from "@/services/schedulerCacheService";
import { findConsecutiveSlots, calculateSkillMatchScore, calculateTaskUrgency } from "./schedulerUtils";
import { getTaskInstanceById } from "./taskOperations";
import { getStaffById } from "./staffOperations";

// Export caches for use by other modules
export const recommendationCache = new CacheStore<any>();

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
 * Find suitable staff members for a task based on required skills
 * and return ranked recommendations - with caching support
 */
export const findSuitableStaffForTask = async (
  taskId: string,
  date?: string, // Optional date to check for specific date, defaults to current date
): Promise<StaffTaskRecommendation[]> => {
  try {
    // Check the cache first
    const cacheKey = generateCacheKey(`recommendations:task:${taskId}`, { date });
    const cachedRecommendations = recommendationCache.get<StaffTaskRecommendation[]>(cacheKey);
    
    if (cachedRecommendations) {
      console.log(`[Cache] Using cached recommendations for task ${taskId}`);
      return cachedRecommendations;
    }
    
    // No cache hit, generate recommendations
    const task = await getTaskInstanceById(taskId);
    if (!task) {
      console.error("Task not found for recommendations:", taskId);
      return [];
    }
    
    // Calculate task urgency for prioritization
    const taskUrgency = calculateTaskUrgency(task);
    
    // Get all active staff members - use cached version
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
    const sortedRecommendations = recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    // Cache the results
    recommendationCache.set(
      cacheKey,
      sortedRecommendations,
      DEFAULT_CACHE_DURATION.RECOMMENDATIONS
    );
    
    return sortedRecommendations;
  } catch (error) {
    console.error("Error finding suitable staff for task:", error);
    logError(
      "Failed to find staff recommendations", 
      'warning',
      {
        taskId,
        component: 'schedulerService',
        details: error instanceof Error ? error.message : String(error)
      }
    );
    return [];
  }
};

/**
 * Generate batch recommendations for multiple unscheduled tasks
 * With caching support
 */
export const generateBatchRecommendations = async (
  date?: string, // Optional date, defaults to current date
  limit: number = 10 // Limit the number of tasks to process
): Promise<Record<string, StaffTaskRecommendation[]>> => {
  try {
    // Get unscheduled tasks - don't use cache here as we need fresh data
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
      // Check cache first for this specific task's recommendations
      const cacheKey = generateCacheKey(`recommendations:task:${task.id}`, { date });
      const cachedRecommendations = recommendationCache.get<StaffTaskRecommendation[]>(cacheKey);
      
      if (cachedRecommendations) {
        recommendations[task.id] = cachedRecommendations;
        continue;
      }
      
      // No cache hit, generate new recommendations
      const taskRecommendations = await findSuitableStaffForTask(task.id, date);
      if (taskRecommendations.length > 0) {
        recommendations[task.id] = taskRecommendations;
        
        // Cache these recommendations for future use
        recommendationCache.set(
          cacheKey,
          taskRecommendations,
          DEFAULT_CACHE_DURATION.RECOMMENDATIONS
        );
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error("Error generating batch recommendations:", error);
    logError(
      "Failed to generate batch recommendations",
      'error',
      {
        component: 'schedulerService',
        details: error instanceof Error ? error.message : String(error)
      }
    );
    return {};
  }
};
