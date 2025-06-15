
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

export const getCriticalSkills = (): Skill[] => {
  return getDefaultSkills();
};

export const validateCriticalSkillsPresent = (currentSkills: Skill[]) => {
  const criticalSkills = getCriticalSkills();
  const currentSkillNames = currentSkills.map(skill => skill.name.trim());
  
  const missingSkills = criticalSkills
    .filter(critical => !currentSkillNames.includes(critical.name.trim()))
    .map(skill => skill.name);
  
  return {
    isValid: missingSkills.length === 0,
    missingSkills
  };
};
