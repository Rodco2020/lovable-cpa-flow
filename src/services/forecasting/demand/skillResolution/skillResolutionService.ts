
/**
 * Enhanced Skill Resolution Service
 * Main service class that orchestrates skill resolution functionality
 * 
 * This service provides:
 * - Skill UUID to name resolution
 * - Skill name validation
 * - Caching for performance
 * - Comprehensive error handling and diagnostics
 * - Backward compatibility with existing API
 */

import { SkillCacheManagerImpl } from './cacheManager';
import { SkillValidator } from './validator';
import { SkillResolver } from './resolver';
import { SkillValidationResult } from './types';

export class SkillResolutionService {
  private static cacheManager = new SkillCacheManagerImpl();
  private static validator = new SkillValidator(SkillResolutionService.cacheManager);
  private static resolver = new SkillResolver(SkillResolutionService.cacheManager, SkillResolutionService.validator);

  /**
   * Resolve skill UUIDs to skill names
   * Main entry point for skill name resolution
   */
  static async getSkillNames(skillIds: string[]): Promise<string[]> {
    return SkillResolutionService.resolver.getSkillNames(skillIds);
  }

  /**
   * Validate skill references with comprehensive diagnostics
   */
  static async validateSkillReferences(skillRefs: string[]): Promise<SkillValidationResult> {
    return SkillResolutionService.validator.validateSkillReferences(skillRefs);
  }

  /**
   * Get all available skills (names)
   */
  static async getAllSkillNames(): Promise<string[]> {
    await SkillResolutionService.cacheManager.initialize();
    return SkillResolutionService.cacheManager.getAllNames();
  }

  /**
   * Clear the cache (useful for testing or when data changes)
   */
  static clearCache(): void {
    SkillResolutionService.cacheManager.clear();
  }

  /**
   * Initialize the skill cache
   */
  static async initializeSkillCache(): Promise<void> {
    await SkillResolutionService.cacheManager.initialize();
  }

  /**
   * Check if a string is a UUID
   */
  static isUUID(str: string): boolean {
    return SkillResolutionService.validator.isUUID(str);
  }

  /**
   * Resolve skill references (backward compatibility method)
   */
  static async resolveSkillReferences(skillRefs: string[]): Promise<{
    validSkills: string[];
    invalidSkills: string[];
  }> {
    try {
      const { valid, invalid, resolved } = await SkillResolutionService.validateSkillReferences(skillRefs);
      return {
        validSkills: resolved,
        invalidSkills: invalid
      };
    } catch (error) {
      console.error('❌ [SKILL RESOLUTION] Error resolving skill references:', error);
      return {
        validSkills: [],
        invalidSkills: skillRefs
      };
    }
  }
}
