
import { RecurringTask } from '@/types/task';
import { FormattedTask } from '../types';
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

  /**
   * Generate filter options from formatted tasks
   */
  static generateFilterOptions(tasks: FormattedTask[]): {
    skills: string[];
    priorities: string[];
    clients: string[];
    validation: { isValid: boolean; errors: string[] };
  } {
    const skills = new Set<string>();
    const priorities = new Set<string>();
    const clients = new Set<string>();
    const errors: string[] = [];

    // Extract unique values from tasks
    tasks.forEach((task, index) => {
      try {
        // Add skills
        if (task.requiredSkills && Array.isArray(task.requiredSkills)) {
          task.requiredSkills.forEach(skill => {
            if (skill && typeof skill === 'string') {
              skills.add(skill.trim());
            }
          });
        }

        // Add priority
        if (task.priority && typeof task.priority === 'string') {
          priorities.add(task.priority.trim());
        }

        // Add client
        if (task.clientName && typeof task.clientName === 'string') {
          clients.add(task.clientName.trim());
        }
      } catch (error) {
        errors.push(`Error processing task at index ${index}: ${error}`);
      }
    });

    // Validate data integrity
    const isValid = errors.length === 0 && skills.size > 0;

    return {
      skills: Array.from(skills).sort(),
      priorities: Array.from(priorities).sort(),
      clients: Array.from(clients).sort(),
      validation: { isValid, errors }
    };
  }
}
