
import { SkillType } from '@/types/task';
import { SkillMappingRules } from '@/services/skillNormalization/mappingRules';
import { debugLog } from './logger';

/**
 * Skill Consistency Service
 * Ensures consistent skill naming between Demand and Capacity matrices
 * 
 * This service is critical for fixing the skill demand calculation discrepancy
 * by ensuring both matrices use identical skill names for lookups.
 */
export class SkillConsistencyService {
  /**
   * Normalize skills to consistent format used across all matrices
   * 
   * This is the key fix: ensures all matrices use the SAME skill names
   * that are present in the Demand Matrix ("Junior", "Senior", "CPA")
   */
  static normalizeSkillsForMatrixConsistency(skills: string[]): SkillType[] {
    const normalizedSkills: SkillType[] = [];
    
    console.log('🔧 [SKILL CONSISTENCY] Normalizing skills for matrix consistency:', skills);
    
    skills.forEach(skill => {
      const trimmedSkill = skill.trim();
      
      // First try direct mapping
      const mappedSkill = SkillMappingRules.getMapping(trimmedSkill);
      
      if (mappedSkill) {
        normalizedSkills.push(mappedSkill);
        console.log(`✅ [SKILL CONSISTENCY] Mapped '${trimmedSkill}' -> '${mappedSkill}'`);
      } else {
        // If no mapping found, use the skill as-is (capitalized)
        const capitalizedSkill = this.capitalizeSkillName(trimmedSkill) as SkillType;
        normalizedSkills.push(capitalizedSkill);
        console.log(`⚠️ [SKILL CONSISTENCY] No mapping for '${trimmedSkill}', using '${capitalizedSkill}'`);
      }
    });
    
    // Remove duplicates while preserving order
    const uniqueSkills = Array.from(new Set(normalizedSkills));
    
    console.log('🎯 [SKILL CONSISTENCY] Final normalized skills:', uniqueSkills);
    return uniqueSkills;
  }

  /**
   * Validate that demand and capacity matrices use consistent skill names
   */
  static validateMatrixSkillConsistency(
    demandSkills: SkillType[],
    capacitySkills: SkillType[]
  ): {
    isConsistent: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const demandSet = new Set(demandSkills.map(s => s.trim()));
    const capacitySet = new Set(capacitySkills.map(s => s.trim()));
    
    console.log('🔍 [SKILL CONSISTENCY] Validating matrix skill consistency');
    console.log('  Demand skills:', Array.from(demandSet));
    console.log('  Capacity skills:', Array.from(capacitySet));
    
    // Check for skills in demand but missing from capacity
    demandSet.forEach(skill => {
      if (!capacitySet.has(skill)) {
        issues.push(`Skill '${skill}' exists in demand matrix but missing from capacity matrix`);
        recommendations.push(`Add '${skill}' to capacity matrix or update skill mapping rules`);
      }
    });
    
    // Check for skills in capacity but missing from demand  
    capacitySet.forEach(skill => {
      if (!demandSet.has(skill)) {
        issues.push(`Skill '${skill}' exists in capacity matrix but missing from demand matrix`);
        recommendations.push(`Remove '${skill}' from capacity matrix or add to demand matrix`);
      }
    });
    
    const isConsistent = issues.length === 0;
    
    if (isConsistent) {
      console.log('✅ [SKILL CONSISTENCY] Matrix skills are consistent');
    } else {
      console.log('❌ [SKILL CONSISTENCY] Matrix skill inconsistencies detected:', issues);
    }
    
    return {
      isConsistent,
      issues,
      recommendations
    };
  }

  /**
   * Create a skill mapping for matrix transformations
   * Returns a map that ensures consistent skill names between matrices
   */
  static createMatrixSkillMapping(sourceSkills: string[]): Map<string, SkillType> {
    const skillMapping = new Map<string, SkillType>();
    
    console.log('🗺️ [SKILL CONSISTENCY] Creating matrix skill mapping for:', sourceSkills);
    
    sourceSkills.forEach(skill => {
      const trimmedSkill = skill.trim();
      const normalizedSkill = SkillMappingRules.getMapping(trimmedSkill);
      
      if (normalizedSkill) {
        // Bidirectional mapping for consistent lookups
        skillMapping.set(trimmedSkill, normalizedSkill);
        skillMapping.set(normalizedSkill, normalizedSkill); // Self-mapping
        
        console.log(`🔗 [SKILL CONSISTENCY] Added mapping: '${trimmedSkill}' <-> '${normalizedSkill}'`);
      } else {
        // No mapping found, use capitalized version
        const capitalizedSkill = this.capitalizeSkillName(trimmedSkill) as SkillType;
        skillMapping.set(trimmedSkill, capitalizedSkill);
        skillMapping.set(capitalizedSkill, capitalizedSkill); // Self-mapping
        
        console.log(`🔗 [SKILL CONSISTENCY] Added fallback mapping: '${trimmedSkill}' <-> '${capitalizedSkill}'`);
      }
    });
    
    console.log(`📊 [SKILL CONSISTENCY] Created ${skillMapping.size} skill mappings`);
    return skillMapping;
  }

  /**
   * Fix skill naming discrepancies in matrix data
   * This is the core fix for the demand calculation issue
   */
  static alignMatrixSkillNames<T extends { skillType: SkillType }>(
    dataPoints: T[],
    targetSkillNames: SkillType[]
  ): T[] {
    const skillMapping = this.createMatrixSkillMapping(
      dataPoints.map(dp => dp.skillType)
    );
    
    console.log('🔧 [SKILL CONSISTENCY] Aligning matrix skill names');
    console.log('  Target skills:', targetSkillNames);
    
    return dataPoints.map(dataPoint => {
      const currentSkill = dataPoint.skillType;
      const alignedSkill = skillMapping.get(currentSkill) || currentSkill;
      
      if (currentSkill !== alignedSkill) {
        console.log(`🔄 [SKILL CONSISTENCY] Aligned '${currentSkill}' -> '${alignedSkill}'`);
      }
      
      return {
        ...dataPoint,
        skillType: alignedSkill
      };
    });
  }

  /**
   * Capitalize skill name properly
   */
  private static capitalizeSkillName(skillName: string): string {
    return skillName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Debug helper: Log skill comparison between matrices
   */
  static debugSkillComparison(
    demandSkills: SkillType[],
    capacitySkills: SkillType[],
    context: string = 'Matrix Comparison'
  ): void {
    debugLog(`[${context}] Skill Comparison:`);
    debugLog(`  Demand Matrix Skills (${demandSkills.length}):`, demandSkills);
    debugLog(`  Capacity Matrix Skills (${capacitySkills.length}):`, capacitySkills);
    
    const validation = this.validateMatrixSkillConsistency(demandSkills, capacitySkills);
    debugLog(`  Consistency Check:`, validation);
  }
}
