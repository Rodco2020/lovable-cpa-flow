
import { SkillType } from '@/types/task';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { SkillsCacheManager } from './cacheManager';
import { SkillValidationResult } from './types';
import { debugLog } from '../logger';

/**
 * Skills Integration Validator
 * Handles validation and normalization of skills for matrix display
 */
export class SkillsValidator {
  /**
   * Validate that skills exist and provide normalization
   */
  static async validateSkills(skills: SkillType[]): Promise<SkillValidationResult> {
    try {
      // Ensure cache is fresh
      if (!SkillsCacheManager.isCacheValid()) {
        await SkillsCacheManager.updateCache();
      }
      
      const availableSkills = SkillsCacheManager.getCachedSkills();
      const availableSkillsSet = new Set(availableSkills);
      
      const validSkills: SkillType[] = [];
      const invalidSkills: SkillType[] = [];
      
      skills.forEach(skill => {
        const normalizedSkill = SkillNormalizationService.normalizeSkill(skill);
        
        if (availableSkillsSet.has(normalizedSkill)) {
          validSkills.push(normalizedSkill);
        } else {
          invalidSkills.push(skill);
          debugLog(`Invalid skill detected: ${skill} -> ${normalizedSkill}`);
        }
      });
      
      return { valid: validSkills, invalid: invalidSkills };
    } catch (error) {
      debugLog('Error validating skills:', error);
      return { valid: [], invalid: skills };
    }
  }

  /**
   * Ensure matrix data has consistent skills
   */
  static async normalizeMatrixSkills(matrixSkills: SkillType[]): Promise<SkillType[]> {
    try {
      const normalizedSkills = matrixSkills.map(skill => 
        SkillNormalizationService.normalizeSkill(skill)
      );
      
      // Remove duplicates and sort
      const uniqueSkills = Array.from(new Set(normalizedSkills)).sort();
      
      debugLog('Matrix skills normalized:', {
        original: matrixSkills,
        normalized: uniqueSkills
      });
      
      return uniqueSkills;
    } catch (error) {
      debugLog('Error normalizing matrix skills:', error);
      return matrixSkills;
    }
  }
}
