
import { debugLog } from '../../forecasting/logger';

export interface StaffInfo {
  id: string;
  name: string;
  roleTitle?: string;
  assignedSkills: string[];
  costPerHour?: number;
  status?: string;
}

export interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Cache Manager for Staff Resolution Service
 * Handles all caching operations for staff data
 */
export class StaffCacheManager {
  private static singleCache = new Map<string, CacheEntry<StaffInfo>>();
  private static bulkCache = new Map<string, CacheEntry<Map<string, StaffInfo>>>();
  private static defaultCacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached staff member by ID
   */
  static getCachedStaff(cacheKey: string): StaffInfo | null {
    const cached = this.singleCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      debugLog('Staff resolution cache hit', { cacheKey });
      return cached.data;
    }
    return null;
  }

  /**
   * Cache a single staff member
   */
  static setCachedStaff(
    cacheKey: string, 
    staffInfo: StaffInfo, 
    expiry?: number
  ): void {
    const expiryTime = Date.now() + (expiry || this.defaultCacheExpiry);
    this.singleCache.set(cacheKey, { data: staffInfo, expiry: expiryTime });
  }

  /**
   * Get cached bulk staff data
   */
  static getCachedBulkStaff(cacheKey: string): Map<string, StaffInfo> | null {
    const cached = this.bulkCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      debugLog('Bulk staff resolution cache hit', { cacheKey });
      return cached.data;
    }
    return null;
  }

  /**
   * Cache bulk staff data
   */
  static setCachedBulkStaff(
    cacheKey: string, 
    staffMap: Map<string, StaffInfo>, 
    expiry?: number
  ): void {
    const expiryTime = Date.now() + (expiry || this.defaultCacheExpiry);
    this.bulkCache.set(cacheKey, { data: staffMap, expiry: expiryTime });
  }

  /**
   * Clear all cache entries
   */
  static clearCache(): void {
    this.singleCache.clear();
    this.bulkCache.clear();
    debugLog('Staff resolution cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    singleCacheSize: number;
    bulkCacheSize: number;
    totalMemoryUsage: number;
  } {
    const singleCacheSize = this.singleCache.size;
    const bulkCacheSize = this.bulkCache.size;
    
    // Rough estimation of memory usage
    const totalMemoryUsage = (singleCacheSize * 200) + (bulkCacheSize * 1000); // bytes

    return {
      singleCacheSize,
      bulkCacheSize,
      totalMemoryUsage
    };
  }

  /**
   * Clean expired cache entries
   */
  static cleanExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;

    // Clean single cache
    for (const [key, value] of this.singleCache.entries()) {
      if (value.expiry < now) {
        this.singleCache.delete(key);
        cleaned++;
      }
    }

    // Clean bulk cache
    for (const [key, value] of this.bulkCache.entries()) {
      if (value.expiry < now) {
        this.bulkCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      debugLog('Cleaned expired cache entries', { entriesCleaned: cleaned });
    }
  }

  /**
   * Generate cache key for single staff lookup
   */
  static generateSingleCacheKey(staffId: string, includeInactive: boolean): string {
    return `staff_${staffId}_${includeInactive}`;
  }

  /**
   * Generate cache key for bulk staff lookup
   */
  static generateBulkCacheKey(staffIds: string[], includeInactive: boolean): string {
    return `bulk_${staffIds.sort().join(',')}_${includeInactive}`;
  }
}
