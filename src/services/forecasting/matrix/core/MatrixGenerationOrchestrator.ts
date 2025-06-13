
import { MatrixData, ForecastType, MatrixErrorContext } from '../types';
import { DemandMatrixService } from '../../demandMatrixService';
import { SkillAwareForecastingService } from '../../skillAwareForecastingService';
import { MatrixValidator } from '../MatrixValidator';
import { MatrixErrorHandler } from '../MatrixErrorHandler';
import { SkillNormalizationHandler } from './SkillNormalizationHandler';
import { MatrixDataProcessor } from './MatrixDataProcessor';
import { DataIntegrityValidator } from '../validation/DataIntegrityValidator';
import { SkillMappingVerifier } from '../validation/SkillMappingVerifier';
import { startOfYear } from 'date-fns';
import { debugLog } from '../../logger';

/**
 * Matrix Generation Orchestrator
 * Orchestrates the complete matrix generation process with validation
 */
export class MatrixGenerationOrchestrator {
  /**
   * Generate fresh matrix data with fixed skill mapping
   */
  static async generateFreshMatrixDataWithFixedSkillMapping(
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
      const normalizedDemandMatrix = await SkillNormalizationHandler.normalizeDemandMatrixSkills(demandMatrix);
      
      debugLog('🔧 [SKILL MAPPING FIX] Normalized demand matrix skills:', normalizedDemandMatrix.skills);
      
      // STEP 3: Generate capacity forecast using existing skill-aware service
      const capacityForecast = await SkillAwareForecastingService.generateCapacityForecast(
        startDate,
        endDate
      );
      
      debugLog('🔧 [SKILL MAPPING FIX] Capacity forecast skills:', 
        Array.from(new Set(capacityForecast.flatMap(p => p.capacity?.map(c => c.skill) || []))));
      
      // STEP 4: Transform with consistent skill mapping
      const matrixData = MatrixDataProcessor.skillConsistentTransformDemandToMatrix(
        normalizedDemandMatrix, 
        capacityForecast
      );
      
      // STEP 5: Validate the generated matrix
      await this.validateGeneratedMatrix(matrixData, normalizedDemandMatrix, context);
      
      debugLog('🔧 [SKILL MAPPING FIX] Matrix data generated successfully with consistent skills', {
        months: matrixData.months.length,
        skills: matrixData.skills.length,
        dataPoints: matrixData.dataPoints.length,
        totalDemand: matrixData.totalDemand,
        totalCapacity: matrixData.totalCapacity,
        totalGap: matrixData.totalGap,
        skillMappingFixed: true
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
   * Validate the generated matrix data
   */
  private static async validateGeneratedMatrix(
    matrixData: MatrixData,
    normalizedDemandMatrix: any,
    context: MatrixErrorContext
  ): Promise<void> {
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
  }
}
