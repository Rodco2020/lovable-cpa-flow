
import { SkillType } from '@/types/task';

/**
 * Standard skill mapping for forecasting
 * Maps various skill naming variations to standardized skill types
 */
export const STANDARD_SKILL_MAPPING: Record<string, SkillType[]> = {
  'tax': ['Junior', 'Senior'],
  'audit': ['Junior', 'Senior'],
  'advisory': ['Senior', 'CPA'],
  'bookkeeping': ['Junior'],
  'compliance': ['Junior', 'Senior'],
  'cpa': ['CPA'],
  'junior': ['Junior'],
  'senior': ['Senior'],
  // Generic role mappings
  'staff': ['Junior'],
  'intern': ['Junior'],
  'manager': ['Senior'],
  'senior manager': ['Senior'],
  'partner': ['CPA'],
  // Add more mappings as needed
};

/**
 * Normalize a set of skills to the standard forecast skill types
 * This is useful for ensuring consistent skill categorization across the system
 */
export const normalizeSkills = (skills: string[]): SkillType[] => {
  // Create a set to avoid duplicates
  const standardizedSkills = new Set<SkillType>();
  
  // Map each skill to standard forecast skills
  skills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    
    // If there's a direct mapping, use it
    if (STANDARD_SKILL_MAPPING[skillLower]) {
      STANDARD_SKILL_MAPPING[skillLower].forEach(s => standardizedSkills.add(s));
    } else {
      // Check if the skill itself is a standard skill type
      const normalizedSkill = capitalizeFirstLetter(skill);
      if (isStandardSkillType(normalizedSkill)) {
        standardizedSkills.add(normalizedSkill as SkillType);
      } else {
        // For unrecognized skills, log and default to Junior
        console.warn(`[Skill Normalization] Unrecognized skill "${skill}", defaulting to Junior`);
        standardizedSkills.add('Junior');
      }
    }
  });
  
  return Array.from(standardizedSkills);
};

/**
 * Check if a skill string is a standard skill type
 */
export const isStandardSkillType = (skill: string): boolean => {
  const standardTypes: SkillType[] = ['Junior', 'Senior', 'CPA'];
  return standardTypes.includes(skill as SkillType);
};

/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Get all standard skill types
 */
export const getStandardSkillTypes = (): SkillType[] => {
  return ['Junior', 'Senior', 'CPA'];
};

/**
 * Get all registered skills in the system
 * This is helpful for debugging and ensuring that all skills are properly mapped
 */
export const getAllSkillsWithMappings = (): Record<string, SkillType[]> => {
  return { ...STANDARD_SKILL_MAPPING };
};
