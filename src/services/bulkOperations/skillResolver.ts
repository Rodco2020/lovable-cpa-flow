
import { getSkillsByIds } from '@/services/skills/skillsService';
import { SkillNormalizationService } from '../skillNormalizationService';

/**
 * Enhanced Skill Resolver Service - Updated for UUID-based skill system
 * 
 * Handles the resolution of skill UUIDs to skill names for DISPLAY PURPOSES ONLY.
 * 
 * IMPORTANT: This service should ONLY be used for UI display and reporting.
 * For database operations, always store and use skill UUIDs directly.
 */

/**
 * Resolve skill UUIDs to skill names with normalization (FOR DISPLAY ONLY)
 * 
 * @param skillIds - Array of skill UUIDs to resolve
 * @returns Promise resolving to array of normalized skill names
 */
export const resolveSkillNames = async (skillIds: string[]): Promise<string[]> => {
  if (!skillIds || skillIds.length === 0) {
    console.log('[Skill Resolver] No skill IDs provided, returning empty array');
    return [];
  }
  
  try {
    console.log(`[Skill Resolver] Resolving ${skillIds.length} skill UUIDs for DISPLAY:`, skillIds);
    
    // Validate that we have proper UUIDs
    const invalidUuids = skillIds.filter(id => !isValidUuid(id));
    if (invalidUuids.length > 0) {
      console.warn('[Skill Resolver] Invalid UUIDs detected:', invalidUuids);
      // Continue with valid UUIDs only
      const validUuids = skillIds.filter(id => isValidUuid(id));
      if (validUuids.length === 0) {
        console.warn('[Skill Resolver] No valid UUIDs found, returning placeholders');
        return skillIds.map(id => `Invalid Skill: ${id.slice(0, 8)}`);
      }
      skillIds = validUuids;
    }
    
    // Step 1: Resolve skill UUIDs to skill objects
    const skills = await getSkillsByIds(skillIds);
    console.log(`[Skill Resolver] Retrieved ${skills.length} skills from database`);
    
    if (skills.length === 0) {
      console.warn('[Skill Resolver] No skills found for provided UUIDs');
      return skillIds.map(id => `Unknown Skill: ${id.slice(0, 8)}`);
    }
    
    // Step 2: Extract skill names
    const skillNames = skills.map(skill => skill.name);
    
    // Step 3: Normalize the skill names for consistency using centralized service
    const normalizedNames = await Promise.all(
      skillNames.map(name => SkillNormalizationService.normalizeSkill(name))
    );
    
    console.log(`[Skill Resolver] Successfully resolved ${skillIds.length} skill UUIDs to normalized names:`, {
      original: skillIds,
      resolved: skillNames,
      normalized: normalizedNames
    });
    
    return normalizedNames;
  } catch (error) {
    console.error('[Skill Resolver] Error resolving skill names:', error);
    // Fallback to creating placeholder names from UUIDs
    return skillIds.map(id => `Skill ${id.slice(0, 8)}`);
  }
};

/**
 * Validate UUID format
 * 
 * @param uuid - String to validate as UUID
 * @returns true if valid UUID format
 */
const isValidUuid = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Resolve and validate skill UUIDs (FOR DISPLAY ONLY)
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
    console.log('[Skill Resolver] Resolving and validating skills for display:', skillIds);
    
    // Separate valid and invalid UUIDs
    const validSkillIds = skillIds.filter(id => isValidUuid(id));
    const invalidSkillIds = skillIds.filter(id => !isValidUuid(id));
    
    console.log('[Skill Resolver] UUID validation results:', {
      valid: validSkillIds,
      invalid: invalidSkillIds
    });
    
    // Resolve valid UUIDs to names
    const resolvedNames = validSkillIds.length > 0 
      ? await resolveSkillNames(validSkillIds)
      : [];
    
    // Add placeholder names for invalid UUIDs
    const invalidPlaceholders = invalidSkillIds.map(id => `Invalid: ${id.slice(0, 8)}`);
    
    return {
      resolvedNames: [...resolvedNames, ...invalidPlaceholders],
      validSkills: validSkillIds,
      invalidSkills: invalidSkillIds
    };
  } catch (error) {
    console.error('[Skill Resolver] Error resolving and validating skills:', error);
    return {
      resolvedNames: skillIds.map(id => `Error: ${id.slice(0, 8)}`),
      validSkills: [],
      invalidSkills: skillIds
    };
  }
};

/**
 * Get skill UUIDs from skill names (FOR REVERSE LOOKUP)
 * Use this when you need to convert user-selected skill names back to UUIDs for storage
 * 
 * @param skillNames - Array of skill names to convert to UUIDs
 * @returns Promise resolving to array of skill UUIDs
 */
export const getSkillUuidsFromNames = async (skillNames: string[]): Promise<string[]> => {
  if (!skillNames || skillNames.length === 0) return [];
  
  try {
    console.log('[Skill Resolver] Converting skill names to UUIDs:', skillNames);
    
    // This would require a different service method to fetch by names
    // For now, return empty array as this is a less common use case
    console.warn('[Skill Resolver] Skill name to UUID conversion not implemented yet');
    return [];
  } catch (error) {
    console.error('[Skill Resolver] Error converting skill names to UUIDs:', error);
    return [];
  }
};
