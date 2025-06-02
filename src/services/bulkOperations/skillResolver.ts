
import { getSkillsByIds } from '@/services/skills/skillsService';
import { SkillNormalizationService } from '../skillNormalizationService';

/**
 * Enhanced Skill Resolver Service - Updated for UUID-based skill system
 * 
 * Handles the resolution of skill UUIDs to skill names for task creation
 * with proper normalization for forecasting compatibility.
 */

/**
 * Resolve skill UUIDs to skill names with normalization
 * 
 * @param skillIds - Array of skill UUIDs to resolve
 * @returns Promise resolving to array of normalized skill names
 */
export const resolveSkillNames = async (skillIds: string[]): Promise<string[]> => {
  if (!skillIds || skillIds.length === 0) return [];
  
  try {
    console.log(`[Skill Resolver] Resolving ${skillIds.length} skill UUIDs:`, skillIds);
    
    // Step 1: Resolve skill UUIDs to skill objects
    const skills = await getSkillsByIds(skillIds);
    
    // Step 2: Extract skill names
    const skillNames = skills.map(skill => skill.name);
    
    // Step 3: Normalize the skill names for consistency using centralized service
    const normalizedNames = await Promise.all(
      skillNames.map(name => SkillNormalizationService.normalizeSkill(name))
    );
    
    console.log(`[Skill Resolver] Resolved ${skillIds.length} skill UUIDs to normalized names:`, {
      original: skillIds,
      resolved: skillNames,
      normalized: normalizedNames
    });
    
    return normalizedNames;
  } catch (error) {
    console.error('Error resolving skill names:', error);
    // Fallback to creating placeholder names from UUIDs
    return skillIds.map(id => `Skill ${id.slice(0, 8)}`);
  }
};

/**
 * Resolve and validate skill UUIDs
 * 
 * @param skillIds - Array of skill UUIDs to resolve and validate
 * @returns Promise resolving to validation result with resolved names
 */
export const resolveAndValidateSkills = async (skillIds: string[]): Promise<{
  resolvedNames: string[];
  validSkills: string[];
  invalidSkills: string[];
}> => {
  try {
    const resolvedNames = await resolveSkillNames(skillIds);
    
    // For UUID-based system, we consider skills valid if they were successfully resolved
    const skills = await getSkillsByIds(skillIds);
    const validSkillIds = skills.map(skill => skill.id);
    const invalidSkillIds = skillIds.filter(id => !validSkillIds.includes(id));
    
    return {
      resolvedNames,
      validSkills: validSkillIds,
      invalidSkills: invalidSkillIds
    };
  } catch (error) {
    console.error('Error resolving and validating skills:', error);
    return {
      resolvedNames: skillIds.map(id => `Skill ${id.slice(0, 8)}`),
      validSkills: [],
      invalidSkills: skillIds
    };
  }
};
