/**
 * Data Filtering Optimizer - Phase 4 Enhanced
 * Handles efficient data filtering with comprehensive three-mode support
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from '../../logger';
import { FilteringOptions } from './types';
import { PERFORMANCE_OPERATIONS, PERFORMANCE_THRESHOLDS } from './constants';
import { PerformanceMonitor } from './performanceMonitor';
import { EnhancedDataFilter } from '../enhancedDataFilter';

export class DataFilter {
  private static performanceMonitor = new PerformanceMonitor();

  /**
   * Phase 4: Enhanced data filtering with comprehensive three-mode preferred staff support
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: FilteringOptions = {}
  ): DemandMatrixData {
    const { enableEarlyExit = true, enablePreCalculation = true, enableLogging = true } = options;
    const startTime = performance.now();
    
    console.log(`🔍 [PHASE 4 DATA FILTER] Starting enhanced optimization:`, {
      skillsFilter: filters.skills?.length === 0 ? 'NONE (show all)' : filters.skills,
      clientsFilter: filters.clients?.length === 0 ? 'NONE (show all)' : filters.clients,
      preferredStaffFilter: this.getPreferredStaffFilterDescription(filters.preferredStaff),
      hasTimeHorizon: !!filters.timeHorizon,
      includeInactive: filters.includeInactive,
      phase: 'PHASE_4_ENHANCED'
    });

    // Early exit for no filters - Phase 4 enhanced detection
    if (enableEarlyExit && this.hasNoActiveFilters(filters)) {
      const processingTime = performance.now() - startTime;
      this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.FILTERING_NO_OP, processingTime);
      
      console.log(`✨ [PHASE 4 DATA FILTER] No active filters detected, returning original data`);
      return data;
    }

    try {
      // Phase 4: Use enhanced filtering engine
      const result = EnhancedDataFilter.optimizeFiltering(data, filters, options);
      
      const filteringTime = performance.now() - startTime;
      this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.FILTERING_COMPREHENSIVE, filteringTime);
      
      // Performance warning check
      if (filteringTime > PERFORMANCE_THRESHOLDS.PERFORMANCE_WARNING_THRESHOLD) {
        console.warn(`⚠️ [PHASE 4 DATA FILTER] Performance warning:`, {
          processingTime: `${filteringTime.toFixed(2)}ms`,
          threshold: `${PERFORMANCE_THRESHOLDS.PERFORMANCE_WARNING_THRESHOLD}ms`,
          dataPoints: data.dataPoints.length,
          recommendation: 'Consider data optimization or filter simplification'
        });
      }

      if (enableLogging) {
        console.log(`✅ [PHASE 4 DATA FILTER] Enhanced filtering completed:`, {
          processingTime: `${filteringTime.toFixed(2)}ms`,
          originalDataPoints: data.dataPoints.length,
          filteredDataPoints: result.dataPoints.length,
          remainingSkills: result.skills.length,
          remainingMonths: result.months.length,
          totalDemand: result.totalDemand.toFixed(1),
          totalTasks: result.totalTasks,
          totalClients: result.totalClients,
          filteringMode: this.getFilteringModeDescription(filters),
          phase: 'PHASE_4_SUCCESS'
        });
      }
      
      return result;

    } catch (error) {
      console.error(`❌ [PHASE 4 DATA FILTER] Enhanced filtering failed, using fallback:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        originalDataPoints: data.dataPoints.length
      });

      // Fallback to legacy filtering logic
      return this.legacyFiltering(data, filters, options);
    }
  }

  /**
   * Phase 4: Enhanced filter detection with preferred staff support
   */
  private static hasNoActiveFilters(filters: DemandFilters): boolean {
    const hasNoSkillFilter = !filters.skills || filters.skills.length === 0;
    const hasNoClientFilter = !filters.clients || filters.clients.length === 0;
    const hasNoPreferredStaffFilter = this.hasNoPreferredStaffFilter(filters.preferredStaff);
    const hasNoTimeHorizon = !filters.timeHorizon;
    const hasNoInactiveFilter = !filters.includeInactive;

    const noActiveFilters = hasNoSkillFilter && hasNoClientFilter && hasNoPreferredStaffFilter && hasNoTimeHorizon && hasNoInactiveFilter;
    
    console.log(`🔍 [PHASE 4 DATA FILTER] Enhanced filter detection:`, {
      hasNoSkillFilter,
      hasNoClientFilter,
      hasNoPreferredStaffFilter,
      hasNoTimeHorizon,
      hasNoInactiveFilter,
      noActiveFilters,
      preferredStaffDetails: filters.preferredStaff ? {
        staffIds: filters.preferredStaff.staffIds?.length || 0,
        includeUnassigned: filters.preferredStaff.includeUnassigned,
        showOnlyPreferred: filters.preferredStaff.showOnlyPreferred
      } : null
    });

    return noActiveFilters;
  }

  /**
   * Phase 4: Enhanced preferred staff filter detection
   */
  private static hasNoPreferredStaffFilter(preferredStaffFilter?: DemandFilters['preferredStaff']): boolean {
    if (!preferredStaffFilter) return true;

    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = preferredStaffFilter;

    // No filter if no specific configuration is set
    const hasNoSpecificStaff = staffIds.length === 0;
    const hasNoSpecialMode = !showOnlyPreferred;
    const hasNoUnassignedMode = !includeUnassigned;

    return hasNoSpecificStaff && hasNoSpecialMode && hasNoUnassignedMode;
  }

  /**
   * Get human-readable description of preferred staff filter
   */
  private static getPreferredStaffFilterDescription(preferredStaffFilter?: DemandFilters['preferredStaff']): string {
    if (!preferredStaffFilter) return 'NONE (show all)';

    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = preferredStaffFilter;

    if (showOnlyPreferred && staffIds.length === 0) {
      return 'NONE MODE (unassigned only)';
    } else if (staffIds.length > 0) {
      return `SPECIFIC MODE (${staffIds.length} staff${includeUnassigned ? ' + unassigned' : ''})`;
    } else {
      return 'ALL MODE (show all)';
    }
  }

  /**
   * Get filtering mode description for logging
   */
  private static getFilteringModeDescription(filters: DemandFilters): string {
    const modes = [];
    
    if (filters.skills && filters.skills.length > 0) {
      modes.push(`skills(${filters.skills.length})`);
    }
    
    if (filters.clients && filters.clients.length > 0) {
      modes.push(`clients(${filters.clients.length})`);
    }
    
    if (filters.preferredStaff) {
      modes.push(`staff(${this.getPreferredStaffFilterDescription(filters.preferredStaff)})`);
    }
    
    if (filters.timeHorizon) {
      modes.push('timeHorizon');
    }

    return modes.length > 0 ? modes.join(' + ') : 'no-filters';
  }

  /**
   * Legacy filtering fallback for error cases
   */
  private static legacyFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: FilteringOptions
  ): DemandMatrixData {
    console.log(`🔄 [PHASE 4 DATA FILTER] Using legacy filtering fallback`);
    
    let filteredData = { ...data };

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
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredData.dataPoints.length,
      originalTotalDemand: data.totalDemand,
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
