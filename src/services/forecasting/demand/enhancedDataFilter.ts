/**
 * Phase 4: Enhanced Data Filter Service
 * 
 * Integrates the new advanced filtering engine with comprehensive validation
 * and performance monitoring while maintaining backward compatibility
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { AdvancedFilteringEngine, FilteringValidator } from './performance';
import { debugLog } from '../logger';

/**
 * Phase 4: Enhanced filtering service with comprehensive validation and monitoring
 */
export class EnhancedDataFilter {
  /**
   * Execute comprehensive filtering with validation and performance monitoring
   */
  static async executeComprehensiveFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: {
      enableValidation?: boolean;
      enablePerformanceMonitoring?: boolean;
      enableLogging?: boolean;
      fallbackOnError?: boolean;
    } = {}
  ): Promise<{
    filteredData: DemandMatrixData;
    success: boolean;
    validationResult?: any;
    performanceStats?: any;
    errors?: string[];
  }> {
    const {
      enableValidation = true,
      enablePerformanceMonitoring = true,
      enableLogging = true,
      fallbackOnError = true
    } = options;

    console.log(`🚀 [PHASE 4 ENHANCED FILTER] Starting comprehensive filtering:`, {
      originalDataPoints: data.dataPoints.length,
      filtersCount: Object.keys(filters).length,
      enableValidation,
      enablePerformanceMonitoring,
      timestamp: new Date().toISOString()
    });

    try {
      // Execute advanced filtering
      const filteringResult = await AdvancedFilteringEngine.executeFiltering(data, filters);

      let validationResult;
      if (enableValidation) {
        // Validate filtering results
        validationResult = FilteringValidator.validateFilteringResult(
          data,
          filters,
          filteringResult
        );

        if (!validationResult.isValid && !fallbackOnError) {
          console.error(`❌ [PHASE 4 ENHANCED FILTER] Validation failed:`, validationResult);
          return {
            filteredData: data, // Return original data
            success: false,
            validationResult,
            errors: validationResult.errors.map(e => e.message)
          };
        }
      }

      if (enableLogging) {
        console.log(`✅ [PHASE 4 ENHANCED FILTER] Filtering completed successfully:`, {
          originalDataPoints: data.dataPoints.length,
          filteredDataPoints: filteringResult.filteredData.dataPoints.length,
          processingTime: filteringResult.performanceStats.totalProcessingTime,
          filterEfficiency: filteringResult.filteringMetrics.filterEfficiency,
          validationPassed: validationResult?.isValid ?? 'not-validated'
        });
      }

      return {
        filteredData: filteringResult.filteredData,
        success: true,
        validationResult,
        performanceStats: enablePerformanceMonitoring ? filteringResult.performanceStats : undefined
      };

    } catch (error) {
      console.error(`❌ [PHASE 4 ENHANCED FILTER] Critical error:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackOnError
      });

      if (fallbackOnError) {
        // Fallback to original data
        return {
          filteredData: data,
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown filtering error']
        };
      } else {
        throw error;
      }
    }
  }

  /**
   * Backward-compatible filtering method that uses the enhanced engine
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: any = {}
  ): DemandMatrixData {
    debugLog('Phase 4: Using enhanced filtering engine for backward compatibility', { filters });

    try {
      // Use the enhanced filtering engine synchronously (simplified version)
      return this.synchronousFiltering(data, filters);
    } catch (error) {
      console.error('❌ [PHASE 4] Fallback filtering error:', error);
      return data; // Return original data as fallback
    }
  }

  /**
   * Synchronous version of filtering for backward compatibility
   */
  private static synchronousFiltering(
    data: DemandMatrixData,
    filters: DemandFilters
  ): DemandMatrixData {
    let filteredData = { ...data };

    // Apply time horizon filter
    if (filters.timeHorizon || filters.dateRange) {
      const timeRange = filters.timeHorizon || filters.dateRange;
      if (timeRange) {
        filteredData = this.applyTimeHorizonFilter(filteredData, timeRange);
      }
    }

    // Apply skill filter
    if (filters.skillTypes && filters.skillTypes.length > 0) {
      filteredData = this.applySkillFilter(filteredData, filters.skillTypes);
    } else if (filters.skills && filters.skills.length > 0) {
      filteredData = this.applySkillFilter(filteredData, filters.skills);
    }

    // Apply client filter
    if (filters.clientIds && filters.clientIds.length > 0) {
      filteredData = this.applyClientFilter(filteredData, filters.clientIds);
    } else if (filters.clients && filters.clients.length > 0) {
      filteredData = this.applyClientFilter(filteredData, filters.clients);
    }

    // Phase 4: Apply enhanced preferred staff filter
    if (filters.preferredStaffIds || filters.preferredStaff) {
      const preferredStaffFilter = filters.preferredStaff || {
        staffIds: filters.preferredStaffIds || [],
        includeUnassigned: false,
        showOnlyPreferred: false
      };
      filteredData = this.applyEnhancedPreferredStaffFilter(filteredData, preferredStaffFilter);
    }

    // Recalculate totals
    return this.recalculateTotals(filteredData);
  }

  // Helper methods (simplified versions of the advanced engine methods)
  private static applyTimeHorizonFilter(data: DemandMatrixData, timeHorizon: { start: Date; end: Date }): DemandMatrixData {
    const filteredMonths = data.months.filter(month => {
      const monthDate = new Date(month.key + '-01');
      return monthDate >= timeHorizon.start && monthDate <= timeHorizon.end;
    });

    const monthKeys = new Set(filteredMonths.map(m => m.key));
    const filteredDataPoints = data.dataPoints.filter(point => monthKeys.has(point.month));

    return {
      ...data,
      months: filteredMonths,
      dataPoints: filteredDataPoints
    };
  }

  private static applySkillFilter(data: DemandMatrixData, skills: string[]): DemandMatrixData {
    const skillSet = new Set(skills);
    const filteredDataPoints = data.dataPoints.filter(point => skillSet.has(point.skillType));

    return {
      ...data,
      skills: data.skills.filter(skill => skillSet.has(skill)),
      dataPoints: filteredDataPoints
    };
  }

  private static applyClientFilter(data: DemandMatrixData, clients: string[]): DemandMatrixData {
    const clientSet = new Set(clients);

    const filteredDataPoints = data.dataPoints.map(point => {
      const filteredTaskBreakdown = point.taskBreakdown?.filter(task => 
        clientSet.has(task.clientId)
      ) || [];

      const demandHours = filteredTaskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
      const uniqueClients = new Set(filteredTaskBreakdown.map(task => task.clientId));

      return {
        ...point,
        taskBreakdown: filteredTaskBreakdown,
        demandHours,
        taskCount: filteredTaskBreakdown.length,
        clientCount: uniqueClients.size
      };
    }).filter(point => point.taskCount > 0);

    return {
      ...data,
      dataPoints: filteredDataPoints
    };
  }

  private static applyEnhancedPreferredStaffFilter(
    data: DemandMatrixData,
    preferredStaffFilter: {
      staffIds: string[];
      includeUnassigned: boolean;
      showOnlyPreferred: boolean;
    }
  ): DemandMatrixData {
    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = preferredStaffFilter;
    
    // Determine filtering mode
    let filteringMode: 'all' | 'specific' | 'none' = 'all';
    if (showOnlyPreferred && staffIds.length === 0) {
      filteringMode = 'none';
    } else if (staffIds.length > 0) {
      filteringMode = 'specific';
    }

    console.log(`🎯 [PHASE 4 SYNC FILTER] Applying three-mode preferred staff filter:`, {
      mode: filteringMode,
      staffIds: staffIds.length,
      includeUnassigned,
      showOnlyPreferred
    });

    const filteredDataPoints = data.dataPoints.map(point => {
      let filteredTaskBreakdown = point.taskBreakdown || [];

      if (filteringMode === 'specific') {
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          // Handle both string and object types for preferredStaff
          const staffId = typeof task.preferredStaff === 'string' 
            ? task.preferredStaff 
            : task.preferredStaff?.staffId;
          
          const hasMatchingStaff = staffId && staffIds.includes(staffId);
          const isUnassigned = !staffId;
          return hasMatchingStaff || (includeUnassigned && isUnassigned);
        });
      } else if (filteringMode === 'none') {
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const staffId = typeof task.preferredStaff === 'string' 
            ? task.preferredStaff 
            : task.preferredStaff?.staffId;
          return !staffId;
        });
      }
      // Mode 'all' keeps all tasks

      const demandHours = filteredTaskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
      const uniqueClients = new Set(filteredTaskBreakdown.map(task => task.clientId));

      return {
        ...point,
        taskBreakdown: filteredTaskBreakdown,
        demandHours,
        taskCount: filteredTaskBreakdown.length,
        clientCount: uniqueClients.size
      };
    }).filter(point => point.taskCount > 0);

    return {
      ...data,
      dataPoints: filteredDataPoints
    };
  }

  private static recalculateTotals(data: DemandMatrixData): DemandMatrixData {
    const totalDemand = data.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
    const totalTasks = data.dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
    
    const uniqueClients = new Set<string>();
    data.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        uniqueClients.add(task.clientId);
      });
    });

    return {
      ...data,
      totalDemand,
      totalTasks,
      totalClients: uniqueClients.size
    };
  }
}
