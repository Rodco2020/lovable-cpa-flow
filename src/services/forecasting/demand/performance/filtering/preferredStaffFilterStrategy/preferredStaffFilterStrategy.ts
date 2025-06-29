
import { DemandMatrixData, DemandFilters, DemandDataPoint } from '@/types/demand';
import { FilterStrategy } from '../types';
import { StaffFilterAnalysis, StaffFilterDiagnostics, FilteringPerformanceMetrics } from './types';
import { normalizeStaffId, isStaffIdInArray } from '@/utils/staffIdUtils';
import { SkillSummaryUtils } from '@/services/forecasting/demand/utils/skillSummaryUtils';

/**
 * Preferred Staff Filter Strategy
 * 
 * Filters demand matrix data to show only tasks assigned to specific preferred staff members.
 * This strategy enables focused analysis of workload distribution among selected staff.
 */
export class PreferredStaffFilterStrategy implements FilterStrategy {
  getName(): string {
    return 'PreferredStaffFilter';
  }

  getPriority(): number {
    return 4; // High priority - staff-based filtering is specific
  }

  shouldApply(filters: DemandFilters): boolean {
    return !!(filters.preferredStaff && filters.preferredStaff.length > 0);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    if (!this.shouldApply(filters)) {
      console.log('🔄 [PREFERRED STAFF FILTER] No staff filter provided, returning original data');
      return data;
    }

    const startTime = performance.now();
    console.log('🎯 [PREFERRED STAFF FILTER] Applying staff-based filtering...', {
      staffFilter: filters.preferredStaff,
      originalDataPoints: data.dataPoints.length
    });

    // Normalize staff IDs for consistent comparison
    const normalizedStaffIds = filters.preferredStaff!
      .map(id => normalizeStaffId(id))
      .filter(id => id !== undefined) as string[];

    console.log('📋 [PREFERRED STAFF FILTER] Normalized staff IDs:', normalizedStaffIds);

    // Filter data points
    const filteredDataPoints = data.dataPoints
      .map(dataPoint => this.filterDataPoint(dataPoint, normalizedStaffIds))
      .filter(dataPoint => dataPoint.taskBreakdown && dataPoint.taskBreakdown.length > 0);

    // Recalculate totals
    const totalDemand = filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = filteredDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const totalClients = new Set(
      filteredDataPoints.flatMap(dp => 
        dp.taskBreakdown?.map(task => task.clientId) || []
      )
    ).size;

    // Recalculate skill summary with proper demandHours mapping
    const skillSummary: Record<string, any> = {};
    filteredDataPoints.forEach(dp => {
      if (!skillSummary[dp.skillType]) {
        skillSummary[dp.skillType] = { totalHours: 0, taskCount: 0, clientCount: 0 };
      }
      skillSummary[dp.skillType].totalHours += dp.demandHours;
      skillSummary[dp.skillType].taskCount += dp.taskCount;
      skillSummary[dp.skillType].clientCount += dp.clientCount;
    });

    // Convert to proper SkillSummary format with demandHours
    const properSkillSummary = Object.fromEntries(
      Object.entries(skillSummary).map(([skill, data]: [string, any]) => [
        skill,
        SkillSummaryUtils.createFromLegacyData(data)
      ])
    );

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    console.log('✅ [PREFERRED STAFF FILTER] Filtering completed:', {
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      totalDemand,
      totalTasks,
      totalClients,
      processingTime: `${processingTime.toFixed(2)}ms`
    });

    return {
      ...data,
      dataPoints: filteredDataPoints,
      totalDemand,
      totalTasks,
      totalClients,
      skillSummary: properSkillSummary
    };
  }

  private filterDataPoint(dataPoint: DemandDataPoint, staffIds: string[]): DemandDataPoint {
    if (!dataPoint.taskBreakdown) {
      return { ...dataPoint, taskBreakdown: [] };
    }

    const filteredTasks = dataPoint.taskBreakdown.filter(task => {
      const taskStaffId = normalizeStaffId(task.preferredStaffId);
      return taskStaffId && isStaffIdInArray(taskStaffId, staffIds);
    });

    // Recalculate data point metrics
    const demandHours = filteredTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
    const taskCount = filteredTasks.length;
    const clientCount = new Set(filteredTasks.map(task => task.clientId)).size;

    return {
      ...dataPoint,
      taskBreakdown: filteredTasks,
      demandHours,
      taskCount,
      clientCount
    };
  }

  // Additional utility methods for diagnostics and analysis
  analyzeStaffFilter(data: DemandMatrixData, filters: DemandFilters): StaffFilterAnalysis {
    const allTasks = data.dataPoints.flatMap(dp => dp.taskBreakdown || []);
    const tasksWithPreferredStaff = allTasks.filter(task => task.preferredStaffId);
    const uniqueStaffIds = [...new Set(tasksWithPreferredStaff.map(task => task.preferredStaffId))].filter(Boolean);

    return {
      totalTasks: allTasks.length,
      tasksWithPreferredStaff: tasksWithPreferredStaff.length,
      tasksWithoutPreferredStaff: allTasks.length - tasksWithPreferredStaff.length,
      uniquePreferredStaffIds: uniqueStaffIds as string[],
      preferredStaffNames: tasksWithPreferredStaff.map(task => task.preferredStaffName).filter(Boolean) as string[],
      filterCoverage: allTasks.length > 0 ? (tasksWithPreferredStaff.length / allTasks.length) * 100 : 0,
      tasksByStaff: new Map()
    };
  }
}
