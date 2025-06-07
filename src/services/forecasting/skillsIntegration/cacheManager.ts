import { SkillType } from '@/types/task';
import { Skill } from '@/types/skill';
import { SkillCache, SKILLS_CACHE_DURATION } from './types';
import { getAllSkills } from '@/services/skillService';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { debugLog } from '../logger';

/**
 * Skills Integration Cache Manager - Database-Only Implementation
 * Handles caching of skill data for performance optimization
 * Now strictly enforces database-only skills
 */
export class SkillsCacheManager {
  private static cache: SkillCache = {
    skillsMap: new Map(),
    skillIdToNameMap: new Map(),
    lastCacheUpdate: 0
  };

  /**
   * Check if cache is still valid
   */
  static isCacheValid(): boolean {
    return (
      this.cache.skillsMap.size > 0 &&
      Date.now() - this.cache.lastCacheUpdate < SKILLS_CACHE_DURATION
    );
  }

  /**
   * Update skills cache with fresh data from database - DATABASE ONLY
   */
  static async updateCache(): Promise<void> {
    try {
      debugLog('Updating skills integration cache from database only');
      
      const skills = await getAllSkills();
      
      if (skills.length === 0) {
        debugLog('No skills found in database - cache will be empty');
        this.cache.skillsMap.clear();
        this.cache.skillIdToNameMap.clear();
        this.cache.lastCacheUpdate = Date.now();
        return;
      }
      
      const skillTypes = this.convertSkillsToSkillTypes(skills);
      
      // Update both caches
      this.cache.skillsMap.clear();
      this.cache.skillIdToNameMap.clear();
      
      // Cache skill types for quick access
      skillTypes.forEach(skillType => {
        this.cache.skillsMap.set(skillType, skillType);
      });
      
      // Cache skill ID to name mappings
      skills.forEach(skill => {
        this.cache.skillIdToNameMap.set(skill.id, skill.name);
      });
      
      this.cache.lastCacheUpdate = Date.now();
      
      debugLog(`Updated skills cache with ${skills.length} database skills -> ${skillTypes.length} skill types`);
    } catch (error) {
      debugLog('Error updating skills cache from database:', error);
      // Do NOT fall back to standard skills - keep cache empty
      this.cache.skillsMap.clear();
      this.cache.skillIdToNameMap.clear();
      this.cache.lastCacheUpdate = Date.now();
    }
  }

  /**
   * Get cached skills as SkillType array
   */
  static getCachedSkills(): SkillType[] {
    return Array.from(this.cache.skillsMap.keys());
  }

  /**
   * Get cached skill name by ID
   */
  static getCachedSkillName(skillId: string): string | null {
    return this.cache.skillIdToNameMap.get(skillId) || null;
  }

  /**
   * Clear the cache
   */
  static clearCache(): void {
    this.cache.skillsMap.clear();
    this.cache.skillIdToNameMap.clear();
    this.cache.lastCacheUpdate = 0;
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { skillsCount: number; lastUpdate: number; age: number } {
    return {
      skillsCount: this.cache.skillsMap.size,
      lastUpdate: this.cache.lastCacheUpdate,
      age: Date.now() - this.cache.lastCacheUpdate
    };
  }

  /**
   * Convert database skills to normalized SkillType array - DATABASE ONLY
   */
  private static convertSkillsToSkillTypes(skills: Skill[]): SkillType[] {
    const skillTypesSet = new Set<SkillType>();
    
    skills.forEach(skill => {
      // Use the skill name directly as a SkillType, with basic normalization
      const normalizedSkill = this.normalizeSkillName(skill.name) as SkillType;
      skillTypesSet.add(normalizedSkill);
    });
    
    // DO NOT include standard forecast skills - only database skills
    return Array.from(skillTypesSet).sort();
  }

  /**
   * Basic skill name normalization
   */
  private static normalizeSkillName(skillName: string): string {
    return skillName.trim().charAt(0).toUpperCase() + skillName.trim().slice(1).toLowerCase();
  }
}
