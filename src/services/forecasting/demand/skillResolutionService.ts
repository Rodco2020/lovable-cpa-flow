
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

  /**
   * Initialize skill cache from database
   */
  static async initializeSkillCache(): Promise<void> {
    if (this.cacheInitialized) return;

    try {
      const { data: skills, error } = await supabase
        .from('skills')
        .select('id, name');

      if (error) {
        console.error('Error loading skills for cache:', error);
        return;
      }

      if (Array.isArray(skills)) {
        this.skillCache.clear();
        this.reverseSkillCache.clear();
        
        skills.forEach(skill => {
          if (skill.id && skill.name) {
            this.skillCache.set(skill.name.toLowerCase().trim(), skill.id);
            this.reverseSkillCache.set(skill.id, skill.name);
          }
        });

        this.cacheInitialized = true;
        debugLog(`Initialized skill cache with ${skills.length} skills`);
      }
    } catch (error) {
      console.error('Failed to initialize skill cache:', error);
    }
  }

  /**
   * Resolve skill references to valid UUIDs
   */
  static async resolveSkillReferences(skillReferences: string[]): Promise<{
    validSkills: string[];
    invalidSkills: string[];
    resolvedCount: number;
  }> {
    await this.initializeSkillCache();

    const validSkills: string[] = [];
    const invalidSkills: string[] = [];
    let resolvedCount = 0;

    for (const skillRef of skillReferences) {
      if (!skillRef || typeof skillRef !== 'string') {
        invalidSkills.push(skillRef);
        continue;
      }

      const trimmedRef = skillRef.trim();
      
      // Check if it's already a valid UUID format
      if (this.isValidUUID(trimmedRef)) {
        // Verify the UUID exists in our cache
        if (this.reverseSkillCache.has(trimmedRef)) {
          validSkills.push(trimmedRef);
        } else {
          // UUID format but not in database - try to resolve by name
          const resolvedUuid = this.skillCache.get(trimmedRef.toLowerCase());
          if (resolvedUuid) {
            validSkills.push(resolvedUuid);
            resolvedCount++;
          } else {
            invalidSkills.push(trimmedRef);
          }
        }
      } else {
        // Treat as skill name and try to resolve to UUID
        const resolvedUuid = this.skillCache.get(trimmedRef.toLowerCase());
        if (resolvedUuid) {
          validSkills.push(resolvedUuid);
          resolvedCount++;
        } else {
          invalidSkills.push(trimmedRef);
        }
      }
    }

    return {
      validSkills,
      invalidSkills,
      resolvedCount
    };
  }

  /**
   * Convert UUIDs back to skill names for display
   */
  static async getSkillNames(skillUuids: string[]): Promise<string[]> {
    await this.initializeSkillCache();

    return skillUuids
      .map(uuid => this.reverseSkillCache.get(uuid) || uuid)
      .filter(name => name);
  }

  /**
   * Check if a string is a valid UUID format
   */
  private static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Clear the skill cache (useful for testing or when skills are updated)
   */
  static clearCache(): void {
    this.skillCache.clear();
    this.reverseSkillCache.clear();
    this.cacheInitialized = false;
  }

  /**
   * Get all available skills for dropdowns/filters
   */
  static async getAvailableSkills(): Promise<Array<{ id: string; name: string }>> {
    await this.initializeSkillCache();

    return Array.from(this.skillCache.entries()).map(([name, id]) => ({
      id,
      name: this.reverseSkillCache.get(id) || name
    }));
  }
}
