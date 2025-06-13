
import { SkillType } from '@/types/task';
import { SkillMappingRule } from './types';

/**
 * Skill Mapping Rules Module - ENHANCED
 * Contains the master skill mapping rules - single source of truth
 * FIXED: Added comprehensive mappings to prevent skill name inconsistencies
 */

export class SkillMappingRules {
  /**
   * Master skill mapping rules - ENHANCED with comprehensive mappings
   */
  private static readonly SKILL_MAPPING_RULES: Record<string, SkillType> = {
    // FIXED: Enhanced Junior Staff variations with comprehensive coverage
    'junior': 'Junior Staff',
    'junior staff': 'Junior Staff',
    'junior ': 'Junior Staff', // Handle trailing spaces
    ' junior': 'Junior Staff', // Handle leading spaces
    'jr': 'Junior Staff',
    'jr staff': 'Junior Staff',
    'junior level': 'Junior Staff',
    'entry level': 'Junior Staff',
    'junior associate': 'Junior Staff',
    
    // FIXED: Enhanced Senior Staff variations with comprehensive coverage
    'senior': 'Senior Staff',
    'senior staff': 'Senior Staff',
    'senior ': 'Senior Staff', // Handle trailing spaces
    ' senior': 'Senior Staff', // Handle leading spaces
    'sr': 'Senior Staff',
    'sr staff': 'Senior Staff',
    'senior level': 'Senior Staff',
    'senior associate': 'Senior Staff',
    'experienced': 'Senior Staff',
    
    // FIXED: Enhanced CPA variations
    'cpa': 'CPA',
    'cpa ': 'CPA', // Handle trailing spaces
    ' cpa': 'CPA', // Handle leading spaces
    'certified public accountant': 'CPA',
    'certified public accountants': 'CPA',
    'certified cpa': 'CPA',
    'licensed cpa': 'CPA',
    
    // FIXED: Enhanced skill mappings with consistency focus
    'tax prep': 'Tax Preparation',
    'tax preparation': 'Tax Preparation',
    'tax specialist': 'Tax Preparation',
    'tax services': 'Tax Preparation',
    'tax planning': 'Tax Preparation',
    'tax compliance': 'Tax Preparation',
    
    'audit': 'Audit',
    'auditing': 'Audit',
    'audit specialist': 'Audit',
    'audit services': 'Audit',
    'financial audit': 'Audit',
    'compliance audit': 'Audit',
    
    'advisory': 'Advisory',
    'advisory services': 'Advisory',
    'business advisory': 'Advisory',
    'consulting': 'Advisory',
    'strategic advisory': 'Advisory',
    
    'bookkeeping': 'Bookkeeping',
    'bookkeeper': 'Bookkeeping',
    'bookkeeping services': 'Bookkeeping',
    'record keeping': 'Bookkeeping',
    
    'accounting': 'Accounting',
    'general accounting': 'Accounting',
    'financial accounting': 'Accounting',
    'staff accountant': 'Accounting',
    
    'payroll': 'Payroll',
    'payroll processing': 'Payroll',
    'payroll services': 'Payroll',
    'payroll specialist': 'Payroll',
    
    'compliance': 'Compliance',
    'regulatory compliance': 'Compliance',
    'compliance services': 'Compliance',
    'compliance specialist': 'Compliance'
  };

  /**
   * FIXED: Enhanced mapping with case-insensitive and whitespace handling
   */
  static getMapping(skillName: string): SkillType | null {
    if (!skillName || typeof skillName !== 'string') {
      return null;
    }
    
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
    if (!skillName || typeof skillName !== 'string') {
      return false;
    }
    
    const cleanSkill = skillName.trim().toLowerCase();
    return cleanSkill in this.SKILL_MAPPING_RULES;
  }

  /**
   * FIXED: Get reverse mapping to find original skill names that map to a normalized skill
   */
  static getOriginalSkillsForNormalized(normalizedSkill: SkillType): string[] {
    return Object.entries(this.SKILL_MAPPING_RULES)
      .filter(([_, normalized]) => normalized === normalizedSkill)
      .map(([original, _]) => original);
  }

  /**
   * FIXED: Validate consistency of skill mapping rules
   */
  static validateMappingConsistency(): {
    isConsistent: boolean;
    issues: string[];
    stats: { totalMappings: number; uniqueTargets: number };
  } {
    const issues: string[] = [];
    const targetSkills = new Set(Object.values(this.SKILL_MAPPING_RULES));
    const totalMappings = Object.keys(this.SKILL_MAPPING_RULES).length;
    
    // Check for potential conflicts or inconsistencies
    const caseVariations = new Map<string, string[]>();
    Object.keys(this.SKILL_MAPPING_RULES).forEach(key => {
      const baseKey = key.replace(/\s+/g, '').toLowerCase();
      const variations = caseVariations.get(baseKey) || [];
      variations.push(key);
      caseVariations.set(baseKey, variations);
    });
    
    // Look for potential case/spacing conflicts
    caseVariations.forEach((variations, baseKey) => {
      if (variations.length > 1) {
        const targets = variations.map(v => this.SKILL_MAPPING_RULES[v]);
        const uniqueTargets = new Set(targets);
        if (uniqueTargets.size > 1) {
          issues.push(`Inconsistent mapping for "${baseKey}": ${Array.from(uniqueTargets).join(', ')}`);
        }
      }
    });
    
    return {
      isConsistent: issues.length === 0,
      issues,
      stats: {
        totalMappings,
        uniqueTargets: targetSkills.size
      }
    };
  }
}
