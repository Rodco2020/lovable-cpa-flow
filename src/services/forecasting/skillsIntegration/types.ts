
import { SkillType } from '@/types/task';

/**
 * Skills Integration Types
 * Defines interfaces and constants for the skills integration system
 */

export interface SkillCache {
  skillsMap: Map<SkillType, SkillType>;
  skillIdToNameMap: Map<string, string>;
  lastCacheUpdate: number;
}

export interface SkillValidationResult {
  valid: SkillType[];
  invalid: SkillType[];
}

export interface SkillResolutionResult {
  resolvedNames: string[];
  validSkills: string[];
  invalidSkills: string[];
}

/**
 * Cache duration for skills data (5 minutes)
 */
export const SKILLS_CACHE_DURATION = 5 * 60 * 1000;
