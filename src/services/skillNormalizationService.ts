
import { SkillType } from '@/types/task';

/**
 * Standard skill mapping for forecasting
 * Maps various skill naming variations to standardized skill types
 */
export const STANDARD_SKILL_MAPPING: Record<string, SkillType[]> = {
  // Tax related skills
  'tax': ['Junior', 'Senior'],
  'tax preparation': ['Junior', 'Senior'],
  'tax planning': ['Senior', 'CPA'],
  'tax compliance': ['Junior', 'Senior'],
  'individual tax': ['Junior', 'Senior'],
  'corporate tax': ['Senior', 'CPA'],
  
  // Audit related skills
  'audit': ['Junior', 'Senior'],
  'auditing': ['Junior', 'Senior'],
  'audit review': ['Senior', 'CPA'],
  'financial audit': ['Junior', 'Senior'],
  
  // Advisory related skills
  'advisory': ['Senior', 'CPA'],
  'consulting': ['Senior', 'CPA'],
  'business advisory': ['Senior', 'CPA'],
  
  // Bookkeeping related skills
  'bookkeeping': ['Junior'],
  'accounting': ['Junior', 'Senior'],
  'accounts': ['Junior'],
  'financial statements': ['Junior', 'Senior'],
  
  // Compliance related skills
  'compliance': ['Junior', 'Senior'],
  'regulatory': ['Senior', 'CPA'],
  
  // Professional designations
  'cpa': ['CPA'],
  'certified public accountant': ['CPA'],
  'ea': ['Senior'],
  'enrolled agent': ['Senior'],
  
  // Generic skill levels - CRITICAL for mapping staff with generic roles
  'junior': ['Junior'],
  'senior': ['Senior'],
  'manager': ['Senior'],
  'director': ['CPA'],
  'partner': ['CPA'],
  
  // Generic role mappings - IMPORTANT: ensure all staff roles map to something
  'staff': ['Junior', 'Senior'],  // Updated: Map "Staff" title to both Junior and Senior by default
  'staff accountant': ['Junior'],
  'intern': ['Junior'],
  'senior manager': ['Senior'],
  'senior staff': ['Senior'],
  'associate': ['Junior'],
  'senior associate': ['Senior'],
  'supervisor': ['Senior'],
  'experienced associate': ['Senior'],
  
  // Catch-all for administrative or support roles
  'administrative': ['Junior'],
  'assistant': ['Junior'],
  'admin': ['Junior'],
  'support': ['Junior'],
};

/**
 * Mapping from raw skill IDs to standard skill types
 * These IDs correspond to entries in the skills table.
 */
export const SKILL_ID_MAPPING: Record<string, SkillType[]> = {
  // Example placeholder IDs - update with real IDs as needed
  '00000000-0000-0000-0000-000000000001': ['Junior'],
  '00000000-0000-0000-0000-000000000002': ['Senior'],
  '00000000-0000-0000-0000-000000000003': ['CPA'],
};

/**
 * Debug mode for skill normalization
 * When enabled, logs detailed information about skill mapping
 */
const DEBUG_SKILL_NORMALIZATION = true;

/**
 * Log a debug message for skill normalization
 */
const debugLog = (message: string, data?: any) => {
  if (DEBUG_SKILL_NORMALIZATION) {
    console.log(`[Skill Normalization] ${message}`, data || '');
  }
};

/**
 * Normalize a set of skills to the standard forecast skill types
 * This is useful for ensuring consistent skill categorization across the system
 */
export const normalizeSkills = (skills: string[], staffId?: string): SkillType[] => {
  // Create a set to avoid duplicates
  const standardizedSkills = new Set<SkillType>();
  
  debugLog(`Normalizing skills: ${skills.join(', ')} for staff ID: ${staffId || 'unknown'}`);
  
  // Special case for Marciano (specific staff ID)
  if (staffId === '654242eb-7298-4218-9c3f-a9b9152f712d') {
    debugLog('Special case: Marciano detected - assigning Senior skill');
    return ['Senior'];
  }
  
  // If no skills provided, default to Junior to prevent zero capacity
  if (!skills || skills.length === 0) {
    debugLog('No skills provided, defaulting to Junior');
    return ['Junior'];
  }
  
  // Map each skill to standard forecast skills
  skills.forEach(skill => {
    if (!skill) return;

    const skillLower = skill.toLowerCase().trim();
    debugLog(`Processing skill "${skill}" (normalized to "${skillLower}")`);

    // First check if this is a known skill ID
    if (SKILL_ID_MAPPING[skill]) {
      debugLog(`Using ID mapping for "${skill}": ${SKILL_ID_MAPPING[skill].join(', ')}`);
      SKILL_ID_MAPPING[skill].forEach(s => standardizedSkills.add(s));
      return;
    }

    // If there's a direct name mapping, use it
    if (STANDARD_SKILL_MAPPING[skillLower]) {
      debugLog(`Found direct mapping for "${skillLower}": ${STANDARD_SKILL_MAPPING[skillLower].join(', ')}`);
      STANDARD_SKILL_MAPPING[skillLower].forEach(s => standardizedSkills.add(s));
    } else {
      // Check if the skill itself is a standard skill type
      const normalizedSkill = capitalizeFirstLetter(skill);
      if (isStandardSkillType(normalizedSkill)) {
        debugLog(`Skill "${skill}" is a standard skill type: ${normalizedSkill}`);
        standardizedSkills.add(normalizedSkill as SkillType);
      } else {
        // For unrecognized skills, check for partial matches
        let matched = false;

        // Try to find partial matches in mapping keys
        for (const mappingKey of Object.keys(STANDARD_SKILL_MAPPING)) {
          if (skillLower.includes(mappingKey) || mappingKey.includes(skillLower)) {
            debugLog(`Found partial match: "${skillLower}" matches "${mappingKey}"`);
            STANDARD_SKILL_MAPPING[mappingKey].forEach(s => standardizedSkills.add(s));
            matched = true;
          }
        }

        // If still no match, just log it
        if (!matched) {
          debugLog(`No match found for "${skill}"`);
        }
      }
    }
  });
  
  const result = Array.from(standardizedSkills);
  debugLog(`Final normalized skills: ${result.join(', ')}`);
  
  // If still empty after all processing, default to Junior
  if (result.length === 0) {
    debugLog('No skills mapped after processing, defaulting to Junior');
    return ['Junior'];
  }
  
  return result;
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

/**
 * Analyze staff skills and determine their representation in standard skill types
 * Useful for debugging skill distribution
 */
export const analyzeStaffSkills = (staffSkills: string[], staffId?: string) => {
  const normalizedSkills = normalizeSkills(staffSkills, staffId);
  
  return {
    originalSkills: staffSkills,
    mappedSkills: normalizedSkills,
    hasCPA: normalizedSkills.includes('CPA'),
    hasSenior: normalizedSkills.includes('Senior'),
    hasJunior: normalizedSkills.includes('Junior'),
    defaultedToJunior: staffSkills.length > 0 && normalizedSkills.length === 1 && normalizedSkills[0] === 'Junior',
    manualOverride: staffId === '654242eb-7298-4218-9c3f-a9b9152f712d'
  };
};
