
/**
 * Core Cache Types and Interfaces
 * 
 * Defines the fundamental types used across the cache system
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  averageAccessCount: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  maxMemoryUsage: number; // in bytes
  enableMetrics: boolean;
  cleanupInterval: number; // in milliseconds
}

export interface CacheWarmUpLoader {
  key: string;
  loader: () => Promise<any>;
  ttl?: number;
}

export interface CacheDiagnostics {
  config: CacheConfig;
  stats: CacheStats;
  internalStats: {
    hits: number;
    misses: number;
    evictions: number;
    totalRequests: number;
  };
  memoryUsage: number;
}
