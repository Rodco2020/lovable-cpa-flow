
export type ProficiencyLevel = "Beginner" | "Intermediate" | "Expert";

export type SkillCategory = "Tax" | "Audit" | "Advisory" | "Bookkeeping" | "Compliance" | "Administrative" | "Other";

export interface Skill {
  id: string;
  name: string;
  description?: string;
  proficiencyLevel?: ProficiencyLevel;
  category?: SkillCategory;
  hourlyRate?: number;
  createdAt?: string;
  updatedAt?: string;
}
