
/**
 * Skill Resolution Types
 * Core type definitions for the skill resolution system
 */

export interface SkillMappingEntry {
  id: string;
  name: string;
}

export interface SkillCache {
  skills: SkillMappingEntry[];
  lastUpdated: number;
  isValid: boolean;
}

export interface SkillResolutionResult {
  resolved: string[];
  valid: string[];
  invalid: string[];
}

export interface SkillResolutionDiagnostics {
  cacheHits: number;
  databaseLookups: number;
  validUuids: number;
  invalidUuids: number;
  validNames: number;
  invalidNames: number;
  totalProcessed: number;
}

export interface SkillValidationResult {
  isValid: boolean;
  valid: string[];
  invalid: string[];
  resolved: string[];
  issues: string[];
  diagnostics: SkillResolutionDiagnostics;
}

export interface SkillResolutionStats {
  total: number;
  resolved: number;
  cached: number;
  fetched: number;
  fallback: number;
  errors: number;
}

export interface SkillCacheManager {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  isCacheValid(): boolean;
  getNameById(id: string): string | undefined;
  getIdByName(name: string): string | undefined;
  updateCache(id: string, name: string): void;
  clear(): void;
  getAllNames(): string[];
}
