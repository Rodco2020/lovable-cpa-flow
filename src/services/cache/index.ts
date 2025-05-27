
/**
 * Cache Module Entry Point
 * 
 * Exports all cache-related functionality and creates global cache instances
 */

export { CacheService } from './CacheService';
export { CacheMetrics } from './metrics';
export { CacheCleanupManager } from './cleanup';
export * from './types';
export * from './utils';

// Re-import CacheService for instance creation
import { CacheService } from './CacheService';

// Create global cache instances for different use cases
export const queryCache = new CacheService({
  maxSize: 500,
  defaultTTL: 5 * 60 * 1000, // 5 minutes for query results
  maxMemoryUsage: 20 * 1024 * 1024 // 20MB
});

export const reportCache = new CacheService({
  maxSize: 100,
  defaultTTL: 15 * 60 * 1000, // 15 minutes for reports
  maxMemoryUsage: 30 * 1024 * 1024 // 30MB
});

export const metadataCache = new CacheService({
  maxSize: 200,
  defaultTTL: 30 * 60 * 1000, // 30 minutes for metadata
  maxMemoryUsage: 5 * 1024 * 1024 // 5MB
});

// Default export for backward compatibility
export default CacheService;
