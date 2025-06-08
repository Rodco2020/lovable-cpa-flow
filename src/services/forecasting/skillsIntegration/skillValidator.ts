
import { SkillType } from '@/types/task';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { SkillsCacheManager } from './cacheManager';
import { SkillValidationResult } from './types';
import { debugLog } from '../logger';

/**
 * Skills Integration Validator
 * Handles validation of skills against available skills and normalization
 */
export class SkillsValidator {
  /**
   * Validate that skills exist and provide normalization
   */
  static async validateSkills(skills: SkillType[]): Promise<SkillValidationResult> {
    try {
      const availableSkills = await this.getAvailableSkills();
      const availableSkillsSet = new Set(availableSkills);

      const valid: SkillType[] = [];
      const invalid: SkillType[] = [];
      const normalized: SkillType[] = [];

      skills.forEach(skill => {
        const normalizedSkill = SkillNormalizationService.normalizeSkill(skill);
        
        if (availableSkillsSet.has(normalizedSkill)) {
          valid.push(normalizedSkill);
          normalized.push(normalizedSkill);
        } else if (availableSkillsSet.has(skill)) {
          valid.push(skill);
          normalized.push(skill);
        } else {
          invalid.push(skill);
        }
      });

      debugLog(`Validated ${skills.length} skills: ${valid.length} valid, ${invalid.length} invalid`);

      return { valid, invalid, normalized };
    } catch (error) {
      debugLog('Error validating skills', error);
      return {
        valid: [],
        invalid: skills,
        normalized: []
      };
    }
  }

  /**
   * Ensure matrix data has consistent skills
   */
  static async normalizeMatrixSkills(matrixSkills: SkillType[]): Promise<SkillType[]> {
    try {
      const availableSkills = await this.getAvailableSkills();
      const availableSkillsSet = new Set(availableSkills);
      
      // Filter and normalize matrix skills to match available skills
      const normalizedSkills = matrixSkills
        .map(skill => SkillNormalizationService.normalizeSkill(skill))
        .filter(skill => availableSkillsSet.has(skill))
        .filter((skill, index, array) => array.indexOf(skill) === index); // Remove duplicates

      // If no matches found, return available skills instead of empty array
      const result = normalizedSkills.length > 0 ? normalizedSkills : availableSkills;
      
      debugLog(`Normalized ${matrixSkills.length} matrix skills to ${result.length} valid skills`);
      
      return result;
    } catch (error) {
      debugLog('Error normalizing matrix skills', error);
      return matrixSkills;
    }
  }

  /**
   * Get available skills (cached or fresh)
   */
  private static async getAvailableSkills(): Promise<SkillType[]> {
    if (SkillsCacheManager.isCacheValid()) {
      return SkillsCacheManager.getCachedSkills();
    }
    
    await SkillsCacheManager.updateCache();
    return SkillsCacheManager.getCachedSkills();
  }
}
