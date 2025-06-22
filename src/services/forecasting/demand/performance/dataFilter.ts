/**
 * Phase 4: Advanced Data Filter Service
 * 
 * Provides enhanced filtering capabilities with improved performance,
 * validation, and comprehensive error handling for complex filtering scenarios.
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { extractStaffId } from '../utils/staffIdExtractor';

/**
 * Phase 4: Enhanced data filtering with advanced algorithms and performance optimization
 */
export class AdvancedDataFilter {
  /**
   * Apply comprehensive filtering with enhanced performance and validation
   */
  static applyAdvancedFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: {
      enableStrictValidation?: boolean;
      enablePerformanceOptimization?: boolean;
      enableAdvancedPreferredStaffFiltering?: boolean;
    } = {}
  ): DemandMatrixData {
    const {
      enableStrictValidation = true,
      enablePerformanceOptimization = true,
      enableAdvancedPreferredStaffFiltering = true
    } = options;

    console.log(`🔍 [PHASE 4 ADVANCED FILTER] Starting comprehensive filtering:`, {
      originalDataPoints: data.dataPoints.length,
      filtersApplied: Object.keys(filters).length,
      strictValidation: enableStrictValidation,
      performanceOptimized: enablePerformanceOptimization,
      advancedStaffFiltering: enableAdvancedPreferredStaffFiltering
    });

    let filteredData = { ...data };

    // Apply time horizon filtering
    if (filters.timeHorizon || filters.dateRange) {
      filteredData = this.applyTimeHorizonFilter(filteredData, filters.timeHorizon || filters.dateRange);
    }

    // Apply skill type filtering with enhanced performance
    if (filters.skillTypes && filters.skillTypes.length > 0) {
      filteredData = this.applyEnhancedSkillFilter(filteredData, filters.skillTypes, enablePerformanceOptimization);
    } else if (filters.skills && filters.skills.length > 0) {
      filteredData = this.applyEnhancedSkillFilter(filteredData, filters.skills, enablePerformanceOptimization);
    }

    // Apply client filtering with validation
    if (filters.clientIds && filters.clientIds.length > 0) {
      filteredData = this.applyValidatedClientFilter(filteredData, filters.clientIds, enableStrictValidation);
    } else if (filters.clients && filters.clients.length > 0) {
      filteredData = this.applyValidatedClientFilter(filteredData, filters.clients, enableStrictValidation);
    }

    // Apply advanced preferred staff filtering
    if (enableAdvancedPreferredStaffFiltering && (filters.preferredStaffIds || filters.preferredStaff)) {
      const preferredStaffConfig = filters.preferredStaff || {
        staffIds: filters.preferredStaffIds || [],
        includeUnassigned: false,
        showOnlyPreferred: false
      };
      filteredData = this.applyAdvancedPreferredStaffFilter(filteredData, preferredStaffConfig);
    }

    // Recalculate totals and metrics
    filteredData = this.recalculateComprehensiveMetrics(filteredData);

    console.log(`✅ [PHASE 4 ADVANCED FILTER] Filtering completed:`, {
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredData.dataPoints.length,
      reductionPercentage: ((data.dataPoints.length - filteredData.dataPoints.length) / data.dataPoints.length * 100).toFixed(1)
    });

    return filteredData;
  }

  /**
   * Enhanced time horizon filtering with performance optimization
   */
  private static applyTimeHorizonFilter(
    data: DemandMatrixData,
    timeHorizon: { start: Date; end: Date } | undefined
  ): DemandMatrixData {
    if (!timeHorizon) return data;

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
   * Enhanced skill filtering with performance optimization
   */
  private static applyEnhancedSkillFilter(
    data: DemandMatrixData,
    skills: string[],
    enableOptimization: boolean
  ): DemandMatrixData {
    const skillSet = enableOptimization ? new Set(skills) : skills;
    
    const filteredDataPoints = data.dataPoints.filter(point => 
      enableOptimization 
        ? (skillSet as Set<string>).has(point.skillType)
        : skills.includes(point.skillType)
    );

    return {
      ...data,
      skills: data.skills.filter(skill => 
        enableOptimization 
          ? (skillSet as Set<string>).has(skill)
          : skills.includes(skill)
      ),
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Validated client filtering with enhanced error handling
   */
  private static applyValidatedClientFilter(
    data: DemandMatrixData,
    clients: string[],
    enableValidation: boolean
  ): DemandMatrixData {
    const clientSet = new Set(clients);

    const filteredDataPoints = data.dataPoints.map(point => {
      const filteredTaskBreakdown = point.taskBreakdown?.filter(task => {
        if (enableValidation && !task.clientId) {
          console.warn(`⚠️ [PHASE 4] Invalid task found without clientId:`, task);
          return false;
        }
        return clientSet.has(task.clientId);
      }) || [];

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
   * Advanced preferred staff filtering with three-mode support
   */
  private static applyAdvancedPreferredStaffFilter(
    data: DemandMatrixData,
    preferredStaffConfig: {
      staffIds: string[];
      includeUnassigned: boolean;
      showOnlyPreferred: boolean;
    }
  ): DemandMatrixData {
    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = preferredStaffConfig;
    
    // Determine filtering mode
    let filteringMode: 'all' | 'specific' | 'none' = 'all';
    if (showOnlyPreferred && staffIds.length === 0) {
      filteringMode = 'none';
    } else if (staffIds.length > 0) {
      filteringMode = 'specific';
    }

    console.log(`🎯 [PHASE 4 ADVANCED FILTER] Applying three-mode preferred staff filter:`, {
      mode: filteringMode,
      staffIdsCount: staffIds.length,
      includeUnassigned,
      showOnlyPreferred
    });

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

  /**
   * Recalculate comprehensive metrics after filtering
   */
  private static recalculateComprehensiveMetrics(data: DemandMatrixData): DemandMatrixData {
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
