
import { MatrixData, ForecastType, MatrixErrorContext } from './types';
import { MATRIX_CONSTANTS } from './constants';
import { MatrixValidator } from './MatrixValidator';
import { MatrixCacheManager } from './MatrixCacheManager';
import { MatrixErrorHandler } from './MatrixErrorHandler';
import { MatrixDataProcessor } from './MatrixDataProcessor';
import { DemandMatrixService } from '../demandMatrixService';
import { SkillAwareForecastingService } from '../skillAwareForecastingService';
import { startOfYear } from 'date-fns';
import { debugLog } from '../logger';

/**
 * Matrix Service Core
 * Core business logic for matrix data generation
 */
export class MatrixServiceCore {
  /**
   * Generate unified matrix forecast data
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
  
  /**
   * Generate fresh matrix data without cache
   */
  private static async generateFreshMatrixData(
    forecastType: ForecastType,
    context: MatrixErrorContext
  ): Promise<MatrixData> {
    const currentYear = new Date().getFullYear();
    const startDate = startOfYear(new Date(currentYear, 0, 1));
    const endDate = new Date(currentYear, 11, 31);
    
    context.startDate = startDate;
    context.endDate = endDate;
    
    try {
      // UNIFIED: Use DemandMatrixService for demand data (same as Demand Forecast Matrix)
      const { matrixData: demandMatrix } = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        startDate
      );
      
      // Generate capacity forecast using existing skill-aware service
      const capacityForecast = await SkillAwareForecastingService.generateCapacityForecast(
        startDate,
        endDate
      );
      
      // Combine demand and capacity data
      const combinedForecast = await this.combineDemandAndCapacity(demandMatrix, capacityForecast);
      
      // Transform combined forecast into matrix data structure
      const matrixData = MatrixDataProcessor.transformForecastDataToMatrix(combinedForecast);
      
      // Validate the generated data
      const validation = MatrixValidator.validateMatrixData(matrixData);
      if (!validation.isValid) {
        throw MatrixErrorHandler.handleValidationError(validation.issues, context);
      }
      
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
   * Combine demand matrix data with capacity forecast data
   */
  private static async combineDemandAndCapacity(
    _demandMatrix: any,
    capacityForecast: any[]
  ) {
    // fetch correct demand-only data
    const startDate = startOfYear(new Date());
    const { matrixData: freshDemand } = await DemandMatrixService.generateDemandMatrix(
      'demand-only',
      startDate
    );

    // merge each month/skill entry with capacityForecast
    return freshDemand.dataPoints.map((dm: any) => {
      const capPeriod = capacityForecast.find(cf => cf.period === dm.month);
      const capSkill = capPeriod?.capacity.find((c: any) => c.skill === dm.skillType);
      const capacityHours = capSkill?.hours || 0;

      return {
        skillId: dm.skillType,
        month: dm.month,
        demandHours: dm.demandHours,
        capacityHours,
        gap: capacityHours - dm.demandHours,
        utilizationPercent: capacityHours > 0 ? (dm.demandHours / capacityHours) * 100 : 0,
        taskCount: dm.taskCount,
        clientCount: dm.clientCount
      } as MatrixData;
    });
  }
  
  /**
   * Clear all cached data
   */
  static clearCache(): void {
    MatrixCacheManager.clearCache();
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return MatrixCacheManager.getCacheStats();
  }
}
