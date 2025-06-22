
import { ForecastType, MatrixErrorContext, MatrixData } from '../types';
import { MATRIX_CONSTANTS } from '../constants';
import { MatrixCacheManager } from '../MatrixCacheManager';
import { MatrixErrorHandler } from '../MatrixErrorHandler';
import { DemandMatrixService } from '../../demandMatrixService';
import { SkillAwareForecastingService } from '../../skillAwareForecastingService';
import { startOfYear } from 'date-fns';
import { debugLog } from '../../logger';
import { MatrixDataTransformer } from './MatrixDataTransformer';
import { MatrixValidationOrchestrator } from './MatrixValidationOrchestrator';

/**
 * Matrix Forecast Generator
 * Handles the core logic for generating matrix forecasts
 */
export class MatrixForecastGenerator {
  /**
   * Generate fresh matrix data without cache
   */
  static async generateFreshMatrixData(
    forecastType: ForecastType,
    context: MatrixErrorContext
  ): Promise<MatrixData> {
    const currentYear = new Date().getFullYear();
    const startDate = startOfYear(new Date(currentYear, 0, 1));
    const endDate = new Date(currentYear, 11, 31);
    
    context.startDate = startDate;
    context.endDate = endDate;
    
    try {
      // UNIFIED: Use DemandMatrixService for demand data
      const { matrixData: demandMatrix } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // Generate capacity forecast using existing skill-aware service
      const capacityForecast = await SkillAwareForecastingService.generateCapacityForecast(
        startDate,
        endDate
      );
      
      debugLog('VALIDATION: Demand data before transformation', {
        sampleJune2025: demandMatrix.dataPoints.filter(dp => dp.month.includes('2025-06')),
        totalDemand: demandMatrix.totalDemand
      });

      // Transform demand and capacity into matrix data
      const matrixData = MatrixDataTransformer.transformDemandToMatrix(demandMatrix, capacityForecast);

      debugLog('VALIDATION: Matrix data after transformation', {
        sampleJune2025: matrixData.dataPoints.filter(dp => dp.month.includes('2025-06')),
        totalDemand: matrixData.totalDemand
      });
      
      // Validate the transformed data
      await MatrixValidationOrchestrator.validateTransformedData(matrixData, demandMatrix, context);
      
      debugLog('UNIFIED Matrix data generated successfully', {
        months: matrixData.months.length,
        skills: matrixData.skills.length,
        dataPoints: matrixData.dataPoints.length,
        totalDemand: matrixData.totalDemand,
        totalCapacity: matrixData.totalCapacity,
        totalGap: matrixData.totalGap,
        demandSource: 'DemandMatrixService (UNIFIED)',
        capacitySource: 'SkillAwareForecastingService'
      });
      
      return matrixData;
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        throw error; // Re-throw validation errors as-is
      }
      throw MatrixErrorHandler.handleError(error, context);
    }
  }

  /**
   * Generate matrix forecast with caching support
   */
  static async generateMatrixForecast(
    forecastType: ForecastType = MATRIX_CONSTANTS.DEFAULT_FORECAST_TYPE,
    useCache: boolean = MATRIX_CONSTANTS.DEFAULT_CACHE_ENABLED
  ): Promise<{ matrixData: MatrixData }> {
    const context: MatrixErrorContext = {
      operation: 'generateMatrixForecast',
      forecastType
    };
    
    debugLog(`Generating UNIFIED matrix forecast (${forecastType}) using DemandMatrixService`);
    
    try {
      // Check cache first if enabled
      if (useCache) {
        const startDate = startOfYear(new Date());
        const cachedData = MatrixCacheManager.getCachedData(forecastType, startDate);
        if (cachedData) {
          debugLog('Returning cached matrix data');
          return { matrixData: cachedData };
        }
      }
      
      // Generate fresh data
      const matrixData = await this.generateFreshMatrixData(forecastType, context);
      
      // Cache the result if enabled
      if (useCache) {
        const startDate = startOfYear(new Date());
        MatrixCacheManager.setCachedData(forecastType, startDate, matrixData);
      }
      
      return { matrixData };
      
    } catch (error) {
      throw MatrixErrorHandler.handleError(error, context);
    }
  }
}
