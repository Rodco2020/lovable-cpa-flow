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
import { SkillNormalizationService } from '@/services/skillNormalizationService';

// Import new debugging and validation infrastructure
import { MatrixDebugLogger } from './debug/MatrixDebugLogger';
import { DataIntegrityValidator, ValidationResult } from './validation/DataIntegrityValidator';
import { SkillMappingVerifier } from './validation/SkillMappingVerifier';

/**
 * Matrix Service Core
 * Core business logic for matrix data generation with FIXED skill mapping consistency
 */
export class MatrixServiceCore {
  /**
   * Generate unified matrix forecast data with consistent skill normalization
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
        const startDate = startOfYear(new Date());
        const cachedData = MatrixCacheManager.getCachedData(forecastType, startDate);
        if (cachedData) {
          debugLog('Returning cached matrix data');
          return { matrixData: cachedData };
        }
      }
      
      // Generate fresh data with fixed skill mapping
      const matrixData = await this.generateFreshMatrixDataWithFixedSkillMapping(forecastType, context);
      
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
   * FIXED: Generate fresh matrix data with consistent skill normalization
   */
  private static async generateFreshMatrixDataWithFixedSkillMapping(
    forecastType: ForecastType,
    context: MatrixErrorContext
  ): Promise<MatrixData> {
    const currentYear = new Date().getFullYear();
    const startDate = startOfYear(new Date(currentYear, 0, 1));
    const endDate = new Date(currentYear, 11, 31);
    
    context.startDate = startDate;
    context.endDate = endDate;
    
    try {
      debugLog('🔧 [SKILL MAPPING FIX] Starting matrix generation with consistent skill normalization');
      
      // STEP 1: Generate demand matrix (uses original skill names)
      const { matrixData: demandMatrix } = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        startDate
      );
      
      debugLog('🔧 [SKILL MAPPING FIX] Original demand matrix skills:', demandMatrix.skills);
      
      // STEP 2: Normalize demand matrix skills for consistency
      const normalizedDemandMatrix = await this.normalizeDemandMatrixSkills(demandMatrix);
      
      debugLog('🔧 [SKILL MAPPING FIX] Normalized demand matrix skills:', normalizedDemandMatrix.skills);
      
      // STEP 3: Generate capacity forecast using existing skill-aware service
      const capacityForecast = await SkillAwareForecastingService.generateCapacityForecast(
        startDate,
        endDate
      );
      
      debugLog('🔧 [SKILL MAPPING FIX] Capacity forecast skills:', 
        Array.from(new Set(capacityForecast.flatMap(p => p.capacity?.map(c => c.skill) || []))));
      
      // STEP 4: Transform with consistent skill mapping
      const matrixData = this.skillConsistentTransformDemandToMatrix(normalizedDemandMatrix, capacityForecast);
      
      // Enhanced validation with skill mapping consistency checks
      const validation = MatrixValidator.validateMatrixData(matrixData);
      if (!validation.isValid) {
        throw MatrixErrorHandler.handleValidationError(validation.issues, context);
      }

      // Additional data integrity validation
      const integrityValidation = DataIntegrityValidator.validateDemandPreservation(normalizedDemandMatrix, matrixData);
      if (!integrityValidation.isValid) {
        console.error('❌ Data integrity validation failed:', integrityValidation.errors);
        debugLog('Data integrity validation failed', integrityValidation);
      }

      // Skill mapping verification with enhanced logging
      const skillMappingReport = SkillMappingVerifier.verifySkillKeyConsistency(
        normalizedDemandMatrix.skills,
        normalizedDemandMatrix.dataPoints,
        matrixData.skills
      );
      
      if (skillMappingReport.consistencyIssues.length > 0) {
        console.warn('⚠️ Skill mapping consistency issues detected:', skillMappingReport.consistencyIssues);
        debugLog('Skill mapping issues', skillMappingReport);
      }
      
      debugLog('🔧 [SKILL MAPPING FIX] Matrix data generated successfully with consistent skills', {
        months: matrixData.months.length,
        skills: matrixData.skills.length,
        dataPoints: matrixData.dataPoints.length,
        totalDemand: matrixData.totalDemand,
        totalCapacity: matrixData.totalCapacity,
        totalGap: matrixData.totalGap,
        skillMappingFixed: true,
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
   * FIXED: Normalize demand matrix skills for consistency with capacity matrix
   */
  private static async normalizeDemandMatrixSkills(demandMatrix: DemandMatrixData): Promise<DemandMatrixData> {
    debugLog('🔧 [SKILL NORMALIZATION] Normalizing demand matrix skills for consistency');
    
    // Build skill normalization map
    const skillNormalizationMap = new Map<string, SkillType>();
    const normalizedSkills: SkillType[] = [];
    
    for (const originalSkill of demandMatrix.skills) {
      const normalizedSkill = SkillNormalizationService.normalizeSkill(originalSkill);
      skillNormalizationMap.set(originalSkill, normalizedSkill);
      
      if (!normalizedSkills.includes(normalizedSkill)) {
        normalizedSkills.push(normalizedSkill);
      }
      
      debugLog(`🔧 [SKILL NORMALIZATION] "${originalSkill}" -> "${normalizedSkill}"`);
    }
    
    // Transform data points with normalized skills
    const normalizedDataPoints = demandMatrix.dataPoints.map(dp => ({
      ...dp,
      skillType: skillNormalizationMap.get(dp.skillType) || dp.skillType
    }));
    
    // Aggregate data points by normalized skills (in case multiple original skills map to same normalized skill)
    const aggregatedDataPoints: DemandDataPoint[] = [];
    const aggregationMap = new Map<string, DemandDataPoint>();
    
    normalizedDataPoints.forEach(dp => {
      const key = `${dp.month}-${dp.skillType}`;
      const existing = aggregationMap.get(key);
      
      if (existing) {
        // Aggregate demand hours and client tasks
        existing.demandHours += dp.demandHours;
        existing.taskBreakdown.push(...dp.taskBreakdown);
      } else {
        aggregationMap.set(key, { ...dp });
      }
    });
    
    aggregatedDataPoints.push(...Array.from(aggregationMap.values()));
    
    // Recalculate totals after normalization
    const totalDemand = aggregatedDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    
    const normalizedMatrix: DemandMatrixData = {
      ...demandMatrix,
      skills: normalizedSkills.sort(),
      dataPoints: aggregatedDataPoints,
      totalDemand
    };
    
    debugLog('🔧 [SKILL NORMALIZATION] Demand matrix normalization complete', {
      originalSkills: demandMatrix.skills.length,
      normalizedSkills: normalizedSkills.length,
      originalTotalDemand: demandMatrix.totalDemand,
      normalizedTotalDemand: totalDemand,
      mappingRules: Array.from(skillNormalizationMap.entries())
    });
    
    return normalizedMatrix;
  }
  
  /**
   * FIXED: Transform demand matrix and capacity forecast with consistent skill handling
   */
  private static skillConsistentTransformDemandToMatrix(
    demandMatrix: DemandMatrixData,
    capacityForecast: any[]
  ): MatrixData {
    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Starting transformation with consistent skill handling');

    const months: MonthInfo[] = demandMatrix.months.map((m, index) => ({
      key: m.key,
      label: m.label,
      index: index
    }));

    // FIXED: Use normalized demand skills as the primary skill set
    const demandSkills = [...demandMatrix.skills];
    
    // Extract and normalize capacity skills
    const capacitySkillsRaw: string[] = [];
    capacityForecast.forEach(period => {
      if (period.capacity && Array.isArray(period.capacity)) {
        period.capacity.forEach((c: any) => {
          if (c.skill && !capacitySkillsRaw.includes(c.skill)) {
            capacitySkillsRaw.push(c.skill);
          }
        });
      }
    });
    
    // Normalize capacity skills for consistency
    const normalizedCapacitySkills = capacitySkillsRaw.map(skill => 
      SkillNormalizationService.normalizeSkill(skill)
    );
    
    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Skill normalization results', {
      demandSkills,
      capacitySkillsRaw,
      normalizedCapacitySkills
    });

    // Build unified skill set with normalized skills
    const skillSet = new Set<SkillType>();
    
    // Add demand skills first (they have priority and are already normalized)
    demandMatrix.skills.forEach(skill => skillSet.add(skill));
    
    // Add normalized capacity skills that don't conflict
    normalizedCapacitySkills.forEach(skill => {
      if (!demandMatrix.skills.includes(skill)) {
        skillSet.add(skill);
      }
    });
    
    const skills = Array.from(skillSet).sort() as SkillType[];

    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Final unified skill set', { skills });

    // Create demand map using normalized skills (already done in demandMatrix)
    const demandMap = new Map<string, Map<SkillType, DemandDataPoint>>();
    demandMatrix.dataPoints.forEach(dp => {
      const monthMap = demandMap.get(dp.month) || new Map<SkillType, DemandDataPoint>();
      monthMap.set(dp.skillType as SkillType, dp);
      demandMap.set(dp.month, monthMap);
    });

    // Create capacity map with skill normalization
    const capacityMap = new Map<string, Map<SkillType, number>>();
    capacityForecast.forEach(period => {
      const monthMap = capacityMap.get(period.period) || new Map<SkillType, number>();
      if (period.capacity && Array.isArray(period.capacity)) {
        period.capacity.forEach((c: any) => {
          if (c.skill && typeof c.hours === 'number') {
            // FIXED: Normalize capacity skill before matching
            const normalizedSkill = SkillNormalizationService.normalizeSkill(c.skill) as SkillType;
            const existingHours = monthMap.get(normalizedSkill) || 0;
            monthMap.set(normalizedSkill, existingHours + c.hours);
          }
        });
      }
      capacityMap.set(period.period, monthMap);
    });

    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Maps created with normalized skills', {
      demandMapSize: demandMap.size,
      capacityMapSize: capacityMap.size
    });

    // Generate data points using consistent normalized skills
    const dataPoints: MatrixDataPoint[] = [];
    for (const skill of skills) {
      for (const month of months) {
        const demandPoint = demandMap.get(month.key)?.get(skill);
        const demandHours = demandPoint?.demandHours || 0;
        const capacityHours = capacityMap.get(month.key)?.get(skill) || 0;
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

    const matrixData: MatrixData = {
      months,
      skills,
      dataPoints,
      totalDemand,
      totalCapacity,
      totalGap
    };

    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Transformation complete with consistent skills', {
      originalDemandTotal: demandMatrix.totalDemand,
      transformedDemandTotal: totalDemand,
      skillConsistencyMaintained: demandMatrix.totalDemand === totalDemand,
      skillCount: skills.length
    });

    return matrixData;
  }
  
  /**
   * Clear all cached data
   */
  static clearCache(): void {
    MatrixCacheManager.clearCache();
    DemandMatrixService.clearCache();
  }
  
  static getCacheStats() {
    return MatrixCacheManager.getCacheStats();
  }
}
