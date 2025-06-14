
import { Skill, ProficiencyLevel, SkillCategory } from "@/types/skill";

export interface SkillRow {
  id: string;
  name: string;
  description?: string;
  proficiency_level?: string;
  category?: string;
  cost_per_hour?: number;
  created_at?: string;
  updated_at?: string;
}

export const mapSkillFromDB = (dbRow: SkillRow): Skill => {
  return {
    id: dbRow.id,
    name: dbRow.name,
    description: dbRow.description,
    proficiencyLevel: dbRow.proficiency_level as ProficiencyLevel,
    category: dbRow.category as SkillCategory,
    hourlyRate: dbRow.cost_per_hour,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
};

export const createFallbackSkill = (skillName: string): Skill => {
  const fallbackId = `fallback-${skillName.toLowerCase().replace(/\s+/g, '-')}`;
  
  return {
    id: fallbackId,
    name: skillName,
    description: `Fallback skill created for: ${skillName}`,
    category: 'Other' as SkillCategory,
    proficiencyLevel: 'Intermediate' as ProficiencyLevel,
    hourlyRate: 50.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
