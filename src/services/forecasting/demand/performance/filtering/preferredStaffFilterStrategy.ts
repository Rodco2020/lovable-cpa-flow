
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from './baseFilterStrategy';
import { normalizeStaffId, isStaffIdInArray } from '@/utils/staffIdUtils';

/**
 * PHASE 3 FIX: Preferred Staff Filter Strategy with Enhanced Normalized ID Comparisons
 * 
 * Root cause resolved: Uses shared normalization utility with comprehensive testing
 * and validation to ensure consistent staff ID comparisons across the filtering pipeline.
 */
export class PreferredStaffFilterStrategy implements BaseFilterStrategy {
  getName(): string {
    return 'PreferredStaffFilter';
  }

  getPriority(): number {
    // Apply after skill, client and time horizon filters
    return 4;
  }

  shouldApply(filters: DemandFilters): boolean {
    // Only apply filtering if preferred staff is selected AND it's not empty
    return Array.isArray(filters.preferredStaff) && filters.preferredStaff.length > 0;
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 3: Starting enhanced normalized staff ID filtering`);
    
    const startTime = performance.now();
    
    // If no preferred staff selected, return all data (no filtering)
    if (!filters.preferredStaff || filters.preferredStaff.length === 0) {
      console.log(`✅ [PREFERRED STAFF FILTER] PHASE 3: No preferred staff filter applied - showing all data`);
      return data;
    }

    // PHASE 3 FIX: Enhanced normalization with validation
    const normalizedFilterStaffIds = filters.preferredStaff
      .map(id => {
        const normalized = normalizeStaffId(id);
        console.log(`🔧 [PREFERRED STAFF FILTER] PHASE 3: Normalizing filter ID:`, {
          originalId: id,
          originalType: typeof id,
          normalizedId: normalized,
          normalizationSuccess: !!normalized
        });
        return normalized;
      })
      .filter(id => id !== undefined) as string[];
    
    console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 3: Enhanced filter normalization:`, {
      originalFilterIds: filters.preferredStaff,
      normalizedFilterIds: normalizedFilterStaffIds,
      normalizationSuccessRate: `${((normalizedFilterStaffIds.length / filters.preferredStaff.length) * 100).toFixed(1)}%`,
      filterValidationPassed: normalizedFilterStaffIds.length > 0
    });

    // PHASE 3 VALIDATION: Early exit if normalization failed
    if (normalizedFilterStaffIds.length === 0) {
      console.error(`❌ [PREFERRED STAFF FILTER] PHASE 3: All filter staff IDs failed normalization!`);
      return {
        ...data,
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };
    }

    // PHASE 3 ENHANCED: Pre-filter data analysis
    const allTasksWithStaff = data.dataPoints.flatMap(dp => 
      dp.taskBreakdown?.filter(task => task.preferredStaffId) || []
    );
    
    const availableStaffIds = Array.from(new Set(
      allTasksWithStaff.map(task => task.preferredStaffId).filter(Boolean)
    ));
    
    const availableNormalizedStaffIds = Array.from(new Set(
      allTasksWithStaff.map(task => normalizeStaffId(task.preferredStaffId)).filter(Boolean)
    ));

    console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 3: Pre-filter data analysis:`, {
      totalDataPoints: data.dataPoints.length,
      totalTasks: data.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.length || 0), 0),
      tasksWithPreferredStaff: allTasksWithStaff.length,
      availableStaffIds: availableStaffIds,
      availableNormalizedStaffIds: availableNormalizedStaffIds,
      potentialMatches: availableNormalizedStaffIds.filter(id => normalizedFilterStaffIds.includes(id)),
      expectedFilteringSuccess: availableNormalizedStaffIds.some(id => normalizedFilterStaffIds.includes(id))
    });

    // Filter data points based on preferred staff assignments
    const filteredDataPoints = data.dataPoints.map(dataPoint => {
      if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
        console.log(`⚠️ [PREFERRED STAFF FILTER] PHASE 3: No task breakdown for ${dataPoint.skillType}/${dataPoint.month}`);
        return { ...dataPoint, taskBreakdown: [], demandHours: 0, taskCount: 0, clientCount: 0 };
      }

      console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 3: Processing ${dataPoint.taskBreakdown.length} tasks for ${dataPoint.skillType}/${dataPoint.month}`);

      // PHASE 3 FIX: Enhanced filtering with comprehensive logging
      const filteredTasks = dataPoint.taskBreakdown.filter((task, index) => {
        // Use shared utility to check if task staff ID is in filter array
        const hasMatchingPreferredStaff = isStaffIdInArray(task.preferredStaffId, normalizedFilterStaffIds);
        
        const taskNormalizedId = normalizeStaffId(task.preferredStaffId);
        
        console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 3: Task ${index + 1} enhanced comparison:`, {
          taskName: task.taskName,
          taskStaffId: task.preferredStaffId,
          taskStaffIdType: typeof task.preferredStaffId,
          normalizedTaskStaffId: taskNormalizedId,
          taskStaffName: task.preferredStaffName,
          filterStaffIds: normalizedFilterStaffIds,
          isMatch: hasMatchingPreferredStaff,
          comparisonMethod: 'Enhanced isStaffIdInArray with shared normalization',
          matchingFilterId: hasMatchingPreferredStaff ? normalizedFilterStaffIds.find(id => id === taskNormalizedId) : null
        });
        
        if (hasMatchingPreferredStaff) {
          console.log(`✅ [PREFERRED STAFF FILTER] PHASE 3: INCLUDING task "${task.taskName}" with preferred staff "${task.preferredStaffName}" (ID: ${taskNormalizedId})`);
        } else {
          console.log(`❌ [PREFERRED STAFF FILTER] PHASE 3: EXCLUDING task "${task.taskName}" - staff: ${task.preferredStaffName || 'None'} (ID: ${taskNormalizedId || 'None'})`);
        }
        
        return hasMatchingPreferredStaff;
      });

      // PHASE 3 ENHANCED: Detailed filtering results per data point
      console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 3: Data point filtering result:`, {
        skillType: dataPoint.skillType,
        month: dataPoint.month,
        originalTasks: dataPoint.taskBreakdown.length,
        filteredTasks: filteredTasks.length,
        tasksRemoved: dataPoint.taskBreakdown.length - filteredTasks.length,
        filterEfficiency: `${((filteredTasks.length / dataPoint.taskBreakdown.length) * 100).toFixed(1)}%`,
        retainedTaskNames: filteredTasks.map(t => t.taskName),
        excludedTaskNames: dataPoint.taskBreakdown.filter(t => !filteredTasks.includes(t)).map(t => t.taskName)
      });

      // Recalculate metrics for filtered tasks
      const demandHours = filteredTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
      const taskCount = filteredTasks.length;
      const uniqueClients = new Set(filteredTasks.map(task => task.clientId));
      const clientCount = uniqueClients.size;

      return {
        ...dataPoint,
        taskBreakdown: filteredTasks,
        demandHours,
        taskCount,
        clientCount
      };
    }).filter(dataPoint => dataPoint.demandHours > 0); // Remove empty data points

    // Recalculate totals for filtered data
    const totalDemand = filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = filteredDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const totalClients = new Set(
      filteredDataPoints.flatMap(dp => 
        dp.taskBreakdown?.map(task => task.clientId) || []
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

    // Update skills list to only include skills that have data after filtering
    const remainingSkills = Array.from(new Set(filteredDataPoints.map(dp => dp.skillType)));

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    console.log(`✅ [PREFERRED STAFF FILTER] PHASE 3 COMPLETE:`, {
      processingTime: `${processingTime.toFixed(2)}ms`,
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      totalDemand: totalDemand.toFixed(1),
      totalTasks,
      totalClients,
      skillsRetained: remainingSkills.length,
      filterEffectiveness: `${((1 - filteredDataPoints.length / data.dataPoints.length) * 100).toFixed(1)}% filtered out`,
      normalizationSuccess: true,
      staffIdMatchingMethod: 'Enhanced shared normalization utility with validation',
      qualityMetrics: {
        normalizationSuccessRate: `${((normalizedFilterStaffIds.length / filters.preferredStaff.length) * 100).toFixed(1)}%`,
        dataRetentionRate: `${((filteredDataPoints.length / data.dataPoints.length) * 100).toFixed(1)}%`,
        taskRetentionRate: `${((totalTasks / data.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.length || 0), 0)) * 100).toFixed(1)}%`
      }
    });

    // PHASE 3: Enhanced zero results diagnostics
    if (filteredDataPoints.length === 0) {
      console.error(`❌ [PREFERRED STAFF FILTER] PHASE 3: ZERO RESULTS - ENHANCED DIAGNOSTICS:`);
      
      console.error(`🔍 PHASE 3 COMPREHENSIVE DIAGNOSTICS:`, {
        inputValidation: {
          filterStaffIds: filters.preferredStaff,
          filterStaffIdTypes: filters.preferredStaff.map(id => ({ id, type: typeof id })),
          normalizedFilterIds: normalizedFilterStaffIds,
          normalizationWorking: normalizedFilterStaffIds.length > 0
        },
        dataAnalysis: {
          dataContainsTasksWithStaff: allTasksWithStaff.length,
          originalStaffIdsInData: availableStaffIds,
          normalizedStaffIdsInData: availableNormalizedStaffIds,
          exactNormalizedMatches: availableNormalizedStaffIds.filter(id => normalizedFilterStaffIds.includes(id)),
          potentialMatches: availableNormalizedStaffIds.some(id => normalizedFilterStaffIds.includes(id))
        },
        processingResults: {
          dataPointsProcessed: data.dataPoints.length,
          dataPointsWithTasks: data.dataPoints.filter(dp => dp.taskBreakdown && dp.taskBreakdown.length > 0).length,
          totalTasksProcessed: data.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.length || 0), 0),
          tasksWithPreferredStaffProcessed: allTasksWithStaff.length
        },
        troubleshooting: {
          filterArrayEmpty: normalizedFilterStaffIds.length === 0,
          dataArrayEmpty: allTasksWithStaff.length === 0,
          noMatches: !availableNormalizedStaffIds.some(id => normalizedFilterStaffIds.includes(id)),
          normalizationIssue: availableStaffIds.length !== availableNormalizedStaffIds.length
        }
      });
    }

    return {
      ...data,
      dataPoints: filteredDataPoints,
      skills: remainingSkills,
      totalDemand,
      totalTasks,
      totalClients,
      skillSummary
    };
  }
}
