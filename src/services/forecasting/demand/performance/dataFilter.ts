
/**
 * Data Filtering Optimizer
 * Handles efficient data filtering with early exit conditions
 * 
 * Updated to use the new filter strategy pattern while maintaining
 * backward compatibility and existing functionality.
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from '../../logger';
import { FilteringOptions } from './types';
import { PERFORMANCE_OPERATIONS } from './constants';
import { PerformanceMonitor } from './performanceMonitor';
import { FilterStrategyFactory } from './filtering/filterStrategyFactory';

export class DataFilter {
  private static performanceMonitor = new PerformanceMonitor();

  /**
   * ENHANCED: Efficient data filtering using the new strategy pattern
   * 
   * Maintains all existing functionality while using the new modular filter architecture.
   * Provides backward compatibility and improved maintainability.
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: FilteringOptions = {}
  ): DemandMatrixData {
    const { enableEarlyExit = true, enableLogging = true } = options;
    const startTime = performance.now();
    
    if (enableLogging) {
      console.log(`🔍 [DATA FILTER] Starting optimization with filters:`, {
        skillsFilter: filters.skills?.length === 0 ? 'NONE (show all)' : filters.skills,
        clientsFilter: filters.clients?.length === 0 ? 'NONE (show all)' : filters.clients,
        hasTimeHorizon: !!filters.timeHorizon,
        includeInactive: filters.includeInactive
      });
    }

    // Early exit for no active filters
    if (enableEarlyExit && !FilterStrategyFactory.hasActiveFilters(filters)) {
      const processingTime = performance.now() - startTime;
      this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.FILTERING_NO_OP, processingTime);
      
      if (enableLogging) {
        console.log(`✨ [DATA FILTER] No active filters detected, returning original data`);
      }
      return data;
    }

    // Apply filters using the strategy pattern
    const result = FilterStrategyFactory.applyFilters(data, filters);
    
    const filteringTime = performance.now() - startTime;
    this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.FILTERING_OPTIMIZED, filteringTime);
    
    if (enableLogging) {
      console.log(`✅ [DATA FILTER] Filtering completed:`, {
        processingTime: `${filteringTime.toFixed(2)}ms`,
        originalDataPoints: data.dataPoints.length,
        filteredDataPoints: result.dataPoints.length,
        remainingSkills: result.skills.length,
        remainingMonths: result.months.length,
        totalDemand: result.totalDemand.toFixed(1),
        totalTasks: result.totalTasks,
        totalClients: result.totalClients,
        appliedFilters: FilterStrategyFactory.getActiveFilterNames(filters)
      });
    }
    
    return result;
  }

  /**
   * LEGACY: Check if filters are effectively empty
   * 
   * Maintained for backward compatibility. New code should use
   * FilterStrategyFactory.hasActiveFilters instead.
   * 
   * @deprecated Use FilterStrategyFactory.hasActiveFilters instead
   */
  private static hasNoActiveFilters(filters: DemandFilters): boolean {
    return !FilterStrategyFactory.hasActiveFilters(filters);
  }

  /**
   * Get information about available filter strategies
   * 
   * Useful for debugging and understanding the current filter configuration.
   */
  static getFilterInfo(): {
    availableStrategies: string[];
    totalStrategies: number;
  } {
    const strategies = FilterStrategyFactory.getStrategies();
    return {
      availableStrategies: strategies.map(s => s.getName()),
      totalStrategies: strategies.length
    };
  }
}
