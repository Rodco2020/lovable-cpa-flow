
/**
 * Common types for performance filtering strategies
 */

export interface FilterResult {
  success: boolean;
  filteredCount: number;
  originalCount: number;
  processingTime: number;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage?: number;
  cacheHitRate?: number;
  throughput: number;
}

export interface FilterDiagnostics {
  inputValidation: boolean;
  filterEffectiveness: number;
  potentialIssues: string[];
  recommendations: string[];
}

export interface BaseFilterStrategy {
  name: string;
  priority: number;
  shouldApply: (filters: any) => boolean;
  apply: (data: any, filters: any) => any;
}
