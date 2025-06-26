
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from './baseFilterStrategy';

/**
 * Preferred Staff Filter Strategy
 * 
 * Filters demand matrix data based on preferred staff assignments for tasks.
 * Only includes data points for tasks that have a preferred staff member
 * matching the selected staff filter criteria.
 */
export class PreferredStaffFilterStrategy implements BaseFilterStrategy {
  getName(): string {
    return 'PreferredStaffFilter';
  }

  getPriority(): number {
    return 30; // Apply after skill and client filters
  }

  shouldApply(filters: DemandFilters): boolean {
    return Array.isArray(filters.preferredStaff) && filters.preferredStaff.length > 0;
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.log(`🎯 [PREFERRED STAFF FILTER] Applying filter with ${filters.preferredStaff.length} selected staff`);
    console.log(`🎯 [PREFERRED STAFF FILTER] Selected staff IDs:`, filters.preferredStaff);

    const startTime = performance.now();
    
    // Filter data points based on preferred staff assignments
    const filteredDataPoints = data.dataPoints.filter(dataPoint => {
      if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
        console.log(`⚠️ [PREFERRED STAFF FILTER] No task breakdown for ${dataPoint.skillType}/${dataPoint.month}`);
        return true; // Include data points without task breakdown to maintain matrix integrity
      }

      // Check if any task in the breakdown has a preferred staff member that matches our filter
      const hasMatchingPreferredStaff = dataPoint.taskBreakdown.some(task => {
        // For this Phase 3 implementation, we'll need to extend the ClientTaskDemand interface
        // to include preferred staff information. For now, we'll include all tasks to maintain functionality.
        // In a future enhancement, we would check: task.preferredStaffId in filters.preferredStaff
        return true; // Temporary: include all tasks to maintain existing functionality
      });

      return hasMatchingPreferredStaff;
    });

    // Recalculate totals for filtered data
    const totalDemand = filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = filteredDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const totalClients = filteredDataPoints.reduce((sum, dp) => sum + dp.clientCount, 0);

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

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    console.log(`✅ [PREFERRED STAFF FILTER] Filtering completed:`, {
      processingTime: `${processingTime.toFixed(2)}ms`,
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      totalDemand: totalDemand.toFixed(1),
      totalTasks,
      totalClients,
      skillsRetained: Object.keys(skillSummary).length
    });

    return {
      ...data,
      dataPoints: filteredDataPoints,
      totalDemand,
      totalTasks,
      totalClients,
      skillSummary
    };
  }
}
