
import { SkillType } from '@/types/task';
import { Skill } from '@/types/skill';

/**
 * Skills Integration Types
 * Shared type definitions for skills integration functionality
 */

export interface SkillCache {
  skillsMap: Map<string, SkillType>;
  skillIdToNameMap: Map<string, string>;
  lastCacheUpdate: number;
}

export interface SkillValidationResult {
  valid: SkillType[];
  invalid: SkillType[];
  normalized: SkillType[];
}

export interface SkillResolutionResult {
  resolvedNames: string[];
  validSkills: string[];
  invalidSkills: string[];
}

export const SKILLS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Re-export commonly used types for convenience
export type { SkillType, Skill };
