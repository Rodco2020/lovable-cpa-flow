
/**
 * Skills Integration Service - Legacy Compatibility Layer
 * 
 * This file maintains backward compatibility while using the new modular structure.
 * All functionality has been moved to focused modules for better maintainability.
 * 
 * @deprecated Direct imports from this file are deprecated. 
 * Use imports from '@/services/forecasting/skillsIntegration' instead for better tree-shaking.
 */

// Re-export everything from the new modular service to maintain backward compatibility
export {
  SkillsIntegrationService,
  SkillsCacheManager,
  SkillsResolver,
  SkillsValidator
} from './skillsIntegration';

export type {
  SkillValidationResult,
  SkillResolutionResult,
  SkillCache
} from './skillsIntegration';

// Legacy warning for developers (only in development)
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'skillsIntegrationService.ts is deprecated. Please import from "@/services/forecasting/skillsIntegration" instead for better maintainability.'
  );
}
