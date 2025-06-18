
import { supabase } from '@/lib/supabaseClient';

/**
 * Enhanced Skill Validation Service
 * 
 * Provides dynamic validation of skill IDs against the database
 * with improved error handling and integration with the unified form system.
 */
class SkillValidationService {
  private skillCache: Map<string, { id: string; name: string; category?: string }> | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate skill IDs against database with enhanced error reporting
   */
  async validateSkillIds(skillIds: string[]): Promise<{
    valid: string[];
    invalid: string[];
    details: Array<{ id: string; name?: string; error?: string }>;
  }> {
    try {
      console.log(`[SkillValidation] Validating ${skillIds.length} skill IDs:`, skillIds);
      
      if (!Array.isArray(skillIds) || skillIds.length === 0) {
        console.log('[SkillValidation] No skills to validate');
        return { valid: [], invalid: [], details: [] };
      }

      const skillsMap = await this.getValidSkillsMap();
      
      const valid: string[] = [];
      const invalid: string[] = [];
      const details: Array<{ id: string; name?: string; error?: string }> = [];
      
      skillIds.forEach(skillId => {
        if (!skillId || typeof skillId !== 'string') {
          invalid.push(skillId);
          details.push({ id: skillId, error: 'Invalid skill ID format' });
          return;
        }

        const skill = skillsMap.get(skillId);
        if (skill) {
          valid.push(skillId);
          details.push({ id: skillId, name: skill.name });
        } else {
          invalid.push(skillId);
          details.push({ id: skillId, error: 'Skill not found in database' });
        }
      });
      
      console.log(`[SkillValidation] Validation complete - Valid: ${valid.length}, Invalid: ${invalid.length}`);
      
      return { valid, invalid, details };
    } catch (error) {
      console.error('[SkillValidation] Error validating skill IDs:', error);
      // Fallback: assume all skills are valid if validation fails
      return { 
        valid: skillIds.filter(id => id && typeof id === 'string'), 
        invalid: [], 
        details: skillIds.map(id => ({ id, error: 'Validation service error' }))
      };
    }
  }

  /**
   * Get skill details by IDs
   */
  async getSkillDetails(skillIds: string[]): Promise<Array<{ id: string; name: string; category?: string }>> {
    try {
      const skillsMap = await this.getValidSkillsMap();
      
      return skillIds
        .map(id => skillsMap.get(id))
        .filter((skill): skill is NonNullable<typeof skill> => skill !== undefined);
    } catch (error) {
      console.error('[SkillValidation] Error getting skill details:', error);
      return [];
    }
  }

  /**
   * Check if a single skill ID is valid
   */
  async isValidSkillId(skillId: string): Promise<boolean> {
    try {
      const validation = await this.validateSkillIds([skillId]);
      return validation.valid.length > 0;
    } catch (error) {
      console.error('[SkillValidation] Error checking skill validity:', error);
      return false;
    }
  }

  /**
   * Get valid skill IDs from database (with enhanced caching)
   */
  private async getValidSkillsMap(): Promise<Map<string, { id: string; name: string; category?: string }>> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.skillCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('[SkillValidation] Using cached skills data');
      return this.skillCache;
    }
    
    console.log('[SkillValidation] Fetching fresh skills data from database');
    
    // Fetch fresh data from database
    const { data: skills, error } = await supabase
      .from('skills')
      .select('id, name, category')
      .order('name');
    
    if (error) {
      console.error('[SkillValidation] Database error:', error);
      throw new Error(`Failed to fetch skills: ${error.message}`);
    }
    
    // Update cache with enhanced data
    this.skillCache = new Map();
    skills?.forEach(skill => {
      if (skill.id) {
        this.skillCache!.set(skill.id, {
          id: skill.id,
          name: skill.name || 'Unknown Skill',
          category: skill.category || undefined
        });
      }
    });
    
    this.cacheTimestamp = now;
    
    console.log(`[SkillValidation] Cached ${this.skillCache.size} skills`);
    return this.skillCache;
  }

  /**
   * Clear the skill cache (useful for testing or when skills are updated)
   */
  clearCache(): void {
    console.log('[SkillValidation] Clearing skills cache');
    this.skillCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Refresh the cache by clearing and fetching fresh data
   */
  async refreshCache(): Promise<void> {
    this.clearCache();
    await this.getValidSkillsMap();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { 
    isCached: boolean; 
    skillCount: number; 
    ageMs: number; 
    isExpired: boolean; 
  } {
    const now = Date.now();
    const ageMs = now - this.cacheTimestamp;
    
    return {
      isCached: this.skillCache !== null,
      skillCount: this.skillCache?.size || 0,
      ageMs,
      isExpired: ageMs > this.CACHE_DURATION
    };
  }
}

export const skillValidationService = new SkillValidationService();
export default skillValidationService;
