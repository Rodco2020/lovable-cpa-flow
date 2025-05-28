
import { getAllSkills } from '@/services/skillService';

/**
 * Skill Resolver Service
 * 
 * Handles the resolution of skill IDs to skill names for task creation.
 * This ensures consistent skill name storage across the system.
 */

/**
 * Resolve skill IDs to skill names
 * 
 * @param skillIds - Array of skill IDs to resolve
 * @returns Promise resolving to array of skill names
 */
export const resolveSkillNames = async (skillIds: string[]): Promise<string[]> => {
  if (!skillIds || skillIds.length === 0) return [];
  
  try {
    const skills = await getAllSkills();
    const skillsMap = skills.reduce((map, skill) => {
      map[skill.id] = skill.name;
      return map;
    }, {} as Record<string, string>);
    
    // Convert skill IDs to names, fallback to ID if name not found
    return skillIds.map(skillId => skillsMap[skillId] || skillId);
  } catch (error) {
    console.error('Error resolving skill names:', error);
    // Fallback to returning the original skill IDs if resolution fails
    return skillIds;
  }
};
