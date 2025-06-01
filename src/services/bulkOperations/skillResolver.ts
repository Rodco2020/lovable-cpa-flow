
import { SkillsIntegrationService } from '../forecasting/skillsIntegrationService';

/**
 * Enhanced Skill Resolver Service
 * 
 * Handles the resolution of skill IDs to skill names for task creation
 * with proper normalization for forecasting compatibility.
 */

/**
 * Resolve skill IDs to skill names with normalization
 * 
 * @param skillIds - Array of skill IDs to resolve
 * @returns Promise resolving to array of normalized skill names
 */
export const resolveSkillNames = async (skillIds: string[]): Promise<string[]> => {
  if (!skillIds || skillIds.length === 0) return [];
  
  try {
    // Step 1: Resolve skill IDs to names using the integration service
    const resolvedNames = await SkillsIntegrationService.resolveSkillIds(skillIds);
    
    // Step 2: Normalize the resolved names for consistency
    const normalizedNames = resolvedNames.map(name => 
      SkillsIntegrationService.normalizeSkill(name)
    );
    
    console.log(`[Skill Resolver] Resolved ${skillIds.length} skill IDs to normalized names:`, {
      original: skillIds,
      resolved: resolvedNames,
      normalized: normalizedNames
    });
    
    return normalizedNames;
  } catch (error) {
    console.error('Error resolving skill names:', error);
    // Fallback to returning the original skill IDs if resolution fails
    return skillIds;
  }
};

/**
 * Resolve and validate skill IDs
 * 
 * @param skillIds - Array of skill IDs to resolve and validate
 * @returns Promise resolving to validation result with resolved names
 */
export const resolveAndValidateSkills = async (skillIds: string[]): Promise<{
  resolvedNames: string[];
  validSkills: string[];
  invalidSkills: string[];
}> => {
  try {
    const resolvedNames = await resolveSkillNames(skillIds);
    
    // Use the skills integration service to validate the resolved names
    const validation = await SkillsIntegrationService.validateSkills(resolvedNames);
    
    return {
      resolvedNames,
      validSkills: validation.valid,
      invalidSkills: validation.invalid
    };
  } catch (error) {
    console.error('Error resolving and validating skills:', error);
    return {
      resolvedNames: skillIds,
      validSkills: [],
      invalidSkills: skillIds
    };
  }
};
