
import { SkillType } from '@/types/task';
import { 
  SkillMappingReport, 
  SkillConsistencyIssue, 
  SkillMappingCorrection,
  SkillMappingRecommendation,
  SkillMappingTrace,
  SkillMapping
} from './DataIntegrityValidator';

/**
 * Skill Mapping Verification Service
 * Provides detailed analysis of skill mapping consistency
 */
export class SkillMappingVerifier {
  /**
   * Generate comprehensive skill mapping report
   */
  static generateSkillMappingReport(
    sourceSkills: SkillType[],
    mappedSkills: SkillType[],
    skillMapping: Map<string, string>
  ): SkillMappingReport {
    const unmappedSkills: string[] = [];
    const conflictingMappings: SkillMappingCorrection[] = [];
    let mappedCount = 0;

    sourceSkills.forEach(skill => {
      const skillKey = String(skill).trim();
      const mapping = skillMapping.get(skillKey);
      
      if (!mapping) {
        unmappedSkills.push(skillKey);
      } else {
        mappedCount++;
        
        // Check for conflicting mappings
        if (!mappedSkills.includes(mapping as SkillType)) {
          conflictingMappings.push({
            originalSkill: skillKey,
            suggestedMapping: this.suggestMapping(skillKey),
            confidence: this.calculateMappingConfidence(skillKey, mapping)
          });
        }
      }
    });

    return {
      totalSkills: sourceSkills.length,
      mappedSkills: mappedCount,
      unmappedSkills,
      conflictingMappings
    };
  }

  /**
   * Detect skill consistency issues
   */
  static detectConsistencyIssues(
    demandSkills: SkillType[],
    capacitySkills: SkillType[]
  ): SkillConsistencyIssue[] {
    const issues: SkillConsistencyIssue[] = [];
    
    const demandSet = new Set(demandSkills.map(s => String(s).trim()));
    const capacitySet = new Set(capacitySkills.map(s => String(s).trim()));

    // Check for missing skills in capacity
    demandSet.forEach(skill => {
      if (!capacitySet.has(skill)) {
        issues.push({
          skillName: skill,
          issueType: 'missing',
          recommendation: `Add '${skill}' to capacity matrix or create mapping`
        });
      }
    });

    // Check for extra skills in capacity
    capacitySet.forEach(skill => {
      if (!demandSet.has(skill)) {
        issues.push({
          skillName: skill,
          issueType: 'duplicate',
          recommendation: `Remove '${skill}' from capacity or add to demand matrix`
        });
      }
    });

    return issues;
  }

  /**
   * Generate mapping recommendations
   */
  static generateMappingRecommendations(
    issues: SkillConsistencyIssue[]
  ): SkillMappingRecommendation[] {
    return issues.map(issue => ({
      action: issue.issueType === 'missing' ? 'add' : 'remove',
      skillName: issue.skillName,
      reason: issue.recommendation
    }));
  }

  /**
   * Trace skill mapping path
   */
  static traceSkillMapping(
    skillName: string,
    skillMapping: Map<string, string>
  ): SkillMappingTrace {
    const mappingPath: string[] = [skillName];
    let currentSkill = skillName;
    let finalMapping = skillName;

    // Follow the mapping chain
    while (skillMapping.has(currentSkill)) {
      const nextMapping = skillMapping.get(currentSkill)!;
      if (mappingPath.includes(nextMapping)) {
        // Circular reference detected
        break;
      }
      mappingPath.push(nextMapping);
      finalMapping = nextMapping;
      currentSkill = nextMapping;
    }

    return {
      skillName,
      mappingPath,
      finalMapping
    };
  }

  /**
   * Suggest mapping for unmapped skill
   */
  private static suggestMapping(skillName: string): string {
    const skillLower = skillName.toLowerCase().trim();
    
    // Simple suggestion logic based on common patterns
    if (skillLower.includes('junior') || skillLower.includes('jr')) {
      return 'Junior Staff';
    }
    if (skillLower.includes('senior') || skillLower.includes('sr')) {
      return 'Senior Staff';
    }
    if (skillLower.includes('cpa') || skillLower.includes('certified')) {
      return 'CPA';
    }
    
    // Default to capitalized version
    return skillName.charAt(0).toUpperCase() + skillName.slice(1).toLowerCase();
  }

  /**
   * Calculate confidence score for mapping
   */
  private static calculateMappingConfidence(originalSkill: string, mapping: string): number {
    const original = originalSkill.toLowerCase().trim();
    const mapped = mapping.toLowerCase().trim();
    
    // Exact match gets highest confidence
    if (original === mapped) return 1.0;
    
    // Check for substring matches
    if (mapped.includes(original) || original.includes(mapped)) {
      return 0.8;
    }
    
    // Check for common variations
    const commonMappings = [
      ['junior', 'junior staff'],
      ['senior', 'senior staff'],
      ['jr', 'junior staff'],
      ['sr', 'senior staff']
    ];
    
    for (const [from, to] of commonMappings) {
      if (original.includes(from) && mapped.includes(to)) {
        return 0.9;
      }
    }
    
    return 0.3; // Low confidence for unclear mappings
  }
}

// Re-export types for convenience
export type {
  SkillMappingReport,
  SkillConsistencyIssue,
  SkillMappingCorrection,
  SkillMappingRecommendation,
  SkillMappingTrace,
  SkillMapping
};
