
/**
 * Data Filtering Optimizer
 * Handles efficient data filtering with early exit conditions
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from '../../logger';
import { FilteringOptions } from './types';
import { PERFORMANCE_OPERATIONS } from './constants';
import { PerformanceMonitor } from './performanceMonitor';

export class DataFilter {
  private static performanceMonitor = new PerformanceMonitor();

  /**
   * Efficient data filtering with early exit conditions
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: FilteringOptions = {}
  ): DemandMatrixData {
    const { enableEarlyExit = true, enablePreCalculation = true, enableLogging = true } = options;
    const startTime = performance.now();
    
    // Early exit for no filters
    if (enableEarlyExit && this.hasNoActiveFilters(filters)) {
      const processingTime = performance.now() - startTime;
      this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.FILTERING_NO_OP, processingTime);
      return data;
    }

    // Pre-calculate filter sets for efficiency
    const skillSet = enablePreCalculation ? new Set(filters.skills || []) : null;
    const clientSet = enablePreCalculation ? new Set(filters.clients || []) : null;
    
    // Filter data points efficiently
    const filteredDataPoints = data.dataPoints.filter(point => {
      // Skill filter
      if (skillSet && skillSet.size > 0 && !skillSet.has(point.skillType)) {
        return false;
      } else if (!skillSet && filters.skills && filters.skills.length > 0 && !filters.skills.includes(point.skillType)) {
        return false;
      }
      
      // Time horizon filter
      if (filters.timeHorizon) {
        const pointDate = new Date(point.month);
        if (pointDate < filters.timeHorizon.start || pointDate > filters.timeHorizon.end) {
          return false;
        }
      }
      
      // Client filter (check task breakdown)
      if (clientSet && clientSet.size > 0) {
        const hasMatchingClient = point.taskBreakdown?.some(task => 
          clientSet.has(task.clientId)
        );
        if (!hasMatchingClient) {
          return false;
        }
      } else if (!clientSet && filters.clients && filters.clients.length > 0) {
        const hasMatchingClient = point.taskBreakdown?.some(task => 
          filters.clients!.includes(task.clientId)
        );
        if (!hasMatchingClient) {
          return false;
        }
      }
      
      return true;
    });

    // Filter skills and months based on remaining data
    const remainingSkills = new Set(filteredDataPoints.map(p => p.skillType));
    const remainingMonths = new Set(filteredDataPoints.map(p => p.month));
    
    const result = {
      ...data,
      skills: data.skills.filter(skill => remainingSkills.has(skill)),
      months: data.months.filter(month => remainingMonths.has(month.key)),
      dataPoints: filteredDataPoints,
      totalDemand: filteredDataPoints.reduce((sum, point) => sum + point.demandHours, 0),
      totalTasks: filteredDataPoints.reduce((sum, point) => sum + point.taskCount, 0),
      totalClients: new Set(
        filteredDataPoints.flatMap(point => 
          point.taskBreakdown?.map(task => task.clientId) || []
        )
      ).size
    };
    
    const filteringTime = performance.now() - startTime;
    this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.FILTERING_OPTIMIZED, filteringTime);
    
    if (enableLogging) {
      debugLog(`Optimized filtering completed in ${filteringTime.toFixed(2)}ms`);
    }
    
    return result;
  }

  /**
   * Check if filters are effectively empty
   */
  private static hasNoActiveFilters(filters: DemandFilters): boolean {
    return (
      (!filters.skills || filters.skills.length === 0) &&
      (!filters.clients || filters.clients.length === 0) &&
      !filters.timeHorizon &&
      !filters.includeInactive
    );
  }
}
