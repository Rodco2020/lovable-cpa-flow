
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from './baseFilterStrategy';

/**
 * FIXED: Preferred Staff Filter Strategy
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
    console.log(`🎯 [PREFERRED STAFF FILTER] FIXED: Applying filter with ${filters.preferredStaff.length} selected staff`);
    console.log(`🎯 [PREFERRED STAFF FILTER] Selected staff IDs:`, filters.preferredStaff);

    const startTime = performance.now();
    
    // Filter data points based on preferred staff assignments
    const filteredDataPoints = data.dataPoints.map(dataPoint => {
      if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
        console.log(`⚠️ [PREFERRED STAFF FILTER] No task breakdown for ${dataPoint.skillType}/${dataPoint.month}`);
        return { ...dataPoint, taskBreakdown: [], demandHours: 0, taskCount: 0, clientCount: 0 };
      }

      // FIXED: Filter tasks based on preferred staff
      const filteredTasks = dataPoint.taskBreakdown.filter(task => {
        // Include tasks that have a preferred staff ID matching our filter
        const hasMatchingPreferredStaff = task.preferredStaffId && 
          filters.preferredStaff.includes(task.preferredStaffId);
        
        if (hasMatchingPreferredStaff) {
          console.log(`✅ [PREFERRED STAFF FILTER] Including task "${task.taskName}" with preferred staff "${task.preferredStaffName}"`);
        }
        
        return hasMatchingPreferredStaff;
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

    console.log(`✅ [PREFERRED STAFF FILTER] FIXED: Filtering completed:`, {
      processingTime: `${processingTime.toFixed(2)}ms`,
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      totalDemand: totalDemand.toFixed(1),
      totalTasks,
      totalClients,
      skillsRetained: remainingSkills.length,
      filterEffectiveness: `${((1 - filteredDataPoints.length / data.dataPoints.length) * 100).toFixed(1)}% filtered out`
    });

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
