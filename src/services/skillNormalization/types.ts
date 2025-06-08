
import { SkillType } from '@/types/task';

/**
 * Skill Normalization Types
 * Centralized type definitions for skill normalization functionality
 */

export interface SkillMappingRule {
  pattern: string;
  target: SkillType;
}

export interface SkillMappingCache {
  skillMappingCache: Map<string, SkillType>;
  lastCacheUpdate: number;
}

export interface NormalizationResult {
  normalizedSkill: SkillType;
  wasMapping: boolean;
  originalInput: string;
}

export interface ValidationResult {
  valid: SkillType[];
  invalid: SkillType[];
  normalized: SkillType[];
}

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Standard forecast skill types - must match what the matrix expects
 */
export const STANDARD_FORECAST_SKILLS: SkillType[] = [
  'Junior Staff',
  'Senior Staff', 
  'CPA',
  'Tax Preparation',
  'Audit',
  'Advisory',
  'Bookkeeping',
  'Accounting',
  'Payroll',
  'Compliance'
];
