
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
      
      debugLog(`Updated skills cache with ${skills.length} skills -> ${skillTypes.length} skill types`);
    } catch (error) {
      debugLog('Error updating skills cache:', error);
      // Fallback to standard skills if database fails
      const standardSkills = SkillNormalizationService.getStandardForecastSkills();
      this.cache.skillsMap.clear();
      standardSkills.forEach(skill => {
        this.cache.skillsMap.set(skill, skill);
      });
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
   * Convert database skills to normalized SkillType array
   */
  private static convertSkillsToSkillTypes(skills: Skill[]): SkillType[] {
    const skillTypesSet = new Set<SkillType>();
    
    skills.forEach(skill => {
      const normalizedSkill = SkillNormalizationService.normalizeSkill(skill.name);
      skillTypesSet.add(normalizedSkill);
    });
    
    // Always include standard forecast skills
    const standardSkills = SkillNormalizationService.getStandardForecastSkills();
    standardSkills.forEach(skill => skillTypesSet.add(skill));
    
    return Array.from(skillTypesSet).sort();
  }
}
