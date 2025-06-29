
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { AbstractFilterStrategy } from '../baseFilterStrategy';
import { normalizeStaffId } from '@/utils/staffIdUtils';
import { SkillSummaryUtils } from '../../utils/skillSummaryUtils';
import { StaffFilterAnalysis, StaffFilterDiagnostics, FilteringPerformanceMetrics } from './types';

/**
 * Preferred Staff Filter Strategy - Core Implementation
 * 
 * This is the main implementation of the preferred staff filtering strategy.
 * It handles filtering demand matrix data by selected staff members while
 * maintaining data integrity and providing comprehensive diagnostics.
 */
export class PreferredStaffFilterStrategy extends AbstractFilterStrategy {
  constructor() {
    super('preferred-staff-filter', 2); // Medium priority
  }

  shouldApply(filters: DemandFilters): boolean {
    return !!(filters.preferredStaff && filters.preferredStaff.length > 0);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    if (!this.shouldApply(filters)) {
      return data;
    }

    console.log(`🎯 [STAFF FILTER] Applying preferred staff filter with ${filters.preferredStaff!.length} selected staff`);

    const startTime = performance.now();
    
    // Normalize staff IDs for consistent comparison
    const normalizedStaffIds = filters.preferredStaff!
      .map(id => normalizeStaffId(id))
      .filter(id => id !== null) as string[];

    if (normalizedStaffIds.length === 0) {
      console.warn('⚠️ [STAFF FILTER] No valid staff IDs after normalization');
      return this.createEmptyResult(data);
    }

    const staffIdSet = new Set(normalizedStaffIds);
    
    // Filter data points by staff assignment
    const filteredDataPoints = data.dataPoints.map(dataPoint => {
      const filteredTasks = dataPoint.taskBreakdown.filter(task => {
        if (!task.preferredStaffId) return false;
        
        const normalizedTaskStaffId = normalizeStaffId(task.preferredStaffId);
        return normalizedTaskStaffId && staffIdSet.has(normalizedTaskStaffId);
      });

      if (filteredTasks.length === 0) {
        return null; // Skip data points with no matching tasks
      }

      // Recalculate data point metrics based on filtered tasks
      const totalHours = filteredTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
      const clientSet = new Set(filteredTasks.map(task => task.clientId));

      return {
        ...dataPoint,
        demandHours: totalHours,
        totalHours: totalHours,
        taskCount: filteredTasks.length,
        clientCount: clientSet.size,
        taskBreakdown: filteredTasks
      };
    }).filter(dataPoint => dataPoint !== null);

    const result = this.recalculateTotals(data, filteredDataPoints);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;

    console.log(`✅ [STAFF FILTER] Filtered from ${data.dataPoints.length} to ${result.dataPoints.length} data points in ${processingTime.toFixed(2)}ms`);

    return result;
  }

  /**
   * Generate comprehensive diagnostics for the filtering operation
   */
  generateDiagnostics(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData,
    filters: DemandFilters,
    performanceMetrics: FilteringPerformanceMetrics
  ): StaffFilterDiagnostics {
    const analysis = this.analyzeStaffDistribution(originalData);
    
    return {
      filterInputs: {
        originalStaffIds: filters.preferredStaff || [],
        normalizedStaffIds: (filters.preferredStaff || [])
          .map(id => normalizeStaffId(id))
          .filter(id => id !== null) as string[],
        validationSuccess: true,
        invalidIds: []
      },
      dataAnalysis: analysis,
      filterResults: {
        originalDataPoints: originalData.dataPoints.length,
        filteredDataPoints: filteredData.dataPoints.length,
        totalTasksProcessed: originalData.totalTasks,
        tasksRetained: filteredData.totalTasks,
        tasksFiltered: originalData.totalTasks - filteredData.totalTasks,
        filterEfficiency: filteredData.totalTasks > 0 ? (filteredData.totalTasks / originalData.totalTasks) * 100 : 0
      },
      potentialIssues: [],
      recommendations: []
    };
  }

  /**
   * Analyze staff distribution in the data
   */
  private analyzeStaffDistribution(data: DemandMatrixData): StaffFilterAnalysis {
    let totalTasks = 0;
    let tasksWithPreferredStaff = 0;
    const staffIds = new Set<string>();
    const staffNames = new Set<string>();
    const tasksByStaff = new Map<string, number>();

    data.dataPoints.forEach(dataPoint => {
      dataPoint.taskBreakdown.forEach(task => {
        totalTasks++;
        
        if (task.preferredStaffId) {
          tasksWithPreferredStaff++;
          
          const normalizedId = normalizeStaffId(task.preferredStaffId);
          if (normalizedId) {
            staffIds.add(normalizedId);
            tasksByStaff.set(normalizedId, (tasksByStaff.get(normalizedId) || 0) + 1);
          }
          
          if (task.preferredStaffName) {
            staffNames.add(task.preferredStaffName);
          }
        }
      });
    });

    return {
      totalTasks,
      tasksWithPreferredStaff,
      tasksWithoutPreferredStaff: totalTasks - tasksWithPreferredStaff,
      uniquePreferredStaffIds: Array.from(staffIds),
      preferredStaffNames: Array.from(staffNames),
      filterCoverage: totalTasks > 0 ? (tasksWithPreferredStaff / totalTasks) * 100 : 0,
      tasksByStaff
    };
  }

  /**
   * Create an empty result when no data matches the filter
   */
  private createEmptyResult(originalData: DemandMatrixData): DemandMatrixData {
    return {
      ...originalData,
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {},
      clientTotals: new Map(),
      clientRevenue: new Map(),
      clientHourlyRates: new Map(),
      clientSuggestedRevenue: new Map(),
      clientExpectedLessSuggested: new Map(),
      revenueTotals: {
        totalSuggestedRevenue: 0,
        totalExpectedRevenue: 0,
        totalExpectedLessSuggested: 0
      }
    };
  }
}
