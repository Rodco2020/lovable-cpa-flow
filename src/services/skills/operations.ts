
import { supabase } from "@/lib/supabaseClient";
import { Skill } from "@/types/skill";
import { SkillsServiceError, SkillCreateData, SkillUpdateData, SkillRow } from "./types";
import { mapSkillFromDB } from "./mappers";

/**
 * Database Operations for Skills Service
 * 
 * This module handles all direct database interactions for the skills system,
 * providing a clean abstraction layer over Supabase operations.
 */

export const fetchAllSkillsFromDB = async (): Promise<Skill[]> => {
  try {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("name");
    
    if (error) {
      throw new SkillsServiceError(
        `Database error fetching skills: ${error.message}`,
        'DATABASE_ERROR'
      );
    }
    
    return data?.map(mapSkillFromDB) || [];
  } catch (error) {
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError(
      'Unexpected error fetching skills from database',
      'UNKNOWN_ERROR'
    );
  }
};

export const fetchSkillByIdFromDB = async (id: string): Promise<Skill | null> => {
  try {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) {
      throw new SkillsServiceError(
        `Database error fetching skill ${id}: ${error.message}`,
        'DATABASE_ERROR'
      );
    }
    
    return data ? mapSkillFromDB(data) : null;
  } catch (error) {
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError(
      `Unexpected error fetching skill ${id} from database`,
      'UNKNOWN_ERROR'
    );
  }
};

/**
 * Fetch multiple skills by their UUIDs
 * @param ids Array of skill UUIDs
 * @returns Promise<Skill[]> - Array of skills
 */
export const fetchSkillsByIdsFromDB = async (ids: string[]): Promise<Skill[]> => {
  try {
    if (!ids || ids.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .in("id", ids)
      .order("name");
    
    if (error) {
      throw new SkillsServiceError(
        `Database error fetching skills by IDs: ${error.message}`,
        'DATABASE_ERROR'
      );
    }
    
    return data?.map(mapSkillFromDB) || [];
  } catch (error) {
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError(
      'Unexpected error fetching skills by IDs from database',
      'UNKNOWN_ERROR'
    );
  }
};

export const createSkillInDB = async (skillData: SkillCreateData): Promise<Skill> => {
  try {
    const insertData = {
      name: skillData.name,
      description: skillData.description || null,
      category: skillData.category || null,
      proficiency_level: skillData.proficiencyLevel || null,
      cost_per_hour: skillData.hourlyRate || 50.00
    };

    const { data, error } = await supabase
      .from("skills")
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new SkillsServiceError(
          `A skill with the name "${skillData.name}" already exists`,
          'DUPLICATE_SKILL'
        );
      }
      throw new SkillsServiceError(
        `Database error creating skill: ${error.message}`,
        'DATABASE_ERROR'
      );
    }
    
    if (!data) {
      throw new SkillsServiceError(
        'No data returned after creating skill',
        'DATABASE_ERROR'
      );
    }
    
    return mapSkillFromDB(data);
  } catch (error) {
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError(
      'Unexpected error creating skill in database',
      'UNKNOWN_ERROR'
    );
  }
};

export const updateSkillInDB = async (id: string, updates: SkillUpdateData): Promise<Skill> => {
  try {
    const updateData: Partial<SkillRow> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.proficiencyLevel !== undefined) updateData.proficiency_level = updates.proficiencyLevel;
    if (updates.hourlyRate !== undefined) updateData.cost_per_hour = updates.hourlyRate;

    const { data, error } = await supabase
      .from("skills")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new SkillsServiceError(
          `Skill with ID ${id} not found`,
          'SKILL_NOT_FOUND'
        );
      }
      if (error.code === '23505') { // Unique constraint violation
        throw new SkillsServiceError(
          `A skill with the name "${updates.name}" already exists`,
          'DUPLICATE_SKILL'
        );
      }
      throw new SkillsServiceError(
        `Database error updating skill ${id}: ${error.message}`,
        'DATABASE_ERROR'
      );
    }
    
    if (!data) {
      throw new SkillsServiceError(
        `No data returned after updating skill ${id}`,
        'DATABASE_ERROR'
      );
    }
    
    return mapSkillFromDB(data);
  } catch (error) {
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError(
      `Unexpected error updating skill ${id} in database`,
      'UNKNOWN_ERROR'
    );
  }
};

export const deleteSkillFromDB = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw new SkillsServiceError(
        `Database error deleting skill ${id}: ${error.message}`,
        'DATABASE_ERROR'
      );
    }
  } catch (error) {
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError(
      `Unexpected error deleting skill ${id} from database`,
      'UNKNOWN_ERROR'
    );
  }
};
