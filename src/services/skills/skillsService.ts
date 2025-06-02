
import { Skill } from '@/types/skill';
import { SkillsServiceError, SkillCreateData, SkillUpdateData } from './types';
import { 
  fetchAllSkillsFromDB, 
  fetchSkillByIdFromDB, 
  createSkillInDB, 
  updateSkillInDB, 
  deleteSkillFromDB 
} from './operations';
import { createFallbackSkill } from './mappers';
import { getDefaultSkills } from './defaults';

/**
 * Enhanced Skills Service
 * 
 * Provides a robust interface for managing skills with comprehensive error handling,
 * fallback mechanisms, and skill resolution capabilities. This service ensures the
 * application continues to function even when database operations fail.
 * 
 * Key features:
 * - Fallback to default skills when database is unavailable
 * - Enhanced skill resolution by name or ID
 * - Comprehensive error handling with custom error types
 * - Automatic fallback skill creation for missing skills
 */

/**
 * Get all skills with comprehensive fallback handling
 * @returns Promise<Skill[]> - Array of skills, never fails
 */
export const getAllSkills = async (): Promise<Skill[]> => {
  try {
    return await fetchAllSkillsFromDB();
  } catch (error) {
    console.error('Failed to fetch skills from database, using defaults:', error);
    return getDefaultSkills();
  }
};

/**
 * Search skills with fallback to defaults
 * @param query - Search query string
 * @returns Promise<Skill[]> - Array of matching skills
 */
export const searchSkills = async (query: string): Promise<Skill[]> => {
  try {
    // First try to get all skills from database
    const allSkills = await fetchAllSkillsFromDB();
    
    // Filter based on query
    const lowercaseQuery = query.toLowerCase();
    return allSkills.filter(skill =>
      skill.name.toLowerCase().includes(lowercaseQuery) ||
      (skill.description && skill.description.toLowerCase().includes(lowercaseQuery))
    );
  } catch (error) {
    console.error('Failed to search skills in database, searching defaults:', error);
    
    // Fallback to searching default skills
    const defaultSkills = getDefaultSkills();
    const lowercaseQuery = query.toLowerCase();
    return defaultSkills.filter(skill =>
      skill.name.toLowerCase().includes(lowercaseQuery) ||
      (skill.description && skill.description.toLowerCase().includes(lowercaseQuery))
    );
  }
};

/**
 * Get skill by ID with fallback to default skills
 * @param id - Skill ID to fetch
 * @returns Promise<Skill | null> - Skill object or null if not found
 */
export const getSkillById = async (id: string): Promise<Skill | null> => {
  try {
    return await fetchSkillByIdFromDB(id);
  } catch (error) {
    console.error('Failed to fetch skill by ID from database, checking defaults:', error);
    const defaultSkills = getDefaultSkills();
    return defaultSkills.find(skill => skill.id === id || skill.name === id) || null;
  }
};

/**
 * Resolve skill names to skill objects with enhanced fallback
 * This is a critical function for the application as it ensures skills are always resolved
 * @param skillNames - Array of skill names to resolve
 * @returns Promise<Skill[]> - Array of resolved skills, never fails
 */
export const resolveSkills = async (skillNames: string[]): Promise<Skill[]> => {
  try {
    console.log('Resolving skills:', skillNames);
    
    if (!skillNames || skillNames.length === 0) {
      return [];
    }

    // Get all available skills
    const allSkills = await getAllSkills();
    const resolvedSkills: Skill[] = [];

    for (const skillName of skillNames) {
      // Try exact name match first (case-insensitive)
      let skill = allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      
      // If not found, try ID match
      if (!skill) {
        skill = allSkills.find(s => s.id === skillName);
      }
      
      // If still not found, create a fallback skill
      if (!skill) {
        console.log(`Creating fallback skill for: ${skillName}`);
        skill = createFallbackSkill(skillName);
      }
      
      resolvedSkills.push(skill);
    }

    console.log(`Successfully resolved ${resolvedSkills.length} skills`);
    return resolvedSkills;
  } catch (error) {
    console.error('Failed to resolve skills, creating fallbacks:', error);
    // Return fallback skills for all requested names
    return skillNames.map(createFallbackSkill);
  }
};

/**
 * Create a new skill
 * @param skillData - Skill data to create
 * @returns Promise<Skill> - Created skill object
 */
export const createSkill = async (skillData: SkillCreateData): Promise<Skill> => {
  try {
    return await createSkillInDB(skillData);
  } catch (error) {
    console.error('Skill creation failed:', error);
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError('Unexpected error creating skill', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Update existing skill
 * @param id - Skill ID to update
 * @param updates - Partial skill data to update
 * @returns Promise<Skill> - Updated skill object
 */
export const updateSkill = async (id: string, updates: SkillUpdateData): Promise<Skill> => {
  try {
    return await updateSkillInDB(id, updates);
  } catch (error) {
    console.error('Skill update failed:', error);
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError('Unexpected error updating skill', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Delete skill
 * @param id - Skill ID to delete
 * @returns Promise<void>
 */
export const deleteSkill = async (id: string): Promise<void> => {
  try {
    await deleteSkillFromDB(id);
  } catch (error) {
    console.error('Skill deletion failed:', error);
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError('Unexpected error deleting skill', 'UNKNOWN_ERROR', error);
  }
};

// Re-export types and utilities for convenience
export { SkillsServiceError, createFallbackSkill, getDefaultSkills };
export type { SkillCreateData, SkillUpdateData };
