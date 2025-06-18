
import { supabase } from '@/lib/supabaseClient';

/**
 * Skill Validation Service
 * Provides dynamic validation of skill IDs against the database
 */
class SkillValidationService {
  private skillCache: Set<string> | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate skill IDs against database
   */
  async validateSkillIds(skillIds: string[]): Promise<{
    valid: string[];
    invalid: string[];
  }> {
    try {
      const validSkillIds = await this.getValidSkillIds();
      
      const valid: string[] = [];
      const invalid: string[] = [];
      
      skillIds.forEach(skillId => {
        if (validSkillIds.has(skillId)) {
          valid.push(skillId);
        } else {
          invalid.push(skillId);
        }
      });
      
      return { valid, invalid };
    } catch (error) {
      console.error('Error validating skill IDs:', error);
      // Fallback: assume all skills are valid if validation fails
      return { valid: skillIds, invalid: [] };
    }
  }

  /**
   * Get valid skill IDs from database (with caching)
   */
  private async getValidSkillIds(): Promise<Set<string>> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.skillCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.skillCache;
    }
    
    // Fetch fresh data from database
    const { data: skills, error } = await supabase
      .from('skills')
      .select('id');
    
    if (error) {
      throw new Error(`Failed to fetch skills: ${error.message}`);
    }
    
    // Update cache
    this.skillCache = new Set(skills?.map(skill => skill.id) || []);
    this.cacheTimestamp = now;
    
    return this.skillCache;
  }

  /**
   * Clear the skill cache (useful for testing or when skills are updated)
   */
  clearCache(): void {
    this.skillCache = null;
    this.cacheTimestamp = 0;
  }
}

export const skillValidationService = new SkillValidationService();
export default skillValidationService;
