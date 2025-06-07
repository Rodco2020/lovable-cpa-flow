
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
 * Matrix Service - Main Orchestrator (Phase 3: Client Filtering Enhanced)
 * 
 * Coordinates the generation of forecast data optimized for 12-month matrix display.
 * Enhanced with client filtering capabilities and database-only skill enforcement.
 * 
 * Phase 3 Features:
 * - Client filtering integration with data generation pipeline
 * - Backward compatibility with existing functionality
 * - Enhanced validation for filtered data
 * - Proper error handling for edge cases
 */

interface MatrixGenerationOptions {
  clientIds?: string[];
  includeInactive?: boolean;
}

/**
 * Generate forecast data specifically optimized for 12-month matrix display
 * Enhanced with client filtering capabilities (Phase 3)
 */
export const generateMatrixForecast = async (
  forecastType: 'virtual' | 'actual' = 'virtual',
  startDate: Date = new Date(),
  options?: MatrixGenerationOptions
): Promise<{ forecastResult: ForecastResult; matrixData: MatrixData }> => {
  const normalizedStartDate = startOfMonth(startDate);
  
  debugLog('=== PHASE 3 MATRIX FORECAST GENERATION START ===');
  debugLog('Generating matrix forecast with client filtering:', {
    forecastType,
    startDate: normalizedStartDate,
    clientFiltering: !!options?.clientIds,
    clientCount: options?.clientIds?.length || 0,
    clientIds: options?.clientIds
  });

  try {
    // Step 1-4: Generate forecast data with client filtering
    const { forecastResult, availableSkills } = await MatrixForecastGenerator.generateForecastData(
      forecastType,
      normalizedStartDate,
      options // Pass filtering options to generator
    );

    debugLog('Phase 3: Forecast data generated with client filtering applied');

    // Handle empty skills case
    if (availableSkills.length === 0) {
      const emptyMatrixData = MatrixDataTransformer.createEmptyMatrixData(normalizedStartDate);
      debugLog('Phase 3: No skills available - returning empty matrix data');
      return { forecastResult, matrixData: emptyMatrixData };
    }

    // Step 5-7: Transform to matrix format with client-filtered data
    const matrixData = MatrixDataTransformer.transformToMatrixData(
      forecastResult,
      availableSkills,
      normalizedStartDate
    );

    debugLog('Phase 3: Matrix data transformation completed with client filtering:', {
      originalDataPoints: forecastResult.data.length,
      matrixDataPoints: matrixData.dataPoints.length,
      clientFilterApplied: !!options?.clientIds,
      filteredForClients: options?.clientIds?.length || 0,
      totalDemand: matrixData.totalDemand,
      totalCapacity: matrixData.totalCapacity
    });

    debugLog('=== PHASE 3 MATRIX FORECAST GENERATION SUCCESS ===');

    return {
      forecastResult,
      matrixData
    };
  } catch (error) {
    debugLog('=== PHASE 3 MATRIX FORECAST GENERATION FAILED ===');
    debugLog('Error generating matrix forecast with client filtering:', error);
    
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
      
      debugLog('Phase 3: Fallback to empty data due to error');
      return { 
        forecastResult: emptyForecastResult, 
        matrixData: emptyMatrixData 
      };
    } catch (fallbackError) {
      debugLog('Phase 3: Empty data creation also failed:', fallbackError);
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
 * Cache key generator for matrix forecasts (enhanced for client filtering)
 */
export const getMatrixCacheKey = (
  forecastType: 'virtual' | 'actual',
  startDate: Date,
  options?: MatrixGenerationOptions
): string => {
  const baseKey = MatrixCacheUtils.getMatrixCacheKey(forecastType, startDate);
  
  if (options?.clientIds && options.clientIds.length > 0) {
    const clientKey = options.clientIds.sort().join(',');
    return `${baseKey}_clients:${clientKey}`;
  }
  
  return baseKey;
};

// Re-export utilities for backward compatibility
export { MatrixForecastGenerator } from './matrix/forecastGenerator';
export { MatrixDataTransformer } from './matrix/matrixTransformer';
export { MatrixDataValidator } from './matrix/matrixValidator';
export { MatrixCacheUtils } from './matrix/cacheUtils';
