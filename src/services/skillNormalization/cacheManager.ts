
import { SkillType } from '@/types/task';
import { SkillMappingCache, CACHE_DURATION } from './types';
import { getAllSkills } from '@/services/skills/skillsService';
import { debugLog } from '@/services/forecasting/logger';
import { SkillMappingRules } from './mappingRules';

/**
 * Cache Manager for Skill Normalization
 * Handles caching of skill mappings for performance optimization
 */

export class SkillNormalizationCacheManager {
  private static cache: SkillMappingCache = {
    skillMappingCache: new Map(),
    lastCacheUpdate: 0
  };

  /**
   * Check if cache should be updated
   */
  static shouldUpdateCache(): boolean {
    return (
      this.cache.skillMappingCache.size === 0 ||
      Date.now() - this.cache.lastCacheUpdate > CACHE_DURATION
    );
  }

  /**
   * Update skill mapping cache with database skills
   */
  static async updateCache(): Promise<void> {
    try {
      const databaseSkills = await getAllSkills();
      
      this.cache.skillMappingCache.clear();
      
      // Map each database skill to a standard forecast skill
      databaseSkills.forEach(skill => {
        const mappedSkill = SkillMappingRules.getMapping(skill.name);
        if (mappedSkill) {
          this.cache.skillMappingCache.set(skill.id, mappedSkill);
          this.cache.skillMappingCache.set(skill.name, mappedSkill);
        } else {
          // If no mapping found, use capitalized version
          const capitalizedSkill = this.capitalizeSkillName(skill.name.trim()) as SkillType;
          this.cache.skillMappingCache.set(skill.id, capitalizedSkill);
          this.cache.skillMappingCache.set(skill.name, capitalizedSkill);
        }
      });

      this.cache.lastCacheUpdate = Date.now();
      
      debugLog(`Updated skill mapping cache with ${databaseSkills.length} database skills`);
    } catch (error) {
      debugLog('Error updating skill mapping cache:', error);
    }
  }

  /**
   * Get cached skill mapping
   */
  static getCachedMapping(skillId: string): SkillType | null {
    return this.cache.skillMappingCache.get(skillId) || null;
  }

  /**
   * Clear the cache
   */
  static clearCache(): void {
    this.cache.skillMappingCache.clear();
    this.cache.lastCacheUpdate = 0;
  }

  /**
   * Get cache stats (for debugging)
   */
  static getCacheStats(): { size: number; lastUpdate: number; age: number } {
    return {
      size: this.cache.skillMappingCache.size,
      lastUpdate: this.cache.lastCacheUpdate,
      age: Date.now() - this.cache.lastCacheUpdate
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
