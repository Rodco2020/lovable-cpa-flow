
import { SkillType } from '@/types/task';
import { Skill } from '@/types/skill';
import { SkillCache, SKILLS_CACHE_DURATION } from './types';
import { getAllSkills } from '@/services/skillService';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { debugLog } from '../logger';

/**
 * Skills Integration Cache Manager
 * Handles caching of skill data for performance optimization
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
   * Update skills cache with fresh data from database
   */
  static async updateCache(): Promise<void> {
    try {
      debugLog('Updating skills integration cache');
      
      const skills = await getAllSkills();
      const skillTypes = this.convertSkillsToSkillTypes(skills);
      
      // Update both caches
      this.updateSkillsCache(skillTypes);
      this.updateSkillIdCache(skills);
      
      // Also update the normalization service cache
      await SkillNormalizationService.updateSkillMappingCache();
      
      this.cache.lastCacheUpdate = Date.now();
      debugLog(`Updated skills integration cache with ${skills.length} skills`);
    } catch (error) {
      debugLog('Error updating skills integration cache', error);
      throw error;
    }
  }

  /**
   * Get cached skills as SkillType array
   */
  static getCachedSkills(): SkillType[] {
    return Array.from(this.cache.skillsMap.values());
  }

  /**
   * Get skill name by ID from cache
   */
  static getCachedSkillName(skillId: string): string | null {
    return this.cache.skillIdToNameMap.get(skillId) || null;
  }

  /**
   * Clear all caches
   */
  static clearCache(): void {
    this.cache.skillsMap.clear();
    this.cache.skillIdToNameMap.clear();
    this.cache.lastCacheUpdate = 0;
    SkillNormalizationService.clearCache();
    debugLog('Cleared skills integration cache');
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): { skillsCount: number; lastUpdate: number; age: number } {
    return {
      skillsCount: this.cache.skillsMap.size,
      lastUpdate: this.cache.lastCacheUpdate,
      age: Date.now() - this.cache.lastCacheUpdate
    };
  }

  /**
   * Convert database Skill objects to SkillType strings using centralized normalization
   */
  private static convertSkillsToSkillTypes(skills: Skill[]): SkillType[] {
    const skillTypes = skills
      .filter(skill => skill.name && skill.name.trim().length > 0)
      .map(skill => SkillNormalizationService.normalizeSkill(skill.name))
      .filter((skill, index, array) => array.indexOf(skill) === index) // Remove duplicates
      .sort();

    debugLog(`Converted ${skills.length} database skills to ${skillTypes.length} normalized skill types`);

    // Ensure we have some standard skills if database is empty
    if (skillTypes.length === 0) {
      return SkillNormalizationService.getStandardForecastSkills();
    }

    return skillTypes;
  }

  /**
   * Update skills cache with skill types
   */
  private static updateSkillsCache(skills: SkillType[]): void {
    this.cache.skillsMap.clear();
    skills.forEach(skill => {
      this.cache.skillsMap.set(skill, skill);
    });
  }

  /**
   * Update skill ID to name cache
   */
  private static updateSkillIdCache(skills: Skill[]): void {
    this.cache.skillIdToNameMap.clear();
    skills.forEach(skill => {
      this.cache.skillIdToNameMap.set(skill.id, skill.name);
    });
    debugLog(`Updated skill ID cache with ${skills.length} entries`);
  }
}
