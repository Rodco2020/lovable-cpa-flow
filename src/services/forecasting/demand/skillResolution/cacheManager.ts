
/**
 * Skill Cache Manager
 * Handles caching and retrieval of skill data
 */

import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../../logger';
import { SkillCacheManager } from './types';

export class SkillCacheManagerImpl implements SkillCacheManager {
  private skillCache = new Map<string, string>(); // name -> uuid
  private reverseSkillCache = new Map<string, string>(); // uuid -> name
  private cacheInitialized = false;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize the skill cache from database
   */
  async initialize(): Promise<void> {
    const now = Date.now();
    if (this.cacheInitialized && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return; // Cache is still valid
    }

    try {
      console.log('🔄 [SKILL CACHE] Initializing skill cache...');
      
      const { data: skills, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('❌ [SKILL CACHE] Error loading skills for cache:', error);
        return;
      }

      if (Array.isArray(skills)) {
        this.skillCache.clear();
        this.reverseSkillCache.clear();
        
        let validSkillsCount = 0;
        skills.forEach(skill => {
          if (skill.id && skill.name && typeof skill.name === 'string') {
            const normalizedName = skill.name.trim();
            if (normalizedName.length > 0) {
              this.skillCache.set(normalizedName.toLowerCase(), skill.id);
              this.reverseSkillCache.set(skill.id, normalizedName);
              validSkillsCount++;
            }
          }
        });

        this.cacheInitialized = true;
        this.cacheTimestamp = now;
        
        console.log(`✅ [SKILL CACHE] Cache initialized with ${validSkillsCount}/${skills.length} valid skills`);
        debugLog(`Skill cache initialized with ${validSkillsCount} skills`);
      } else {
        console.warn('⚠️ [SKILL CACHE] Skills data is not an array:', skills);
      }
    } catch (error) {
      console.error('❌ [SKILL CACHE] Failed to initialize skill cache:', error);
    }
  }

  /**
   * Check if cache is initialized
   */
  isInitialized(): boolean {
    return this.cacheInitialized;
  }

  /**
   * Check if cache is still valid (within duration)
   */
  isCacheValid(): boolean {
    const now = Date.now();
    return this.cacheInitialized && (now - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  /**
   * Get skill name by UUID
   */
  getNameById(id: string): string | undefined {
    return this.reverseSkillCache.get(id);
  }

  /**
   * Get skill UUID by name
   */
  getIdByName(name: string): string | undefined {
    return this.skillCache.get(name.toLowerCase());
  }

  /**
   * Update cache with new skill data
   */
  updateCache(id: string, name: string): void {
    const normalizedName = name.trim();
    this.skillCache.set(normalizedName.toLowerCase(), id);
    this.reverseSkillCache.set(id, normalizedName);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.skillCache.clear();
    this.reverseSkillCache.clear();
    this.cacheInitialized = false;
    this.cacheTimestamp = 0;
    debugLog('Skill cache cleared');
  }

  /**
   * Get all available skill names
   */
  getAllNames(): string[] {
    return Array.from(this.reverseSkillCache.values()).sort();
  }
}
