
/**
 * Skill Resolution Engine
 * Handles the core logic for resolving skill UUIDs to names
 */

import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../../logger';
import { SkillCacheManager, SkillResolutionResult, SkillValidator } from './types';

export class SkillResolver {
  constructor(
    private cacheManager: SkillCacheManager,
    private validator: SkillValidator
  ) {}

  /**
   * Resolve skill UUIDs to names with comprehensive error handling
   */
  async getSkillNames(skillIds: string[]): Promise<string[]> {
    console.log('🔧 [SKILL RESOLVER] Enhanced getSkillNames called:', {
      inputSkillIds: skillIds,
      inputLength: skillIds?.length || 0,
      inputType: Array.isArray(skillIds) ? 'array' : typeof skillIds
    });

    // Handle empty or invalid input gracefully
    if (!Array.isArray(skillIds)) {
      console.warn('⚠️ [SKILL RESOLVER] Input is not an array:', skillIds);
      return [];
    }

    if (skillIds.length === 0) {
      console.log('✅ [SKILL RESOLVER] Empty array provided, returning empty result');
      return [];
    }

    // Filter out null, undefined, and empty string values
    const validSkillIds = skillIds.filter(id => 
      id !== null && id !== undefined && typeof id === 'string' && id.trim().length > 0
    );

    if (validSkillIds.length === 0) {
      console.warn('⚠️ [SKILL RESOLVER] No valid skill IDs after filtering:', skillIds);
      return [];
    }

    console.log(`🔍 [SKILL RESOLVER] Processing ${validSkillIds.length}/${skillIds.length} valid skill IDs`);

    try {
      await this.cacheManager.initialize();

      const resolvedNames: string[] = [];
      const resolutionStats = {
        total: validSkillIds.length,
        resolved: 0,
        cached: 0,
        fetched: 0,
        fallback: 0,
        errors: 0
      };

      for (const skillId of validSkillIds) {
        try {
          const result = await this.resolveSingleSkill(skillId.trim(), resolutionStats);
          resolvedNames.push(result);
        } catch (skillError) {
          console.error(`❌ [SKILL RESOLVER] Error processing skill ID ${skillId}:`, skillError);
          const fallbackName = `Error Skill (${skillId.slice(0, 8)})`;
          resolvedNames.push(fallbackName);
          resolutionStats.fallback++;
          resolutionStats.errors++;
        }
      }

      this.logResolutionResults(skillIds, resolvedNames, resolutionStats);
      return resolvedNames;

    } catch (error) {
      console.error('❌ [SKILL RESOLVER] Critical error in getSkillNames:', error);
      const fallbackNames = validSkillIds.map(id => `Fallback Skill (${id.slice(0, 8)})`);
      console.log('🆘 [SKILL RESOLVER] Using fallback names:', fallbackNames);
      return fallbackNames;
    }
  }

  /**
   * Resolve a single skill ID to name
   */
  private async resolveSingleSkill(skillId: string, stats: any): Promise<string> {
    // Check if it's already a name (not a UUID)
    if (!this.validator.isUUID(skillId)) {
      console.log(`📝 [SKILL RESOLVER] ID appears to be a name: ${skillId}`);
      stats.resolved++;
      return skillId;
    }

    // Look up in cache first
    const cachedName = this.cacheManager.getNameById(skillId);
    if (cachedName) {
      console.log(`⚡ [SKILL RESOLVER] Cache hit for UUID: ${skillId} -> ${cachedName}`);
      stats.resolved++;
      stats.cached++;
      return cachedName;
    }

    // Fallback: try to fetch directly from database
    console.log(`🔄 [SKILL RESOLVER] Cache miss, fetching from database: ${skillId}`);
    const { data, error } = await supabase
      .from('skills')
      .select('name')
      .eq('id', skillId)
      .single();

    if (data && !error && data.name) {
      const resolvedName = data.name.trim();
      console.log(`✅ [SKILL RESOLVER] Database fetch success: ${skillId} -> ${resolvedName}`);
      
      // Update cache for future use
      this.cacheManager.updateCache(skillId, resolvedName);
      
      stats.resolved++;
      stats.fetched++;
      return resolvedName;
    } else {
      console.warn(`⚠️ [SKILL RESOLVER] Could not resolve skill UUID: ${skillId}`, { error });
      const fallbackName = `Unknown Skill (${skillId.slice(0, 8)})`;
      stats.fallback++;
      stats.errors++;
      return fallbackName;
    }
  }

  /**
   * Log resolution results for monitoring
   */
  private logResolutionResults(input: string[], output: string[], stats: any): void {
    console.log('📊 [SKILL RESOLVER] Resolution complete:', {
      input,
      output,
      stats,
      successRate: `${((stats.resolved / stats.total) * 100).toFixed(1)}%`,
      pipelineHealthy: stats.errors === 0
    });

    debugLog(`Enhanced skill resolution completed: ${output.length}/${input.length} processed`);
  }
}
