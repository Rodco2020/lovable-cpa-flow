
/**
 * Phase 4: Advanced Filtering Engine
 * 
 * Implements comprehensive three-mode filtering logic with:
 * - Enhanced performance monitoring
 * - Proper task counting and metrics calculation
 * - Extensive logging for debugging
 * - Edge case handling
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { PerformanceMonitor } from './performanceMonitor';
import { PERFORMANCE_OPERATIONS } from './constants';

export interface FilteringResult {
  filteredData: DemandMatrixData;
  filteringMetrics: FilteringMetrics;
  performanceStats: FilteringPerformanceStats;
}

export interface FilteringMetrics {
  originalDataPoints: number;
  filteredDataPoints: number;
  tasksFiltered: {
    bySkill: number;
    byClient: number;
    byPreferredStaff: number;
    byTimeHorizon: number;
  };
  filterEfficiency: number;
  dataReductionRatio: number;
}

export interface FilteringPerformanceStats {
  totalProcessingTime: number;
  operationBreakdown: {
    skillFiltering: number;
    clientFiltering: number;
    preferredStaffFiltering: number;
    timeHorizonFiltering: number;
    metricsRecalculation: number;
  };
  memoryUsage: {
    beforeFiltering: number;
    afterFiltering: number;
    reductionPercentage: number;
  };
}

export class AdvancedFilteringEngine {
  private static performanceMonitor = new PerformanceMonitor();

  /**
   * Phase 4: Enhanced filtering with comprehensive three-mode support
   */
  static async executeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters
  ): Promise<FilteringResult> {
    const startTime = performance.now();
    const initialMemory = this.estimateMemoryUsage(data);
    
    console.log(`🚀 [PHASE 4 FILTERING ENGINE] Starting comprehensive filtering:`, {
      dataPoints: data.dataPoints.length,
      totalTasks: data.totalTasks,
      totalClients: data.totalClients,
      filters: {
        skills: filters.skills?.length || 0,
        clients: filters.clients?.length || 0,
        preferredStaffMode: filters.preferredStaff ? 'configured' : 'none',
        timeHorizon: !!filters.timeHorizon
      },
      timestamp: new Date().toISOString()
    });

    // Initialize filtering metrics
    const metrics: FilteringMetrics = {
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: 0,
      tasksFiltered: {
        bySkill: 0,
        byClient: 0,
        byPreferredStaff: 0,
        byTimeHorizon: 0
      },
      filterEfficiency: 0,
      dataReductionRatio: 0
    };

    const performanceStats: FilteringPerformanceStats = {
      totalProcessingTime: 0,
      operationBreakdown: {
        skillFiltering: 0,
        clientFiltering: 0,
        preferredStaffFiltering: 0,
        timeHorizonFiltering: 0,
        metricsRecalculation: 0
      },
      memoryUsage: {
        beforeFiltering: initialMemory,
        afterFiltering: 0,
        reductionPercentage: 0
      }
    };

    let filteredData = { ...data };

    // Phase 4: Sequential filtering with performance tracking
    try {
      // 1. Time Horizon Filtering
      if (filters.timeHorizon) {
        const timeStart = performance.now();
        const timeResult = this.applyTimeHorizonFilter(filteredData, filters.timeHorizon);
        filteredData = timeResult.data;
        metrics.tasksFiltered.byTimeHorizon = timeResult.tasksFiltered;
        performanceStats.operationBreakdown.timeHorizonFiltering = performance.now() - timeStart;
        
        console.log(`⏰ [PHASE 4] Time horizon filtering completed:`, {
          tasksFiltered: timeResult.tasksFiltered,
          remainingDataPoints: filteredData.dataPoints.length,
          processingTime: `${performanceStats.operationBreakdown.timeHorizonFiltering.toFixed(2)}ms`
        });
      }

      // 2. Skill Filtering
      if (filters.skills && filters.skills.length > 0) {
        const skillStart = performance.now();
        const skillResult = this.applySkillFilter(filteredData, filters.skills);
        filteredData = skillResult.data;
        metrics.tasksFiltered.bySkill = skillResult.tasksFiltered;
        performanceStats.operationBreakdown.skillFiltering = performance.now() - skillStart;
        
        console.log(`🎯 [PHASE 4] Skill filtering completed:`, {
          skillsSelected: filters.skills,
          tasksFiltered: skillResult.tasksFiltered,
          remainingDataPoints: filteredData.dataPoints.length,
          processingTime: `${performanceStats.operationBreakdown.skillFiltering.toFixed(2)}ms`
        });
      }

      // 3. Client Filtering
      if (filters.clients && filters.clients.length > 0) {
        const clientStart = performance.now();
        const clientResult = this.applyClientFilter(filteredData, filters.clients);
        filteredData = clientResult.data;
        metrics.tasksFiltered.byClient = clientResult.tasksFiltered;
        performanceStats.operationBreakdown.clientFiltering = performance.now() - clientStart;
        
        console.log(`🏢 [PHASE 4] Client filtering completed:`, {
          clientsSelected: filters.clients.length,
          tasksFiltered: clientResult.tasksFiltered,
          remainingDataPoints: filteredData.dataPoints.length,
          processingTime: `${performanceStats.operationBreakdown.clientFiltering.toFixed(2)}ms`
        });
      }

      // 4. Phase 4: Enhanced Three-Mode Preferred Staff Filtering
      if (filters.preferredStaff) {
        const staffStart = performance.now();
        const staffResult = this.applyThreeModePreferredStaffFilter(filteredData, filters.preferredStaff);
        filteredData = staffResult.data;
        metrics.tasksFiltered.byPreferredStaff = staffResult.tasksFiltered;
        performanceStats.operationBreakdown.preferredStaffFiltering = performance.now() - staffStart;
        
        console.log(`👥 [PHASE 4] Three-mode preferred staff filtering completed:`, {
          mode: staffResult.mode,
          staffSelected: staffResult.staffSelected,
          tasksFiltered: staffResult.tasksFiltered,
          remainingDataPoints: filteredData.dataPoints.length,
          processingTime: `${performanceStats.operationBreakdown.preferredStaffFiltering.toFixed(2)}ms`,
          modeDetails: staffResult.modeDetails
        });
      }

      // 5. Recalculate metrics and totals
      const metricsStart = performance.now();
      filteredData = this.recalculateMetrics(filteredData);
      performanceStats.operationBreakdown.metricsRecalculation = performance.now() - metricsStart;

      // Finalize metrics
      metrics.filteredDataPoints = filteredData.dataPoints.length;
      metrics.filterEfficiency = metrics.originalDataPoints > 0 
        ? (metrics.filteredDataPoints / metrics.originalDataPoints) * 100 
        : 100;
      metrics.dataReductionRatio = metrics.originalDataPoints > 0
        ? ((metrics.originalDataPoints - metrics.filteredDataPoints) / metrics.originalDataPoints) * 100
        : 0;

      // Calculate memory usage
      const finalMemory = this.estimateMemoryUsage(filteredData);
      performanceStats.memoryUsage.afterFiltering = finalMemory;
      performanceStats.memoryUsage.reductionPercentage = initialMemory > 0
        ? ((initialMemory - finalMemory) / initialMemory) * 100
        : 0;

      performanceStats.totalProcessingTime = performance.now() - startTime;

      // Record performance
      this.performanceMonitor.recordPerformance(
        PERFORMANCE_OPERATIONS.FILTERING_COMPREHENSIVE, 
        performanceStats.totalProcessingTime
      );

      console.log(`✅ [PHASE 4 FILTERING ENGINE] Comprehensive filtering completed successfully:`, {
        metrics,
        performanceStats,
        finalDataState: {
          dataPoints: filteredData.dataPoints.length,
          totalDemand: filteredData.totalDemand,
          totalTasks: filteredData.totalTasks,
          totalClients: filteredData.totalClients
        }
      });

      return {
        filteredData,
        filteringMetrics: metrics,
        performanceStats
      };

    } catch (error) {
      console.error(`❌ [PHASE 4 FILTERING ENGINE] Critical error during filtering:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        filterState: {
          skills: filters.skills?.length || 0,
          clients: filters.clients?.length || 0,
          preferredStaff: !!filters.preferredStaff,
          timeHorizon: !!filters.timeHorizon
        },
        dataState: {
          originalDataPoints: data.dataPoints.length,
          currentDataPoints: filteredData.dataPoints.length
        }
      });

      // Fallback: return original data with error metrics
      return {
        filteredData: data,
        filteringMetrics: {
          ...metrics,
          filteredDataPoints: data.dataPoints.length,
          filterEfficiency: 0,
          dataReductionRatio: 0
        },
        performanceStats: {
          ...performanceStats,
          totalProcessingTime: performance.now() - startTime
        }
      };
    }
  }

  /**
   * Phase 4: Enhanced three-mode preferred staff filtering
   */
  private static applyThreeModePreferredStaffFilter(
    data: DemandMatrixData,
    preferredStaffFilter: NonNullable<DemandFilters['preferredStaff']>
  ): {
    data: DemandMatrixData;
    tasksFiltered: number;
    mode: string;
    staffSelected: number;
    modeDetails: any;
  } {
    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = preferredStaffFilter;
    
    // Determine filtering mode based on configuration
    let filteringMode: 'all' | 'specific' | 'none' = 'all';
    
    if (showOnlyPreferred && staffIds.length === 0) {
      filteringMode = 'none'; // Show only unassigned tasks
    } else if (staffIds.length > 0) {
      filteringMode = 'specific'; // Filter by specific staff
    } else {
      filteringMode = 'all'; // Show all tasks
    }

    console.log(`🎯 [PHASE 4] Applying three-mode preferred staff filter:`, {
      mode: filteringMode,
      staffIds: staffIds.length,
      includeUnassigned,
      showOnlyPreferred,
      originalDataPoints: data.dataPoints.length
    });

    let tasksFilteredCount = 0;
    const modeDetails: any = {
      mode: filteringMode,
      configuration: { staffIds: staffIds.length, includeUnassigned, showOnlyPreferred }
    };

    const filteredDataPoints = data.dataPoints.map(point => {
      const originalTaskCount = point.taskBreakdown?.length || 0;
      let filteredTaskBreakdown = point.taskBreakdown || [];

      if (filteringMode === 'all') {
        // Mode 'all': Show ALL tasks (no filtering)
        modeDetails.tasksWithPreferredStaff = filteredTaskBreakdown.filter(t => t.preferredStaff?.staffId).length;
        modeDetails.tasksWithoutPreferredStaff = filteredTaskBreakdown.filter(t => !t.preferredStaff?.staffId).length;
        
      } else if (filteringMode === 'specific') {
        // Mode 'specific': Show only tasks assigned to selected preferred staff
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => {
          const hasMatchingStaff = task.preferredStaff?.staffId && staffIds.includes(task.preferredStaff.staffId);
          const isUnassigned = !task.preferredStaff?.staffId;
          
          return hasMatchingStaff || (includeUnassigned && isUnassigned);
        });
        
        const filtered = originalTaskCount - filteredTaskBreakdown.length;
        tasksFilteredCount += filtered;
        
        modeDetails.tasksMatchingStaff = filteredTaskBreakdown.filter(t => 
          t.preferredStaff?.staffId && staffIds.includes(t.preferredStaff.staffId)
        ).length;
        modeDetails.unassignedTasksIncluded = includeUnassigned ? 
          filteredTaskBreakdown.filter(t => !t.preferredStaff?.staffId).length : 0;
        
      } else if (filteringMode === 'none') {
        // Mode 'none': Show only tasks WITHOUT preferred staff assignments
        filteredTaskBreakdown = filteredTaskBreakdown.filter(task => !task.preferredStaff?.staffId);
        
        const filtered = originalTaskCount - filteredTaskBreakdown.length;
        tasksFilteredCount += filtered;
        
        modeDetails.unassignedTasksShown = filteredTaskBreakdown.length;
        modeDetails.assignedTasksFiltered = filtered;
      }

      // Recalculate point metrics
      const demandHours = filteredTaskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
      const taskCount = filteredTaskBreakdown.length;
      const uniqueClients = new Set(filteredTaskBreakdown.map(task => task.clientId));

      return {
        ...point,
        taskBreakdown: filteredTaskBreakdown,
        demandHours,
        taskCount,
        clientCount: uniqueClients.size
      };
    }).filter(point => point.taskCount > 0); // Remove points with no tasks

    console.log(`✅ [PHASE 4] Three-mode filtering completed:`, {
      mode: filteringMode,
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      tasksFiltered: tasksFilteredCount,
      modeDetails
    });

    return {
      data: {
        ...data,
        dataPoints: filteredDataPoints
      },
      tasksFiltered: tasksFilteredCount,
      mode: filteringMode,
      staffSelected: staffIds.length,
      modeDetails
    };
  }

  // Helper methods for other filter types
  private static applyTimeHorizonFilter(
    data: DemandMatrixData,
    timeHorizon: { start: Date; end: Date }
  ): { data: DemandMatrixData; tasksFiltered: number } {
    const filteredMonths = data.months.filter(month => {
      const monthDate = new Date(month.key + '-01');
      return monthDate >= timeHorizon.start && monthDate <= timeHorizon.end;
    });

    const monthKeys = new Set(filteredMonths.map(m => m.key));
    const filteredDataPoints = data.dataPoints.filter(point => monthKeys.has(point.month));
    
    const tasksFiltered = data.dataPoints.length - filteredDataPoints.length;

    return {
      data: {
        ...data,
        months: filteredMonths,
        dataPoints: filteredDataPoints
      },
      tasksFiltered
    };
  }

  private static applySkillFilter(
    data: DemandMatrixData,
    skills: string[]
  ): { data: DemandMatrixData; tasksFiltered: number } {
    const skillSet = new Set(skills);
    const filteredDataPoints = data.dataPoints.filter(point => skillSet.has(point.skillType));
    
    const tasksFiltered = data.dataPoints.length - filteredDataPoints.length;

    return {
      data: {
        ...data,
        skills: data.skills.filter(skill => skillSet.has(skill)),
        dataPoints: filteredDataPoints
      },
      tasksFiltered
    };
  }

  private static applyClientFilter(
    data: DemandMatrixData,
    clients: string[]
  ): { data: DemandMatrixData; tasksFiltered: number } {
    const clientSet = new Set(clients);
    let tasksFiltered = 0;

    const filteredDataPoints = data.dataPoints.map(point => {
      const originalTaskCount = point.taskBreakdown?.length || 0;
      const filteredTaskBreakdown = point.taskBreakdown?.filter(task => 
        clientSet.has(task.clientId)
      ) || [];
      
      tasksFiltered += originalTaskCount - filteredTaskBreakdown.length;

      // Recalculate metrics
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
      data: {
        ...data,
        dataPoints: filteredDataPoints
      },
      tasksFiltered
    };
  }

  private static recalculateMetrics(data: DemandMatrixData): DemandMatrixData {
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

  private static estimateMemoryUsage(data: DemandMatrixData): number {
    // Rough estimation of memory usage in bytes
    const baseSize = JSON.stringify(data).length * 2; // UTF-16 characters
    return baseSize;
  }
}
