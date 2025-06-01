
import { supabase } from '@/integrations/supabase/client';
import { Skill } from '@/types/skill';
import { SkillsServiceError, SkillCreateData, SkillUpdateData } from './types';
import { mapSkillFromDB } from './mappers';

/**
 * Database operations for skills
 * Handles direct CRUD operations with Supabase
 */

/**
 * Fetches all skills from database with error handling
 * @returns Promise<Skill[]> - Array of skills or empty array on error
 */
export const fetchAllSkillsFromDB = async (): Promise<Skill[]> => {
  console.log('Fetching all skills from database...');
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name');

  if (error) {
    console.error('Database error fetching skills:', error);
    throw new SkillsServiceError(
      `Failed to fetch skills: ${error.message}`,
      error.code,
      error.details
    );
  }

  if (!data) {
    return [];
  }

  const skills = data.map(mapSkillFromDB);
  console.log(`Successfully fetched ${skills.length} skills from database`);
  return skills;
};

/**
 * Fetches single skill by ID from database
 * @param id - Skill ID to fetch
 * @returns Promise<Skill | null> - Skill object or null if not found
 */
export const fetchSkillByIdFromDB = async (id: string): Promise<Skill | null> => {
  console.log('Fetching skill by ID from database:', id);
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Database error fetching skill by ID:', error);
    throw new SkillsServiceError(
      `Failed to fetch skill: ${error.message}`,
      error.code,
      error.details
    );
  }

  return data ? mapSkillFromDB(data) : null;
};

/**
 * Creates new skill in database
 * @param skillData - Skill data to create
 * @returns Promise<Skill> - Created skill object
 */
export const createSkillInDB = async (skillData: SkillCreateData): Promise<Skill> => {
  console.log('Creating skill in database:', skillData);
  
  const { data, error } = await supabase
    .from('skills')
    .insert({
      name: skillData.name,
      description: skillData.description,
      category: skillData.category,
      proficiency_level: skillData.proficiencyLevel,
      cost_per_hour: 50.00 // Default value
    })
    .select()
    .single();

  if (error) {
    console.error('Database error creating skill:', error);
    throw new SkillsServiceError(
      `Failed to create skill: ${error.message}`,
      error.code,
      error.details
    );
  }

  return mapSkillFromDB(data);
};

/**
 * Updates existing skill in database
 * @param id - Skill ID to update
 * @param updates - Partial skill data to update
 * @returns Promise<Skill> - Updated skill object
 */
export const updateSkillInDB = async (id: string, updates: SkillUpdateData): Promise<Skill> => {
  console.log('Updating skill in database:', id, updates);
  
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.category) updateData.category = updates.category;
  if (updates.proficiencyLevel) updateData.proficiency_level = updates.proficiencyLevel;
  
  const { data, error } = await supabase
    .from('skills')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Database error updating skill:', error);
    throw new SkillsServiceError(
      `Failed to update skill: ${error.message}`,
      error.code,
      error.details
    );
  }

  return mapSkillFromDB(data);
};

/**
 * Deletes skill from database
 * @param id - Skill ID to delete
 * @returns Promise<void>
 */
export const deleteSkillFromDB = async (id: string): Promise<void> => {
  console.log('Deleting skill from database:', id);
  
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Database error deleting skill:', error);
    throw new SkillsServiceError(
      `Failed to delete skill: ${error.message}`,
      error.code,
      error.details
    );
  }
};
