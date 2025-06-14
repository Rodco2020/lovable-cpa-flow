
import { supabase } from "@/lib/supabaseClient";
import { Skill, ProficiencyLevel, SkillCategory } from "@/types/skill";

// CRUD operations
export const getAllSkills = async (): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from("skills")
    .select("*");
  
  if (error) {
    console.error("Error fetching skills:", error);
    throw new Error(error.message);
  }
  
  // Map the Supabase data to our Skill type
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
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
    throw new Error(error.message);
  }
  
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    proficiencyLevel: data.proficiency_level as ProficiencyLevel,
    category: data.category as SkillCategory,
    hourlyRate: data.cost_per_hour,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
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
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating skill:", error);
    throw new Error(error.message);
  }
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    proficiencyLevel: data.proficiency_level as ProficiencyLevel,
    category: data.category as SkillCategory,
    hourlyRate: data.cost_per_hour,
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
  
  const { data, error } = await supabase
    .from("skills")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating skill:", error);
    throw new Error(error.message);
  }
  
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    proficiencyLevel: data.proficiency_level as ProficiencyLevel,
    category: data.category as SkillCategory,
    hourlyRate: data.cost_per_hour,
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
    throw new Error(error.message);
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
    throw new Error(error.message);
  }
  
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
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
    throw new Error(error.message);
  }
  
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
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
    throw new Error(error.message);
  }
  
  return data.map((item: any): Skill => ({
    id: item.id,
    name: item.name,
    description: item.description,
    proficiencyLevel: item.proficiency_level as ProficiencyLevel,
    category: item.category as SkillCategory,
    hourlyRate: item.cost_per_hour,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};
