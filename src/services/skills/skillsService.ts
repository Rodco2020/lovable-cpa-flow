
import { Skill } from '@/types/skill';
import { SkillsServiceError, SkillCreateData, SkillUpdateData } from './types';
import { 
  fetchAllSkillsFromDB, 
  fetchSkillByIdFromDB, 
  fetchSkillsByIdsFromDB,
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
 * fallback mechanisms, and UUID-based skill resolution capabilities.
 * 
 * Key features:
 * - Fallback to default skills when database is unavailable
 * - UUID-based skill resolution for consistency
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
    return defaultSkills.find(skill => skill.id === id) || null;
  }
};

/**
 * Get multiple skills by their UUIDs
 * @param ids - Array of skill UUIDs
 * @returns Promise<Skill[]> - Array of skills
 */
export const getSkillsByIds = async (ids: string[]): Promise<Skill[]> => {
  try {
    if (!ids || ids.length === 0) {
      return [];
    }

    console.log('Fetching skills by UUIDs:', ids);
    
    // Fetch from database first
    const skills = await fetchSkillsByIdsFromDB(ids);
    
    // Check if we got all requested skills
    const foundIds = skills.map(skill => skill.id);
    const missingIds = ids.filter(id => !foundIds.includes(id));
    
    // For missing IDs, try to find in defaults
    if (missingIds.length > 0) {
      console.log('Some skills missing from database, checking defaults:', missingIds);
      const defaultSkills = getDefaultSkills();
      const defaultMatches = defaultSkills.filter(skill => missingIds.includes(skill.id));
      skills.push(...defaultMatches);
      
      // For still missing skills, create fallback skills
      const stillMissingIds = missingIds.filter(id => !defaultMatches.some(skill => skill.id === id));
      if (stillMissingIds.length > 0) {
        console.log('Creating fallback skills for missing UUIDs:', stillMissingIds);
        const fallbackSkills = stillMissingIds.map(id => createFallbackSkill(`Skill ${id.slice(0, 8)}`));
        skills.push(...fallbackSkills);
      }
    }
    
    console.log(`Successfully resolved ${skills.length} skills from ${ids.length} UUIDs`);
    return skills;
  } catch (error) {
    console.error('Failed to fetch skills by IDs, creating fallbacks:', error);
    // Return fallback skills for all requested IDs
    return ids.map(id => createFallbackSkill(`Skill ${id.slice(0, 8)}`));
  }
};

/**
 * Resolve skill UUIDs to skill objects with enhanced fallback
 * This is the primary function for resolving skill UUIDs throughout the application
 * @param skillIds - Array of skill UUIDs to resolve
 * @returns Promise<Skill[]> - Array of resolved skills, never fails
 */
export const resolveSkills = async (skillIds: string[]): Promise<Skill[]> => {
  return getSkillsByIds(skillIds);
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
