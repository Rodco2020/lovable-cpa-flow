
import { Skill, ProficiencyLevel, SkillCategory } from '@/types/skill';

/**
 * Maps database row to Skill object with proper type conversions
 * @param row - Raw database row data
 * @returns Mapped Skill object
 */
export const mapSkillFromDB = (row: any): Skill => ({
  id: row.id,
  name: row.name,
  description: row.description || undefined,
  category: (row.category as SkillCategory) || undefined,
  proficiencyLevel: (row.proficiency_level as ProficiencyLevel) || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

/**
 * Creates fallback skill object when skill resolution fails
 * @param skillName - Name of the skill to create fallback for
 * @returns Fallback Skill object
 */
export const createFallbackSkill = (skillName: string): Skill => ({
  id: `fallback-${skillName.toLowerCase().replace(/\s+/g, '-')}`,
  name: skillName,
  description: `Auto-generated skill for ${skillName}`,
  category: 'Other',
  proficiencyLevel: 'Intermediate',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
