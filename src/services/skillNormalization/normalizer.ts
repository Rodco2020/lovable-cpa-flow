
import { SkillType } from '@/types/task';
import { SkillMappingRules } from './mappingRules';
import { SkillNormalizationCacheManager } from './cacheManager';
import { debugLog } from '@/services/forecasting/logger';

/**
 * Skill Normalizer - Core normalization logic
 * Handles the actual skill normalization process using mapping rules and cache
 */
export class SkillNormalizer {
  /**
   * Standard forecast skills that can be used in the matrix
   */
  private static readonly STANDARD_FORECAST_SKILLS: SkillType[] = [
    'Junior Staff',
    'Senior Staff', 
    'CPA',
    'Tax Preparation',
    'Audit',
    'Advisory',
    'Bookkeeping',
    'Accounting',
    'Payroll',
    'Compliance'
  ];

  /**
   * Normalize a single skill name to standard forecast skill type
   */
  static normalizeSkill(skillName: string): SkillType {
    if (!skillName || typeof skillName !== 'string') {
      debugLog('Invalid skill name provided:', skillName);
      return 'Junior Staff'; // Default fallback
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

    // Check if it's already a standard skill
    const trimmedSkill = skillName.trim();
    if (this.isStandardForecastSkill(trimmedSkill)) {
      return trimmedSkill as SkillType;
    }

    // Fallback: capitalize and use as-is if reasonable, otherwise default
    const capitalizedSkill = this.capitalizeSkillName(trimmedSkill);
    
    // If it looks like a reasonable skill name, use it
    if (this.isReasonableSkillName(capitalizedSkill)) {
      return capitalizedSkill as SkillType;
    }

    debugLog(`Could not normalize skill "${skillName}", using default: Junior Staff`);
    return 'Junior Staff';
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
   * Get all available standard forecast skills
   */
  static getStandardForecastSkills(): SkillType[] {
    return [...this.STANDARD_FORECAST_SKILLS];
  }

  /**
   * Validate if a skill is a standard forecast skill
   */
  static isStandardForecastSkill(skill: string): skill is SkillType {
    return this.STANDARD_FORECAST_SKILLS.includes(skill as SkillType);
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

      // If not in cache, try to get skill name and normalize it
      // This would typically involve a database lookup, but for now we'll use a fallback
      debugLog(`Skill ID ${skillId} not found in cache, using fallback`);
      return 'Junior Staff';
    } catch (error) {
      debugLog('Error resolving skill ID:', error);
      return 'Junior Staff';
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

  /**
   * Check if a skill name looks reasonable
   */
  private static isReasonableSkillName(skillName: string): boolean {
    // Basic validation: not too short, not too long, contains letters
    return skillName.length >= 2 && 
           skillName.length <= 50 && 
           /[a-zA-Z]/.test(skillName);
  }
}
