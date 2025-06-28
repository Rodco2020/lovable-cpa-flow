
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { normalizeStaffId } from '@/utils/staffIdUtils';
import { DataPointFilterResult, TaskFilterResult } from './types';

/**
 * ENHANCED Data Point Processing Utilities with SURGICAL PRECISION Field Access
 * 
 * This module has been enhanced to provide comprehensive debugging and validation
 * for the preferred staff filtering process, with special focus on ensuring
 * proper field access for the preferredStaffId field.
 */

/**
 * ENHANCED: Process a data point with comprehensive field access validation
 */
export function processDataPoint(
  dataPoint: DemandDataPoint,
  normalizedFilterIds: string[]
): DataPointFilterResult {
  console.log('🔍 [DATA POINT PROCESSOR] ENHANCED: Processing data point for skill:', dataPoint.skillType);

  if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
    console.log('⚠️ [DATA POINT PROCESSOR] No task breakdown available for data point');
    return {
      filteredDataPoint: { ...dataPoint, demandHours: 0, taskCount: 0 },
      tasksProcessed: 0,
      tasksRetained: 0,
      tasksFiltered: 0
    };
  }

  // Enhanced task processing with comprehensive debugging
  const taskResults = dataPoint.taskBreakdown.map(task => 
    processTaskForFilteringWithEnhancedDebugging(task, normalizedFilterIds)
  );

  // Extract retained tasks and log filtering results
  const retainedTasks = taskResults
    .filter(result => result.retained)
    .map(result => result.task);

  const filteredTasks = taskResults
    .filter(result => !result.retained)
    .map(result => result.task);

  // Log detailed processing results
  console.log('📊 [DATA POINT PROCESSOR] Processing results:', {
    skill: dataPoint.skillType,
    totalTasksProcessed: taskResults.length,
    tasksRetained: retainedTasks.length,
    tasksFiltered: filteredTasks.length,
    retainedTaskNames: retainedTasks.map(t => t.taskName),
    filteredTaskNames: filteredTasks.map(t => t.taskName),
    filterIds: normalizedFilterIds
  });

  // Create filtered data point
  const filteredDataPoint: DemandDataPoint = {
    ...dataPoint,
    taskBreakdown: retainedTasks,
    demandHours: retainedTasks.reduce((sum, task) => sum + task.monthlyHours, 0),
    taskCount: retainedTasks.length,
    clientCount: new Set(retainedTasks.map(task => task.clientId)).size
  };

  // Generate debug information
  const debugInfo = {
    taskFieldMappings: taskResults.map(result => ({
      taskName: result.task.taskName,
      hasPreferredStaff: !!result.task.preferredStaffId,
      preferredStaffId: result.task.preferredStaffId,
      fieldAccessWorking: result.debugInfo?.fieldAccess.fieldExists || false
    }))
  };

  return {
    filteredDataPoint,
    tasksProcessed: taskResults.length,
    tasksRetained: retainedTasks.length,
    tasksFiltered: filteredTasks.length,
    debugInfo
  };
}

/**
 * ENHANCED: Process task with comprehensive field access debugging
 */
function processTaskForFilteringWithEnhancedDebugging(
  task: ClientTaskDemand,
  normalizedFilterIds: string[]
): TaskFilterResult {
  console.log('🔬 [TASK PROCESSOR] ENHANCED: Processing task with surgical precision:', task.taskName);

  // STEP 1: Field Access Validation with Enhanced Debugging
  const fieldAccessResult = validateFieldAccess(task);
  
  // STEP 2: Early exit if no preferred staff
  if (!fieldAccessResult.preferredStaffId) {
    return {
      task,
      retained: false,
      filterReason: 'No preferred staff assigned',
      debugInfo: {
        fieldAccess: fieldAccessResult,
        normalization: { normalizedId: null, normalizationWorked: false },
        matching: { filterIds: normalizedFilterIds, isMatch: false, matchFound: false }
      }
    };
  }

  // STEP 3: Staff ID Normalization with Validation
  const normalizationResult = performStaffIdNormalization(fieldAccessResult.preferredStaffId);
  
  if (!normalizationResult.normalizedId) {
    return {
      task,
      retained: false,
      filterReason: 'Invalid staff ID format',
      debugInfo: {
        fieldAccess: fieldAccessResult,
        normalization: normalizationResult,
        matching: { filterIds: normalizedFilterIds, isMatch: false, matchFound: false }
      }
    };
  }

  // STEP 4: Filter Matching with Enhanced Validation
  const matchingResult = performFilterMatching(normalizationResult.normalizedId, normalizedFilterIds);

  // STEP 5: Generate comprehensive debug information
  const debugInfo = {
    fieldAccess: fieldAccessResult,
    normalization: normalizationResult,
    matching: matchingResult
  };

  // STEP 6: Log comprehensive filtering results
  logTaskFilteringResults(task, debugInfo, matchingResult.isMatch);

  return {
    task,
    retained: matchingResult.isMatch,
    filterReason: matchingResult.isMatch ? 'Matches preferred staff filter' : 'Does not match preferred staff filter',
    debugInfo
  };
}

/**
 * ENHANCED: Validate field access with comprehensive debugging
 */
function validateFieldAccess(task: ClientTaskDemand): {
  preferredStaffId: any;
  fieldExists: boolean;
  fieldType: string;
} {
  // SURGICAL PRECISION: Access the camelCase field as required
  const preferredStaffId = task.preferredStaffId;
  
  const fieldAccess = {
    preferredStaffId,
    fieldExists: task.hasOwnProperty('preferredStaffId'),
    fieldType: typeof preferredStaffId
  };

  console.log('🔍 [FIELD ACCESS] Comprehensive field validation:', {
    taskName: task.taskName,
    fieldAccess,
    fieldValue: preferredStaffId,
    isNull: preferredStaffId === null,
    isUndefined: preferredStaffId === undefined,
    isString: typeof preferredStaffId === 'string',
    hasValue: !!preferredStaffId,
    surgicalPrecisionApplied: true
  });

  return fieldAccess;
}

/**
 * ENHANCED: Perform staff ID normalization with validation
 */
function performStaffIdNormalization(staffId: any): {
  normalizedId: string | null;
  normalizationWorked: boolean;
} {
  const normalizedId = normalizeStaffId(staffId);
  const normalizationWorked = !!normalizedId;

  console.log('🔄 [NORMALIZATION] Staff ID normalization:', {
    originalId: staffId,
    normalizedId,
    normalizationWorked,
    inputType: typeof staffId,
    outputType: typeof normalizedId
  });

  return { normalizedId, normalizationWorked };
}

/**
 * ENHANCED: Perform filter matching with comprehensive validation
 */
function performFilterMatching(normalizedStaffId: string, filterIds: string[]): {
  filterIds: string[];
  isMatch: boolean;
  matchFound: boolean;
} {
  const isMatch = filterIds.includes(normalizedStaffId);
  
  console.log('🎯 [MATCHING] Filter matching validation:', {
    staffId: normalizedStaffId,
    filterIds,
    isMatch,
    matchFound: isMatch,
    filterCount: filterIds.length
  });

  return {
    filterIds,
    isMatch,
    matchFound: isMatch
  };
}

/**
 * ENHANCED: Log comprehensive task filtering results
 */
function logTaskFilteringResults(
  task: ClientTaskDemand,
  debugInfo: any,
  retained: boolean
): void {
  const logLevel = retained ? 'log' : 'warn';
  const symbol = retained ? '✅' : '❌';
  
  console[logLevel](`${symbol} [TASK FILTERING] ${retained ? 'RETAINED' : 'FILTERED'}:`, {
    taskName: task.taskName,
    clientName: task.clientName,
    retained,
    fieldAccess: debugInfo.fieldAccess,
    normalization: debugInfo.normalization,
    matching: debugInfo.matching,
    surgicalPrecisionComplete: true
  });
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

  console.log('📊 [TOTALS CALCULATION] Final filtered totals:', {
    totalDemand,
    totalTasks,
    totalClients,
    remainingSkills: remainingSkills.length,
    skillSummary
  });

  return {
    totalDemand,
    totalTasks,
    totalClients,
    skillSummary,
    remainingSkills
  };
}
