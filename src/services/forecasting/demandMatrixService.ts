
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from './logger';
import { MatrixTransformerCore } from './demand/matrixTransformer/matrixTransformerCore';
import { DataFetcher } from './demand/dataFetcher';
import { DemandPerformanceOptimizer } from './demand/performanceOptimizer';
import { DemandMatrixValidator } from './demand/demandMatrixValidator';
import { startOfYear, addMonths } from 'date-fns';

/**
 * Demand Matrix Service with Enhanced Preferred Staff Support
 * Core service for generating demand matrix data with preferred staff filtering capabilities
 */
export class DemandMatrixService {
  private static cache = new Map<string, { data: DemandMatrixData; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate demand matrix with preferred staff integration
   */
  static async generateDemandMatrix(
    forecastType: 'demand-only' | 'combined' = 'demand-only',
    startDate: Date = startOfYear(new Date()),
    filters?: DemandFilters
  ): Promise<{ matrixData: DemandMatrixData }> {
    const cacheKey = this.buildCacheKey(forecastType, startDate, filters);
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      debugLog('Returning cached demand matrix data');
      return { matrixData: cached };
    }

    debugLog('Generating fresh demand matrix data with preferred staff support', { 
      forecastType, 
      startDate,
      hasPreferredStaffFilter: !!filters?.preferredStaff?.staffIds?.length
    });

    try {
      // Fetch forecast and task data
      const forecastData = await DataFetcher.fetchForecastData(startDate);
      const tasks = await DataFetcher.fetchRecurringTasks();

      console.log(`📊 [DEMAND MATRIX SERVICE] Data fetched: ${forecastData.length} forecast periods, ${tasks.length} tasks`);

      // Transform to matrix data with preferred staff processing
      const matrixData = await MatrixTransformerCore.transformToMatrixData(forecastData, tasks);

      // Apply preferred staff filters if provided
      let filteredMatrixData = matrixData;
      if (filters) {
        console.log('🎯 [DEMAND MATRIX SERVICE] Applying preferred staff filters:', {
          skillsFilter: filters.skills?.length || 0,
          clientsFilter: filters.clients?.length || 0,
          preferredStaffFilter: filters.preferredStaff?.staffIds?.length || 0
        });

        filteredMatrixData = DemandPerformanceOptimizer.optimizeFiltering(matrixData, filters);
      }

      // Validate the matrix data
      const validation = DemandMatrixValidator.validateDemandMatrixData(filteredMatrixData);
      if (!validation.isValid) {
        console.warn('⚠️ [DEMAND MATRIX SERVICE] Matrix validation issues:', validation.issues);
      }

      // Cache the result
      this.setCachedData(cacheKey, filteredMatrixData);

      console.log(`✅ [DEMAND MATRIX SERVICE] Matrix generated successfully: ${filteredMatrixData.dataPoints.length} data points, ${filteredMatrixData.totalDemand}h total demand`);

      return { matrixData: filteredMatrixData };

    } catch (error) {
      console.error('❌ [DEMAND MATRIX SERVICE] Error generating demand matrix:', error);
      throw new Error(`Failed to generate demand matrix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate demand matrix data with preferred staff validation
   */
  static validateDemandMatrixData(data: DemandMatrixData): string[] {
    return DemandMatrixValidator.validateDemandMatrixData(data).issues;
  }

  /**
   * Enhanced cache management
   */
  private static buildCacheKey(forecastType: string, startDate: Date, filters?: DemandFilters): string {
    const baseKey = `${forecastType}-${startDate.toISOString().split('T')[0]}`;
    
    if (!filters) return baseKey;
    
    const filterKey = [
      filters.skills?.sort().join(',') || '',
      filters.clients?.sort().join(',') || '',
      filters.preferredStaff?.staffIds?.sort().join(',') || '',
      filters.timeHorizon ? `${filters.timeHorizon.start.toISOString()}-${filters.timeHorizon.end.toISOString()}` : ''
    ].join('|');
    
    return `${baseKey}-${filterKey}`;
  }

  private static getCachedData(cacheKey: string): DemandMatrixData | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(cacheKey);
    }
    return null;
  }

  private static setCachedData(cacheKey: string, data: DemandMatrixData): void {
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  /**
   * Clear cache for fresh data generation
   */
  static clearCache(): void {
    this.cache.clear();
    debugLog('Demand matrix cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
