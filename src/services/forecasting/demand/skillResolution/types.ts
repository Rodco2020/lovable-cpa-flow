
/**
 * Type definitions for the Skill Resolution Service
 */

export interface SkillCacheEntry {
  id: string;
  name: string;
}

export interface SkillResolutionResult {
  resolvedNames: string[];
  stats: SkillResolutionStats;
}

export interface SkillResolutionStats {
  total: number;
  resolved: number;
  cached: number;
  fetched: number;
  fallback: number;
  errors: number;
}

export interface SkillValidationResult {
  valid: string[];
  invalid: string[];
  resolved: string[];
  diagnostics: SkillValidationDiagnostics;
}

export interface SkillValidationDiagnostics {
  inputCount: number;
  validUuids: number;
  invalidUuids: number;
  resolvedNames: number;
  cacheHits: number;
  errors: string[];
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
