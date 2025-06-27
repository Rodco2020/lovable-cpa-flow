
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from './baseFilterStrategy';
import { normalizeStaffId, isStaffIdInArray } from '@/utils/staffIdUtils';

/**
 * PHASE 2 FIX: Preferred Staff Filter Strategy with Normalized ID Comparisons
 * 
 * Root cause resolved: Uses shared normalization utility to ensure consistent
 * staff ID comparisons across the filtering pipeline.
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
    console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 2: Starting normalized staff ID filtering`);
    
    const startTime = performance.now();
    
    // If no preferred staff selected, return all data (no filtering)
    if (!filters.preferredStaff || filters.preferredStaff.length === 0) {
      console.log(`✅ [PREFERRED STAFF FILTER] PHASE 2: No preferred staff filter applied - showing all data`);
      return data;
    }

    // PHASE 2 FIX: Normalize all filter staff IDs using shared utility
    const normalizedFilterStaffIds = filters.preferredStaff
      .map(id => normalizeStaffId(id))
      .filter(id => id !== undefined) as string[];
    
    console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 2: Normalized filter staff IDs:`, {
      originalFilterIds: filters.preferredStaff,
      normalizedFilterIds: normalizedFilterStaffIds,
      normalizationSuccessful: normalizedFilterStaffIds.length === filters.preferredStaff.length
    });

    // Log data structure before filtering
    const sampleDataPoint = data.dataPoints[0];
    if (sampleDataPoint?.taskBreakdown?.[0]) {
      const sampleTask = sampleDataPoint.taskBreakdown[0];
      console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 2: Sample task structure:`, {
        taskName: sampleTask.taskName,
        preferredStaffId: sampleTask.preferredStaffId,
        preferredStaffName: sampleTask.preferredStaffName,
        hasPreferredStaff: !!sampleTask.preferredStaffId,
        isAlreadyNormalized: sampleTask.preferredStaffId === normalizeStaffId(sampleTask.preferredStaffId)
      });
    }

    // Filter data points based on preferred staff assignments
    const filteredDataPoints = data.dataPoints.map(dataPoint => {
      if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
        console.log(`⚠️ [PREFERRED STAFF FILTER] PHASE 2: No task breakdown for ${dataPoint.skillType}/${dataPoint.month}`);
        return { ...dataPoint, taskBreakdown: [], demandHours: 0, taskCount: 0, clientCount: 0 };
      }

      console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 2: Processing ${dataPoint.taskBreakdown.length} tasks for ${dataPoint.skillType}/${dataPoint.month}`);

      // PHASE 2 FIX: Use normalized ID comparison with shared utility
      const filteredTasks = dataPoint.taskBreakdown.filter((task, index) => {
        // Use shared utility to check if task staff ID is in filter array
        const hasMatchingPreferredStaff = isStaffIdInArray(task.preferredStaffId, normalizedFilterStaffIds);
        
        console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 2: Task ${index + 1} comparison:`, {
          taskName: task.taskName,
          taskStaffId: task.preferredStaffId,
          normalizedTaskStaffId: normalizeStaffId(task.preferredStaffId),
          taskStaffName: task.preferredStaffName,
          filterStaffIds: normalizedFilterStaffIds,
          isMatch: hasMatchingPreferredStaff,
          comparisonMethod: 'isStaffIdInArray utility'
        });
        
        if (hasMatchingPreferredStaff) {
          console.log(`✅ [PREFERRED STAFF FILTER] PHASE 2: INCLUDING task "${task.taskName}" with preferred staff "${task.preferredStaffName}"`);
        } else {
          console.log(`❌ [PREFERRED STAFF FILTER] PHASE 2: EXCLUDING task "${task.taskName}" - staff: ${task.preferredStaffName || 'None'}`);
        }
        
        return hasMatchingPreferredStaff;
      });

      // Log filtering results per data point
      console.log(`🔍 [PREFERRED STAFF FILTER] PHASE 2: Data point filtering result:`, {
        skillType: dataPoint.skillType,
        month: dataPoint.month,
        originalTasks: dataPoint.taskBreakdown.length,
        filteredTasks: filteredTasks.length,
        tasksRemoved: dataPoint.taskBreakdown.length - filteredTasks.length,
        filterEfficiency: `${((filteredTasks.length / dataPoint.taskBreakdown.length) * 100).toFixed(1)}%`
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

    console.log(`✅ [PREFERRED STAFF FILTER] PHASE 2 COMPLETE:`, {
      processingTime: `${processingTime.toFixed(2)}ms`,
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      totalDemand: totalDemand.toFixed(1),
      totalTasks,
      totalClients,
      skillsRetained: remainingSkills.length,
      filterEffectiveness: `${((1 - filteredDataPoints.length / data.dataPoints.length) * 100).toFixed(1)}% filtered out`,
      normalizationSuccess: true,
      staffIdMatchingMethod: 'Shared normalization utility'
    });

    // PHASE 2: Enhanced diagnostics for zero results
    if (filteredDataPoints.length === 0) {
      console.error(`❌ [PREFERRED STAFF FILTER] PHASE 2: ZERO RESULTS - NORMALIZATION DIAGNOSTICS:`);
      
      // Show all available staff IDs in the data
      const allTasksWithStaff = data.dataPoints.flatMap(dp => 
        dp.taskBreakdown?.filter(task => task.preferredStaffId) || []
      );
      
      const availableStaffIds = Array.from(new Set(
        allTasksWithStaff.map(task => task.preferredStaffId).filter(Boolean)
      ));
      
      const availableNormalizedStaffIds = Array.from(new Set(
        allTasksWithStaff.map(task => normalizeStaffId(task.preferredStaffId)).filter(Boolean)
      ));

      console.error(`🔍 PHASE 2 DIAGNOSTICS:`, {
        dataContainsTasksWithStaff: allTasksWithStaff.length,
        originalStaffIdsInData: availableStaffIds,
        normalizedStaffIdsInData: availableNormalizedStaffIds,
        filterLookingForNormalizedIds: normalizedFilterStaffIds,
        exactNormalizedMatches: availableNormalizedStaffIds.filter(id => normalizedFilterStaffIds.includes(id)),
        normalizationWorking: availableStaffIds.length === availableNormalizedStaffIds.length
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
