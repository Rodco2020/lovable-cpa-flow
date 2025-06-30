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

// Import new debugging and validation infrastructure
import { MatrixDebugLogger } from './debug/MatrixDebugLogger';
import { DataIntegrityValidator, ValidationResult } from './validation/DataIntegrityValidator';
import { SkillMappingVerifier } from './validation/SkillMappingVerifier';

/**
 * Matrix Service Core
 * Core business logic for matrix data generation with enhanced debugging
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
      // Pass undefined for filters since we don't have any active filters in this context
      const { matrixData: demandMatrix } = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        undefined // No active filters for this unified matrix generation
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

      // Transform demand and capacity into matrix data WITH ENHANCED DEBUGGING
      const matrixData = this.preservingTransformDemandToMatrix(demandMatrix, capacityForecast);

      debugLog('VALIDATION: Matrix data after transformation', {
        sampleJune2025: matrixData.dataPoints.filter(dp => dp.month.includes('2025-06')),
        totalDemand: matrixData.totalDemand
      });
      
      // Enhanced validation with new infrastructure
      const validation = MatrixValidator.validateMatrixData(matrixData);
      if (!validation.isValid) {
        throw MatrixErrorHandler.handleValidationError(validation.issues, context);
      }

      // Additional data integrity validation
      const integrityValidation = DataIntegrityValidator.validateDemandPreservation(demandMatrix, matrixData);
      if (!integrityValidation.isValid) {
        console.error('❌ Data integrity validation failed:', integrityValidation.errors);
        debugLog('Data integrity validation failed', integrityValidation);
      }

      // Skill mapping verification
      const skillMappingReport = SkillMappingVerifier.verifySkillKeyConsistency(
        demandMatrix.skills,
        demandMatrix.dataPoints,
        matrixData.skills
      );
      
      if (skillMappingReport.consistencyIssues.length > 0) {
        console.warn('⚠️ Skill mapping consistency issues detected:', skillMappingReport.consistencyIssues);
        debugLog('Skill mapping issues', skillMappingReport);
      }
      
      debugLog('UNIFIED Matrix data generated successfully', {
        months: matrixData.months.length,
        skills: matrixData.skills.length,
        dataPoints: matrixData.dataPoints.length,
        totalDemand: matrixData.totalDemand,
        totalCapacity: matrixData.totalCapacity,
        totalGap: matrixData.totalGap,
        demandSource: 'DemandMatrixService (UNIFIED)',
        capacitySource: 'SkillAwareForecastingService',
        integrityValidation: integrityValidation.isValid,
        skillMappingIssues: skillMappingReport.consistencyIssues.length
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
   * Transform demand matrix and capacity forecast into MatrixData WITH ENHANCED DEBUGGING
   */
  private static preservingTransformDemandToMatrix(
    demandMatrix: DemandMatrixData,
    capacityForecast: any[]
  ): MatrixData {
    // PHASE 1: Enhanced debugging - Log transformation start
    MatrixDebugLogger.logTransformationStart(demandMatrix, capacityForecast);

    const months: MonthInfo[] = demandMatrix.months.map((m, index) => ({
      key: m.key,
      label: m.label,
      index: (m as any).index ?? index
    }));

    // PHASE 1: Enhanced debugging - Log skill set creation
    const demandSkills = demandMatrix.skills;
    const capacitySkills: string[] = [];
    capacityForecast.forEach(period => {
      period.capacity.forEach((c: any) => capacitySkills.push(String(c.skill).trim()));
    });

    // Build the union of all skills from demand and capacity data.
    // Use trimmed string keys to avoid mismatches caused by whitespace
    const skillSet = new Set<string>();
    demandMatrix.skills.forEach(s => skillSet.add(String(s).trim()));
    capacityForecast.forEach(period => {
      period.capacity.forEach((c: any) => skillSet.add(String(c.skill).trim()));
    });
    const skills = Array.from(skillSet).sort() as SkillType[];

    // PHASE 1: Enhanced debugging - Log skill set creation results
    MatrixDebugLogger.logSkillSetCreation(demandSkills, capacitySkills, skills);

    // VALIDATION CHECKPOINT: Skill set creation
    MatrixDebugLogger.logValidationCheckpoint(
      'Skill Set Creation',
      { originalSkills: demandSkills.length, finalSkills: skills.length },
      skills.length >= demandSkills.length
    );

    // Map month -> skill -> demand data using sanitized skill keys
    const demandMap = new Map<string, Map<string, DemandDataPoint>>();
    demandMatrix.dataPoints.forEach(dp => {
      const monthMap = demandMap.get(dp.month) || new Map<string, DemandDataPoint>();
      const skillKey = String(dp.skillType).trim();
      monthMap.set(skillKey, dp);
      demandMap.set(dp.month, monthMap);
    });

    // PHASE 1: Enhanced debugging - Log demand map creation
    MatrixDebugLogger.logDemandMapCreation(demandMatrix.dataPoints, demandMap);

    const capacityMap = new Map<string, Map<string, number>>();
    capacityForecast.forEach(period => {
      const monthMap = capacityMap.get(period.period) || new Map<string, number>();
      period.capacity.forEach((c: any) => {
        const skillKey = String(c.skill).trim();
        monthMap.set(skillKey, (monthMap.get(skillKey) || 0) + c.hours);
      });
      capacityMap.set(period.period, monthMap);
    });

    // PHASE 1: Enhanced debugging - Log capacity map creation
    MatrixDebugLogger.logCapacityMapCreation(capacityForecast, capacityMap);

    // VALIDATION CHECKPOINT: Map creation
    const expectedDemandSum = demandMatrix.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const actualDemandInMap = Array.from(demandMap.values()).reduce((sum, monthMap) => {
      return sum + Array.from(monthMap.values()).reduce((monthSum, dp) => monthSum + dp.demandHours, 0);
    }, 0);
    
    MatrixDebugLogger.logValidationCheckpoint(
      'Demand Map Integrity',
      { expected: expectedDemandSum, actual: actualDemandInMap },
      expectedDemandSum === actualDemandInMap
    );

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

    // PHASE 1: Enhanced debugging - Log data point generation
    MatrixDebugLogger.logDataPointGeneration(skills, months, demandMap, capacityMap, dataPoints);

    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalCapacity = dataPoints.reduce((sum, dp) => sum + dp.capacityHours, 0);
    const totalGap = totalDemand - totalCapacity;

    const matrixData: MatrixData = {
      months,
      skills,
      dataPoints,
      totalDemand,
      totalCapacity,
      totalGap
    };

    // VALIDATION CHECKPOINT: Final data integrity
    MatrixDebugLogger.logValidationCheckpoint(
      'Final Data Integrity',
      { 
        originalTotalDemand: demandMatrix.totalDemand, 
        transformedTotalDemand: totalDemand,
        preserved: demandMatrix.totalDemand === totalDemand
      },
      demandMatrix.totalDemand === totalDemand
    );

    // PHASE 1: Enhanced debugging - Log transformation completion
    MatrixDebugLogger.logTransformationComplete(demandMatrix, matrixData);

    return matrixData;
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
