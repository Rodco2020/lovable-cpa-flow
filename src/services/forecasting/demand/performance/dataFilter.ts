
/**
 * Data Filtering Optimizer
 * Phase 1: Enhanced with preferred staff filtering support
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from '../../logger';
import { FilteringOptions } from './types';
import { PERFORMANCE_OPERATIONS } from './constants';
import { PerformanceMonitor } from './performanceMonitor';

export class DataFilter {
  private static performanceMonitor = new PerformanceMonitor();

  /**
   * Phase 1: Enhanced efficient data filtering with preferred staff support
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
      preferredStaffFilter: filters.preferredStaffIds?.length === 0 ? 'NONE (show all)' : filters.preferredStaffIds, // Phase 1: NEW
      hasTimeHorizon: !!filters.timeHorizon,
      includeInactive: filters.includeInactive
    });

    // Phase 1: Enhanced early exit for no filters - includes preferred staff check
    if (enableEarlyExit && this.hasNoActiveFilters(filters)) {
      const processingTime = performance.now() - startTime;
      this.performanceMonitor.recordPerformance(PERFORMANCE_OPERATIONS.FILTERING_NO_OP, processingTime);
      
      console.log(`✨ [DATA FILTER] No active filters detected, returning original data`);
      return data;
    }

    // Pre-calculate filter sets for efficiency
    const skillSet = enablePreCalculation && filters.skills && filters.skills.length > 0 ? new Set(filters.skills) : null;
    const clientSet = enablePreCalculation && filters.clients && filters.clients.length > 0 ? new Set(filters.clients) : null;
    // Phase 1: NEW - Preferred staff filter set
    const preferredStaffSet = enablePreCalculation && filters.preferredStaffIds && filters.preferredStaffIds.length > 0 
      ? new Set(filters.preferredStaffIds) : null;
    
    console.log(`🎯 [DATA FILTER] Filter sets prepared:`, {
      skillSetSize: skillSet?.size || 0,
      clientSetSize: clientSet?.size || 0,
      preferredStaffSetSize: preferredStaffSet?.size || 0, // Phase 1: NEW
      willFilterBySkills: !!skillSet,
      willFilterByClients: !!clientSet,
      willFilterByPreferredStaff: !!preferredStaffSet // Phase 1: NEW
    });
    
    // Filter data points efficiently
    const filteredDataPoints = data.dataPoints.filter(point => {
      // Skill filter
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
      
      // Client filter
      if (clientSet && clientSet.size > 0) {
        const hasMatchingClient = point.taskBreakdown?.some(task => 
          clientSet.has(task.clientId)
        );
        if (!hasMatchingClient) {
          return false;
        }
      }
      
      // Phase 1: NEW - Preferred staff filter
      if (preferredStaffSet && preferredStaffSet.size > 0) {
        const hasMatchingPreferredStaff = point.taskBreakdown?.some(task => 
          task.preferredStaffId && preferredStaffSet.has(task.preferredStaffId)
        );
        if (!hasMatchingPreferredStaff) {
          return false;
        }
      }
      
      return true;
    });

    // Phase 1: Enhanced filtering with preferred staff breakdown preservation
    const enhancedFilteredDataPoints = filteredDataPoints.map(point => {
      // If we have preferred staff filters, also filter the task breakdown within each data point
      if (preferredStaffSet && preferredStaffSet.size > 0 && point.taskBreakdown) {
        const filteredTaskBreakdown = point.taskBreakdown.filter(task => 
          !task.preferredStaffId || preferredStaffSet.has(task.preferredStaffId)
        );
        
        // Recalculate metrics based on filtered breakdown
        const filteredTaskCount = filteredTaskBreakdown.length;
        const filteredClientCount = new Set(filteredTaskBreakdown.map(task => task.clientId)).size;
        const filteredDemandHours = filteredTaskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
        
        return {
          ...point,
          taskBreakdown: filteredTaskBreakdown,
          taskCount: filteredTaskCount,
          clientCount: filteredClientCount,
          demandHours: filteredDemandHours
        };
      }
      
      return point;
    });

    // Filter skills and months based on remaining data
    const remainingSkills = new Set(enhancedFilteredDataPoints.map(p => p.skillType));
    const remainingMonths = new Set(enhancedFilteredDataPoints.map(p => p.month));
    
    const result = {
      ...data,
      skills: data.skills.filter(skill => remainingSkills.has(skill)),
      months: data.months.filter(month => remainingMonths.has(month.key)),
      dataPoints: enhancedFilteredDataPoints,
      totalDemand: enhancedFilteredDataPoints.reduce((sum, point) => sum + point.demandHours, 0),
      totalTasks: enhancedFilteredDataPoints.reduce((sum, point) => sum + point.taskCount, 0),
      totalClients: new Set(
        enhancedFilteredDataPoints.flatMap(point => 
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
        totalClients: result.totalClients
      });
    }
    
    return result;
  }

  /**
   * Phase 1: Enhanced check if filters are effectively empty - includes preferred staff check
   */
  private static hasNoActiveFilters(filters: DemandFilters): boolean {
    const hasNoSkillFilter = !filters.skills || filters.skills.length === 0;
    const hasNoClientFilter = !filters.clients || filters.clients.length === 0;
    const hasNoPreferredStaffFilter = !filters.preferredStaffIds || filters.preferredStaffIds.length === 0; // Phase 1: NEW
    const hasNoTimeHorizon = !filters.timeHorizon;
    const hasNoInactiveFilter = !filters.includeInactive;

    const noActiveFilters = hasNoSkillFilter && hasNoClientFilter && hasNoPreferredStaffFilter && hasNoTimeHorizon && hasNoInactiveFilter;
    
    console.log(`🔍 [DATA FILTER] Active filters check:`, {
      hasNoSkillFilter,
      hasNoClientFilter, 
      hasNoPreferredStaffFilter, // Phase 1: NEW
      hasNoTimeHorizon,
      hasNoInactiveFilter,
      noActiveFilters
    });

    return noActiveFilters;
  }
}
