
import { TaskInstance } from "@/types/task";
import { Staff } from "@/types/staff";

export interface SchedulingMetrics {
  tasksScheduledCount: number;
  averageTimeToSchedule: number; // In seconds
  staffUtilization: Record<string, number>; // Staff ID to utilization percentage
  skillUtilization: Record<string, number>; // Skill ID to utilization percentage
  tasksPerPriority: Record<string, number>; // Priority to count
  successRate: number; // Percentage of successful assignments
}

// In-memory cache for scheduling metrics (in a real app would be persisted)
let schedulingMetricsCache: SchedulingMetrics = {
  tasksScheduledCount: 0,
  averageTimeToSchedule: 0,
  staffUtilization: {},
  skillUtilization: {},
  tasksPerPriority: {},
  successRate: 0
};

// Total time spent scheduling (for average calculation)
let totalSchedulingTime = 0;

// Track current scheduling operation start time
let currentOperationStartTime: number | null = null;

/**
 * Start tracking a scheduling operation
 */
export const startSchedulingOperation = (): void => {
  currentOperationStartTime = Date.now();
};

/**
 * Record a successful scheduling operation
 * @param task The scheduled task
 * @param staffId The staff ID assigned to the task
 */
export const recordSuccessfulScheduling = (task: TaskInstance, staffId: string): void => {
  // Calculate time taken if we were tracking
  if (currentOperationStartTime) {
    const timeTaken = (Date.now() - currentOperationStartTime) / 1000; // Convert to seconds
    totalSchedulingTime += timeTaken;
    currentOperationStartTime = null;
  }
  
  // Update metrics
  schedulingMetricsCache.tasksScheduledCount++;
  schedulingMetricsCache.averageTimeToSchedule = 
    totalSchedulingTime / schedulingMetricsCache.tasksScheduledCount;
    
  // Update staff utilization
  schedulingMetricsCache.staffUtilization[staffId] = 
    (schedulingMetricsCache.staffUtilization[staffId] || 0) + task.estimatedHours;
  
  // Update skill utilization
  if (task.requiredSkills) {
    task.requiredSkills.forEach(skill => {
      schedulingMetricsCache.skillUtilization[skill] = 
        (schedulingMetricsCache.skillUtilization[skill] || 0) + 1;
    });
  }
  
  // Update priority counts
  schedulingMetricsCache.tasksPerPriority[task.priority] = 
    (schedulingMetricsCache.tasksPerPriority[task.priority] || 0) + 1;
  
  // Recalculate success rate (this is just a placeholder, real implementation would be more complex)
  schedulingMetricsCache.successRate = 
    schedulingMetricsCache.tasksScheduledCount / (schedulingMetricsCache.tasksScheduledCount + 1) * 100;
};

/**
 * Record a failed scheduling operation
 * @param taskId The ID of the task that failed to schedule
 * @param reason The reason for the failure
 */
export const recordFailedScheduling = (taskId: string, reason: string): void => {
  // Reset tracking
  currentOperationStartTime = null;
  
  // Update success rate
  schedulingMetricsCache.successRate = 
    schedulingMetricsCache.tasksScheduledCount / (schedulingMetricsCache.tasksScheduledCount + 1) * 100;
    
  // In a real implementation, we would log the failed operation details
  console.warn(`Scheduling failed for task ${taskId}: ${reason}`);
};

/**
 * Get current scheduling metrics
 */
export const getSchedulingMetrics = (): SchedulingMetrics => {
  return {...schedulingMetricsCache};
};

/**
 * Generate a staff utilization report
 * @param staffList List of all staff members for context
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 */
export const generateStaffUtilizationReport = async (
  staffList: Staff[],
  startDate?: Date,
  endDate?: Date
): Promise<Record<string, any>> => {
  // This would typically query the database for actual utilization data
  // but for this example, we'll just use our in-memory cache
  
  const report: Record<string, any> = {};
  
  staffList.forEach(staff => {
    const utilization = schedulingMetricsCache.staffUtilization[staff.id] || 0;
    report[staff.id] = {
      staffName: staff.fullName,
      hoursAssigned: utilization,
      taskCount: Math.round(utilization / 2), // Rough estimate for example purposes
      utilizationPercentage: Math.min(100, (utilization / 40) * 100) // Assuming 40 hours is 100%
    };
  });
  
  return report;
};

/**
 * Reset scheduling metrics
 */
export const resetSchedulingMetrics = (): void => {
  schedulingMetricsCache = {
    tasksScheduledCount: 0,
    averageTimeToSchedule: 0,
    staffUtilization: {},
    skillUtilization: {},
    tasksPerPriority: {},
    successRate: 0
  };
  totalSchedulingTime = 0;
  currentOperationStartTime = null;
};

export default {
  startSchedulingOperation,
  recordSuccessfulScheduling,
  recordFailedScheduling,
  getSchedulingMetrics,
  generateStaffUtilizationReport,
  resetSchedulingMetrics
};
