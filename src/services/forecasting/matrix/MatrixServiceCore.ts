
import { MatrixData, ForecastType, MatrixErrorContext } from './types';
import { MATRIX_CONSTANTS } from './constants';
import { MatrixCacheManager } from './MatrixCacheManager';
import { DemandMatrixService } from '../demandMatrixService';
import { MatrixForecastGenerator } from './core/MatrixForecastGenerator';

/**
 * Matrix Service Core
 * Simplified orchestration layer for matrix data generation
 * Refactored for improved maintainability while preserving exact functionality
 */
export class MatrixServiceCore {
  /**
   * Generate unified matrix forecast data
   */
  static async generateMatrixForecast(
    forecastType: ForecastType = MATRIX_CONSTANTS.DEFAULT_FORECAST_TYPE,
    useCache: boolean = MATRIX_CONSTANTS.DEFAULT_CACHE_ENABLED
  ): Promise<{ matrixData: MatrixData }> {
    return MatrixForecastGenerator.generateMatrixForecast(forecastType, useCache);
  }
  
  /**
   * Generate matrix using the correct service method
   */
  static async generateMatrix(mode: string = 'demand-only'): Promise<any> {
    try {
      // Use the correct method signature - single parameter
      const result = await DemandMatrixService.generateDemandMatrix(mode as any);
      return result;
    } catch (error) {
      console.error('Error generating matrix in MatrixServiceCore:', error);
      throw error;
    }
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
