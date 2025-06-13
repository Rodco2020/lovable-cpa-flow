import { SkillType } from '@/types/task';
import { SkillMappingRule } from './types';

/**
 * Skill Mapping Rules Module
 * Contains the master skill mapping rules - single source of truth
 */

export class SkillMappingRules {
  /**
   * Master skill mapping rules - single source of truth
   */
  private static readonly SKILL_MAPPING_RULES: Record<string, SkillType> = {
    // Junior Staff variations
    'junior': 'Junior Staff',
    'junior staff': 'Junior Staff',
    'junior ': 'Junior Staff', // Handle trailing spaces
    ' junior': 'Junior Staff', // Handle leading spaces
    'jr': 'Junior Staff',
    'jr staff': 'Junior Staff',
    
    // Senior Staff variations
    'senior': 'Senior Staff',
    'senior staff': 'Senior Staff',
    'senior ': 'Senior Staff', // Handle trailing spaces
    ' senior': 'Senior Staff', // Handle leading spaces
    'sr': 'Senior Staff',
    'sr staff': 'Senior Staff',
    
    // CPA variations
    'cpa': 'CPA',
    'cpa ': 'CPA', // Handle trailing spaces
    ' cpa': 'CPA', // Handle leading spaces
    'certified public accountant': 'CPA',
    'certified public accountants': 'CPA',
    
    // Other skill mappings
    'tax prep': 'Tax Preparation',
    'tax preparation': 'Tax Preparation',
    'tax specialist': 'Tax Preparation',
    'audit': 'Audit',
    'auditing': 'Audit',
    'audit specialist': 'Audit',
    'advisory': 'Advisory',
    'bookkeeping': 'Bookkeeping',
    'accounting': 'Accounting',
    'payroll': 'Payroll',
    'compliance': 'Compliance'
  };

  /**
   * Get mapping for a skill name
   */
  static getMapping(skillName: string): SkillType | null {
    const cleanSkill = skillName.trim().toLowerCase();
    return this.SKILL_MAPPING_RULES[cleanSkill] || null;
  }

  /**
   * Get all mapping rules (for testing/debugging)
   */
  static getAllMappings(): Record<string, SkillType> {
    return { ...this.SKILL_MAPPING_RULES };
  }

  /**
   * Check if a mapping exists
   */
  static hasMapping(skillName: string): boolean {
    const cleanSkill = skillName.trim().toLowerCase();
    return cleanSkill in this.SKILL_MAPPING_RULES;
  }
}
