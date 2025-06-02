
import { Skill } from '@/types/skill';

/**
 * Default Skills Configuration
 * 
 * This file provides fallback skills that are critical for the CPA Practice Management
 * System to function properly. These skills serve as defaults when the database is
 * unavailable or when skills are accidentally deleted.
 */

/**
 * Core skills that are essential for the forecasting and task management systems
 * These correspond to the standard skill types used throughout the application
 */
export const getDefaultSkills = (): Skill[] => [
  {
    id: 'cpa-skill',
    name: 'CPA Skill',
    description: 'Certified Public Accountant with advanced accounting and auditing expertise',
    category: 'Audit',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'senior-staff-skill',
    name: 'Senior Skill',
    description: 'Experienced accounting professional with supervisory capabilities',
    category: 'Tax',
    proficiencyLevel: 'Intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'junior-staff-skill',
    name: 'Junior Skill',
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
    ['CPA Skill', 'Senior Skill', 'Junior Skill'].includes(skill.name)
  );
};

/**
 * Check if a skill is considered critical for system operation
 */
export const isCriticalSkill = (skillName: string): boolean => {
  return ['CPA Skill', 'Senior Skill', 'Junior Skill'].includes(skillName);
};

/**
 * Get skill by name from defaults
 */
export const getDefaultSkillByName = (name: string): Skill | null => {
  const defaults = getDefaultSkills();
  return defaults.find(skill => skill.name.toLowerCase() === name.toLowerCase()) || null;
};

/**
 * Validate that critical skills are present in a skill list
 */
export const validateCriticalSkillsPresent = (skills: Skill[]): {
  isValid: boolean;
  missingSkills: string[];
} => {
  const criticalSkillNames = ['CPA Skill', 'Senior Skill', 'Junior Skill'];
  const presentSkillNames = skills.map(skill => skill.name);
  const missingSkills = criticalSkillNames.filter(name => 
    !presentSkillNames.includes(name)
  );
  
  return {
    isValid: missingSkills.length === 0,
    missingSkills
  };
};
