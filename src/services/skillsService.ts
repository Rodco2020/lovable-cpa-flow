
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';
import { Skill, ProficiencyLevel, SkillCategory } from '@/types/skill';

type SkillRow = Database['public']['Tables']['skills']['Row'];

/**
 * Enhanced error handling for skills operations
 */
export class SkillsServiceError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'SkillsServiceError';
  }
}

/**
 * Get all skills with error handling and fallback
 */
export const getAllSkills = async (): Promise<Skill[]> => {
  try {
    console.log('Fetching all skills...');
    
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching skills:', error);
      
      // If there's an error, return default skills to prevent app from breaking
      console.log('Returning default skills due to error');
      return getDefaultSkills();
    }

    if (!data || data.length === 0) {
      console.log('No skills found, returning defaults');
      return getDefaultSkills();
    }

    const skills = data.map(mapSkillFromDB);
    console.log(`Successfully fetched ${skills.length} skills`);
    return skills;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    // Return default skills as fallback
    return getDefaultSkills();
  }
};

/**
 * Get skill by ID with fallback
 */
export const getSkillById = async (id: string): Promise<Skill | null> => {
  try {
    console.log('Fetching skill by ID:', id);
    
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching skill by ID:', error);
      // Try to find in default skills
      const defaultSkills = getDefaultSkills();
      return defaultSkills.find(skill => skill.id === id || skill.name === id) || null;
    }

    return data ? mapSkillFromDB(data) : null;
  } catch (error) {
    console.error('Failed to fetch skill by ID:', error);
    return null;
  }
};

/**
 * Resolve skill names to skill objects with enhanced fallback
 */
export const resolveSkills = async (skillNames: string[]): Promise<Skill[]> => {
  try {
    console.log('Resolving skills:', skillNames);
    
    if (!skillNames || skillNames.length === 0) {
      return [];
    }

    // Get all skills first
    const allSkills = await getAllSkills();
    const resolvedSkills: Skill[] = [];

    for (const skillName of skillNames) {
      // Try exact name match first
      let skill = allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      
      // If not found, try ID match
      if (!skill) {
        skill = allSkills.find(s => s.id === skillName);
      }
      
      // If still not found, create a default skill object
      if (!skill) {
        console.log(`Creating fallback skill for: ${skillName}`);
        skill = createFallbackSkill(skillName);
      }
      
      resolvedSkills.push(skill);
    }

    console.log(`Resolved ${resolvedSkills.length} skills`);
    return resolvedSkills;
  } catch (error) {
    console.error('Failed to resolve skills:', error);
    // Return fallback skills for all requested names
    return skillNames.map(createFallbackSkill);
  }
};

/**
 * Create a new skill
 */
export const createSkill = async (skillData: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Skill> => {
  try {
    console.log('Creating skill:', skillData);
    
    const { data, error } = await supabase
      .from('skills')
      .insert({
        name: skillData.name,
        description: skillData.description,
        category: skillData.category,
        proficiency_level: skillData.proficiencyLevel
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating skill:', error);
      throw new SkillsServiceError(
        `Failed to create skill: ${error.message}`,
        error.code,
        error.details
      );
    }

    return mapSkillFromDB(data);
  } catch (error) {
    console.error('Skill creation failed:', error);
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError('Unexpected error creating skill', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Update skill
 */
export const updateSkill = async (id: string, updates: Partial<Skill>): Promise<Skill> => {
  try {
    console.log('Updating skill:', id, updates);
    
    const { data, error } = await supabase
      .from('skills')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.category && { category: updates.category }),
        ...(updates.proficiencyLevel && { proficiency_level: updates.proficiencyLevel })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating skill:', error);
      throw new SkillsServiceError(
        `Failed to update skill: ${error.message}`,
        error.code,
        error.details
      );
    }

    return mapSkillFromDB(data);
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
 */
export const deleteSkill = async (id: string): Promise<void> => {
  try {
    console.log('Deleting skill:', id);
    
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting skill:', error);
      throw new SkillsServiceError(
        `Failed to delete skill: ${error.message}`,
        error.code,
        error.details
      );
    }
  } catch (error) {
    console.error('Skill deletion failed:', error);
    if (error instanceof SkillsServiceError) {
      throw error;
    }
    throw new SkillsServiceError('Unexpected error deleting skill', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Helper function to map database rows to Skill objects
 */
const mapSkillFromDB = (row: SkillRow): Skill => ({
  id: row.id,
  name: row.name,
  description: row.description || undefined,
  category: row.category as SkillCategory || undefined,
  proficiencyLevel: row.proficiency_level as ProficiencyLevel || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

/**
 * Create a fallback skill for when skill resolution fails
 */
const createFallbackSkill = (skillName: string): Skill => ({
  id: `fallback-${skillName.toLowerCase().replace(/\s+/g, '-')}`,
  name: skillName,
  description: `Auto-generated skill for ${skillName}`,
  category: 'Other',
  proficiencyLevel: 'Intermediate',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

/**
 * Get default skills when database is empty or unavailable
 */
const getDefaultSkills = (): Skill[] => [
  {
    id: 'junior-staff',
    name: 'Junior Staff',
    description: 'Entry-level accounting and administrative tasks',
    category: 'Administrative',
    proficiencyLevel: 'Beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'senior-staff',
    name: 'Senior Staff',
    description: 'Advanced accounting and supervisory tasks',
    category: 'Administrative',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cpa',
    name: 'CPA',
    description: 'Certified Public Accountant level expertise',
    category: 'Audit',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tax-specialist',
    name: 'Tax Specialist',
    description: 'Specialized tax preparation and planning',
    category: 'Tax',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'audit-specialist',
    name: 'Audit Specialist',
    description: 'Financial auditing and compliance',
    category: 'Audit',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    description: 'Basic bookkeeping and data entry',
    category: 'Bookkeeping',
    proficiencyLevel: 'Intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
