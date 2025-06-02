
/**
 * Skill Normalization Service - Legacy Compatibility Layer
 * 
 * This file maintains backward compatibility while using the new modular structure.
 * All functionality has been moved to focused modules for better maintainability.
 * 
 * @deprecated Direct imports from this file are deprecated. 
 * Use imports from '@/services/skillNormalization' instead for better tree-shaking.
 */

// Re-export everything from the new modular service to maintain backward compatibility
export {
  SkillNormalizationService,
  normalizeSkills,
  normalizeSkill
} from './skillNormalization';

export type {
  SkillMappingRule,
  NormalizationResult,
  ValidationResult
} from './skillNormalization';

// Legacy warning for developers (only in development)
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'skillNormalizationService.ts is deprecated. Please import from "@/services/skillNormalization" instead for better maintainability.'
  );
}
