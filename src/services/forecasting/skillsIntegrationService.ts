import { getAllSkills } from '@/services/skillService';
import { Skill } from '@/types/skill';
import { SkillType } from '@/types/task';
import { debugLog } from './logger';

/**
 * Skills Integration Service
 * Handles integration between database skills and forecasting skill types
 * Fixed to properly resolve skill UUIDs to names and normalize them
 */
export class SkillsIntegrationService {
  private static skillsCache: Map<string, SkillType> = new Map();
  private static skillIdToNameCache: Map<string, string> = new Map();
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
      
      // Update both caches
      this.updateCache(skillTypes);
      this.updateSkillIdCache(skills);
      
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
   * Resolve skill IDs to skill names
   */
  static async resolveSkillIds(skillIds: string[]): Promise<string[]> {
    try {
      // Ensure we have the latest skill data
      await this.getAvailableSkills();
      
      const resolvedNames = skillIds.map(skillId => {
        const skillName = this.skillIdToNameCache.get(skillId);
        if (skillName) {
          debugLog(`Resolved skill ID ${skillId} -> ${skillName}`);
          return skillName;
        } else {
          debugLog(`Could not resolve skill ID ${skillId}, using ID as fallback`);
          return skillId;
        }
      });

      return resolvedNames;
    } catch (error) {
      debugLog('Error resolving skill IDs', error);
      return skillIds; // Fallback to original IDs
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

    debugLog(`Converted ${skills.length} database skills to ${skillTypes.length} normalized skill types`);

    // Ensure we have some standard skills if database is empty
    if (skillTypes.length === 0) {
      return this.getDefaultSkills();
    }

    return skillTypes;
  }

  /**
   * Normalize skill names to ensure consistency with matrix expectations
   */
  private static normalizeSkillName(skillName: string): SkillType {
    const normalized = skillName.trim();

    // Enhanced mapping to handle database names -> matrix display names
    const skillMappings: Record<string, SkillType> = {
      // Handle both variations for Junior
      'junior': 'Junior Staff',
      'junior staff': 'Junior Staff',
      
      // Handle both variations for Senior  
      'senior': 'Senior Staff',
      'senior staff': 'Senior Staff',
      
      // CPA mappings
      'cpa': 'CPA',
      'certified public accountant': 'CPA',
      
      // Other skill mappings
      'tax prep': 'Tax Preparation',
      'tax preparation': 'Tax Preparation',
      'audit': 'Audit',
      'auditing': 'Audit',
      'advisory': 'Advisory',
      'bookkeeping': 'Bookkeeping',
      'accounting': 'Accounting'
    };

    const lowerNormalized = normalized.toLowerCase();
    const mappedSkill = skillMappings[lowerNormalized];

    if (mappedSkill) {
      debugLog(`Mapped skill "${skillName}" -> "${mappedSkill}"`);
      return mappedSkill;
    } else {
      debugLog(`No mapping for skill "${skillName}", using normalized version`);
      return normalized as SkillType;
    }
  }

  /**
   * Public wrapper for skill normalization
   */
  static normalizeSkill(skillName: string): SkillType {
    return this.normalizeSkillName(skillName);
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
   * Update skill ID to name cache
   */
  private static updateSkillIdCache(skills: Skill[]): void {
    this.skillIdToNameCache.clear();
    skills.forEach(skill => {
      this.skillIdToNameCache.set(skill.id, skill.name);
    });
    debugLog(`Updated skill ID cache with ${skills.length} entries`);
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
    this.skillIdToNameCache.clear();
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
