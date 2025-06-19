
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';

/**
 * Skill Resolution Service
 * Handles conversion between skill names and UUIDs, and validates skill references
 */
export class SkillResolutionService {
  private static skillCache = new Map<string, string>(); // name -> uuid
  private static reverseSkillCache = new Map<string, string>(); // uuid -> name
  private static cacheInitialized = false;
  private static cacheTimestamp = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize skill cache from database
   */
  static async initializeSkillCache(): Promise<void> {
    const now = Date.now();
    if (this.cacheInitialized && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return; // Cache is still valid
    }

    try {
      debugLog('Initializing skill cache from database...');
      
      const { data: skills, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error loading skills for cache:', error);
        throw new Error(`Failed to load skills: ${error.message}`);
      }

      if (Array.isArray(skills)) {
        this.skillCache.clear();
        this.reverseSkillCache.clear();
        
        skills.forEach(skill => {
          if (skill.id && skill.name) {
            const normalizedName = skill.name.trim();
            this.skillCache.set(normalizedName.toLowerCase(), skill.id);
            this.reverseSkillCache.set(skill.id, normalizedName);
          }
        });

        this.cacheInitialized = true;
        this.cacheTimestamp = now;
        debugLog(`Initialized skill cache with ${skills.length} skills`);
      }
    } catch (error) {
      console.error('Failed to initialize skill cache:', error);
      // Don't throw here - let the system work with what it has
    }
  }

  /**
   * Get skill names from UUIDs
   */
  static async getSkillNames(skillIds: string[]): Promise<string[]> {
    await this.initializeSkillCache();

    const resolvedNames: string[] = [];

    for (const skillId of skillIds) {
      if (!skillId || typeof skillId !== 'string') {
        continue;
      }

      const trimmedId = skillId.trim();
      
      // Check if it's already a name (not a UUID)
      if (!this.isUUID(trimmedId)) {
        resolvedNames.push(trimmedId);
        continue;
      }

      // Look up in cache
      const skillName = this.reverseSkillCache.get(trimmedId);
      if (skillName) {
        resolvedNames.push(skillName);
      } else {
        // Fallback: try to fetch directly from database
        try {
          const { data, error } = await supabase
            .from('skills')
            .select('name')
            .eq('id', trimmedId)
            .single();

          if (data && !error) {
            const name = data.name.trim();
            resolvedNames.push(name);
            // Update cache
            this.reverseSkillCache.set(trimmedId, name);
            this.skillCache.set(name.toLowerCase(), trimmedId);
          } else {
            debugLog(`Could not resolve skill ID: ${trimmedId}`);
            resolvedNames.push(trimmedId); // Keep original if can't resolve
          }
        } catch (err) {
          console.error(`Error fetching skill name for ID ${trimmedId}:`, err);
          resolvedNames.push(trimmedId);
        }
      }
    }

    debugLog(`Resolved ${skillIds.length} skill IDs to names:`, {
      input: skillIds,
      output: resolvedNames
    });

    return resolvedNames;
  }

  /**
   * Get skill UUIDs from names
   */
  static async getSkillIds(skillNames: string[]): Promise<string[]> {
    await this.initializeSkillCache();

    const resolvedIds: string[] = [];

    for (const skillName of skillNames) {
      if (!skillName || typeof skillName !== 'string') {
        continue;
      }

      const trimmedName = skillName.trim();
      
      // Check if it's already a UUID
      if (this.isUUID(trimmedName)) {
        resolvedIds.push(trimmedName);
        continue;
      }

      // Look up in cache
      const skillId = this.skillCache.get(trimmedName.toLowerCase());
      if (skillId) {
        resolvedIds.push(skillId);
      } else {
        // Fallback: try to fetch directly from database
        try {
          const { data, error } = await supabase
            .from('skills')
            .select('id')
            .ilike('name', trimmedName)
            .single();

          if (data && !error) {
            resolvedIds.push(data.id);
            // Update cache
            this.skillCache.set(trimmedName.toLowerCase(), data.id);
            this.reverseSkillCache.set(data.id, trimmedName);
          } else {
            debugLog(`Could not resolve skill name: ${trimmedName}`);
            resolvedIds.push(trimmedName); // Keep original if can't resolve
          }
        } catch (err) {
          console.error(`Error fetching skill ID for name ${trimmedName}:`, err);
          resolvedIds.push(trimmedName);
        }
      }
    }

    return resolvedIds;
  }

  /**
   * Check if a string is a UUID
   */
  private static isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Clear the cache (useful for testing or when data changes)
   */
  static clearCache(): void {
    this.skillCache.clear();
    this.reverseSkillCache.clear();
    this.cacheInitialized = false;
    this.cacheTimestamp = 0;
    debugLog('Skill cache cleared');
  }

  /**
   * Get all available skills (names)
   */
  static async getAllSkillNames(): Promise<string[]> {
    await this.initializeSkillCache();
    return Array.from(this.reverseSkillCache.values()).sort();
  }

  /**
   * Validate that skill references exist in the database
   */
  static async validateSkillReferences(skillRefs: string[]): Promise<{
    valid: string[];
    invalid: string[];
    resolved: string[];
  }> {
    await this.initializeSkillCache();

    const valid: string[] = [];
    const invalid: string[] = [];
    const resolved: string[] = [];

    for (const skillRef of skillRefs) {
      if (!skillRef || typeof skillRef !== 'string') {
        invalid.push(skillRef);
        continue;
      }

      const trimmed = skillRef.trim();
      
      if (this.isUUID(trimmed)) {
        // It's a UUID - resolve to name
        const name = this.reverseSkillCache.get(trimmed);
        if (name) {
          valid.push(trimmed);
          resolved.push(name);
        } else {
          invalid.push(trimmed);
          resolved.push(trimmed);
        }
      } else {
        // It's a name - check if valid
        const id = this.skillCache.get(trimmed.toLowerCase());
        if (id) {
          valid.push(trimmed);
          resolved.push(trimmed);
        } else {
          invalid.push(trimmed);
          resolved.push(trimmed);
        }
      }
    }

    return { valid, invalid, resolved };
  }
}
