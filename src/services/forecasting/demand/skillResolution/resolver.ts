
/**
 * Skill Resolution Core Logic
 * Handles the main skill resolution operations
 */

import { supabase } from '@/integrations/supabase/client';
import { SkillCacheManager, SkillResolutionResult, SkillResolutionStats } from './types';
import { SkillValidator } from './validator';

export class SkillResolver {
  constructor(
    private cacheManager: SkillCacheManager,
    private validator: SkillValidator
  ) {}

  /**
   * Resolve skill UUIDs to skill names with comprehensive error handling
   */
  async getSkillNames(skillIds: string[]): Promise<string[]> {
    console.log('🔍 [SKILL RESOLVER] Starting skill name resolution for:', skillIds);

    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      console.log('📝 [SKILL RESOLVER] Empty or invalid input, returning empty array');
      return [];
    }

    await this.cacheManager.initialize();

    const stats: SkillResolutionStats = {
      total: skillIds.length,
      resolved: 0,
      cached: 0,
      fetched: 0,
      fallback: 0,
      errors: 0
    };

    const resolvedNames: string[] = [];

    for (const skillId of skillIds) {
      try {
        if (!skillId || typeof skillId !== 'string') {
          resolvedNames.push(`Invalid: ${skillId}`);
          stats.errors++;
          continue;
        }

        const trimmed = skillId.trim();
        
        if (this.validator.isUUID(trimmed)) {
          // It's a UUID - try to resolve to name
          const cachedName = this.cacheManager.getNameById(trimmed);
          
          if (cachedName) {
            resolvedNames.push(cachedName);
            stats.resolved++;
            stats.cached++;
          } else {
            // Cache miss - fetch from database
            try {
              const { data } = await supabase
                .from('skills')
                .select('name')
                .eq('id', trimmed)
                .single();
                
              if (data?.name) {
                resolvedNames.push(data.name);
                this.cacheManager.updateCache(trimmed, data.name);
                stats.resolved++;
                stats.fetched++;
              } else {
                resolvedNames.push(`Unknown: ${trimmed.slice(0, 8)}`);
                stats.fallback++;
              }
            } catch (dbError) {
              console.error(`❌ [SKILL RESOLVER] Database error for ${trimmed}:`, dbError);
              resolvedNames.push(`Error: ${trimmed.slice(0, 8)}`);
              stats.errors++;
            }
          }
        } else {
          // It's already a name - validate it exists
          const skillId = this.cacheManager.getIdByName(trimmed);
          if (skillId) {
            resolvedNames.push(trimmed);
            stats.resolved++;
            stats.cached++;
          } else {
            // Name not found in cache - treat as is but mark as potential issue
            resolvedNames.push(trimmed);
            stats.fallback++;
          }
        }
      } catch (error) {
        console.error(`❌ [SKILL RESOLVER] Error processing skill ${skillId}:`, error);
        resolvedNames.push(`Error: ${skillId}`);
        stats.errors++;
      }
    }

    console.log('📊 [SKILL RESOLVER] Resolution complete:', { stats, resolvedNames });
    return resolvedNames;
  }
}
