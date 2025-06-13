
/**
 * Matrix Validation Services
 * Exports validation utilities including skill consistency validation
 */
export { DataIntegrityValidator } from './DataIntegrityValidator';
export { SkillMappingVerifier } from './SkillMappingVerifier';
export { SkillMappingConsistencyValidator } from './SkillMappingConsistencyValidator';

export type { ValidationResult } from './DataIntegrityValidator';
export type { SkillMappingReport } from './SkillMappingVerifier';
export type { 
  SkillConsistencyResult, 
  SkillInconsistency 
} from './SkillMappingConsistencyValidator';
