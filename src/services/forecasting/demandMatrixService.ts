import { debugLog } from './logger';
import { DemandDataService } from './demandDataService';
import { DemandMatrixData, DemandMatrixMode, DemandFilters, DemandForecastParameters } from '@/types/demand';
import { MatrixValidationService } from './matrixValidationService';
import { MatrixCacheManager } from './cache/matrixCacheManager';
import { DemandPerformanceOptimizer } from './demand/performanceOptimizer';

/**
 * Demand Matrix Service
 * Handles the generation, validation, and caching of the demand matrix
 */
export class DemandMatrixService {
  private static cacheManager = new MatrixCacheManager();

  /**
   * Clear the matrix cache
   */
  static clearCache(): void {
    debugLog('Clearing demand matrix cache');
    this.cacheManager.clearCache();
  }

  /**
   * Validate demand matrix data
   */
  static validateDemandMatrixData(matrixData: DemandMatrixData): string[] {
    return MatrixValidationService.validateMatrixData(matrixData);
  }

  /**
   * Generate demand matrix with enhanced error handling
   */
  static async generateDemandMatrix(
    mode: DemandMatrixMode = 'demand-only'
  ): Promise<{ matrixData: DemandMatrixData }> {
    const startTime = performance.now();
    debugLog('Generating demand matrix', { mode });

    try {
      // Define 12-month forecast parameters with updated interface
      const parameters: DemandForecastParameters = {
        timeHorizon: 'year',
        dateRange: {
          startDate: new Date(new Date().getFullYear(), 0, 1), // Jan 1st
          endDate: new Date(new Date().getFullYear(), 11, 31)  // Dec 31st
        },
        includeSkills: 'all',
        includeClients: 'all',
        includePreferredStaff: 'all', // NEW: Add missing includePreferredStaff
        granularity: 'monthly'
      };

      // Generate forecast and get matrix data
      const { demandMatrix } = await DemandDataService.generateDemandForecastWithMatrix(parameters);

      // Apply default filters (no filtering) with updated interface
      const filters: DemandFilters = {
        skills: [],
        clients: [],
        preferredStaff: [], // NEW: Add missing preferredStaff
        timeHorizon: {
          start: parameters.dateRange.startDate,
          end: parameters.dateRange.endDate
        }
      };

      // Apply performance optimization
      const optimizedMatrix = DemandPerformanceOptimizer.optimizeFiltering(demandMatrix, filters);

      const processingTime = performance.now() - startTime;
      debugLog(`Matrix generated successfully in ${processingTime.toFixed(2)}ms`, {
        months: optimizedMatrix.months.length,
        skills: optimizedMatrix.skills.length,
        dataPoints: optimizedMatrix.dataPoints.length,
        totalDemand: optimizedMatrix.totalDemand
      });

      return { matrixData: optimizedMatrix };

    } catch (error) {
      console.error('Error generating demand matrix:', error);
      throw new Error(`Failed to generate demand matrix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate and cache demand matrix data
   */
  static async generateAndCacheDemandMatrix(
    mode: DemandMatrixMode = 'demand-only'
  ): Promise<{ matrixData: DemandMatrixData }> {
    const cacheKey = `demandMatrix-${mode}`;

    try {
      // Try to get data from cache
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        debugLog('Using cached demand matrix data', { cacheKey });
        return { matrixData: cachedData.data };
      }

      // Generate new data if not in cache
      const { matrixData } = await this.generateDemandMatrix(mode);

      // Store the generated data in the cache
      await this.cacheManager.set(cacheKey, matrixData);
      debugLog('Stored demand matrix data in cache', { cacheKey });

      return { matrixData };
    } catch (error) {
      console.error('Error generating and caching demand matrix:', error);
      throw error;
    }
  }
}
