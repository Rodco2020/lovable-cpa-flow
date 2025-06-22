
import { MatrixData } from '../types';
import { DemandMatrixData } from '@/types/demand';
import { MatrixValidator } from '../MatrixValidator';
import { MatrixErrorHandler } from '../MatrixErrorHandler';
import { DataIntegrityValidator } from '../validation/DataIntegrityValidator';
import { SkillMappingVerifier } from '../validation/SkillMappingVerifier';
import { MatrixDebugLogger } from '../debug/MatrixDebugLogger';
import { debugLog } from '../../logger';

/**
 * Matrix Validation Orchestrator
 * Coordinates all validation activities for matrix data
 */
export class MatrixValidationOrchestrator {
  /**
   * Validate transformed matrix data with comprehensive checks
   */
  static async validateTransformedData(
    matrixData: MatrixData,
    demandMatrix: DemandMatrixData,
    context: any
  ): Promise<void> {
    // Basic matrix validation
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

    // Log validation summary
    this.logValidationSummary(integrityValidation, skillMappingReport);
  }

  /**
   * Log comprehensive validation summary
   */
  private static logValidationSummary(integrityValidation: any, skillMappingReport: any) {
    debugLog('Validation Summary', {
      integrityValidation: integrityValidation.isValid,
      skillMappingIssues: skillMappingReport.consistencyIssues.length,
      validationPassed: integrityValidation.isValid && skillMappingReport.consistencyIssues.length === 0
    });
  }
}
