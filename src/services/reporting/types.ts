
/**
 * Reporting Data Service Types
 * 
 * Defines types and interfaces for the reporting data service
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  size: number;
  entries: string[];
}

export interface ProcessedClientData {
  client: any;
  recurringTasks: any[];
  taskInstances: any[];
}

export interface ProcessedStaffLiaisonData {
  aggregatedData: any[];
}

export interface ReportingConfig {
  cacheTTL: number;
  performanceThreshold: number;
}

