import { SkillType } from '@/types/task';

/**
 * Skill Mapping Rules Module - UPDATED for Demand/Capacity Matrix Consistency
 * Contains the master skill mapping rules - single source of truth
 * 
 * CRITICAL: This update ensures consistent skill naming between Demand and Capacity matrices
 * by using the SAME display names that appear in the Demand Matrix for all mappings.
 */

export class SkillMappingRules {
  /**
   * Master skill mapping rules - UPDATED for consistency
   * 
   * Key Change: Maps to the EXACT skill names used in Demand Matrix:
   * - "Junior" (not "Junior Staff")  
   * - "Senior" (not "Senior Staff")
   * - "CPA" (unchanged)
   * 
   * This prevents lookup failures between matrices.
   */
  private static readonly SKILL_MAPPING_RULES: Record<string, SkillType> = {
    // Junior Staff variations - NOW MAPS TO "Junior" for consistency
    'junior': 'Junior',
    'junior staff': 'Junior',
    'junior ': 'Junior', // Handle trailing spaces
    ' junior': 'Junior', // Handle leading spaces
    'jr': 'Junior',
    'jr staff': 'Junior',
    
    // Senior Staff variations - NOW MAPS TO "Senior" for consistency  
    'senior': 'Senior',
    'senior staff': 'Senior',
    'senior ': 'Senior', // Handle trailing spaces
    ' senior': 'Senior', // Handle leading spaces
    'sr': 'Senior',
    'sr staff': 'Senior',
    
    // CPA variations - unchanged (already consistent)
    'cpa': 'CPA',
    'cpa ': 'CPA', // Handle trailing spaces
    ' cpa': 'CPA', // Handle leading spaces
    'certified public accountant': 'CPA',
    'certified public accountants': 'CPA',
    
    // Other skill mappings - add specific mappings as needed
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
   * Bidirectional mapping for enhanced lookup
   * Ensures both directions work: "junior" -> "Junior" and "Junior" -> "Junior"
   */
  private static readonly BIDIRECTIONAL_MAPPINGS: Map<string, SkillType> = new Map();

  /**
   * Initialize bidirectional mappings on first use
   */
  private static initializeBidirectionalMappings(): void {
    if (this.BIDIRECTIONAL_MAPPINGS.size > 0) return;

    // Add original mappings
    Object.entries(this.SKILL_MAPPING_RULES).forEach(([key, value]) => {
      this.BIDIRECTIONAL_MAPPINGS.set(key.toLowerCase().trim(), value);
    });

    // Add reverse mappings (normalized skill names map to themselves)
    const uniqueSkillTypes = new Set(Object.values(this.SKILL_MAPPING_RULES));
    uniqueSkillTypes.forEach(skillType => {
      this.BIDIRECTIONAL_MAPPINGS.set(skillType.toLowerCase().trim(), skillType);
    });

    console.log(`🔄 [SKILL MAPPING] Initialized ${this.BIDIRECTIONAL_MAPPINGS.size} bidirectional mappings`);
  }

  /**
   * Get mapping for a skill name with bidirectional support
   */
  static getMapping(skillName: string): SkillType | null {
    this.initializeBidirectionalMappings();
    
    const cleanSkill = skillName.trim().toLowerCase();
    const mapping = this.BIDIRECTIONAL_MAPPINGS.get(cleanSkill);
    
    if (mapping) {
      console.log(`✅ [SKILL MAPPING] Mapped '${skillName}' -> '${mapping}'`);
      return mapping;
    }
    
    console.log(`⚠️ [SKILL MAPPING] No mapping found for '${skillName}'`);
    return null;
  }

  /**
   * Get all mapping rules (for testing/debugging)
   */
  static getAllMappings(): Record<string, SkillType> {
    return { ...this.SKILL_MAPPING_RULES };
  }

  /**
   * Get all bidirectional mappings (for debugging)
   */
  static getAllBidirectionalMappings(): Map<string, SkillType> {
    this.initializeBidirectionalMappings();
    return new Map(this.BIDIRECTIONAL_MAPPINGS);
  }

  /**
   * Check if a mapping exists
   */
  static hasMapping(skillName: string): boolean {
    this.initializeBidirectionalMappings();
    const cleanSkill = skillName.trim().toLowerCase();
    return this.BIDIRECTIONAL_MAPPINGS.has(cleanSkill);
  }

  /**
   * Get standard forecast skills (the target skill types)
   */
  static getStandardForecastSkills(): SkillType[] {
    return [
      'Junior',    // Updated from "Junior Staff" 
      'Senior',    // Updated from "Senior Staff"
      'CPA',
      'Tax Preparation',
      'Audit', 
      'Advisory',
      'Bookkeeping',
      'Accounting',
      'Payroll',
      'Compliance'
    ];
  }

  /**
   * Validate skill consistency across matrices  
   */
  static validateSkillConsistency(
    demandSkills: SkillType[],
    capacitySkills: SkillType[]
  ): { isConsistent: boolean; issues: string[] } {
    const issues: string[] = [];
    
    const demandSet = new Set(demandSkills.map(s => s.trim()));
    const capacitySet = new Set(capacitySkills.map(s => s.trim()));
    
    // Check for skills in demand but not in capacity
    demandSet.forEach(skill => {
      if (!capacitySet.has(skill)) {
        issues.push(`Skill '${skill}' exists in demand but not in capacity matrix`);
      }
    });
    
    // Check for skills in capacity but not in demand
    capacitySet.forEach(skill => {
      if (!demandSet.has(skill)) {
        issues.push(`Skill '${skill}' exists in capacity but not in demand matrix`);
      }
    });
    
    return {
      isConsistent: issues.length === 0,
      issues
    };
  }
}
