import { RecurringTask } from '@/types/task';
import { resolveSkillNames } from '@/services/bulkOperations/skillResolver';

/**
 * Enhanced Skill Deduplication Service
 * Handles skill name resolution and deduplication for task metrics
 */
export class SkillDeduplicationService {
  /**
   * Deduplicate skills, ensuring consistent naming
   */
  static deduplicateSkills(skills: string[]): string[] {
    const uniqueSkills = new Set(skills.map(skill => skill.toLowerCase().trim()));
    return Array.from(uniqueSkills).sort();
  }

  /**
   * Count skill occurrences in a list of tasks
   */
  static countSkillOccurrences(tasks: RecurringTask[], skill: string): number {
    return tasks.filter(task =>
      task.requiredSkills.some(taskSkill => taskSkill.toLowerCase().trim() === skill.toLowerCase().trim())
    ).length;
  }

  /**
   * Calculate skill distribution across tasks
   */
  static calculateSkillDistribution(tasks: RecurringTask[]): { skill: string; count: number; percentage: number }[] {
    const allSkills = tasks.flatMap(task => task.requiredSkills);
    const deduplicatedSkills = SkillDeduplicationService.deduplicateSkills(allSkills);

    return deduplicatedSkills.map(skill => {
      const count = SkillDeduplicationService.countSkillOccurrences(tasks, skill);
      const percentage = (count / tasks.length) * 100;
      return { skill, count, percentage };
    });
  }

  /**
   * Get unique skills across all tasks with resolution
   */
  static async getUniqueSkills(tasks: RecurringTask[]): Promise<string[]> {
    const allSkillIds = new Set<string>();
    
    // Collect all skill IDs
    tasks.forEach(task => {
      task.requiredSkills.forEach(skillId => allSkillIds.add(skillId));
    });
    
    try {
      // Resolve all skill IDs to names
      const resolvedSkills = await resolveSkillNames(Array.from(allSkillIds));
      
      // Return unique resolved skills
      return Array.from(new Set(resolvedSkills)).sort();
    } catch (error) {
      console.error('Error resolving skills for deduplication:', error);
      // Fallback to original skill IDs
      return Array.from(allSkillIds).sort();
    }
  }
}
