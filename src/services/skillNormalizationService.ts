import { SkillType } from '@/types/task';
import { getAllSkills } from '@/services/skillService';
import { debugLog } from '@/services/forecasting/logger';

/**
 * Skill Normalization Service
 * Ensures consistent mapping between database skills and forecasting skill types
 * This service is the single source of truth for skill normalization
 */

export class SkillNormalizationService {
  private static skillMappingCache: Map<string, SkillType> = new Map();
  private static lastCacheUpdate: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Master skill mapping rules - single source of truth
   */
  private static readonly SKILL_MAPPING_RULES: Record<string, SkillType> = {
    // Junior Staff variations
    'junior': 'Junior Staff',
    'junior staff': 'Junior Staff',
    'junior ': 'Junior Staff', // Handle trailing spaces
    ' junior': 'Junior Staff', // Handle leading spaces
    'jr': 'Junior Staff',
    'jr staff': 'Junior Staff',
    
    // Senior Staff variations
    'senior': 'Senior Staff',
    'senior staff': 'Senior Staff',
    'senior ': 'Senior Staff', // Handle trailing spaces
    ' senior': 'Senior Staff', // Handle leading spaces
    'sr': 'Senior Staff',
    'sr staff': 'Senior Staff',
    
    // CPA variations
    'cpa': 'CPA',
    'cpa ': 'CPA', // Handle trailing spaces
    ' cpa': 'CPA', // Handle leading spaces
    'certified public accountant': 'CPA',
    'certified public accountants': 'CPA',
    
    // Other skill mappings
    'tax prep': 'Tax Preparation',
    'tax preparation': 'Tax Preparation',
    'tax specialist': 'Tax Preparation',
    'audit': 'Audit',
    'auditing': 'Audit',
    'audit specialist': 'Audit',
    'advisory': 'Advisory',
    'bookkeeping': 'Bookkeeping',
    'accounting': 'Accounting',
    'payroll': 'Payroll',
    'compliance': 'Compliance'
  };

  /**
   * Standard forecast skill types - must match what the matrix expects
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
      debugLog('Invalid skill name provided for normalization:', skillName);
      return 'Junior Staff'; // Default fallback
    }

    // Clean the input
    const cleanSkill = skillName.trim().toLowerCase();
    
    // Check direct mapping first
    const mappedSkill = this.SKILL_MAPPING_RULES[cleanSkill];
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
    return [...this.STANDARD_FORECAST_SKILLS];
  }

  /**
   * Validate if a skill is a standard forecast skill
   */
  static isStandardForecastSkill(skill: string): skill is SkillType {
    return this.STANDARD_FORECAST_SKILLS.includes(skill as SkillType);
  }

  /**
   * Update skill mapping cache with database skills
   */
  static async updateSkillMappingCache(): Promise<void> {
    try {
      const databaseSkills = await getAllSkills();
      
      this.skillMappingCache.clear();
      
      // Map each database skill to a standard forecast skill
      databaseSkills.forEach(skill => {
        const normalizedSkill = this.normalizeSkill(skill.name);
        this.skillMappingCache.set(skill.id, normalizedSkill);
        this.skillMappingCache.set(skill.name, normalizedSkill);
      });

      this.lastCacheUpdate = Date.now();
      
      debugLog(`Updated skill mapping cache with ${databaseSkills.length} database skills`);
    } catch (error) {
      debugLog('Error updating skill mapping cache:', error);
    }
  }

  /**
   * Resolve skill ID to forecast skill type
   */
  static async resolveSkillId(skillId: string): Promise<SkillType> {
    // Update cache if needed
    if (this.shouldUpdateCache()) {
      await this.updateSkillMappingCache();
    }

    // Try to get from cache
    const cachedSkill = this.skillMappingCache.get(skillId);
    if (cachedSkill) {
      return cachedSkill;
    }

    // If not in cache, try to normalize the ID as a skill name
    return this.normalizeSkill(skillId);
  }

  /**
   * Check if cache should be updated
   */
  private static shouldUpdateCache(): boolean {
    return (
      this.skillMappingCache.size === 0 ||
      Date.now() - this.lastCacheUpdate > this.CACHE_DURATION
    );
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
   * Clear the cache (for testing or manual refresh)
   */
  static clearCache(): void {
    this.skillMappingCache.clear();
    this.lastCacheUpdate = 0;
  }
}

/**
 * Convenience function for normalizing skills - maintains backward compatibility
 */
export const normalizeSkills = SkillNormalizationService.normalizeSkills.bind(SkillNormalizationService);
export const normalizeSkill = SkillNormalizationService.normalizeSkill.bind(SkillNormalizationService);
