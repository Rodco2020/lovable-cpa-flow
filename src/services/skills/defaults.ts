
import { Skill } from '@/types/skill';

/**
 * Default Skills Configuration
 * 
 * This file provides fallback skills that are critical for the CPA Practice Management
 * System to function properly. These skills serve as defaults when the database is
 * unavailable or when skills are accidentally deleted.
 * 
 * Updated to match the actual skill names in the database.
 */

/**
 * Core skills that are essential for the forecasting and task management systems
 * These correspond to the standard skill types used throughout the application
 */
export const getDefaultSkills = (): Skill[] => [
  {
    id: 'cpa-skill',
    name: 'CPA',
    description: 'Certified Public Accountant with advanced accounting and auditing expertise',
    category: 'Audit',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'senior-staff-skill',
    name: 'Senior',
    description: 'Experienced accounting professional with supervisory capabilities',
    category: 'Tax',
    proficiencyLevel: 'Intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'junior-staff-skill',
    name: 'Junior',
    description: 'Entry-level accounting professional with basic competencies',
    category: 'Bookkeeping',
    proficiencyLevel: 'Beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tax-preparation-skill',
    name: 'Tax Preparation',
    description: 'Preparation of individual and business tax returns',
    category: 'Tax',
    proficiencyLevel: 'Intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bookkeeping-skill',
    name: 'Bookkeeping',
    description: 'Maintaining financial records and basic accounting functions',
    category: 'Bookkeeping',
    proficiencyLevel: 'Beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'audit-skill',
    name: 'Audit',
    description: 'Examination and verification of financial records and statements',
    category: 'Audit',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'payroll-skill',
    name: 'Payroll Processing',
    description: 'Processing employee payroll and related tax obligations',
    category: 'Compliance',
    proficiencyLevel: 'Intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'financial-advisory-skill',
    name: 'Financial Advisory',
    description: 'Providing financial planning and advisory services to clients',
    category: 'Advisory',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Critical skills that must always be available for the system to function
 * These are used by the forecasting and staff allocation systems
 */
export const getCriticalSkills = (): Skill[] => {
  const allDefaults = getDefaultSkills();
  return allDefaults.filter(skill => 
    ['CPA', 'Senior', 'Junior'].includes(skill.name)
  );
};

/**
 * Check if a skill is considered critical for system operation
 */
export const isCriticalSkill = (skillName: string): boolean => {
  const normalizedName = skillName.trim();
  return ['CPA', 'Senior', 'Junior'].includes(normalizedName);
};

/**
 * Get skill by name from defaults with whitespace handling
 */
export const getDefaultSkillByName = (name: string): Skill | null => {
  const normalizedSearchName = name.trim().toLowerCase();
  const defaults = getDefaultSkills();
  return defaults.find(skill => 
    skill.name.trim().toLowerCase() === normalizedSearchName
  ) || null;
};

/**
 * Validate that critical skills are present in a skill list
 * Now handles whitespace issues that were causing false negatives
 */
export const validateCriticalSkillsPresent = (skills: Skill[]): {
  isValid: boolean;
  missingSkills: string[];
} => {
  console.log('Skills validation: Starting validation with skills:', skills.map(s => s.name));
  
  const criticalSkillNames = ['CPA', 'Senior', 'Junior'];
  
  // Normalize skill names by trimming whitespace for comparison
  const presentSkillNames = skills.map(skill => skill.name.trim());
  console.log('Skills validation: Present skills (normalized):', presentSkillNames);
  
  const missingSkills = criticalSkillNames.filter(criticalName => 
    !presentSkillNames.includes(criticalName)
  );
  
  console.log('Skills validation: Missing skills:', missingSkills);
  
  const result = {
    isValid: missingSkills.length === 0,
    missingSkills
  };
  
  console.log('Skills validation: Final result:', result);
  return result;
};
