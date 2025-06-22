/**
 * Synchronous Filter Processor
 * 
 * Contains all the original filtering logic from enhancedDataFilter.ts
 * This preserves exact behavior and functionality
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { TimeHorizonFilter, PreferredStaffFilter } from './types';

export class SynchronousFilterProcessor {
  /**
   * Process all filters synchronously (preserves original logic exactly)
   */
  static processFilters(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    let filteredData = { ...data };

    // Apply time horizon filter (preserves original logic)
    if (filters.timeHorizon || filters.dateRange) {
      const timeRange = filters.timeHorizon || filters.dateRange;
      if (timeRange) {
        filteredData = this.applyTimeHorizonFilter(filteredData, timeRange);
      }
    }

    // Apply skill filter (preserves original logic)
    if (filters.skillTypes && filters.skillTypes.length > 0) {
      filteredData = this.applySkillFilter(filteredData, filters.skillTypes);
    } else if (filters.skills && filters.skills.length > 0) {
      filteredData = this.applySkillFilter(filteredData, filters.skills);
    }

    // Apply client filter (preserves original logic)
    if (filters.clientIds && filters.clientIds.length > 0) {
      filteredData = this.applyClientFilter(filteredData, filters.clientIds);
    } else if (filters.clients && filters.clients.length > 0) {
      filteredData = this.applyClientFilter(filteredData, filters.clients);
    }

    // Apply enhanced preferred staff filter (preserves original logic)
    if (filters.preferredStaffIds || filters.preferredStaff) {
      const preferredStaffFilter = filters.preferredStaff || {
        staffIds: filters.preferredStaffIds || [],
        includeUnassigned: false,
        showOnlyPreferred: false
      };
      filteredData = this.applyEnhancedPreferredStaffFilter(filteredData, preferredStaffFilter);
    }

    // Recalculate totals (preserves original logic)
    return this.recalculateTotals(filteredData);
  }

  /**
   * Apply time horizon filter (exact copy from original)
   */
  private static applyTimeHorizonFilter(data: DemandMatrixData, timeHorizon: TimeHorizonFilter): DemandMatrixData {
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

  /**
   * Apply skill filter (exact copy from original)
   */
  private static applySkillFilter(data: DemandMatrixData, skills: string[]): DemandMatrixData {
    const skillSet = new Set(skills);
    const filteredDataPoints = data.dataPoints.filter(point => skillSet.has(point.skillType));

    return {
      ...data,
      skills: data.skills.filter(skill => skillSet.has(skill)),
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Apply client filter (exact copy from original)
   */
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

  /**
   * Apply enhanced preferred staff filter (exact copy from original)
   */
  private static applyEnhancedPreferredStaffFilter(
    data: DemandMatrixData,
    preferredStaffFilter: PreferredStaffFilter
  ): DemandMatrixData {
    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = preferredStaffFilter;
    
    // Determine filtering mode (preserves original logic)
    let filteringMode: 'all' | 'specific' | 'none' = 'all';
    if (showOnlyPreferred && staffIds.length === 0) {
      filteringMode = 'none';
    } else if (staffIds.length > 0) {
      filteringMode = 'specific';
    }

    console.log(`🎯 [SYNC FILTER] Applying three-mode preferred staff filter:`, {
      mode: filteringMode,
      staffIds: staffIds.length,
      includeUnassigned,
      showOnlyPreferred
    });

    const filteredDataPoints = data.dataPoints.map(point => {
      let filteredTaskBreakdown = point.taskBreakdown || [];

      if (filteringMode === 'specific') {
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          // Handle both string and object types for preferredStaff (preserves original logic)
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
      // Mode 'all' keeps all tasks (preserves original logic)

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

  /**
   * Recalculate totals (exact copy from original)
   */
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
