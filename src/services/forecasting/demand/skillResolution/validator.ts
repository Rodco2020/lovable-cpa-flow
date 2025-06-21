
/**
 * Skill Validation Service
 * Handles validation of skill references and UUIDs
 */

import { SkillCacheManager, SkillValidationResult } from './types';
import { debugLog } from '../../logger';

export class SkillValidator {
  constructor(private cacheManager: SkillCacheManager) {}

  /**
   * Check if a string is a valid UUID
   */
  isUUID(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str.trim());
  }

  /**
   * Validate skill references with comprehensive diagnostics
   */
  async validateSkillReferences(skillRefs: string[]): Promise<SkillValidationResult> {
    console.log('🔍 [SKILL VALIDATOR] Starting skill reference validation for:', skillRefs);

    if (!Array.isArray(skillRefs) || skillRefs.length === 0) {
      return {
        isValid: true,
        valid: [],
        invalid: [],
        resolved: [],
        issues: []
      };
    }

    await this.cacheManager.initialize();

    const result: SkillValidationResult = {
      isValid: true,
      valid: [],
      invalid: [],
      resolved: [],
      issues: []
    };

    for (const skillRef of skillRefs) {
      try {
        if (!skillRef || typeof skillRef !== 'string') {
          result.invalid.push(String(skillRef));
          result.issues.push(`Invalid skill reference: ${skillRef}`);
          continue;
        }

        const trimmed = skillRef.trim();
        
        if (this.isUUID(trimmed)) {
          // It's a UUID - check if we can resolve it
          const skillName = this.cacheManager.getNameById(trimmed);
          if (skillName) {
            result.valid.push(trimmed);
            result.resolved.push(skillName);
          } else {
            result.invalid.push(trimmed);
            result.issues.push(`UUID not found in skills cache: ${trimmed.slice(0, 8)}...`);
          }
        } else {
          // It's a name - check if it exists in our cache
          const skillId = this.cacheManager.getIdByName(trimmed);
          if (skillId) {
            result.valid.push(trimmed);
            result.resolved.push(trimmed);
          } else {
            // Name not found - this might be valid but not in cache
            result.valid.push(trimmed);
            result.resolved.push(trimmed);
            result.issues.push(`Skill name not found in cache: ${trimmed}`);
          }
        }
      } catch (error) {
        console.error(`❌ [SKILL VALIDATOR] Error validating skill ${skillRef}:`, error);
        result.invalid.push(skillRef);
        result.issues.push(`Validation error for ${skillRef}: ${error}`);
      }
    }

    result.isValid = result.invalid.length === 0;

    console.log('📊 [SKILL VALIDATOR] Validation complete:', {
      isValid: result.isValid,
      validCount: result.valid.length,
      invalidCount: result.invalid.length,
      resolvedCount: result.resolved.length,
      issuesCount: result.issues.length
    });

    debugLog(`Skill validation completed: ${result.valid.length} valid, ${result.invalid.length} invalid`);
    return result;
  }

  /**
   * Validate array contains only UUIDs
   */
  validateUUIDArray(skillIds: string[]): { valid: string[], invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const skillId of skillIds) {
      if (this.isUUID(skillId)) {
        valid.push(skillId);
      } else {
        invalid.push(skillId);
      }
    }

    return { valid, invalid };
  }

  /**
   * Validate array contains only skill names
   */
  validateNameArray(skillNames: string[]): { valid: string[], invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const skillName of skillNames) {
      if (skillName && typeof skillName === 'string' && skillName.trim().length > 0) {
        valid.push(skillName.trim());
      } else {
        invalid.push(skillName);
      }
    }

    return { valid, invalid };
  }
}
