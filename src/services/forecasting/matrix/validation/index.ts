
/**
 * Matrix Validation and Debugging Infrastructure
 * Exports all validation and debugging utilities
 */
export { DataIntegrityValidator } from './DataIntegrityValidator';
export { SkillMappingVerifier } from './SkillMappingVerifier';
export type { 
  ValidationResult,
  SkillMappingReport,
  SkillConsistencyIssue,
  SkillMappingCorrection,
  SkillMappingRecommendation,
  SkillMappingTrace,
  SkillMapping
} from './DataIntegrityValidator';
export type { 
  SkillMappingReport as SMReport,
  SkillConsistencyIssue as SCIssue,
  SkillMappingCorrection as SMCorrection,
  SkillMappingRecommendation as SMRecommendation,
  SkillMappingTrace as SMTrace,
  SkillMapping as SMapping
} from './SkillMappingVerifier';
