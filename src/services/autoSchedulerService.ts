
import { 
  getUnscheduledTaskInstances,
  updateTaskInstance,
  getTaskInstances  // Changed from getTaskInstanceById
} from "@/services/taskService";
import { 
  getTimeSlotsByStaffAndDate,
  updateTimeSlot,
  getAllStaff,
  getStaffById
} from "@/services/staffService";
import { 
  findSuitableStaffForTask,
  validateScheduleSlot,
  scheduleTask
} from "@/services/schedulerService";
import { TaskInstance, TaskPriority } from "@/types/task";
import { Staff, TimeSlot } from "@/types/staff";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { logError } from "@/services/errorLoggingService";
import {
  startSchedulingOperation,
  recordSuccessfulScheduling,
  recordFailedScheduling
} from "@/services/schedulingAnalyticsService";

/**
 * Configuration options for automatic scheduling
 */
export interface AutoScheduleConfig {
  lookAheadDays: number;      // How many days in the future to schedule
  maxTasksPerBatch: number;   // Maximum number of tasks to process in one batch
  balanceWorkload: boolean;   // Whether to balance workload across staff
  respectPriority: boolean;   // Whether to prioritize by task priority
  respectDueDate: boolean;    // Whether to prioritize by due date
  respectSkillMatch: boolean; // Whether to prioritize by skill match quality
}

/**
 * Result of an automatic scheduling operation
 */
export interface AutoScheduleResult {
  totalTasksProcessed: number;
  tasksScheduled: number;
  tasksSkipped: number;
  errors: { taskId: string; message: string }[];
  scheduledTasks: {
    taskId: string;
    taskName: string;
    staffId: string;
    staffName: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

/**
 * Auto-schedules multiple unscheduled tasks based on configuration
 * @param config Configuration options for scheduling
 * @returns Result of the auto-scheduling operation
 */
export const autoScheduleTasks = async (
  config: AutoScheduleConfig
): Promise<AutoScheduleResult> => {
  console.log("Starting automatic task scheduling with config:", config);
  
  // Start scheduling analytics tracking
  startSchedulingOperation();
  
  const result: AutoScheduleResult = {
    totalTasksProcessed: 0,
    tasksScheduled: 0,
    tasksSkipped: 0,
    errors: [],
    scheduledTasks: []
  };

  try {
    // 1. Get all unscheduled tasks
    const unscheduledTasks = await getUnscheduledTaskInstances();
    console.log(`Found ${unscheduledTasks.length} unscheduled tasks`);
    
    // 2. Sort tasks based on configuration
    const sortedTasks = sortTasksByPriority(unscheduledTasks, config);
    console.log(`Sorted ${sortedTasks.length} tasks for processing`);
    
    // 3. Limit to max tasks per batch
    const tasksToProcess = sortedTasks.slice(0, config.maxTasksPerBatch);
    result.totalTasksProcessed = tasksToProcess.length;
    
    // 4. Get all active staff
    const allStaff = await getAllStaff();
    const activeStaff = allStaff.filter(staff => staff.status === "active");
    
    // 5. Initialize workload tracking
    const workloadMap: Record<string, number> = {};
    activeStaff.forEach(staff => {
      workloadMap[staff.id] = 0;
    });
    
    // 6. Process each task
    for (const task of tasksToProcess) {
      try {
        // Calculate the date range to consider
        const startDate = new Date();
        const endDate = addDays(startDate, config.lookAheadDays);
        
        let scheduled = false;
        
        // Try to schedule within the date range
        for (let day = 0; !scheduled && day <= config.lookAheadDays; day++) {
          const currentDate = addDays(startDate, day);
          const dateString = format(currentDate, "yyyy-MM-dd");
          
          // Get recommendations for this task on this date
          const recommendations = await findSuitableStaffForTask(task.id, dateString);
          
          if (recommendations.length === 0) {
            continue;
          }
          
          // Sort recommendations based on config and workload
          const sortedRecommendations = sortRecommendationsByConfig(
            recommendations, 
            workloadMap, 
            config
          );
          
          if (sortedRecommendations.length === 0) {
            continue;
          }
          
          // Try to schedule with the best recommendation
          const bestMatch = sortedRecommendations[0];
          
          try {
            // Attempt to schedule
            const scheduledTask = await scheduleTask(
              task.id,
              bestMatch.staffId,
              bestMatch.date,
              bestMatch.startTime,
              bestMatch.endTime
            );
            
            // Update workload tracking
            workloadMap[bestMatch.staffId] = 
              (workloadMap[bestMatch.staffId] || 0) + task.estimatedHours;
            
            // Record successful scheduling
            result.tasksScheduled++;
            result.scheduledTasks.push({
              taskId: task.id,
              taskName: task.name,
              staffId: bestMatch.staffId,
              staffName: bestMatch.staffName,
              date: bestMatch.date,
              startTime: bestMatch.startTime,
              endTime: bestMatch.endTime
            });
            
            scheduled = true;
            
          } catch (error) {
            console.error(`Failed to schedule task ${task.id} with recommendation:`, error);
            continue;
          }
        }
        
        // If task wasn't scheduled after trying all dates
        if (!scheduled) {
          result.tasksSkipped++;
          console.log(`Skipped task ${task.id}: No suitable time slots found`);
          
          // Log this as a warning
          logError(
            `No suitable time slots found for task "${task.name}"`,
            'warning',
            {
              taskId: task.id,
              component: 'autoScheduler',
              details: `Task could not be scheduled within the ${config.lookAheadDays}-day window`
            }
          );
        }
        
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        result.errors.push({
          taskId: task.id,
          message: error instanceof Error ? error.message : String(error)
        });
        result.tasksSkipped++;
        
        // Record failed scheduling
        recordFailedScheduling(
          task.id, 
          error instanceof Error ? error.message : String(error)
        );
      }
    }
    
    console.log("Automatic scheduling completed:", result);
    return result;
    
  } catch (error) {
    console.error("Failed to complete automatic scheduling:", error);
    
    // Log global error
    logError(
      "Automatic scheduling failed",
      'error',
      {
        component: 'autoScheduler',
        details: error instanceof Error ? error.message : String(error)
      }
    );
    
    throw error;
  }
};

/**
 * Sorts tasks based on configuration priorities
 */
const sortTasksByPriority = (
  tasks: TaskInstance[],
  config: AutoScheduleConfig
): TaskInstance[] => {
  return [...tasks].sort((a, b) => {
    let score = 0;
    
    // Sort by priority if enabled
    if (config.respectPriority) {
      score += getPriorityScore(b.priority) - getPriorityScore(a.priority);
    }
    
    // Sort by due date if enabled
    if (config.respectDueDate && a.dueDate && b.dueDate) {
      const dueDateA = new Date(a.dueDate);
      const dueDateB = new Date(b.dueDate);
      score += dueDateA.getTime() - dueDateB.getTime();
    } else if (config.respectDueDate) {
      // Tasks with due dates come before those without
      if (a.dueDate && !b.dueDate) score -= 1000;
      if (!a.dueDate && b.dueDate) score += 1000;
    }
    
    return score;
  });
};

/**
 * Sorts recommendations based on configuration and current workload
 */
const sortRecommendationsByConfig = (
  recommendations: any[],
  workloadMap: Record<string, number>,
  config: AutoScheduleConfig
): any[] => {
  return [...recommendations].sort((a, b) => {
    let score = 0;
    
    // Consider skill match if enabled
    if (config.respectSkillMatch) {
      score += b.matchScore - a.matchScore; // Higher matchScore should be preferred
    }
    
    // Consider workload balancing if enabled
    if (config.balanceWorkload) {
      const workloadA = workloadMap[a.staffId] || 0;
      const workloadB = workloadMap[b.staffId] || 0;
      score += workloadA - workloadB; // Prefer staff with lower workload
    }
    
    return score;
  });
};

/**
 * Converts priority string to numeric score for sorting
 */
const getPriorityScore = (priority: string): number => {
  switch (priority) {
    case 'Urgent': return 100;
    case 'High': return 75;
    case 'Medium': return 50;
    case 'Low': return 25;
    default: return 0;
  }
};

export default {
  autoScheduleTasks
};
