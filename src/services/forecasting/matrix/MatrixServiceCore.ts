
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

      // Transform demand and capacity into matrix data WITH FIXED SKILL MAPPING
      const matrixData = this.skillPreservingTransformDemandToMatrix(demandMatrix, capacityForecast);

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
   * PHASE 2: FIXED - Transform demand matrix and capacity forecast into MatrixData with PRESERVED SKILL KEYS
   * This method fixes the skill key mapping corruption by preserving original skill identifiers
   */
  private static skillPreservingTransformDemandToMatrix(
    demandMatrix: DemandMatrixData,
    capacityForecast: any[]
  ): MatrixData {
    // PHASE 2: Enhanced debugging - Log transformation start
    MatrixDebugLogger.logTransformationStart(demandMatrix, capacityForecast);

    const months: MonthInfo[] = demandMatrix.months.map((m, index) => ({
      key: m.key,
      label: m.label,
      index: index
    }));

    // PHASE 2 FIX: PRESERVE ORIGINAL SKILL KEYS - No trimming or string conversion
    // Extract skills directly from demand matrix WITHOUT modification
    const demandSkills = [...demandMatrix.skills]; // Direct copy without transformation
    
    // Extract capacity skills and preserve their original form
    const capacitySkills: SkillType[] = [];
    capacityForecast.forEach(period => {
      if (period.capacity && Array.isArray(period.capacity)) {
        period.capacity.forEach((c: any) => {
          if (c.skill && !capacitySkills.includes(c.skill)) {
            capacitySkills.push(c.skill); // Preserve original skill key format
          }
        });
      }
    });

    // PHASE 2 FIX: Build skill union while preserving original identifiers
    // Use Set to ensure uniqueness but maintain original skill key format
    const skillSet = new Set<SkillType>();
    
    // Add demand skills first (they have priority)
    demandMatrix.skills.forEach(skill => skillSet.add(skill));
    
    // Add capacity skills that don't already exist
    capacitySkills.forEach(skill => {
      // Only add if not already present (preserve demand skill priority)
      if (!demandMatrix.skills.includes(skill)) {
        skillSet.add(skill);
      }
    });
    
    const skills = Array.from(skillSet).sort() as SkillType[];

    // PHASE 2: Enhanced debugging - Log skill set creation results
    MatrixDebugLogger.logSkillSetCreation(demandSkills, capacitySkills, skills);

    // VALIDATION CHECKPOINT: Skill set creation
    MatrixDebugLogger.logValidationCheckpoint(
      'Skill Set Creation',
      { originalSkills: demandSkills.length, finalSkills: skills.length },
      skills.length >= demandSkills.length
    );

    // PHASE 2 FIX: Create demand map using EXACT ORIGINAL skill keys - no trimming
    const demandMap = new Map<string, Map<SkillType, DemandDataPoint>>();
    demandMatrix.dataPoints.forEach(dp => {
      const monthMap = demandMap.get(dp.month) || new Map<SkillType, DemandDataPoint>();
      // Use original skill type directly - NO string conversion or trimming
      monthMap.set(dp.skillType as SkillType, dp);
      demandMap.set(dp.month, monthMap);
    });

    // PHASE 2: Enhanced debugging - Log demand map creation
    MatrixDebugLogger.logDemandMapCreation(demandMatrix.dataPoints, demandMap as any);

    // PHASE 2 FIX: Create capacity map preserving original skill keys
    const capacityMap = new Map<string, Map<SkillType, number>>();
    capacityForecast.forEach(period => {
      const monthMap = capacityMap.get(period.period) || new Map<SkillType, number>();
      if (period.capacity && Array.isArray(period.capacity)) {
        period.capacity.forEach((c: any) => {
          if (c.skill && typeof c.hours === 'number') {
            // Preserve original skill key format - no trimming
            const existingHours = monthMap.get(c.skill as SkillType) || 0;
            monthMap.set(c.skill as SkillType, existingHours + c.hours);
          }
        });
      }
      capacityMap.set(period.period, monthMap);
    });

    // PHASE 2: Enhanced debugging - Log capacity map creation
    MatrixDebugLogger.logCapacityMapCreation(capacityForecast, capacityMap as any);

    // VALIDATION CHECKPOINT: Map creation with preserved skill keys
    const expectedDemandSum = demandMatrix.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const actualDemandInMap = Array.from(demandMap.values()).reduce((sum, monthMap) => {
      return sum + Array.from(monthMap.values()).reduce((monthSum, dp) => monthSum + dp.demandHours, 0);
    }, 0);
    
    MatrixDebugLogger.logValidationCheckpoint(
      'Demand Map Integrity',
      { expected: expectedDemandSum, actual: actualDemandInMap },
      expectedDemandSum === actualDemandInMap
    );

    // PHASE 2 FIX: Generate data points using preserved skill keys
    const dataPoints: MatrixDataPoint[] = [];
    for (const skill of skills) {
      for (const month of months) {
        // Use skill directly - no conversion or trimming
        const demandPoint = demandMap.get(month.key)?.get(skill);
        const demandHours = demandPoint?.demandHours || 0;
        const capacityHours = capacityMap.get(month.key)?.get(skill) || 0;
        const gap = demandHours - capacityHours;
        const utilizationPercent = capacityHours > 0 ? Math.round((demandHours / capacityHours) * 100) : 0;

        dataPoints.push({
          skillType: skill, // Use original skill key directly
          month: month.key,
          monthLabel: month.label,
          demandHours,
          capacityHours,
          gap,
          utilizationPercent
        });
      }
    }

    // PHASE 2: Enhanced debugging - Log data point generation
    MatrixDebugLogger.logDataPointGeneration(skills, months, demandMap as any, capacityMap as any, dataPoints);

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

    // PHASE 2: Enhanced debugging - Log transformation completion
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
