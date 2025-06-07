
import { SkillType } from '@/types/task';

/**
 * Skill Normalization Types
 * Defines interfaces and constants for the skill normalization system
 */

export interface SkillMappingRule {
  pattern: string;
  mappedTo: SkillType;
  priority: number;
}

export interface NormalizationResult {
  originalSkill: string;
  normalizedSkill: SkillType;
  matchedRule?: string;
  confidence: number;
}

export interface ValidationResult {
  isValid: boolean;
  normalizedSkill: SkillType;
  errors: string[];
}

export interface SkillMappingCache {
  skillMappingCache: Map<string, SkillType>;
  lastCacheUpdate: number;
}

/**
 * Cache duration for skill mappings (10 minutes)
 */
export const CACHE_DURATION = 10 * 60 * 1000;
