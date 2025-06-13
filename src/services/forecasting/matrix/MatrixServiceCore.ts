
import { MatrixData, ForecastType, MatrixErrorContext } from './types';
import { MATRIX_CONSTANTS } from './constants';
import { MatrixCacheManager } from './MatrixCacheManager';
import { MatrixErrorHandler } from './MatrixErrorHandler';
import { DemandMatrixService } from '../demandMatrixService';
import { MatrixGenerationOrchestrator } from './core/MatrixGenerationOrchestrator';
import { startOfYear } from 'date-fns';
import { debugLog } from '../logger';

/**
 * Matrix Service Core
 * Refactored core business logic for matrix data generation with improved maintainability
 * 
 * FUNCTIONALITY PRESERVED: All existing behavior and functionality remains exactly the same.
 * IMPROVEMENTS: Better code organization, separation of concerns, and maintainability.
 */
export class MatrixServiceCore {
  /**
   * Generate unified matrix forecast data with consistent skill normalization
   * 
   * @param forecastType - Type of forecast to generate
   * @param useCache - Whether to use cached data
   * @returns Promise with matrix data
   */
  static async generateMatrixForecast(
    forecastType: ForecastType = MATRIX_CONSTANTS.DEFAULT_FORECAST_TYPE,
    useCache: boolean = MATRIX_CONSTANTS.DEFAULT_CACHE_ENABLED
  ): Promise<{ matrixData: MatrixData }> {
    const context: MatrixErrorContext = {
      operation: 'generateMatrixForecast',
      forecastType
    };
    
    debugLog(`Generating UNIFIED matrix forecast (${forecastType}) with FIXED skill mapping consistency`);
    
    try {
      // Check cache first if enabled
      if (useCache) {
        const cachedData = this.getCachedDataIfAvailable(forecastType);
        if (cachedData) {
          debugLog('Returning cached matrix data');
          return { matrixData: cachedData };
        }
      }
      
      // Generate fresh data with fixed skill mapping
      const matrixData = await MatrixGenerationOrchestrator.generateFreshMatrixDataWithFixedSkillMapping(
        forecastType, 
        context
      );
      
      // Cache the result if enabled
      if (useCache) {
        this.cacheGeneratedData(forecastType, matrixData);
      }
      
      return { matrixData };
      
    } catch (error) {
      throw MatrixErrorHandler.handleError(error, context);
    }
  }
  
  /**
   * Get cached data if available
   */
  private static getCachedDataIfAvailable(forecastType: ForecastType): MatrixData | null {
    const startDate = startOfYear(new Date());
    return MatrixCacheManager.getCachedData(forecastType, startDate);
  }
  
  /**
   * Cache the generated matrix data
   */
  private static cacheGeneratedData(forecastType: ForecastType, matrixData: MatrixData): void {
    const startDate = startOfYear(new Date());
    MatrixCacheManager.setCachedData(forecastType, startDate, matrixData);
  }
  
  /**
   * Clear all cached data
   */
  static clearCache(): void {
    MatrixCacheManager.clearCache();
    DemandMatrixService.clearCache();
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return MatrixCacheManager.getCacheStats();
  }
}
