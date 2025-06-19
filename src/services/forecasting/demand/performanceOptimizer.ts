
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from '../logger';

/**
 * Demand Performance Optimizer
 * Optimizes filtering and processing of demand matrix data
 */
export class DemandPerformanceOptimizer {
  /**
   * Optimize filtering for demand matrix data with preferred staff support
   */
  static optimizeFiltering(matrixData: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    debugLog('Optimizing demand matrix filtering with preferred staff support', { filters });

    let filteredData = { ...matrixData };

    // Apply skill filters
    if (filters.skills && filters.skills.length > 0) {
      filteredData = this.applySkillFilter(filteredData, filters.skills);
    }

    // Apply client filters
    if (filters.clients && filters.clients.length > 0) {
      filteredData = this.applyClientFilter(filteredData, filters.clients);
    }

    // Apply preferred staff filters
    if (filters.preferredStaff) {
      filteredData = this.applyPreferredStaffFilter(filteredData, filters.preferredStaff);
    }

    // Apply time horizon filters
    if (filters.timeHorizon) {
      filteredData = this.applyTimeHorizonFilter(filteredData, filters.timeHorizon);
    }

    // Recalculate totals after filtering
    filteredData = this.recalculateTotals(filteredData);

    debugLog('Filtering optimization complete', {
      originalDataPoints: matrixData.dataPoints.length,
      filteredDataPoints: filteredData.dataPoints.length,
      originalTotalDemand: matrixData.totalDemand,
      filteredTotalDemand: filteredData.totalDemand
    });

    return filteredData;
  }

  /**
   * Apply skill filter to matrix data
   */
  private static applySkillFilter(matrixData: DemandMatrixData, skills: string[]): DemandMatrixData {
    const filteredDataPoints = matrixData.dataPoints.filter(point =>
      skills.includes(point.skillType)
    );

    return {
      ...matrixData,
      dataPoints: filteredDataPoints,
      skills: matrixData.skills.filter(skill => skills.includes(skill))
    };
  }

  /**
   * Apply client filter to matrix data
   */
  private static applyClientFilter(matrixData: DemandMatrixData, clients: string[]): DemandMatrixData {
    const filteredDataPoints = matrixData.dataPoints.map(point => ({
      ...point,
      taskBreakdown: point.taskBreakdown?.filter(task =>
        clients.includes(task.clientId)
      ) || []
    })).filter(point => point.taskBreakdown.length > 0);

    return {
      ...matrixData,
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Apply preferred staff filter to matrix data
   */
  private static applyPreferredStaffFilter(
    matrixData: DemandMatrixData, 
    preferredStaffFilter: NonNullable<DemandFilters['preferredStaff']>
  ): DemandMatrixData {
    const { staffIds, includeUnassigned, showOnlyPreferred } = preferredStaffFilter;

    const filteredDataPoints = matrixData.dataPoints.map(point => {
      let filteredTaskBreakdown = point.taskBreakdown || [];

      if (showOnlyPreferred) {
        // Show only tasks with preferred staff assignments
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task =>
          task.preferredStaff?.staffId
        );
      }

      if (staffIds && staffIds.length > 0) {
        // Filter by specific staff IDs
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const hasMatchingStaff = task.preferredStaff?.staffId && staffIds.includes(task.preferredStaff.staffId);
          const isUnassigned = !task.preferredStaff?.staffId;
          
          return hasMatchingStaff || (includeUnassigned && isUnassigned);
        });
      } else if (!includeUnassigned) {
        // If no specific staff IDs but not including unassigned, show only assigned tasks
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task =>
          task.preferredStaff?.staffId
        );
      }

      return {
        ...point,
        taskBreakdown: filteredTaskBreakdown
      };
    }).filter(point => point.taskBreakdown.length > 0);

    return {
      ...matrixData,
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Apply time horizon filter to matrix data
   */
  private static applyTimeHorizonFilter(
    matrixData: DemandMatrixData,
    timeHorizon: { start: Date; end: Date }
  ): DemandMatrixData {
    const filteredMonths = matrixData.months.filter(month => {
      const monthDate = new Date(month.key + '-01');
      return monthDate >= timeHorizon.start && monthDate <= timeHorizon.end;
    });

    const filteredDataPoints = matrixData.dataPoints.filter(point =>
      filteredMonths.some(month => month.key === point.month)
    );

    return {
      ...matrixData,
      months: filteredMonths,
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Recalculate totals after filtering
   */
  private static recalculateTotals(matrixData: DemandMatrixData): DemandMatrixData {
    const totalDemand = matrixData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
    const totalTasks = matrixData.dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
    
    // Count unique clients across all data points
    const uniqueClients = new Set<string>();
    matrixData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        uniqueClients.add(task.clientId);
      });
    });

    return {
      ...matrixData,
      totalDemand,
      totalTasks,
      totalClients: uniqueClients.size
    };
  }
}
