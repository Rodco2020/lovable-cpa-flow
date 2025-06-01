
import { Skill } from '@/types/skill';

/**
 * Default skills when database is empty or unavailable
 * These provide a fallback to ensure the application continues to function
 */
export const getDefaultSkills = (): Skill[] => [
  {
    id: 'junior-staff',
    name: 'Junior Staff',
    description: 'Entry-level accounting and administrative tasks',
    category: 'Administrative',
    proficiencyLevel: 'Beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'senior-staff',
    name: 'Senior Staff',
    description: 'Advanced accounting and supervisory tasks',
    category: 'Administrative',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cpa',
    name: 'CPA',
    description: 'Certified Public Accountant level expertise',
    category: 'Audit',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tax-specialist',
    name: 'Tax Specialist',
    description: 'Specialized tax preparation and planning',
    category: 'Tax',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'audit-specialist',
    name: 'Audit Specialist',
    description: 'Financial auditing and compliance',
    category: 'Audit',
    proficiencyLevel: 'Expert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    description: 'Basic bookkeeping and data entry',
    category: 'Bookkeeping',
    proficiencyLevel: 'Intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
