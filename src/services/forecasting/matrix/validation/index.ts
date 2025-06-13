
/**
 * Matrix Validation and Debugging Infrastructure
 * Exports all validation and debugging utilities including Phase 3 components
 */
export { DataIntegrityValidator } from './DataIntegrityValidator';
export { SkillMappingVerifier } from './SkillMappingVerifier';
export { CrossMatrixValidator } from './CrossMatrixValidator';
export type { 
  ValidationResult
} from './DataIntegrityValidator';
export type { 
  SkillMappingReport,
  SkillConsistencyIssue,
  SkillMappingCorrection,
  SkillMappingRecommendation,
  SkillMappingTrace,
  SkillMapping
} from './SkillMappingVerifier';
export type {
  CrossMatrixValidationResult,
  MatrixComparisonData
} from './CrossMatrixValidator';
