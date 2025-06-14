
import { Skill, SkillCategory, ProficiencyLevel } from "@/types/skill";

export const getDefaultSkills = (): Skill[] => {
  return [
    {
      id: 'cpa',
      name: 'CPA',
      description: 'Certified Public Accountant',
      category: 'Compliance' as SkillCategory,
      proficiencyLevel: 'Expert' as ProficiencyLevel,
      hourlyRate: 150.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tax-prep',
      name: 'Tax Preparation',
      description: 'Individual and business tax preparation',
      category: 'Tax' as SkillCategory,
      proficiencyLevel: 'Intermediate' as ProficiencyLevel,
      hourlyRate: 75.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bookkeeping',
      name: 'Bookkeeping',
      description: 'General bookkeeping and accounting',
      category: 'Bookkeeping' as SkillCategory,
      proficiencyLevel: 'Intermediate' as ProficiencyLevel,
      hourlyRate: 45.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};
