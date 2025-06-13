
import { SkillType } from '@/types/task';
import { MatrixData } from '../types';
import { DemandMatrixData } from '@/types/demand';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { debugLog } from '../../logger';

/**
 * Skill Mapping Consistency Validator
 * 
 * Validates that skills are consistently mapped and normalized across
 * different matrix types to prevent demand/capacity mismatches.
 */

export interface SkillConsistencyResult {
  isConsistent: boolean;
  inconsistencies: SkillInconsistency[];
  normalizedSkillMap: Map<string, SkillType>;
  recommendations: string[];
}

export interface SkillInconsistency {
  originalSkill: string;
  expectedNormalized: SkillType;
  actualNormalized: SkillType;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export class SkillMappingConsistencyValidator {
  /**
   * Validate skill consistency between demand and capacity matrices
   */
  static validateSkillConsistency(
    demandMatrix: DemandMatrixData,
    capacityMatrix: MatrixData
  ): SkillConsistencyResult {
    debugLog('🔍 [SKILL CONSISTENCY] Validating skill mapping consistency');
    
    const inconsistencies: SkillInconsistency[] = [];
    const normalizedSkillMap = new Map<string, SkillType>();
    const recommendations: string[] = [];
    
    // Build expected normalization map from demand skills
    const expectedNormalizations = new Map<string, SkillType>();
    demandMatrix.skills.forEach(skill => {
      const normalized = SkillNormalizationService.normalizeSkill(skill);
      expectedNormalizations.set(skill, normalized);
      normalizedSkillMap.set(skill, normalized);
    });
    
    // Check capacity matrix skills for consistency
    capacityMatrix.skills.forEach(skill => {
      const normalized = SkillNormalizationService.normalizeSkill(skill);
      
      // Check if this normalized skill should match any demand skill
      const demandSkillsWithSameNormalization = Array.from(expectedNormalizations.entries())
        .filter(([_, norm]) => norm === normalized);
      
      if (demandSkillsWithSameNormalization.length > 0) {
        // There should be consistency in how these skills are represented
        const [expectedOriginal, expectedNormalized] = demandSkillsWithSameNormalization[0];
        
        if (skill !== expectedOriginal && normalized === expectedNormalized) {
          inconsistencies.push({
            originalSkill: skill,
            expectedNormalized: expectedNormalized,
            actualNormalized: normalized,
            impact: 'high',
            description: `Skill "${skill}" normalizes to "${normalized}" but should be consistently represented as "${expectedOriginal}"`
          });
        }
      }
      
      normalizedSkillMap.set(skill, normalized);
    });
    
    // Check for missing skills between matrices
    const demandNormalizedSkills = new Set(Array.from(expectedNormalizations.values()));
    const capacityNormalizedSkills = new Set(capacityMatrix.skills.map(s => 
      SkillNormalizationService.normalizeSkill(s)
    ));
    
    // Skills in demand but not in capacity
    demandNormalizedSkills.forEach(skill => {
      if (!capacityNormalizedSkills.has(skill)) {
        inconsistencies.push({
          originalSkill: skill,
          expectedNormalized: skill,
          actualNormalized: skill,
          impact: 'medium',
          description: `Demand skill "${skill}" has no corresponding capacity data`
        });
      }
    });
    
    // Generate recommendations
    if (inconsistencies.length > 0) {
      recommendations.push(
        'Apply consistent skill normalization across all matrix types',
        'Use SkillNormalizationService for all skill name transformations',
        'Ensure demand matrix skills are normalized before capacity matching'
      );
      
      if (inconsistencies.some(i => i.impact === 'high')) {
        recommendations.push('Priority: Fix high-impact skill mapping inconsistencies first');
      }
    } else {
      recommendations.push('Skill mapping consistency is maintained - no action needed');
    }
    
    const result: SkillConsistencyResult = {
      isConsistent: inconsistencies.length === 0,
      inconsistencies,
      normalizedSkillMap,
      recommendations
    };
    
    debugLog('🔍 [SKILL CONSISTENCY] Validation complete', {
      isConsistent: result.isConsistent,
      inconsistencyCount: inconsistencies.length,
      highImpactIssues: inconsistencies.filter(i => i.impact === 'high').length
    });
    
    return result;
  }
  
  /**
   * Validate that a skill set is internally consistent
   */
  static validateSkillSetConsistency(skills: SkillType[]): {
    isConsistent: boolean;
    duplicateNormalizations: Array<{ normalized: SkillType; originals: string[] }>;
    recommendations: string[];
  } {
    const normalizationGroups = new Map<SkillType, string[]>();
    
    skills.forEach(skill => {
      const normalized = SkillNormalizationService.normalizeSkill(skill);
      const group = normalizationGroups.get(normalized) || [];
      group.push(skill);
      normalizationGroups.set(normalized, group);
    });
    
    const duplicateNormalizations = Array.from(normalizationGroups.entries())
      .filter(([_, originals]) => originals.length > 1)
      .map(([normalized, originals]) => ({ normalized, originals }));
    
    const recommendations = duplicateNormalizations.length > 0
      ? [
          'Standardize skill names to prevent multiple originals mapping to same normalized form',
          'Consider using normalized skill names consistently throughout the application'
        ]
      : ['Skill set consistency is maintained'];
    
    return {
      isConsistent: duplicateNormalizations.length === 0,
      duplicateNormalizations,
      recommendations
    };
  }
}
