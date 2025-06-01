
import { normalizeSkills } from '@/services/skillNormalizationService';
import { SkillType } from '@/types/task';

/**
 * Skill Mapping Service
 * Handles mapping and normalization of staff skills for consistent forecasting
 */

/**
 * Map staff skills to forecast skill types
 */
export const mapStaffSkillsToForecastSkills = async (staffSkills: string[], staffId?: string): Promise<SkillType[]> => {
  if (!staffSkills || staffSkills.length === 0) {
    return ['Junior Staff']; // Default fallback
  }

  try {
    // Use the skill normalization service to handle the mapping
    const normalizedSkills = await normalizeSkills(staffSkills, staffId);
    return normalizedSkills;
  } catch (error) {
    console.error('Error mapping staff skills:', error);
    // Fallback to Junior Staff if mapping fails
    return ['Junior Staff'];
  }
};

/**
 * Get skill capacity distribution for a staff member
 */
export const getSkillCapacityDistribution = async (
  staffSkills: string[], 
  totalCapacity: number,
  staffId?: string
): Promise<Record<SkillType, number>> => {
  const mappedSkills = await mapStaffSkillsToForecastSkills(staffSkills, staffId);
  const distribution: Record<SkillType, number> = {} as Record<SkillType, number>;
  
  if (mappedSkills.length === 0) {
    return distribution;
  }
  
  const capacityPerSkill = totalCapacity / mappedSkills.length;
  
  mappedSkills.forEach(skill => {
    distribution[skill] = (distribution[skill] || 0) + capacityPerSkill;
  });
  
  return distribution;
};

/**
 * Validate staff skill mappings
 */
export const validateStaffSkillMappings = async (staffData: Array<{
  id: string;
  skills: string[];
  fullName: string;
}>): Promise<{
  valid: Array<{ id: string; mappedSkills: SkillType[] }>;
  invalid: Array<{ id: string; error: string }>;
}> => {
  const valid: Array<{ id: string; mappedSkills: SkillType[] }> = [];
  const invalid: Array<{ id: string; error: string }> = [];
  
  for (const staff of staffData) {
    try {
      const mappedSkills = await mapStaffSkillsToForecastSkills(staff.skills, staff.id);
      valid.push({ id: staff.id, mappedSkills });
    } catch (error) {
      invalid.push({ 
        id: staff.id, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return { valid, invalid };
};
