
import { getAllSkills } from '@/services/skillService';
import { Skill } from '@/types/skill';
import { SkillType } from '@/types/task';
import { debugLog } from './logger';

/**
 * Skills Integration Service
 * Handles integration between database skills and forecasting skill types
 */
export class SkillsIntegrationService {
  private static skillsCache: Map<string, SkillType> = new Map();
  private static lastCacheUpdate: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all available skills as SkillType array
   */
  static async getAvailableSkills(): Promise<SkillType[]> {
    try {
      debugLog('Fetching available skills from database');
      
      // Check cache first
      if (this.isCacheValid()) {
        const cachedSkills = Array.from(this.skillsCache.values());
        debugLog(`Returning ${cachedSkills.length} skills from cache`);
        return cachedSkills;
      }

      // Fetch from database
      const skills = await getAllSkills();
      const skillTypes = this.convertSkillsToSkillTypes(skills);
      
      // Update cache
      this.updateCache(skillTypes);
      
      debugLog(`Fetched ${skillTypes.length} skills from database`);
      return skillTypes;
    } catch (error) {
      debugLog('Error fetching skills, falling back to default skills', error);
      return this.getDefaultSkills();
    }
  }

  /**
   * Convert database Skill objects to SkillType strings
   */
  private static convertSkillsToSkillTypes(skills: Skill[]): SkillType[] {
    return skills
      .filter(skill => skill.name && skill.name.trim().length > 0)
      .map(skill => skill.name as SkillType)
      .sort();
  }

  /**
   * Update skills cache
   */
  private static updateCache(skills: SkillType[]): void {
    this.skillsCache.clear();
    skills.forEach(skill => {
      this.skillsCache.set(skill, skill);
    });
    this.lastCacheUpdate = Date.now();
  }

  /**
   * Check if cache is still valid
   */
  private static isCacheValid(): boolean {
    return (
      this.skillsCache.size > 0 &&
      Date.now() - this.lastCacheUpdate < this.CACHE_DURATION
    );
  }

  /**
   * Get default skills as fallback
   */
  private static getDefaultSkills(): SkillType[] {
    return [
      'Junior Staff',
      'Senior Staff', 
      'CPA',
      'Tax Preparation',
      'Audit',
      'Advisory'
    ] as SkillType[];
  }

  /**
   * Clear skills cache
   */
  static clearCache(): void {
    this.skillsCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Validate that skills exist in database
   */
  static async validateSkills(skills: SkillType[]): Promise<{
    valid: SkillType[];
    invalid: SkillType[];
  }> {
    const availableSkills = await this.getAvailableSkills();
    const availableSkillsSet = new Set(availableSkills);

    const valid = skills.filter(skill => availableSkillsSet.has(skill));
    const invalid = skills.filter(skill => !availableSkillsSet.has(skill));

    return { valid, invalid };
  }
}
