
/**
 * Skill Normalization Service - Main Entry Point
 * 
 * This service provides the main interface for skill normalization throughout the application.
 * It delegates to the modular skill normalization system for improved maintainability.
 */

// Re-export the main service
export { SkillNormalizationService } from './skillNormalization';

// Re-export commonly used functions for backward compatibility
export { 
  SkillNormalizationService as default,
  normalizeSkills,
  normalizeSkill 
} from './skillNormalization';
