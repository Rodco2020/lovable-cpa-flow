
import { Skill, ProficiencyLevel, SkillCategory } from '@/types/skill';

/**
 * Skills Service Types
 * 
 * Defines all types used by the skills service for better type safety
 * and clearer interfaces between components.
 */

export interface SkillCreateData {
  name: string;
  description?: string;
  proficiencyLevel?: ProficiencyLevel;
  category?: SkillCategory;
}

export interface SkillUpdateData {
  name?: string;
  description?: string;
  proficiencyLevel?: ProficiencyLevel;
  category?: SkillCategory;
}

export interface SkillRow {
  id: string;
  name: string;
  description: string | null;
  proficiency_level: ProficiencyLevel | null;
  category: SkillCategory | null;
  cost_per_hour: number;
  created_at: string;
  updated_at: string;
}

export type SkillsServiceErrorCode = 
  | 'DATABASE_ERROR'
  | 'SKILL_NOT_FOUND'
  | 'DUPLICATE_SKILL'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export class SkillsServiceError extends Error {
  constructor(
    message: string,
    public code: SkillsServiceErrorCode,
    public originalError?: any
  ) {
    super(message);
    this.name = 'SkillsServiceError';
  }
}
