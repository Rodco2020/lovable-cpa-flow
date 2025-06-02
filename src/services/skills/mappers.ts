
import { Skill } from '@/types/skill';
import { SkillRow } from './types';

/**
 * Skills Data Mappers
 * 
 * Handles transformation between database rows and application models.
 * This provides a clean abstraction layer and makes it easy to adapt
 * to schema changes without affecting the rest of the application.
 */

export const mapSkillFromDB = (row: SkillRow): Skill => ({
  id: row.id,
  name: row.name,
  description: row.description || undefined,
  proficiencyLevel: row.proficiency_level || undefined,
  category: row.category || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createFallbackSkill = (skillName: string): Skill => ({
  id: `fallback-${skillName.toLowerCase().replace(/\s+/g, '-')}`,
  name: skillName,
  description: `Fallback skill created for: ${skillName}`,
  proficiencyLevel: 'Beginner',
  category: 'Other',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
