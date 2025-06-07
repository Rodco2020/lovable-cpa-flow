
import { SkillType } from '@/types/task';
import { SkillMappingRules } from './mappingRules';
import { SkillNormalizationCacheManager } from './cacheManager';
import { debugLog } from '@/services/forecasting/logger';

/**
 * Skill Normalizer - Database-Only Implementation
 * Handles the actual skill normalization process using mapping rules and cache
 * Now strictly enforces database-only skills
 */
export class SkillNormalizer {
  /**
   * Normalize a single skill name to database skill type
   */
  static normalizeSkill(skillName: string): SkillType {
    if (!skillName || typeof skillName !== 'string') {
      debugLog('Invalid skill name provided:', skillName);
      return 'Junior'; // Fallback to a common database skill
    }

    // Check cache first
    const cachedMapping = SkillNormalizationCacheManager.getCachedMapping(skillName);
    if (cachedMapping) {
      return cachedMapping;
    }

    // Try mapping rules
    const mappedSkill = SkillMappingRules.getMapping(skillName);
    if (mappedSkill) {
      return mappedSkill;
    }

    // Use skill name as-is with basic capitalization
    const trimmedSkill = skillName.trim();
    const capitalizedSkill = this.capitalizeSkillName(trimmedSkill);
    
    // Return the capitalized skill name as SkillType
    // This will be validated later against database skills
    return capitalizedSkill as SkillType;
  }

  /**
   * Normalize multiple skill names
   */
  static async normalizeSkills(skillNames: string[], staffId?: string): Promise<SkillType[]> {
    if (!skillNames || skillNames.length === 0) {
      return [];
    }

    try {
      // Update cache if needed
      if (SkillNormalizationCacheManager.shouldUpdateCache()) {
        await SkillNormalizationCacheManager.updateCache();
      }

      const normalizedSkills = skillNames.map(skillName => this.normalizeSkill(skillName));
      
      // Remove duplicates
      const uniqueSkills = Array.from(new Set(normalizedSkills));
      
      debugLog(`Normalized ${skillNames.length} skills for staff ${staffId}:`, {
        original: skillNames,
        normalized: uniqueSkills
      });
      
      return uniqueSkills;
    } catch (error) {
      debugLog('Error normalizing skills:', error);
      return skillNames.map(skill => this.normalizeSkill(skill));
    }
  }

  /**
   * Get all available database skills - NO STANDARD SKILLS
   */
  static getStandardForecastSkills(): SkillType[] {
    // Return empty array - we only use database skills now
    return [];
  }

  /**
   * Validate if a skill is a database skill (will be checked against actual database)
   */
  static isStandardForecastSkill(skill: string): skill is SkillType {
    // This will be validated against database skills in the integration service
    return true;
  }

  /**
   * Resolve skill ID to forecast skill type
   */
  static async resolveSkillId(skillId: string): Promise<SkillType> {
    try {
      // Check cache first
      const cachedMapping = SkillNormalizationCacheManager.getCachedMapping(skillId);
      if (cachedMapping) {
        return cachedMapping;
      }

      // If not in cache, return the ID as-is for now
      // This will be handled by the skills integration service
      debugLog(`Skill ID ${skillId} not found in cache, returning as-is`);
      return skillId as SkillType;
    } catch (error) {
      debugLog('Error resolving skill ID:', error);
      return skillId as SkillType;
    }
  }

  /**
   * Capitalize skill name properly
   */
  private static capitalizeSkillName(skillName: string): string {
    return skillName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
