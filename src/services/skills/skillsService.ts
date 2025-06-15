import { supabase } from "@/lib/supabaseClient";
import { Skill, ProficiencyLevel, SkillCategory } from "@/types/skill";

// Custom error class for skills service
export class SkillsServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SkillsServiceError';
  }
}

// CRUD operations
export const getAllSkills = async (): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from("skills")
    .select("*");
  
  if (error) {
    console.error("Error fetching skills:", error);
    throw new SkillsServiceError(error.message);
  }
  
  // Map the Supabase data to our Skill type
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
    feePerHour: item.fee_per_hour,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

export const getSkillById = async (id: string): Promise<Skill | undefined> => {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return undefined; // Skill not found
    }
    console.error("Error fetching skill:", error);
    throw new SkillsServiceError(error.message);
  }
  
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    proficiencyLevel: data.proficiency_level as ProficiencyLevel,
    category: data.category as SkillCategory,
    hourlyRate: data.cost_per_hour,
    feePerHour: data.fee_per_hour,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const getSkillsByIds = async (ids: string[]): Promise<Skill[]> => {
  if (!ids || ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .in("id", ids);
  
  if (error) {
    console.error("Error fetching skills by IDs:", error);
    throw new SkillsServiceError(error.message);
  }
  
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
    feePerHour: item.fee_per_hour,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

export const createSkill = async (skillData: Omit<Skill, "id" | "createdAt" | "updatedAt">): Promise<Skill> => {
  const { data, error } = await supabase
    .from("skills")
    .insert({
      name: skillData.name,
      description: skillData.description,
      category: skillData.category,
      proficiency_level: skillData.proficiencyLevel,
      cost_per_hour: skillData.hourlyRate || 50.00, // Default value if not provided
      fee_per_hour: skillData.feePerHour || 75.00,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating skill:", error);
    throw new SkillsServiceError(error.message);
  }
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    proficiencyLevel: data.proficiency_level as ProficiencyLevel,
    category: data.category as SkillCategory,
    hourlyRate: data.cost_per_hour,
    feePerHour: data.fee_per_hour,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updateSkill = async (id: string, skillData: Partial<Omit<Skill, "id" | "createdAt">>): Promise<Skill | undefined> => {
  const updateData: any = {};
  
  if (skillData.name) updateData.name = skillData.name;
  if (skillData.description !== undefined) updateData.description = skillData.description;
  if (skillData.category) updateData.category = skillData.category;
  if (skillData.proficiencyLevel) updateData.proficiency_level = skillData.proficiencyLevel;
  if (skillData.hourlyRate !== undefined) updateData.cost_per_hour = skillData.hourlyRate;
  if (skillData.feePerHour !== undefined) updateData.fee_per_hour = skillData.feePerHour;
  
  const { data, error } = await supabase
    .from("skills")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating skill:", error);
    throw new SkillsServiceError(error.message);
  }
  
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    proficiencyLevel: data.proficiency_level as ProficiencyLevel,
    category: data.category as SkillCategory,
    hourlyRate: data.cost_per_hour,
    feePerHour: data.fee_per_hour,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const deleteSkill = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting skill:", error);
    throw new SkillsServiceError(error.message);
  }
  
  return true;
};

// Advanced operations
export const getSkillsByCategory = async (category: SkillCategory): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("category", category);
  
  if (error) {
    console.error("Error fetching skills by category:", error);
    throw new SkillsServiceError(error.message);
  }
  
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
    feePerHour: item.fee_per_hour,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

export const getSkillsByProficiencyLevel = async (level: ProficiencyLevel): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("proficiency_level", level);
  
  if (error) {
    console.error("Error fetching skills by proficiency level:", error);
    throw new SkillsServiceError(error.message);
  }
  
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
    feePerHour: item.fee_per_hour,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

export const searchSkills = async (query: string): Promise<Skill[]> => {
  const lowercaseQuery = query.toLowerCase();
  
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .or(`name.ilike.%${lowercaseQuery}%,description.ilike.%${lowercaseQuery}%`);
  
  if (error) {
    console.error("Error searching skills:", error);
    throw new SkillsServiceError(error.message);
  }
  
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
    feePerHour: item.fee_per_hour,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

// Utility functions
export const createFallbackSkill = (skillName: string): Skill => {
  const fallbackId = `fallback-${skillName.toLowerCase().replace(/\s+/g, '-')}`;
  
  return {
    id: fallbackId,
    name: skillName,
    description: `Fallback skill created for: ${skillName}`,
    category: 'Other' as SkillCategory,
    proficiencyLevel: 'Intermediate' as ProficiencyLevel,
    hourlyRate: 50.00,
    feePerHour: 75.00, // NEW: Default client billing rate
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const getDefaultSkills = (): Skill[] => {
  return [
    {
      id: 'cpa',
      name: 'CPA',
      description: 'Certified Public Accountant',
      category: 'Compliance' as SkillCategory,
      proficiencyLevel: 'Expert' as ProficiencyLevel,
      hourlyRate: 150.00,
      feePerHour: 250.00, // Updated to correct rate
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'senior',
      name: 'Senior',
      description: 'Senior-level professional with advanced expertise',
      category: 'Administrative' as SkillCategory,
      proficiencyLevel: 'Expert' as ProficiencyLevel,
      hourlyRate: 125.00,
      feePerHour: 150.00, // Updated to correct rate
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'junior',
      name: 'Junior',
      description: 'Junior-level professional with foundational skills',
      category: 'Administrative' as SkillCategory,
      proficiencyLevel: 'Intermediate' as ProficiencyLevel,
      hourlyRate: 65.00,
      feePerHour: 100.00, // Updated to correct rate
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const resolveSkills = async (skillNames: string[]): Promise<Skill[]> => {
  if (!skillNames || skillNames.length === 0) {
    return [];
  }

  try {
    // First try to get all skills from database
    const allSkills = await getAllSkills();
    const resolvedSkills: Skill[] = [];

    for (const skillName of skillNames) {
      // Try to find exact match first
      let foundSkill = allSkills.find(skill => 
        skill.name.toLowerCase() === skillName.toLowerCase()
      );

      // If not found, try partial match
      if (!foundSkill) {
        foundSkill = allSkills.find(skill => 
          skill.name.toLowerCase().includes(skillName.toLowerCase()) ||
          skillName.toLowerCase().includes(skill.name.toLowerCase())
        );
      }

      // If still not found, check default skills
      if (!foundSkill) {
        const defaultSkills = getDefaultSkills();
        foundSkill = defaultSkills.find(skill => 
          skill.name.toLowerCase() === skillName.toLowerCase()
        );
      }

      // If still not found, create fallback
      if (!foundSkill) {
        foundSkill = createFallbackSkill(skillName);
      }

      resolvedSkills.push(foundSkill);
    }

    return resolvedSkills;
  } catch (error) {
    console.error('Error resolving skills:', error);
    // Return fallback skills for all requested names
    return skillNames.map(name => createFallbackSkill(name));
  }
};
