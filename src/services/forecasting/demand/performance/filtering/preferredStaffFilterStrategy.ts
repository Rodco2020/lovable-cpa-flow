
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from './baseFilterStrategy';

/**
 * INVESTIGATION FIX: Preferred Staff Filter Strategy
 * 
 * Root cause identified: Data type mismatch in staff ID comparison
 * Solution: Type-safe comparison with detailed logging for staff ID flow tracing
 */
export class PreferredStaffFilterStrategy implements BaseFilterStrategy {
  getName(): string {
    return 'PreferredStaffFilter';
  }

  getPriority(): number {
    return 30; // Apply after skill and client filters
  }

  shouldApply(filters: DemandFilters): boolean {
    // Only apply filtering if preferred staff is selected AND it's not empty
    return Array.isArray(filters.preferredStaff) && filters.preferredStaff.length > 0;
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.log(`🔍 [PREFERRED STAFF FILTER] INVESTIGATION: Starting staff ID flow trace`);
    console.log(`🔍 [PREFERRED STAFF FILTER] Filter staff selection:`, {
      selectedStaff: filters.preferredStaff,
      selectionType: typeof filters.preferredStaff[0],
      selectionLength: filters.preferredStaff.length
    });

    const startTime = performance.now();
    
    // INVESTIGATION: If no preferred staff selected, return all data (no filtering)
    if (!filters.preferredStaff || filters.preferredStaff.length === 0) {
      console.log(`✅ [PREFERRED STAFF FILTER] No preferred staff filter applied - showing all data`);
      return data;
    }

    // INVESTIGATION: Log data structure before filtering
    const sampleDataPoint = data.dataPoints[0];
    if (sampleDataPoint?.taskBreakdown?.[0]) {
      const sampleTask = sampleDataPoint.taskBreakdown[0];
      console.log(`🔍 [PREFERRED STAFF FILTER] Sample task structure:`, {
        taskName: sampleTask.taskName,
        preferredStaffId: sampleTask.preferredStaffId,
        preferredStaffIdType: typeof sampleTask.preferredStaffId,
        preferredStaffName: sampleTask.preferredStaffName,
        hasPreferredStaff: !!sampleTask.preferredStaffId
      });
    }

    // INVESTIGATION: Convert filter staff IDs to strings for consistent comparison
    const normalizedFilterStaffIds = filters.preferredStaff.map(id => String(id).trim());
    console.log(`🔍 [PREFERRED STAFF FILTER] Normalized filter staff IDs:`, normalizedFilterStaffIds);

    // Filter data points based on preferred staff assignments
    const filteredDataPoints = data.dataPoints.map(dataPoint => {
      if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
        console.log(`⚠️ [PREFERRED STAFF FILTER] No task breakdown for ${dataPoint.skillType}/${dataPoint.month}`);
        return { ...dataPoint, taskBreakdown: [], demandHours: 0, taskCount: 0, clientCount: 0 };
      }

      // INVESTIGATION: Log task filtering process
      console.log(`🔍 [PREFERRED STAFF FILTER] Processing ${dataPoint.taskBreakdown.length} tasks for ${dataPoint.skillType}/${dataPoint.month}`);

      // FIXED: Type-safe filtering with detailed logging
      const filteredTasks = dataPoint.taskBreakdown.filter((task, index) => {
        // INVESTIGATION: Normalize task staff ID for comparison
        const taskStaffId = task.preferredStaffId ? String(task.preferredStaffId).trim() : null;
        
        // INVESTIGATION: Log each comparison
        const hasMatchingPreferredStaff = taskStaffId && normalizedFilterStaffIds.includes(taskStaffId);
        
        console.log(`🔍 [PREFERRED STAFF FILTER] Task ${index + 1}/${dataPoint.taskBreakdown.length} comparison:`, {
          taskName: task.taskName,
          taskStaffId: taskStaffId,
          taskStaffIdType: typeof taskStaffId,
          taskStaffName: task.preferredStaffName,
          filterStaffIds: normalizedFilterStaffIds,
          isMatch: hasMatchingPreferredStaff,
          comparisonDetails: normalizedFilterStaffIds.map(filterId => ({
            filterId,
            taskId: taskStaffId,
            exactMatch: filterId === taskStaffId,
            caseInsensitiveMatch: filterId?.toLowerCase() === taskStaffId?.toLowerCase()
          }))
        });
        
        if (hasMatchingPreferredStaff) {
          console.log(`✅ [PREFERRED STAFF FILTER] INCLUDING task "${task.taskName}" with preferred staff "${task.preferredStaffName}" (ID: ${taskStaffId})`);
        } else {
          console.log(`❌ [PREFERRED STAFF FILTER] EXCLUDING task "${task.taskName}" - staff: ${task.preferredStaffName || 'None'} (ID: ${taskStaffId || 'null'})`);
        }
        
        return hasMatchingPreferredStaff;
      });

      // INVESTIGATION: Log filtering results per data point
      console.log(`🔍 [PREFERRED STAFF FILTER] Data point filtering result:`, {
        skillType: dataPoint.skillType,
        month: dataPoint.month,
        originalTasks: dataPoint.taskBreakdown.length,
        filteredTasks: filteredTasks.length,
        tasksRemoved: dataPoint.taskBreakdown.length - filteredTasks.length
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

    console.log(`✅ [PREFERRED STAFF FILTER] INVESTIGATION COMPLETE:`, {
      processingTime: `${processingTime.toFixed(2)}ms`,
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      totalDemand: totalDemand.toFixed(1),
      totalTasks,
      totalClients,
      skillsRetained: remainingSkills.length,
      filterEffectiveness: `${((1 - filteredDataPoints.length / data.dataPoints.length) * 100).toFixed(1)}% filtered out`,
      staffIdComparisonSuccess: filteredDataPoints.length > 0
    });

    // INVESTIGATION: Enhanced diagnostics for zero results
    if (filteredDataPoints.length === 0) {
      console.error(`❌ [PREFERRED STAFF FILTER] ZERO RESULTS - INVESTIGATION RESULTS:`);
      
      // Show all available staff IDs in the data
      const allTasksWithStaff = data.dataPoints.flatMap(dp => 
        dp.taskBreakdown?.filter(task => task.preferredStaffId) || []
      );
      
      const availableStaffIds = Array.from(new Set(
        allTasksWithStaff.map(task => String(task.preferredStaffId).trim())
      ));
      
      const availableStaffNames = Array.from(new Set(
        allTasksWithStaff.map(task => task.preferredStaffName).filter(Boolean)
      ));

      console.error(`🔍 Data contains ${allTasksWithStaff.length} tasks with preferred staff`);
      console.error(`🔍 Available staff IDs in data:`, availableStaffIds);
      console.error(`🔍 Available staff names in data:`, availableStaffNames);
      console.error(`🔍 Filter looking for staff IDs:`, normalizedFilterStaffIds);
      console.error(`🔍 Exact matches found:`, availableStaffIds.filter(id => normalizedFilterStaffIds.includes(id)));
      
      // Check for potential UUID format issues
      console.error(`🔍 UUID format analysis:`, {
        filterStaffUUIDs: normalizedFilterStaffIds.map(id => ({
          id,
          length: id.length,
          hasHyphens: id.includes('-'),
          isValidUUIDFormat: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        })),
        dataStaffUUIDs: availableStaffIds.map(id => ({
          id,
          length: id.length,
          hasHyphens: id.includes('-'),
          isValidUUIDFormat: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        }))
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
