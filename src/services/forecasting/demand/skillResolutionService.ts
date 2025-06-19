import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';

/**
 * Enhanced Skill Resolution Service
 * Handles conversion between skill names and UUIDs, and validates skill references
 * 
 * Phase 4: Comprehensive Pipeline Fix
 * - Graceful handling of empty/invalid UUID arrays
 * - Non-blocking error recovery with detailed diagnostics
 * - Fallback mechanisms for resilient operation
 */
export class SkillResolutionService {
  private static skillCache = new Map<string, string>(); // name -> uuid
  private static reverseSkillCache = new Map<string, string>(); // uuid -> name
  private static cacheInitialized = false;
  private static cacheTimestamp = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Enhanced skill names resolution with comprehensive error handling
   * 
   * PIPELINE FIX: This method now handles empty arrays, invalid UUIDs,
   * and database failures gracefully while providing detailed diagnostics.
   */
  static async getSkillNames(skillIds: string[]): Promise<string[]> {
    console.log('🔧 [SKILL RESOLUTION] Enhanced getSkillNames called:', {
      inputSkillIds: skillIds,
      inputLength: skillIds?.length || 0,
      inputType: Array.isArray(skillIds) ? 'array' : typeof skillIds
    });

    // PIPELINE FIX: Handle empty or invalid input gracefully
    if (!Array.isArray(skillIds)) {
      console.warn('⚠️ [SKILL RESOLUTION] Input is not an array:', skillIds);
      return [];
    }

    if (skillIds.length === 0) {
      console.log('✅ [SKILL RESOLUTION] Empty array provided, returning empty result');
      return [];
    }

    // Filter out null, undefined, and empty string values
    const validSkillIds = skillIds.filter(id => 
      id !== null && id !== undefined && typeof id === 'string' && id.trim().length > 0
    );

    if (validSkillIds.length === 0) {
      console.warn('⚠️ [SKILL RESOLUTION] No valid skill IDs after filtering:', skillIds);
      return [];
    }

    console.log(`🔍 [SKILL RESOLUTION] Processing ${validSkillIds.length}/${skillIds.length} valid skill IDs`);

    try {
      // Initialize cache if needed
      await this.initializeSkillCache();

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
          const trimmedId = skillId.trim();
          
          // Check if it's already a name (not a UUID)
          if (!this.isUUID(trimmedId)) {
            console.log(`📝 [SKILL RESOLUTION] ID appears to be a name: ${trimmedId}`);
            resolvedNames.push(trimmedId);
            resolutionStats.resolved++;
            continue;
          }

          // Look up in cache first
          const cachedName = this.reverseSkillCache.get(trimmedId);
          if (cachedName) {
            console.log(`⚡ [SKILL RESOLUTION] Cache hit for UUID: ${trimmedId} -> ${cachedName}`);
            resolvedNames.push(cachedName);
            resolutionStats.resolved++;
            resolutionStats.cached++;
            continue;
          }

          // Fallback: try to fetch directly from database
          console.log(`🔄 [SKILL RESOLUTION] Cache miss, fetching from database: ${trimmedId}`);
          const { data, error } = await supabase
            .from('skills')
            .select('name')
            .eq('id', trimmedId)
            .single();

          if (data && !error && data.name) {
            const resolvedName = data.name.trim();
            console.log(`✅ [SKILL RESOLUTION] Database fetch success: ${trimmedId} -> ${resolvedName}`);
            resolvedNames.push(resolvedName);
            
            // Update cache for future use
            this.reverseSkillCache.set(trimmedId, resolvedName);
            this.skillCache.set(resolvedName.toLowerCase(), trimmedId);
            
            resolutionStats.resolved++;
            resolutionStats.fetched++;
          } else {
            // PIPELINE FIX: Non-blocking fallback instead of hard failure
            console.warn(`⚠️ [SKILL RESOLUTION] Could not resolve skill UUID: ${trimmedId}`, { error });
            const fallbackName = `Unknown Skill (${trimmedId.slice(0, 8)})`;
            resolvedNames.push(fallbackName);
            resolutionStats.fallback++;
            resolutionStats.errors++;
          }
        } catch (skillError) {
          // PIPELINE FIX: Individual skill errors don't break the entire pipeline
          console.error(`❌ [SKILL RESOLUTION] Error processing skill ID ${skillId}:`, skillError);
          const fallbackName = `Error Skill (${skillId.slice(0, 8)})`;
          resolvedNames.push(fallbackName);
          resolutionStats.fallback++;
          resolutionStats.errors++;
        }
      }

      // Enhanced logging for pipeline diagnosis
      console.log('📊 [SKILL RESOLUTION] Resolution complete:', {
        input: skillIds,
        output: resolvedNames,
        stats: resolutionStats,
        successRate: `${((resolutionStats.resolved / resolutionStats.total) * 100).toFixed(1)}%`,
        pipelineHealthy: resolutionStats.errors === 0
      });

      debugLog(`Enhanced skill resolution completed: ${resolvedNames.length}/${skillIds.length} processed`);
      return resolvedNames;

    } catch (error) {
      // PIPELINE FIX: Total failure fallback - return meaningful placeholders
      console.error('❌ [SKILL RESOLUTION] Critical error in getSkillNames:', error);
      const fallbackNames = validSkillIds.map(id => `Fallback Skill (${id.slice(0, 8)})`);
      
      console.log('🆘 [SKILL RESOLUTION] Using fallback names:', fallbackNames);
      return fallbackNames;
    }
  }

  /**
   * Enhanced cache initialization with better error handling
   */
  static async initializeSkillCache(): Promise<void> {
    const now = Date.now();
    if (this.cacheInitialized && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return; // Cache is still valid
    }

    try {
      console.log('🔄 [SKILL RESOLUTION] Initializing enhanced skill cache...');
      
      const { data: skills, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('❌ [SKILL RESOLUTION] Error loading skills for cache:', error);
        // Don't throw - let the system work with existing cache
        return;
      }

      if (Array.isArray(skills)) {
        // Clear existing cache
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
        
        console.log(`✅ [SKILL RESOLUTION] Cache initialized with ${validSkillsCount}/${skills.length} valid skills`);
        debugLog(`Skill cache initialized with ${validSkillsCount} skills`);
      } else {
        console.warn('⚠️ [SKILL RESOLUTION] Skills data is not an array:', skills);
      }
    } catch (error) {
      console.error('❌ [SKILL RESOLUTION] Failed to initialize skill cache:', error);
      // Don't throw here - let the system work with what it has
    }
  }

  /**
   * Enhanced UUID validation
   */
  private static isUUID(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Enhanced skill references validation with comprehensive diagnostics
   */
  static async validateSkillReferences(skillRefs: string[]): Promise<{
    valid: string[];
    invalid: string[];
    resolved: string[];
    diagnostics: Record<string, any>;
  }> {
    console.log('🔍 [SKILL RESOLUTION] Enhanced validation starting:', skillRefs);

    const diagnostics: Record<string, any> = {
      inputCount: skillRefs?.length || 0,
      validUuids: 0,
      invalidUuids: 0,
      resolvedNames: 0,
      cacheHits: 0,
      errors: []
    };

    if (!Array.isArray(skillRefs)) {
      diagnostics.errors.push('Input is not an array');
      return { valid: [], invalid: skillRefs || [], resolved: [], diagnostics };
    }

    await this.initializeSkillCache();

    const valid: string[] = [];
    const invalid: string[] = [];
    const resolved: string[] = [];

    for (const skillRef of skillRefs) {
      try {
        if (!skillRef || typeof skillRef !== 'string') {
          invalid.push(skillRef);
          diagnostics.invalidUuids++;
          continue;
        }

        const trimmed = skillRef.trim();
        
        if (this.isUUID(trimmed)) {
          diagnostics.validUuids++;
          // It's a UUID - resolve to name
          const name = this.reverseSkillCache.get(trimmed);
          if (name) {
            valid.push(trimmed);
            resolved.push(name);
            diagnostics.resolvedNames++;
            diagnostics.cacheHits++;
          } else {
            // Try database lookup for missing cache entries
            try {
              const { data } = await supabase
                .from('skills')
                .select('name')
                .eq('id', trimmed)
                .single();
                
              if (data?.name) {
                valid.push(trimmed);
                resolved.push(data.name);
                diagnostics.resolvedNames++;
                // Update cache
                this.reverseSkillCache.set(trimmed, data.name);
              } else {
                invalid.push(trimmed);
                resolved.push(`Unknown: ${trimmed.slice(0, 8)}`);
              }
            } catch {
              invalid.push(trimmed);
              resolved.push(`Error: ${trimmed.slice(0, 8)}`);
            }
          }
        } else {
          // It's a name - check if valid
          const id = this.skillCache.get(trimmed.toLowerCase());
          if (id) {
            valid.push(trimmed);
            resolved.push(trimmed);
            diagnostics.resolvedNames++;
            diagnostics.cacheHits++;
          } else {
            invalid.push(trimmed);
            resolved.push(trimmed);
          }
        }
      } catch (error) {
        console.error(`❌ [SKILL RESOLUTION] Error validating skill reference ${skillRef}:`, error);
        invalid.push(skillRef);
        resolved.push(`Error: ${skillRef}`);
        diagnostics.errors.push(`Validation error for ${skillRef}: ${error}`);
      }
    }

    console.log('📊 [SKILL RESOLUTION] Validation complete:', { valid, invalid, resolved, diagnostics });
    return { valid, invalid, resolved, diagnostics };
  }

  /**
   * Get all available skills (names)
   */
  static async getAllSkillNames(): Promise<string[]> {
    await this.initializeSkillCache();
    return Array.from(this.reverseSkillCache.values()).sort();
  }

  /**
   * Clear the cache (useful for testing or when data changes)
   */
  static clearCache(): void {
    this.skillCache.clear();
    this.reverseSkillCache.clear();
    this.cacheInitialized = false;
    this.cacheTimestamp = 0;
    debugLog('Enhanced skill cache cleared');
  }

  /**
   * Resolve skill references (backward compatibility method)
   */
  static async resolveSkillReferences(skillRefs: string[]): Promise<{
    validSkills: string[];
    invalidSkills: string[];
  }> {
    try {
      const { valid, invalid, resolved } = await this.validateSkillReferences(skillRefs);
      return {
        validSkills: resolved,
        invalidSkills: invalid
      };
    } catch (error) {
      console.error('❌ [SKILL RESOLUTION] Error resolving skill references:', error);
      return {
        validSkills: [],
        invalidSkills: skillRefs
      };
    }
  }
}
