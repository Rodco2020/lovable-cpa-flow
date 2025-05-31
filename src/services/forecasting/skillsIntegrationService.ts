
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
      const fallbackSkills = this.getDefaultSkills();
      this.updateCache(fallbackSkills);
      return fallbackSkills;
    }
  }

  /**
   * Convert database Skill objects to SkillType strings with normalization
   */
  private static convertSkillsToSkillTypes(skills: Skill[]): SkillType[] {
    const skillTypes = skills
      .filter(skill => skill.name && skill.name.trim().length > 0)
      .map(skill => this.normalizeSkillName(skill.name))
      .filter((skill, index, array) => array.indexOf(skill) === index) // Remove duplicates
      .sort();

    // Ensure we have some standard skills if database is empty
    if (skillTypes.length === 0) {
      return this.getDefaultSkills();
    }

    return skillTypes;
  }

  /**
   * Normalize skill names to ensure consistency
   */
  private static normalizeSkillName(skillName: string): SkillType {
    const normalized = skillName.trim();
    
    // Map common variations to standard names
    const skillMappings: Record<string, SkillType> = {
      'junior staff': 'Junior Staff',
      'junior': 'Junior Staff',
      'senior staff': 'Senior Staff', 
      'senior': 'Senior Staff',
      'cpa': 'CPA',
      'tax prep': 'Tax Preparation',
      'tax preparation': 'Tax Preparation',
      'audit': 'Audit',
      'advisory': 'Advisory',
      'bookkeeping': 'Bookkeeping'
    };

    const mappedSkill = skillMappings[normalized.toLowerCase()];
    return (mappedSkill || normalized) as SkillType;
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
   * Get default skills as fallback with consistent naming
   */
  private static getDefaultSkills(): SkillType[] {
    return [
      'Junior Staff',
      'Senior Staff', 
      'CPA',
      'Tax Preparation',
      'Audit',
      'Advisory',
      'Bookkeeping'
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
   * Validate that skills exist and provide normalization
   */
  static async validateSkills(skills: SkillType[]): Promise<{
    valid: SkillType[];
    invalid: SkillType[];
    normalized: SkillType[];
  }> {
    const availableSkills = await this.getAvailableSkills();
    const availableSkillsSet = new Set(availableSkills);

    const valid: SkillType[] = [];
    const invalid: SkillType[] = [];
    const normalized: SkillType[] = [];

    skills.forEach(skill => {
      const normalizedSkill = this.normalizeSkillName(skill);
      
      if (availableSkillsSet.has(normalizedSkill)) {
        valid.push(normalizedSkill);
        normalized.push(normalizedSkill);
      } else if (availableSkillsSet.has(skill)) {
        valid.push(skill);
        normalized.push(skill);
      } else {
        invalid.push(skill);
      }
    });

    return { valid, invalid, normalized };
  }

  /**
   * Ensure matrix data has consistent skills
   */
  static async normalizeMatrixSkills(matrixSkills: SkillType[]): Promise<SkillType[]> {
    const availableSkills = await this.getAvailableSkills();
    const availableSkillsSet = new Set(availableSkills);
    
    // Filter and normalize matrix skills to match available skills
    const normalizedSkills = matrixSkills
      .map(skill => this.normalizeSkillName(skill))
      .filter(skill => availableSkillsSet.has(skill))
      .filter((skill, index, array) => array.indexOf(skill) === index); // Remove duplicates

    // If no matches found, return available skills instead of empty array
    return normalizedSkills.length > 0 ? normalizedSkills : availableSkills;
  }
}
