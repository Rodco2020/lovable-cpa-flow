
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
   * Enhanced data filtering with preferred staff support
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: FilteringOptions = {}
  ): DemandMatrixData {
    const { enableEarlyExit = true, enablePreCalculation = true, enableLogging = true } = options;
    const startTime = performance.now();
    
    console.log(`🔍 [DATA FILTER] Starting optimization with filters:`, {
      skillsFilter: filters.skills?.length === 0 ? 'NONE (show all)' : filters.skills,
      clientsFilter: filters.clients?.length === 0 ? 'NONE (show all)' : filters.clients,
      preferredStaffFilter: filters.preferredStaff?.staffIds?.length === 0 ? 'NONE (show all)' : filters.preferredStaff?.staffIds,
      hasTimeHorizon: !!filters.timeHorizon,
      includeInactive: filters.includeInactive
    });

    // Early exit for no filters - check correctly for empty arrays including preferred staff
    if (enableEarlyExit && this.hasNoActiveFilters(filters)) {
      const processingTime = performance.now() - startTime;
      this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.FILTERING_NO_OP, processingTime);
      
      console.log(`✨ [DATA FILTER] No active filters detected, returning original data`);
      return data;
    }

    // Pre-calculate filter sets for efficiency
    const skillSet = enablePreCalculation && filters.skills && filters.skills.length > 0 ? new Set(filters.skills) : null;
    const clientSet = enablePreCalculation && filters.clients && filters.clients.length > 0 ? new Set(filters.clients) : null;
    const preferredStaffSet = enablePreCalculation && filters.preferredStaff?.staffIds && filters.preferredStaff.staffIds.length > 0 ? new Set(filters.preferredStaff.staffIds) : null;
    
    console.log(`🎯 [DATA FILTER] Filter sets prepared:`, {
      skillSetSize: skillSet?.size || 0,
      clientSetSize: clientSet?.size || 0,
      preferredStaffSetSize: preferredStaffSet?.size || 0,
      willFilterBySkills: !!skillSet,
      willFilterByClients: !!clientSet,
      willFilterByPreferredStaff: !!preferredStaffSet
    });
    
    // Filter data points efficiently
    const filteredDataPoints = data.dataPoints.filter(point => {
      // Skill filter - only apply if we have an active skill filter
      if (skillSet && skillSet.size > 0) {
        if (!skillSet.has(point.skillType)) {
          return false;
        }
      }
      
      // Time horizon filter
      if (filters.timeHorizon) {
        const pointDate = new Date(point.month);
        if (pointDate < filters.timeHorizon.start || pointDate > filters.timeHorizon.end) {
          return false;
        }
      }
      
      // Client filter - only apply if we have an active client filter
      if (clientSet && clientSet.size > 0) {
        const hasMatchingClient = point.taskBreakdown?.some(task => 
          clientSet.has(task.clientId)
        );
        if (!hasMatchingClient) {
          return false;
        }
      }
      
      // Preferred staff filter - only apply if we have an active preferred staff filter
      if (preferredStaffSet && preferredStaffSet.size > 0) {
        const hasMatchingPreferredStaff = point.taskBreakdown?.some(task => 
          task.preferredStaff?.staffId && preferredStaffSet.has(task.preferredStaff.staffId)
        );
        if (!hasMatchingPreferredStaff) {
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
      console.log(`✅ [DATA FILTER] Filtering completed:`, {
        processingTime: `${filteringTime.toFixed(2)}ms`,
        originalDataPoints: data.dataPoints.length,
        filteredDataPoints: result.dataPoints.length,
        remainingSkills: result.skills.length,
        remainingMonths: result.months.length,
        totalDemand: result.totalDemand.toFixed(1),
        totalTasks: result.totalTasks,
        totalClients: result.totalClients,
        preferredStaffFiltered: !!preferredStaffSet
      });
    }
    
    return result;
  }

  /**
   * Check if filters are effectively empty - updated to include preferred staff
   */
  private static hasNoActiveFilters(filters: DemandFilters): boolean {
    const hasNoSkillFilter = !filters.skills || filters.skills.length === 0;
    const hasNoClientFilter = !filters.clients || filters.clients.length === 0;
    const hasNoPreferredStaffFilter = !filters.preferredStaff?.staffIds || filters.preferredStaff.staffIds.length === 0;
    const hasNoTimeHorizon = !filters.timeHorizon;
    const hasNoInactiveFilter = !filters.includeInactive;

    const noActiveFilters = hasNoSkillFilter && hasNoClientFilter && hasNoPreferredStaffFilter && hasNoTimeHorizon && hasNoInactiveFilter;
    
    console.log(`🔍 [DATA FILTER] Active filters check:`, {
      hasNoSkillFilter,
      hasNoClientFilter,
      hasNoPreferredStaffFilter,
      hasNoTimeHorizon,
      hasNoInactiveFilter,
      noActiveFilters
    });

    return noActiveFilters;
  }
}
