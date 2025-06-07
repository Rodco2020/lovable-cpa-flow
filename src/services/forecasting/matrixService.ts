
import { 
  ForecastParameters, 
  ForecastResult
} from '@/types/forecasting';
import { MatrixData } from './matrixUtils';
import { MatrixForecastGenerator } from './matrix/forecastGenerator';
import { MatrixDataTransformer } from './matrix/matrixTransformer';
import { MatrixDataValidator } from './matrix/matrixValidator';
import { MatrixCacheUtils } from './matrix/cacheUtils';
import { debugLog } from './logger';
import { startOfMonth } from 'date-fns';

/**
 * Matrix Service - Main Orchestrator
 * 
 * Coordinates the generation of forecast data optimized for 12-month matrix display.
 * Enhanced with database-only skill enforcement and modular architecture.
 * 
 * This service has been refactored into focused modules for better maintainability:
 * - MatrixForecastGenerator: Core forecast generation logic
 * - MatrixDataTransformer: Data transformation and formatting
 * - MatrixDataValidator: Data validation and quality checks
 * - MatrixCacheUtils: Cache management utilities
 */

/**
 * Generate forecast data specifically optimized for 12-month matrix display
 * Enhanced with database-only skill enforcement
 */
export const generateMatrixForecast = async (
  forecastType: 'virtual' | 'actual' = 'virtual',
  startDate: Date = new Date()
): Promise<{ forecastResult: ForecastResult; matrixData: MatrixData }> => {
  const normalizedStartDate = startOfMonth(startDate);

  try {
    // Step 1-4: Generate forecast data
    const { forecastResult, availableSkills } = await MatrixForecastGenerator.generateForecastData(
      forecastType,
      normalizedStartDate
    );

    // Handle empty skills case
    if (availableSkills.length === 0) {
      const emptyMatrixData = MatrixDataTransformer.createEmptyMatrixData(normalizedStartDate);
      return { forecastResult, matrixData: emptyMatrixData };
    }

    // Step 5-7: Transform to matrix format
    const matrixData = MatrixDataTransformer.transformToMatrixData(
      forecastResult,
      availableSkills,
      normalizedStartDate
    );

    return {
      forecastResult,
      matrixData
    };
  } catch (error) {
    debugLog('=== MATRIX FORECAST GENERATION FAILED ===');
    debugLog('Error generating matrix forecast:', error);
    
    // Create empty data so the UI doesn't completely break
    try {
      const emptyMatrixData = MatrixDataTransformer.createEmptyMatrixData(normalizedStartDate);
      const emptyForecastResult: ForecastResult = {
        parameters: {
          mode: forecastType,
          timeframe: 'custom',
          dateRange: { 
            startDate: normalizedStartDate, 
            endDate: normalizedStartDate 
          },
          granularity: 'monthly',
          includeSkills: 'all'
        },
        data: [],
        financials: [],
        summary: {
          totalDemand: 0,
          totalCapacity: 0,
          gap: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0
        },
        generatedAt: new Date()
      };
      
      return { 
        forecastResult: emptyForecastResult, 
        matrixData: emptyMatrixData 
      };
    } catch (fallbackError) {
      debugLog('Empty data creation also failed:', fallbackError);
      throw new Error(`Matrix forecast generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Validate matrix data to ensure it meets expected criteria
 */
export const validateMatrixData = (matrixData: MatrixData): string[] => {
  return MatrixDataValidator.validateMatrixData(matrixData);
};

/**
 * Cache key generator for matrix forecasts
 */
export const getMatrixCacheKey = (
  forecastType: 'virtual' | 'actual',
  startDate: Date
): string => {
  return MatrixCacheUtils.getMatrixCacheKey(forecastType, startDate);
};

// Re-export utilities for backward compatibility
export { MatrixForecastGenerator } from './matrix/forecastGenerator';
export { MatrixDataTransformer } from './matrix/matrixTransformer';
export { MatrixDataValidator } from './matrix/matrixValidator';
export { MatrixCacheUtils } from './matrix/cacheUtils';
