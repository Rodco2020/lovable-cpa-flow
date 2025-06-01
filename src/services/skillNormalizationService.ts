import { SkillType } from '@/types/task';
import { SkillsIntegrationService } from './forecasting/skillsIntegrationService';

/**
 * Enhanced Skill Normalization Service
 * Fixed to properly handle skill UUID resolution and matrix display normalization
 */

/**
 * Standard skill mapping for forecasting - Updated for matrix compatibility
 * Maps various skill naming variations to standardized skill types
 */
export const STANDARD_SKILL_MAPPING: Record<string, SkillType[]> = {
  // Database skill names to matrix display names
  'junior': ['Junior Staff'],
  'senior': ['Senior Staff'], 
  'cpa': ['CPA'],
  
  // Legacy mappings for backward compatibility
  'junior staff': ['Junior Staff'],
  'senior staff': ['Senior Staff'],
  'certified public accountant': ['CPA'],
  
  // Tax related skills
  'tax': ['Junior Staff', 'Senior Staff'],
  'tax preparation': ['Junior Staff', 'Senior Staff'],
  'tax planning': ['Senior Staff', 'CPA'],
  'tax compliance': ['Junior Staff', 'Senior Staff'],
  'individual tax': ['Junior Staff', 'Senior Staff'],
  'corporate tax': ['Senior Staff', 'CPA'],
  
  // Audit related skills
  'audit': ['Junior Staff', 'Senior Staff'],
  'auditing': ['Junior Staff', 'Senior Staff'],
  'audit review': ['Senior Staff', 'CPA'],
  'financial audit': ['Junior Staff', 'Senior Staff'],
  
  // Advisory related skills
  'advisory': ['Senior Staff', 'CPA'],
  'consulting': ['Senior Staff', 'CPA'],
  'business advisory': ['Senior Staff', 'CPA'],
  
  // Bookkeeping related skills
  'bookkeeping': ['Junior Staff'],
  'accounting': ['Junior Staff', 'Senior Staff'],
  'accounts': ['Junior Staff'],
  'financial statements': ['Junior Staff', 'Senior Staff'],
  
  // Compliance related skills
  'compliance': ['Junior Staff', 'Senior Staff'],
  'regulatory': ['Senior Staff', 'CPA'],
  
  // Generic skill levels
  'manager': ['Senior Staff'],
  'director': ['CPA'],
  'partner': ['CPA'],
  
  // Generic role mappings
  'staff': ['Junior Staff', 'Senior Staff'],
  'staff accountant': ['Junior Staff'],
  'intern': ['Junior Staff'],
  'senior manager': ['Senior Staff'],
  'associate': ['Junior Staff'],
  'senior associate': ['Senior Staff'],
  'supervisor': ['Senior Staff'],
  'experienced associate': ['Senior Staff'],
  
  // Administrative roles
  'administrative': ['Junior Staff'],
  'assistant': ['Junior Staff'],
  'admin': ['Junior Staff'],
  'support': ['Junior Staff'],
};

/**
 * Debug mode for skill normalization
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
 * Enhanced to handle skill ID resolution first, then normalization
 */
export const normalizeSkills = async (skills: string[], staffId?: string): Promise<SkillType[]> => {
  debugLog(`Normalizing skills: ${skills.join(', ')} for staff ID: ${staffId || 'unknown'}`);
  
  // If no skills provided, default to Junior Staff to prevent zero capacity
  if (!skills || skills.length === 0) {
    debugLog('No skills provided, defaulting to Junior Staff');
    return ['Junior Staff'];
  }

  // Step 1: Try to resolve skill IDs to skill names
  let resolvedSkills: string[];
  try {
    resolvedSkills = await SkillsIntegrationService.resolveSkillIds(skills);
    debugLog(`Resolved skill IDs to names: ${resolvedSkills.join(', ')}`);
  } catch (error) {
    debugLog('Error resolving skill IDs, using original values', error);
    resolvedSkills = skills;
  }

  // Step 2: Normalize skill names to matrix display format
  const standardizedSkills = new Set<SkillType>();
  
  for (const skill of resolvedSkills) {
    if (!skill) continue;
    
    const skillLower = skill.toLowerCase().trim();
    debugLog(`Processing skill "${skill}" (normalized to "${skillLower}")`);
    
    // Enhanced detection for key skills
    if (skillLower.includes('cpa') || skillLower === 'cpa' || 
        skillLower.includes('certified public accountant')) {
      debugLog(`CPA keyword detected in "${skill}", adding CPA skill type`);
      standardizedSkills.add('CPA');
      continue;
    }

    // Check for direct mapping
    if (STANDARD_SKILL_MAPPING[skillLower]) {
      debugLog(`Found direct mapping for "${skillLower}": ${STANDARD_SKILL_MAPPING[skillLower].join(', ')}`);
      STANDARD_SKILL_MAPPING[skillLower].forEach(s => standardizedSkills.add(s));
    } else {
      // Use Skills Integration Service for normalization
      const normalizedSkill = SkillsIntegrationService.normalizeSkill(skill);
      debugLog(`Skills Integration Service normalized "${skill}" to "${normalizedSkill}"`);
      standardizedSkills.add(normalizedSkill);
    }
  }
  
  const result = Array.from(standardizedSkills);
  debugLog(`Final normalized skills: ${result.join(', ')}`);
  
  // If still empty after all processing, default to Junior Staff
  if (result.length === 0) {
    debugLog('No skills mapped after processing, defaulting to Junior Staff');
    return ['Junior Staff'];
  }
  
  return result;
};

/**
 * Check if a skill string is a standard skill type
 */
export const isStandardSkillType = (skill: string): boolean => {
  const standardTypes: SkillType[] = ['Junior Staff', 'Senior Staff', 'CPA'];
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
 * Get all standard skill types - Updated for matrix compatibility
 */
export const getStandardSkillTypes = (): SkillType[] => {
  return ['Junior Staff', 'Senior Staff', 'CPA'];
};

/**
 * Get all registered skills in the system
 */
export const getAllSkillsWithMappings = (): Record<string, SkillType[]> => {
  return { ...STANDARD_SKILL_MAPPING };
};

/**
 * Analyze staff skills and determine their representation in standard skill types
 */
export const analyzeStaffSkills = async (staffSkills: string[], staffId?: string) => {
  const normalizedSkills = await normalizeSkills(staffSkills, staffId);
  
  return {
    originalSkills: staffSkills,
    mappedSkills: normalizedSkills,
    hasCPA: normalizedSkills.includes('CPA'),
    hasSenior: normalizedSkills.includes('Senior Staff'),
    hasJunior: normalizedSkills.includes('Junior Staff'),
    defaultedToJunior: staffSkills.length > 0 && normalizedSkills.length === 1 && normalizedSkills[0] === 'Junior Staff'
  };
};
