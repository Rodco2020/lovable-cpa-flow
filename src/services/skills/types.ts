
import { Database } from '@/types/supabase';
import { Skill } from '@/types/skill';

export type SkillRow = Database['public']['Tables']['skills']['Row'];

export class SkillsServiceError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'SkillsServiceError';
  }
}

export interface SkillCreateData extends Omit<Skill, 'id' | 'createdAt' | 'updatedAt'> {}

export interface SkillUpdateData extends Partial<Skill> {}
