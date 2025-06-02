/**
 * Skill Normalization Service - Legacy Compatibility Layer
 * 
 * This file maintains backward compatibility while using the new modular structure.
 * All functionality has been moved to focused modules for better maintainability.
 * 
 * @deprecated Direct imports from this file are deprecated. 
 * Use imports from '@/services/skillNormalization' instead for better tree-shaking.
 */

// Re-export everything from the new modular service to maintain backward compatibility
export {
  SkillNormalizationService,
  normalizeSkills,
  normalizeSkill
} from './skillNormalization';

export type {
  SkillMappingRule,
  NormalizationResult,
  ValidationResult
} from './skillNormalization';

// Legacy warning for developers (only in development)
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'skillNormalizationService.ts is deprecated. Please import from "@/services/skillNormalization" instead for better maintainability.'
  );
}

import { SkillType } from '@/types/task';
import { getSkillsByIds } from '@/services/skills/skillsService';

/**
 * Centralized Skill Normalization Service
 * 
 * This service provides standardized skill normalization across the entire application.
 * It handles both UUID-based skill references and name-based fallbacks for legacy data.
 */

/**
 * Main skill normalization function that handles UUID-based skill resolution
 * @param skillInput - UUID string or skill name to normalize
 * @param context - Optional context for debugging (e.g., staff ID, task ID)
 * @returns Promise<SkillType> - Normalized skill type
 */
export const normalizeSkill = async (skillInput: string, context?: string): Promise<SkillType> => {
  try {
    console.log(`[Skill Normalization] Processing skill: ${skillInput}${context ? ` (context: ${context})` : ''}`);
    
    // Check if input is already a valid SkillType
    if (isValidSkillType(skillInput)) {
      console.log(`[Skill Normalization] Input is already a valid SkillType: ${skillInput}`);
      return skillInput as SkillType;
    }
    
    // Try to resolve as UUID first
    if (isValidUUID(skillInput)) {
      console.log(`[Skill Normalization] Resolving UUID: ${skillInput}`);
      const skills = await getSkillsByIds([skillInput]);
      if (skills.length > 0) {
        const skill = skills[0];
        const normalized = mapSkillNameToSkillType(skill.name);
        console.log(`[Skill Normalization] UUID resolved to: ${skill.name} -> ${normalized}`);
        return normalized;
      }
    }
    
    // Fall back to name-based mapping
    console.log(`[Skill Normalization] Using name-based mapping for: ${skillInput}`);
    return mapSkillNameToSkillType(skillInput);
  } catch (error) {
    console.error(`[Skill Normalization] Error normalizing skill "${skillInput}":`, error);
    return 'Junior Staff'; // Safe fallback
  }
};

/**
 * Normalize multiple skills at once
 * @param skillInputs - Array of skill UUIDs or names
 * @param context - Optional context for debugging
 * @returns Promise<SkillType[]> - Array of normalized skill types
 */
export const normalizeSkills = async (skillInputs: string[], context?: string): Promise<SkillType[]> => {
  if (!skillInputs || skillInputs.length === 0) {
    return ['Junior Staff']; // Default fallback
  }
  
  try {
    console.log(`[Skill Normalization] Processing ${skillInputs.length} skills${context ? ` (context: ${context})` : ''}`);
    
    // Process all skills
    const normalizedSkills = await Promise.all(
      skillInputs.map(skill => normalizeSkill(skill, context))
    );
    
    // Remove duplicates and ensure we have at least one skill
    const uniqueSkills = Array.from(new Set(normalizedSkills));
    const result = uniqueSkills.length > 0 ? uniqueSkills : ['Junior Staff'];
    
    console.log(`[Skill Normalization] Normalized ${skillInputs.length} skills to ${result.length} unique types:`, result);
    return result;
  } catch (error) {
    console.error(`[Skill Normalization] Error normalizing skills:`, error);
    return ['Junior Staff']; // Safe fallback
  }
};

/**
 * Check if a string is a valid UUID
 */
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Check if a string is already a valid SkillType
 */
const isValidSkillType = (str: string): boolean => {
  const validSkillTypes: SkillType[] = ['CPA', 'Senior Staff', 'Junior Staff'];
  return validSkillTypes.includes(str as SkillType);
};

/**
 * Map skill names to standardized SkillType enum values
 * This handles the various ways skills might be named in the database
 */
const mapSkillNameToSkillType = (skillName: string): SkillType => {
  const normalizedName = skillName.toLowerCase().trim();
  
  // CPA-level skills
  if (normalizedName.includes('cpa') || 
      normalizedName.includes('certified public accountant') ||
      normalizedName.includes('audit') ||
      normalizedName.includes('financial advisory') ||
      normalizedName === 'audit skill' ||
      normalizedName === 'financial advisory skill') {
    return 'CPA';
  }
  
  // Senior-level skills
  if (normalizedName.includes('senior') || 
      normalizedName.includes('supervisor') ||
      normalizedName.includes('manager') ||
      normalizedName.includes('tax preparation') ||
      normalizedName.includes('payroll') ||
      normalizedName === 'senior skill' ||
      normalizedName === 'tax preparation skill' ||
      normalizedName === 'payroll processing skill') {
    return 'Senior Staff';
  }
  
  // Junior-level skills (default)
  // This includes bookkeeping, administrative, and other entry-level skills
  return 'Junior Staff';
};

/**
 * Skill Normalization Service - exported as a namespace for consistency
 */
export const SkillNormalizationService = {
  normalizeSkill,
  normalizeSkills,
};
