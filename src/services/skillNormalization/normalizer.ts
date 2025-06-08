
import { SkillType } from '@/types/task';
import { NormalizationResult, STANDARD_FORECAST_SKILLS } from './types';
import { SkillMappingRules } from './mappingRules';
import { SkillNormalizationCacheManager } from './cacheManager';
import { debugLog } from '@/services/forecasting/logger';

/**
 * Skill Normalizer
 * Core normalization logic for converting skill names to standard forecast types
 */

export class SkillNormalizer {
  /**
   * Normalize a single skill name to standard forecast skill type
   */
  static normalizeSkill(skillName: string): SkillType {
    if (!skillName || typeof skillName !== 'string') {
      debugLog('Invalid skill name provided for normalization:', skillName);
      return 'Junior Staff'; // Default fallback
    }

    // Check direct mapping first
    const mappedSkill = SkillMappingRules.getMapping(skillName);
    if (mappedSkill) {
      debugLog(`Mapped skill "${skillName}" -> "${mappedSkill}"`);
      return mappedSkill;
    }

    // If no mapping found, return the original cleaned skill name
    // but ensure it's properly capitalized
    const normalized = this.capitalizeSkillName(skillName.trim());
    debugLog(`No mapping found for "${skillName}", using normalized: "${normalized}"`);
    
    return normalized as SkillType;
  }

  /**
   * Normalize multiple skill names
   */
  static async normalizeSkills(skillNames: string[], staffId?: string): Promise<SkillType[]> {
    if (!skillNames || skillNames.length === 0) {
      debugLog('No skills provided for normalization, returning default');
      return ['Junior Staff'];
    }

    try {
      const normalizedSkills = skillNames
        .filter(skill => skill && skill.trim().length > 0)
        .map(skill => this.normalizeSkill(skill))
        .filter((skill, index, array) => array.indexOf(skill) === index); // Remove duplicates

      if (normalizedSkills.length === 0) {
        debugLog('No valid skills after normalization, returning default');
        return ['Junior Staff'];
      }

      debugLog(`Normalized ${skillNames.length} skills to ${normalizedSkills.length} for staff ${staffId || 'unknown'}:`, {
        original: skillNames,
        normalized: normalizedSkills
      });

      return normalizedSkills;
    } catch (error) {
      debugLog('Error normalizing skills:', error);
      return ['Junior Staff'];
    }
  }

  /**
   * Get all available standard forecast skills
   */
  static getStandardForecastSkills(): SkillType[] {
    return [...STANDARD_FORECAST_SKILLS];
  }

  /**
   * Validate if a skill is a standard forecast skill
   */
  static isStandardForecastSkill(skill: string): skill is SkillType {
    return STANDARD_FORECAST_SKILLS.includes(skill as SkillType);
  }

  /**
   * Resolve skill ID to forecast skill type
   */
  static async resolveSkillId(skillId: string): Promise<SkillType> {
    // Update cache if needed
    if (SkillNormalizationCacheManager.shouldUpdateCache()) {
      await SkillNormalizationCacheManager.updateCache();
    }

    // Try to get from cache
    const cachedSkill = SkillNormalizationCacheManager.getCachedMapping(skillId);
    if (cachedSkill) {
      return cachedSkill;
    }

    // If not in cache, try to normalize the ID as a skill name
    return this.normalizeSkill(skillId);
  }

  /**
   * Normalize skill with detailed result information
   */
  static normalizeSkillDetailed(skillName: string): NormalizationResult {
    const mappedSkill = SkillMappingRules.getMapping(skillName);
    
    if (mappedSkill) {
      return {
        normalizedSkill: mappedSkill,
        wasMapping: true,
        originalInput: skillName
      };
    }

    const normalized = this.capitalizeSkillName(skillName.trim()) as SkillType;
    return {
      normalizedSkill: normalized,
      wasMapping: false,
      originalInput: skillName
    };
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
