
/**
 * Matrix Validation and Debugging Infrastructure
 * Exports all validation and debugging utilities
 */
export { DataIntegrityValidator } from './DataIntegrityValidator';
export { SkillMappingVerifier } from './SkillMappingVerifier';
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
