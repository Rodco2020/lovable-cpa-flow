
import { SkillType } from '@/types/task';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { SkillsCacheManager } from './cacheManager';
import { SkillsResolver } from './skillResolver';
import { SkillsValidator } from './skillValidator';
import { SkillValidationResult } from './types';

/**
 * Skills Integration Service - Refactored Main Interface
 * 
 * Handles integration between database skills and forecasting skill types
 * Now uses centralized SkillNormalizationService for all mappings with
 * improved modular structure for better maintainability.
 */
export class SkillsIntegrationService {
  /**
   * Get all available skills as SkillType array
   */
  static async getAvailableSkills(): Promise<SkillType[]> {
    try {
      // Check cache first
      if (SkillsCacheManager.isCacheValid()) {
        const cachedSkills = SkillsCacheManager.getCachedSkills();
        return cachedSkills;
      }

      // Update cache and return fresh data
      await SkillsCacheManager.updateCache();
      return SkillsCacheManager.getCachedSkills();
    } catch (error) {
      // Fallback to standard skills if database fails
      const fallbackSkills = SkillNormalizationService.getStandardForecastSkills();
      return fallbackSkills;
    }
  }

  /**
   * Resolve skill IDs to skill names using centralized normalization
   */
  static async resolveSkillIds(skillIds: string[]): Promise<string[]> {
    return SkillsResolver.resolveSkillIds(skillIds);
  }

  /**
   * Public wrapper for skill normalization - uses centralized service
   */
  static normalizeSkill(skillName: string): SkillType {
    return SkillNormalizationService.normalizeSkill(skillName);
  }

  /**
   * Clear skills cache
   */
  static clearCache(): void {
    SkillsCacheManager.clearCache();
  }

  /**
   * Validate that skills exist and provide normalization
   */
  static async validateSkills(skills: SkillType[]): Promise<SkillValidationResult> {
    return SkillsValidator.validateSkills(skills);
  }

  /**
   * Ensure matrix data has consistent skills
   */
  static async normalizeMatrixSkills(matrixSkills: SkillType[]): Promise<SkillType[]> {
    return SkillsValidator.normalizeMatrixSkills(matrixSkills);
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getCacheStats(): { skillsCount: number; lastUpdate: number; age: number } {
    return SkillsCacheManager.getCacheStats();
  }
}

// Export individual modules for direct access if needed
export { SkillsCacheManager } from './cacheManager';
export { SkillsResolver } from './skillResolver';
export { SkillsValidator } from './skillValidator';

// Export types for consumers
export type { SkillValidationResult, SkillResolutionResult, SkillCache } from './types';
