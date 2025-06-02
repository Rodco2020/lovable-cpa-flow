
import { SkillType } from '@/types/task';
import { SkillNormalizer } from './normalizer';
import { SkillNormalizationCacheManager } from './cacheManager';

/**
 * Skill Normalization Service - Refactored Main Interface
 * 
 * This service ensures consistent mapping between database skills and forecasting skill types.
 * It serves as the single source of truth for skill normalization across the application.
 * 
 * Key Features:
 * - Centralized skill mapping rules
 * - Performance-optimized caching
 * - Consistent skill type normalization
 * - Fallback mechanisms for unknown skills
 */

export class SkillNormalizationService {
  /**
   * Normalize a single skill name to standard forecast skill type
   */
  static normalizeSkill(skillName: string): SkillType {
    return SkillNormalizer.normalizeSkill(skillName);
  }

  /**
   * Normalize multiple skill names
   */
  static async normalizeSkills(skillNames: string[], staffId?: string): Promise<SkillType[]> {
    return SkillNormalizer.normalizeSkills(skillNames, staffId);
  }

  /**
   * Get all available standard forecast skills
   */
  static getStandardForecastSkills(): SkillType[] {
    return SkillNormalizer.getStandardForecastSkills();
  }

  /**
   * Validate if a skill is a standard forecast skill
   */
  static isStandardForecastSkill(skill: string): skill is SkillType {
    return SkillNormalizer.isStandardForecastSkill(skill);
  }

  /**
   * Resolve skill ID to forecast skill type
   */
  static async resolveSkillId(skillId: string): Promise<SkillType> {
    return SkillNormalizer.resolveSkillId(skillId);
  }

  /**
   * Update skill mapping cache with database skills
   */
  static async updateSkillMappingCache(): Promise<void> {
    return SkillNormalizationCacheManager.updateCache();
  }

  /**
   * Clear the cache (for testing or manual refresh)
   */
  static clearCache(): void {
    SkillNormalizationCacheManager.clearCache();
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getCacheStats(): { size: number; lastUpdate: number; age: number } {
    return SkillNormalizationCacheManager.getCacheStats();
  }
}

/**
 * Convenience functions for backward compatibility
 */
export const normalizeSkills = SkillNormalizationService.normalizeSkills.bind(SkillNormalizationService);
export const normalizeSkill = SkillNormalizationService.normalizeSkill.bind(SkillNormalizationService);

// Export types for consumers
export type { SkillMappingRule, NormalizationResult, ValidationResult } from './types';
