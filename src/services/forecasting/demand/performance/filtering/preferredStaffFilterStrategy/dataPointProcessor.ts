
import { DemandMatrixData } from '@/types/demand';
import { isStaffIdInArray, normalizeStaffId } from '@/utils/staffIdUtils';
import { DataPointFilterResult, TaskFilterResult } from './types';

/**
 * Data point processing utilities for preferred staff filtering
 * 
 * This module handles the core filtering logic for individual data points
 * and tasks, providing detailed logging and analysis of filtering operations.
 */

/**
 * Process a single data point and filter its tasks based on preferred staff
 */
export function processDataPoint(
  dataPoint: any,
  normalizedFilterIds: string[]
): {
  filteredDataPoint: any;
  filterResult: DataPointFilterResult;
} {
  if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
    console.log(`⚠️ [PREFERRED STAFF FILTER] No task breakdown for ${dataPoint.skillType}/${dataPoint.month}`);
    return {
      filteredDataPoint: { 
        ...dataPoint, 
        taskBreakdown: [], 
        demandHours: 0, 
        taskCount: 0, 
        clientCount: 0 
      },
      filterResult: {
        skillType: dataPoint.skillType,
        month: dataPoint.month,
        originalTasks: 0,
        filteredTasks: 0,
        tasksRemoved: 0,
        filterEfficiency: '0%',
        retainedTaskNames: [],
        excludedTaskNames: []
      }
    };
  }

  console.log(`🔍 [PREFERRED STAFF FILTER] Processing ${dataPoint.taskBreakdown.length} tasks for ${dataPoint.skillType}/${dataPoint.month}`);

  // Filter tasks with detailed logging
  const taskFilterResults: TaskFilterResult[] = [];
  const filteredTasks = dataPoint.taskBreakdown.filter((task: any, index: number) => {
    const filterResult = processTask(task, index, normalizedFilterIds);
    taskFilterResults.push(filterResult);
    return filterResult.isMatch;
  });

  // Calculate metrics for filtered tasks
  const demandHours = filteredTasks.reduce((sum: number, task: any) => sum + task.monthlyHours, 0);
  const taskCount = filteredTasks.length;
  const uniqueClients = new Set(filteredTasks.map((task: any) => task.clientId));
  const clientCount = uniqueClients.size;

  const filterResult: DataPointFilterResult = {
    skillType: dataPoint.skillType,
    month: dataPoint.month,
    originalTasks: dataPoint.taskBreakdown.length,
    filteredTasks: filteredTasks.length,
    tasksRemoved: dataPoint.taskBreakdown.length - filteredTasks.length,
    filterEfficiency: `${((filteredTasks.length / dataPoint.taskBreakdown.length) * 100).toFixed(1)}%`,
    retainedTaskNames: filteredTasks.map((t: any) => t.taskName),
    excludedTaskNames: dataPoint.taskBreakdown.filter((t: any) => !filteredTasks.includes(t)).map((t: any) => t.taskName)
  };

  console.log(`🔍 [PREFERRED STAFF FILTER] Data point filtering result:`, filterResult);

  return {
    filteredDataPoint: {
      ...dataPoint,
      taskBreakdown: filteredTasks,
      demandHours,
      taskCount,
      clientCount
    },
    filterResult
  };
}

/**
 * Process a single task and determine if it matches the preferred staff filter
 */
export function processTask(
  task: any,
  index: number,
  normalizedFilterIds: string[]
): TaskFilterResult {
  const hasMatchingPreferredStaff = isStaffIdInArray(task.preferredStaffId, normalizedFilterIds);
  const taskNormalizedId = normalizeStaffId(task.preferredStaffId);
  
  const filterResult: TaskFilterResult = {
    taskName: task.taskName,
    taskStaffId: task.preferredStaffId,
    taskStaffIdType: typeof task.preferredStaffId,
    normalizedTaskStaffId: taskNormalizedId,
    taskStaffName: task.preferredStaffName,
    filterStaffIds: normalizedFilterIds,
    isMatch: hasMatchingPreferredStaff,
    comparisonMethod: 'Enhanced isStaffIdInArray with shared normalization',
    matchingFilterId: hasMatchingPreferredStaff ? normalizedFilterIds.find(id => id === taskNormalizedId) || null : null
  };

  console.log(`🔍 [PREFERRED STAFF FILTER] Task ${index + 1} enhanced comparison:`, filterResult);
  
  if (hasMatchingPreferredStaff) {
    console.log(`✅ [PREFERRED STAFF FILTER] INCLUDING task "${task.taskName}" with preferred staff "${task.preferredStaffName}" (ID: ${taskNormalizedId})`);
  } else {
    console.log(`❌ [PREFERRED STAFF FILTER] EXCLUDING task "${task.taskName}" - staff: ${task.preferredStaffName || 'None'} (ID: ${taskNormalizedId || 'None'})`);
  }
  
  return filterResult;
}

/**
 * Calculate totals and skill summary for filtered data
 */
export function calculateFilteredTotals(filteredDataPoints: any[]): {
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: { [key: string]: any };
  remainingSkills: string[];
} {
  const totalDemand = filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
  const totalTasks = filteredDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
  const totalClients = new Set(
    filteredDataPoints.flatMap(dp => 
      dp.taskBreakdown?.map((task: any) => task.clientId) || []
    )
  ).size;

  // Update skill summary based on filtered data
  const skillSummary: { [key: string]: any } = {};
  filteredDataPoints.forEach(dp => {
    if (!skillSummary[dp.skillType]) {
      skillSummary[dp.skillType] = {
        totalHours: 0,
        taskCount: 0,
        clientCount: 0,
        totalSuggestedRevenue: 0,
        totalExpectedLessSuggested: 0,
        averageFeeRate: 0
      };
    }
    
    skillSummary[dp.skillType].totalHours += dp.demandHours;
    skillSummary[dp.skillType].taskCount += dp.taskCount;
    skillSummary[dp.skillType].clientCount += dp.clientCount;
    
    if (dp.suggestedRevenue) {
      skillSummary[dp.skillType].totalSuggestedRevenue += dp.suggestedRevenue;
    }
    if (dp.expectedLessSuggested) {
      skillSummary[dp.skillType].totalExpectedLessSuggested += dp.expectedLessSuggested;
    }
  });

  const remainingSkills = Array.from(new Set(filteredDataPoints.map(dp => dp.skillType)));

  return {
    totalDemand,
    totalTasks,
    totalClients,
    skillSummary,
    remainingSkills
  };
}
