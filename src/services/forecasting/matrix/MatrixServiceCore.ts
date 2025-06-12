
import { MatrixData, ForecastType, MatrixErrorContext, MonthInfo, MatrixDataPoint } from './types';
import { MATRIX_CONSTANTS } from './constants';
import { MatrixValidator } from './MatrixValidator';
import { MatrixCacheManager } from './MatrixCacheManager';
import { MatrixErrorHandler } from './MatrixErrorHandler';
import { MatrixDataProcessor } from './MatrixDataProcessor';
import { DemandMatrixService } from '../demandMatrixService';
import { SkillAwareForecastingService } from '../skillAwareForecastingService';
import { startOfYear } from 'date-fns';
import { debugLog } from '../logger';
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';
import { SkillType } from '@/types/task';

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
      
      debugLog('VALIDATION: Demand data before transformation', {
        sampleJune2025: demandMatrix.dataPoints.filter(dp => dp.month.includes('2025-06')),
        totalDemand: demandMatrix.totalDemand
      });

      // Transform demand and capacity into matrix data without corruption
      const matrixData = this.preservingTransformDemandToMatrix(demandMatrix, capacityForecast);

      debugLog('VALIDATION: Matrix data after transformation', {
        sampleJune2025: matrixData.dataPoints.filter(dp => dp.month.includes('2025-06')),
        totalDemand: matrixData.totalDemand
      });
      
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
  private static combineDemandAndCapacity(demandMatrix: any, capacityForecast: any[]) {
    const months = demandMatrix.months;
    
    // Build demand map by month and skill from unified demand matrix
    const demandByMonth = new Map();
    demandMatrix.dataPoints.forEach((dp: any) => {
      const monthMap = demandByMonth.get(dp.month) || new Map();
      monthMap.set(dp.skillType, (monthMap.get(dp.skillType) || 0) + dp.demandHours);
      demandByMonth.set(dp.month, monthMap);
    });
    
    // Construct combined forecast array
    return months.map((month: any) => {
      const demandMap = demandByMonth.get(month.key) || new Map();
      const demand = Array.from(demandMap.entries()).map(([skill, hours]) => ({ skill, hours }));
      const capacityPeriod = capacityForecast.find(p => p.period === month.key);
      const capacity = capacityPeriod?.capacity || [];
      
      return {
        period: month.key,
        demand,
        capacity
      };
    });
  }

  /**
   * Transform demand matrix and capacity forecast into MatrixData without altering demand values
   */
  private static preservingTransformDemandToMatrix(
    demandMatrix: DemandMatrixData,
    capacityForecast: any[]
  ): MatrixData {
    const months: MonthInfo[] = demandMatrix.months.map((m, index) => ({
      key: m.key,
      label: m.label,
      index: (m as any).index ?? index
    }));

    // Build the union of all skills from demand and capacity data.
    // Use trimmed string keys to avoid mismatches caused by whitespace
    const skillSet = new Set<string>();
    demandMatrix.skills.forEach(s => skillSet.add(String(s).trim()));
    capacityForecast.forEach(period => {
      period.capacity.forEach((c: any) => skillSet.add(String(c.skill).trim()));
    });
    const skills = Array.from(skillSet).sort() as SkillType[];

    // Map month -> skill -> demand data using sanitized skill keys
    const demandMap = new Map<string, Map<string, DemandDataPoint>>();
    demandMatrix.dataPoints.forEach(dp => {
      const monthMap = demandMap.get(dp.month) || new Map<string, DemandDataPoint>();
      const skillKey = String(dp.skillType).trim();
      monthMap.set(skillKey, dp);
      demandMap.set(dp.month, monthMap);
    });

    const capacityMap = new Map<string, Map<string, number>>();
    capacityForecast.forEach(period => {
      const monthMap = capacityMap.get(period.period) || new Map<string, number>();
      period.capacity.forEach((c: any) => {
        const skillKey = String(c.skill).trim();
        monthMap.set(skillKey, (monthMap.get(skillKey) || 0) + c.hours);
      });
      capacityMap.set(period.period, monthMap);
    });

    const dataPoints: MatrixDataPoint[] = [];
    for (const skill of skills) {
      const skillKey = String(skill).trim();
      for (const month of months) {
        const demandPoint = demandMap.get(month.key)?.get(skillKey);
        const demandHours = demandPoint?.demandHours || 0;
        const capacityHours = capacityMap.get(month.key)?.get(skillKey) || 0;
        const gap = demandHours - capacityHours;
        const utilizationPercent = capacityHours > 0 ? Math.round((demandHours / capacityHours) * 100) : 0;

        dataPoints.push({
          skillType: skill,
          month: month.key,
          monthLabel: month.label,
          demandHours,
          capacityHours,
          gap,
          utilizationPercent
        });
      }
    }

    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalCapacity = dataPoints.reduce((sum, dp) => sum + dp.capacityHours, 0);
    const totalGap = totalDemand - totalCapacity;

    return {
      months,
      skills,
      dataPoints,
      totalDemand,
      totalCapacity,
      totalGap
    };
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
