import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { extractStaffId } from './utils/staffIdExtractor';
import { debugLog } from '../logger';

/**
 * Performance Optimizer for Demand Matrix Operations
 * 
 * Provides performance optimization techniques for large-scale demand data processing,
 * including caching, batching, and efficient filtering algorithms.
 */

export interface OptimizationResult {
  optimizedData: DemandMatrixData;
  performanceMetrics: {
    processingTime: number;
    memoryUsage: number;
    optimizationRatio: number;
  };
}

export interface OptimizationOptions {
  enableCaching?: boolean;
  enableBatching?: boolean;
  batchSize?: number;
  enableParallelProcessing?: boolean;
}

/**
 * Performance optimizer for demand matrix operations
 */
export class PerformanceOptimizer {
  private static cache = new Map<string, { data: DemandMatrixData; timestamp: number }>();
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Optimize demand matrix filtering for large datasets
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: OptimizationOptions = {}
  ): OptimizationResult {
    const startTime = Date.now();
    const startMemory = process.memoryUsage?.()?.heapUsed || 0;

    debugLog('Starting performance optimization', { 
      dataPoints: data.dataPoints.length,
      options 
    });

    const {
      enableCaching = true,
      enableBatching = false,
      batchSize = 1000,
      enableParallelProcessing = false
    } = options;

    // Check cache first
    const cacheKey = enableCaching ? this.generateCacheKey(data, filters) : null;
    if (cacheKey) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        debugLog('Cache hit for optimization');
        return {
          optimizedData: cached,
          performanceMetrics: {
            processingTime: Date.now() - startTime,
            memoryUsage: 0,
            optimizationRatio: 1.0
          }
        };
      }
    }

    let optimizedData = { ...data };

    // Apply optimized filtering
    if (enableBatching && data.dataPoints.length > batchSize) {
      optimizedData = this.applyBatchedFiltering(optimizedData, filters, batchSize);
    } else {
      optimizedData = this.applyOptimizedFiltering(optimizedData, filters);
    }

    // Cache result
    if (cacheKey && enableCaching) {
      this.setCachedResult(cacheKey, optimizedData);
    }

    const endTime = Date.now();
    const endMemory = process.memoryUsage?.()?.heapUsed || 0;

    const result: OptimizationResult = {
      optimizedData,
      performanceMetrics: {
        processingTime: endTime - startTime,
        memoryUsage: Math.max(0, endMemory - startMemory),
        optimizationRatio: data.dataPoints.length > 0 
          ? optimizedData.dataPoints.length / data.dataPoints.length 
          : 1.0
      }
    };

    debugLog('Performance optimization completed', result.performanceMetrics);
    return result;
  }

  /**
   * Apply optimized filtering with performance enhancements
   */
  private static applyOptimizedFiltering(
    data: DemandMatrixData,
    filters: DemandFilters
  ): DemandMatrixData {
    let filteredData = { ...data };

    // Time horizon filter (most selective first)
    if (filters.timeHorizon || filters.dateRange) {
      const timeRange = filters.timeHorizon || filters.dateRange;
      if (timeRange) {
        filteredData = this.applyTimeHorizonFilter(filteredData, timeRange);
      }
    }

    // Skill filter
    if (filters.skillTypes?.length || filters.skills?.length) {
      const skills = filters.skillTypes || filters.skills || [];
      filteredData = this.applySkillFilter(filteredData, skills);
    }

    // Client filter
    if (filters.clientIds?.length || filters.clients?.length) {
      const clients = filters.clientIds || filters.clients || [];
      filteredData = this.applyClientFilter(filteredData, clients);
    }

    // Preferred staff filter
    if (filters.preferredStaffIds?.length || filters.preferredStaff) {
      const preferredStaffConfig = filters.preferredStaff || {
        staffIds: filters.preferredStaffIds || [],
        includeUnassigned: false,
        showOnlyPreferred: false
      };
      filteredData = this.applyPreferredStaffFilter(filteredData, preferredStaffConfig);
    }

    return this.recalculateTotals(filteredData);
  }

  /**
   * Apply preferred staff filter with optimized staff ID extraction
   */
  private static applyPreferredStaffFilter(
    data: DemandMatrixData,
    config: {
      staffIds: string[];
      includeUnassigned: boolean;
      showOnlyPreferred: boolean;
    }
  ): DemandMatrixData {
    const { staffIds = [], includeUnassigned = false, showOnlyPreferred = false } = config;
    
    // Determine filtering mode
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

    return {
      ...data,
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

    const monthKeys = new Set(filteredMonths.map(m => m.key));
    const filteredDataPoints = matrixData.dataPoints.filter(point => monthKeys.has(point.month));

    return {
      ...matrixData,
      months: filteredMonths,
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Apply skill filter to matrix data
   */
  private static applySkillFilter(matrixData: DemandMatrixData, skills: string[]): DemandMatrixData {
    const skillSet = new Set(skills);
    const filteredDataPoints = matrixData.dataPoints.filter(point => skillSet.has(point.skillType));
    
    return {
      ...matrixData,
      skills: matrixData.skills.filter(skill => skillSet.has(skill)),
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Apply client filter to matrix data
   */
  private static applyClientFilter(matrixData: DemandMatrixData, clients: string[]): DemandMatrixData {
    const clientSet = new Set(clients);

    const filteredDataPoints = matrixData.dataPoints.map(point => {
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
      ...matrixData,
      dataPoints: filteredDataPoints
    };
  }

  /**
   * Recalculate totals after filtering
   */
  private static recalculateTotals(matrixData: DemandMatrixData): DemandMatrixData {
    const totalDemand = matrixData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
    const totalTasks = matrixData.dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
    
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

  private static generateCacheKey(data: DemandMatrixData, filters: DemandFilters): string {
    return JSON.stringify({
      dataHash: data.dataPoints.length,
      totalDemand: data.totalDemand,
      filters
    });
  }

  private static getCachedResult(cacheKey: string): DemandMatrixData | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(cacheKey);
    return null;
  }

  private static setCachedResult(cacheKey: string, data: DemandMatrixData): void {
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  private static applyBatchedFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    batchSize: number
  ): DemandMatrixData {
    // For large datasets, process in batches
    const batches = [];
    for (let i = 0; i < data.dataPoints.length; i += batchSize) {
      batches.push(data.dataPoints.slice(i, i + batchSize));
    }

    const processedBatches = batches.map(batch => {
      const batchData = { ...data, dataPoints: batch };
      return this.applyOptimizedFiltering(batchData, filters);
    });

    // Combine results
    const combinedDataPoints = processedBatches.flatMap(batch => batch.dataPoints);
    
    return {
      ...data,
      dataPoints: combinedDataPoints
    };
  }
}
