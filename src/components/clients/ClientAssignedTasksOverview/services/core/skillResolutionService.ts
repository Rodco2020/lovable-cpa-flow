
import { resolveSkillNames } from '@/services/bulkOperations/skillResolver';

/**
 * Skill Resolution Service
 * 
 * Handles the resolution of skill IDs to skill names with proper error handling
 * and fallback mechanisms for when skill resolution fails.
 */
export class SkillResolutionService {
  /**
   * Resolve skill IDs to skill names for a task
   * @param skillIds Array of skill UUIDs to resolve
   * @returns Promise resolving to array of skill names
   */
  static async resolveTaskSkills(skillIds: string[]): Promise<string[]> {
    if (!skillIds || skillIds.length === 0) {
      return [];
    }

    try {
      console.log(`[SkillResolutionService] Resolving ${skillIds.length} skill IDs:`, skillIds);
      const resolvedNames = await resolveSkillNames(skillIds);
      console.log(`[SkillResolutionService] Resolved skill names:`, resolvedNames);
      return resolvedNames;
    } catch (error) {
      console.error('[SkillResolutionService] Error resolving skill names:', error);
      // Fallback to showing placeholder names
      return skillIds.map(id => `Skill ${id.slice(0, 8)}`);
    }
  }

  /**
   * Collect skills for filter options
   * @param resolvedSkills Array of resolved skill names
   * @param skillsSet Set to collect unique skills
   */
  static collectSkillsForFilters(resolvedSkills: string[], skillsSet: Set<string>): void {
    resolvedSkills.forEach(skill => skillsSet.add(skill));
  }
}
