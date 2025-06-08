
import { SkillType } from '@/types/task';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { SkillsCacheManager } from './cacheManager';
import { SkillsResolver } from './skillResolver';
import { SkillsValidator } from './skillValidator';
import { SkillValidationResult } from './types';

/**
 * Skills Integration Service - Database-Only Implementation
 * 
 * Now strictly enforces database-only skills to fix matrix display issues.
 * No fallback to standard skills - only skills from the database are allowed.
 */
export class SkillsIntegrationService {
  /**
   * Get all available skills as SkillType array - DATABASE ONLY
   */
  static async getAvailableSkills(): Promise<SkillType[]> {
    try {
      // Check cache first
      if (SkillsCacheManager.isCacheValid()) {
        const cachedSkills = SkillsCacheManager.getCachedSkills();
        // Only return cached skills if they exist and are from database
        if (cachedSkills.length > 0) {
          return cachedSkills;
        }
      }

      // Update cache and return fresh data from database
      await SkillsCacheManager.updateCache();
      const databaseSkills = SkillsCacheManager.getCachedSkills();
      
      // If no database skills exist, return empty array instead of fallback
      if (databaseSkills.length === 0) {
        console.warn('No skills found in database. Matrix will be empty until skills are added.');
        return [];
      }
      
      return databaseSkills;
    } catch (error) {
      console.error('Error getting available skills from database:', error);
      // Return empty array instead of fallback to ensure matrix shows only database skills
      return [];
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
