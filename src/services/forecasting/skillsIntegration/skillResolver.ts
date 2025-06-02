
import { SkillType } from '@/types/task';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { SkillsCacheManager } from './cacheManager';
import { SkillResolutionResult } from './types';
import { debugLog } from '../logger';

/**
 * Skills Integration Resolver
 * Handles resolution of skill IDs to names and validation
 */
export class SkillsResolver {
  /**
   * Resolve skill IDs to skill names using centralized normalization
   */
  static async resolveSkillIds(skillIds: string[]): Promise<string[]> {
    try {
      // Ensure we have the latest skill data
      if (!SkillsCacheManager.isCacheValid()) {
        await SkillsCacheManager.updateCache();
      }
      
      const resolvedNames = await Promise.all(
        skillIds.map(async (skillId) => {
          // First try to get the actual skill name from cache
          const skillName = SkillsCacheManager.getCachedSkillName(skillId);
          if (skillName) {
            debugLog(`Resolved skill ID ${skillId} -> ${skillName}`);
            return skillName;
          } else {
            // If not found, try to resolve using normalization service
            const normalizedSkill = await SkillNormalizationService.resolveSkillId(skillId);
            debugLog(`Could not resolve skill ID ${skillId}, using normalized: ${normalizedSkill}`);
            return normalizedSkill;
          }
        })
      );

      return resolvedNames;
    } catch (error) {
      debugLog('Error resolving skill IDs', error);
      return skillIds; // Fallback to original IDs
    }
  }

  /**
   * Resolve and validate skill IDs
   */
  static async resolveAndValidateSkills(skillIds: string[]): Promise<SkillResolutionResult> {
    try {
      const resolvedNames = await this.resolveSkillIds(skillIds);
      
      // Get available skills for validation
      const availableSkills = await this.getAvailableSkills();
      const availableSkillsSet = new Set(availableSkills);

      const validSkills: string[] = [];
      const invalidSkills: string[] = [];

      resolvedNames.forEach(skill => {
        const normalizedSkill = SkillNormalizationService.normalizeSkill(skill);
        
        if (availableSkillsSet.has(normalizedSkill)) {
          validSkills.push(normalizedSkill);
        } else if (availableSkillsSet.has(skill)) {
          validSkills.push(skill);
        } else {
          invalidSkills.push(skill);
        }
      });

      return {
        resolvedNames,
        validSkills,
        invalidSkills
      };
    } catch (error) {
      debugLog('Error resolving and validating skills', error);
      return {
        resolvedNames: skillIds,
        validSkills: [],
        invalidSkills: skillIds
      };
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
