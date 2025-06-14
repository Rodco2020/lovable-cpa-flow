
import { Skill } from "@/types/skill";

export class SkillsServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SkillsServiceError';
  }
}

export interface SkillCreateData extends Omit<Skill, "id" | "createdAt" | "updatedAt"> {}

export interface SkillUpdateData extends Partial<Omit<Skill, "id" | "createdAt">> {}

export interface SkillRow {
  id: string;
  name: string;
  description?: string;
  proficiency_level?: string;
  category?: string;
  cost_per_hour?: number;
  fee_per_hour?: number; // NEW: Client billing rate
  created_at?: string;
  updated_at?: string;
}
