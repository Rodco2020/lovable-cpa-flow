
/**
 * Synchronous Filter Processor
 * 
 * Handles synchronous filtering operations for backward compatibility
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { extractStaffId } from '../utils/staffIdExtractor';

export class SynchronousFilterProcessor {
  /**
   * Process filters synchronously (preserves original logic)
   */
  static processFilters(
    data: DemandMatrixData,
    filters: DemandFilters
  ): DemandMatrixData {
    let filteredData = { ...data };

    // Apply time horizon filter
    if (filters.timeHorizon || filters.dateRange) {
      filteredData = this.applyTimeHorizonFilter(
        filteredData, 
        filters.timeHorizon || filters.dateRange
      );
    }

    // Apply skill filter
    if (filters.skillTypes?.length || filters.skills?.length) {
      const skillsToFilter = filters.skillTypes || filters.skills || [];
      filteredData = this.applySkillFilter(filteredData, skillsToFilter);
    }

    // Apply client filter
    if (filters.clientIds?.length || filters.clients?.length) {
      const clientsToFilter = filters.clientIds || filters.clients || [];
      filteredData = this.applyClientFilter(filteredData, clientsToFilter);
    }

    // Apply preferred staff filter
    if (filters.preferredStaffIds?.length || filters.preferredStaff) {
      const preferredStaffConfig = filters.preferredStaff || {
        staffIds: filters.preferredStaffIds || [],
        includeUnassigned: false,
        showOnlyPreferred: false
      };
      filteredData = this.applyPreferredStaffFilter(filteredData, preferredStaffConfig);
    }

    // Recalculate totals
    return this.recalculateTotals(filteredData);
  }

  private static applyTimeHorizonFilter(data: DemandMatrixData, timeHorizon: { start: Date; end: Date } | undefined): DemandMatrixData {
    if (!timeHorizon) return data;

    const filteredMonths = data.months.filter(month => {
      const monthDate = new Date(month.key + '-01');
      return monthDate >= timeHorizon.start && monthDate <= timeHorizon.end;
    });

    const monthKeys = new Set(filteredMonths.map(m => m.key));
    const filteredDataPoints = data.dataPoints.filter(point => monthKeys.has(point.month));

    return { ...data, months: filteredMonths, dataPoints: filteredDataPoints };
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

    return { ...data, dataPoints: filteredDataPoints };
  }

  private static applyPreferredStaffFilter(
    data: DemandMatrixData,
    preferredStaffConfig: {
      staffIds: string[];
      includeUnassigned: boolean;
      showOnlyPreferred: boolean;
    }
  ): DemandMatrixData {
    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = preferredStaffConfig;
    
    let filteringMode: 'all' | 'specific' | 'none' = 'all';
    if (showOnlyPreferred && staffIds.length === 0) {
      filteringMode = 'none';
    } else if (staffIds.length > 0) {
      filteringMode = 'specific';
    }

    const filteredDataPoints = data.dataPoints.map(point => {
      let filteredTaskBreakdown = point.taskBreakdown || [];

      if (filteringMode === 'specific') {
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const staffId = extractStaffId(task.preferredStaff);
          const hasMatchingStaff = staffId && staffIds.includes(staffId);
          const isUnassigned = !staffId;
          return hasMatchingStaff || (includeUnassigned && isUnassigned);
        });
      } else if (filteringMode === 'none') {
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const staffId = extractStaffId(task.preferredStaff);
          return !staffId;
        });
      }

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

    return { ...data, dataPoints: filteredDataPoints };
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
