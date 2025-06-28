

import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { normalizeStaffId } from '@/utils/staffIdUtils';

/**
 * Data Point Processing Utilities for Preferred Staff Filter Strategy
 * 
 * This module handles the core filtering logic for data points and their associated tasks,
 * applying preferred staff filters with enhanced diagnostics and performance tracking.
 */

export interface DataPointFilterResult {
  filteredDataPoint: DemandDataPoint;
  tasksProcessed: number;
  tasksRetained: number;
  tasksFiltered: number;
}

export interface TaskFilterResult {
  task: ClientTaskDemand;
  retained: boolean;
  filterReason?: string;
}

/**
 * Process a data point and filter its tasks based on preferred staff
 */
export function processDataPoint(
  dataPoint: DemandDataPoint,
  normalizedFilterIds: string[]
): DataPointFilterResult {
  if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
    return {
      filteredDataPoint: { ...dataPoint, demandHours: 0, taskCount: 0 },
      tasksProcessed: 0,
      tasksRetained: 0,
      tasksFiltered: 0
    };
  }

  const taskResults = dataPoint.taskBreakdown.map(task => 
    processTaskForFiltering(task, normalizedFilterIds)
  );

  const retainedTasks = taskResults
    .filter(result => result.retained)
    .map(result => result.task);

  const filteredDataPoint: DemandDataPoint = {
    ...dataPoint,
    taskBreakdown: retainedTasks,
    demandHours: retainedTasks.reduce((sum, task) => sum + task.monthlyHours, 0),
    taskCount: retainedTasks.length,
    clientCount: new Set(retainedTasks.map(task => task.clientId)).size
  };

  return {
    filteredDataPoint,
    tasksProcessed: taskResults.length,
    tasksRetained: retainedTasks.length,
    tasksFiltered: taskResults.length - retainedTasks.length
  };
}

/**
 * Process a single task for preferred staff filtering with SURGICAL PRECISION
 */
function processTaskForFiltering(
  task: ClientTaskDemand,
  normalizedFilterIds: string[]
): TaskFilterResult {
  // SURGICAL PRECISION: Access the correctly mapped camelCase field
  const taskStaffId = task.preferredStaffId; // Must be camelCase as per requirements
  
  // DEBUGGING: Field access verification as requested
  console.log('🔍 [TASK FILTERING] Field access debug:', {
    taskName: task.taskName,
    accessingField: 'task.preferredStaffId',
    fieldValue: taskStaffId,
    fieldType: typeof taskStaffId,
    isNull: taskStaffId === null,
    isUndefined: taskStaffId === undefined
  });

  if (!taskStaffId) {
    return {
      task,
      retained: false,
      filterReason: 'No preferred staff assigned'
    };
  }

  // Normalize the task's preferred staff ID for comparison
  const normalizedTaskStaffId = normalizeStaffId(taskStaffId);
  
  if (!normalizedTaskStaffId) {
    return {
      task,
      retained: false,
      filterReason: 'Invalid staff ID format'
    };
  }

  // Check if normalized task staff ID matches any of the filter IDs
  const isMatch = normalizedFilterIds.includes(normalizedTaskStaffId);

  // VALIDATION: Filter logic verification as requested
  console.log('🎯 [TASK FILTERING] Filter logic verification:', {
    taskName: task.taskName,
    taskStaffId: taskStaffId,
    normalizedTaskStaffId: normalizedTaskStaffId,
    filterIds: normalizedFilterIds,
    isMatch: isMatch,
    filterWorking: true
  });

  return {
    task,
    retained: isMatch,
    filterReason: isMatch ? 'Matches preferred staff filter' : 'Does not match preferred staff filter'
  };
}

/**
 * Calculate totals and summaries for filtered data points
 */
export function calculateFilteredTotals(filteredDataPoints: DemandDataPoint[]): {
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: { [key: string]: { totalHours: number; taskCount: number; clientCount: number } };
  remainingSkills: string[];
} {
  const skillSummary: { [key: string]: { totalHours: number; taskCount: number; clientCount: number } } = {};
  const allClients = new Set<string>();
  let totalDemand = 0;
  let totalTasks = 0;

  filteredDataPoints.forEach(dataPoint => {
    totalDemand += dataPoint.demandHours;
    totalTasks += dataPoint.taskCount;

    // Update skill summary
    if (!skillSummary[dataPoint.skillType]) {
      skillSummary[dataPoint.skillType] = {
        totalHours: 0,
        taskCount: 0,
        clientCount: 0
      };
    }

    skillSummary[dataPoint.skillType].totalHours += dataPoint.demandHours;
    skillSummary[dataPoint.skillType].taskCount += dataPoint.taskCount;

    // Collect unique clients for this skill
    const skillClients = new Set<string>();
    dataPoint.taskBreakdown?.forEach(task => {
      allClients.add(task.clientId);
      skillClients.add(task.clientId);
    });

    skillSummary[dataPoint.skillType].clientCount = skillClients.size;
  });

  const remainingSkills = Object.keys(skillSummary);
  const totalClients = allClients.size;

  return {
    totalDemand,
    totalTasks,
    totalClients,
    skillSummary,
    remainingSkills
  };
}

