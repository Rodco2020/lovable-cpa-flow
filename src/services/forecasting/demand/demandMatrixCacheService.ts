
import { format } from 'date-fns';
import { debugLog } from '../logger';
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';

/**
 * Demand Matrix Cache Service - ENHANCED WITH AGGREGATION STRATEGY CACHE INVALIDATION
 * Pure caching logic for demand matrix data with TTL management and aggregation strategy support
 */
export class DemandMatrixCacheService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static cache = new Map<string, { data: DemandMatrixData; timestamp: number; aggregationStrategy: string }>();
  private static readonly AGGREGATION_STRATEGY_VERSION = 'v2.0'; // Increment when aggregation logic changes

  /**
   * Generate demand matrix cache key with aggregation strategy versioning
   * ENHANCED: Now includes aggregation strategy and version for proper cache isolation
   */
  static getDemandMatrixCacheKey(
    mode: DemandMatrixMode, 
    startDate: Date, 
    aggregationStrategy?: 'skill-based' | 'staff-based'
  ): string {
    const baseKey = `demand_matrix_${mode}_${format(startDate, 'yyyy-MM')}`;
    const strategyKey = aggregationStrategy || 'skill-based';
    const versionedKey = `${baseKey}_${strategyKey}_${this.AGGREGATION_STRATEGY_VERSION}`;
    
    console.log(`🔑 [CACHE SERVICE] Generated cache key:`, {
      mode,
      startDate: startDate.toISOString(),
      aggregationStrategy: strategyKey,
      version: this.AGGREGATION_STRATEGY_VERSION,
      finalKey: versionedKey
    });
    
    return versionedKey;
  }

  /**
   * Get cached demand matrix data with aggregation strategy validation
   * ENHANCED: Validates aggregation strategy matches and logs cache decisions
   */
  static getCachedData(cacheKey: string, expectedAggregationStrategy?: 'skill-based' | 'staff-based'): DemandMatrixData | null {
    console.log(`💾 [CACHE SERVICE] ========= CACHE LOOKUP =========`);
    console.log(`💾 [CACHE SERVICE] Looking for cache key: ${cacheKey}`);
    console.log(`💾 [CACHE SERVICE] Expected aggregation strategy: ${expectedAggregationStrategy || 'skill-based'}`);
    console.log(`💾 [CACHE SERVICE] Available cache keys:`, Array.from(this.cache.keys()));
    
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      console.log(`❌ [CACHE SERVICE] CACHE MISS - No entry found for key: ${cacheKey}`);
      return null;
    }
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      console.log(`⏰ [CACHE SERVICE] CACHE EXPIRED - Removing expired entry`);
      this.cache.delete(cacheKey);
      return null;
    }
    
    // Validate aggregation strategy matches
    if (expectedAggregationStrategy && cached.aggregationStrategy !== expectedAggregationStrategy) {
      console.log(`🚫 [CACHE SERVICE] AGGREGATION STRATEGY MISMATCH - Invalidating cache entry:`, {
        cachedStrategy: cached.aggregationStrategy,
        expectedStrategy: expectedAggregationStrategy,
        action: 'CACHE_INVALIDATED'
      });
      this.cache.delete(cacheKey);
      return null;
    }
    
    console.log(`✅ [CACHE SERVICE] CACHE HIT - Valid entry found:`, {
      aggregationStrategy: cached.data.aggregationStrategy,
      dataPoints: cached.data.dataPoints.length,
      cacheAge: Date.now() - cached.timestamp,
      action: 'CACHE_HIT'
    });
    
    return cached.data;
  }

  /**
   * Cache demand matrix data with aggregation strategy tracking
   * ENHANCED: Stores aggregation strategy for validation and logs cache operations
   */
  static setCachedData(cacheKey: string, data: DemandMatrixData): void {
    console.log(`💾 [CACHE SERVICE] ========= CACHE STORE =========`);
    console.log(`💾 [CACHE SERVICE] Storing cache entry:`, {
      cacheKey,
      aggregationStrategy: data.aggregationStrategy,
      dataPoints: data.dataPoints.length,
      timestamp: new Date().toISOString()
    });
    
    // Simple LRU: remove oldest if cache is getting large
    if (this.cache.size >= 10) {
      const oldestKey = Array.from(this.cache.keys())[0];
      console.log(`🧹 [CACHE SERVICE] Cache size limit reached, removing oldest entry: ${oldestKey}`);
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      aggregationStrategy: data.aggregationStrategy
    });
    
    console.log(`✅ [CACHE SERVICE] Cache entry stored successfully, total entries: ${this.cache.size}`);
  }

  /**
   * Clear demand matrix cache with optional strategy-based filtering
   * ENHANCED: Can clear specific aggregation strategy entries or all entries
   */
  static clearCache(aggregationStrategy?: 'skill-based' | 'staff-based'): void {
    console.log(`🧹 [CACHE SERVICE] ========= CACHE CLEAR =========`);
    
    if (aggregationStrategy) {
      console.log(`🧹 [CACHE SERVICE] Clearing cache entries for strategy: ${aggregationStrategy}`);
      let removedCount = 0;
      
      for (const [key, entry] of this.cache.entries()) {
        if (entry.aggregationStrategy === aggregationStrategy || 
            key.includes(aggregationStrategy) ||
            (aggregationStrategy === 'staff-based' && key.includes('staff'))) {
          this.cache.delete(key);
          removedCount++;
          console.log(`🗑️ [CACHE SERVICE] Removed cache entry: ${key}`);
        }
      }
      
      console.log(`✅ [CACHE SERVICE] Cleared ${removedCount} entries for strategy: ${aggregationStrategy}`);
    } else {
      const previousSize = this.cache.size;
      this.cache.clear();
      console.log(`✅ [CACHE SERVICE] Cleared all ${previousSize} cache entries`);
    }
    
    debugLog('Demand matrix cache cleared', { aggregationStrategy, remainingEntries: this.cache.size });
  }

  /**
   * Force clear staff-based aggregation cache entries
   * CRITICAL: Ensures old skill-based cached data doesn't interfere with staff aggregation
   */
  static forceInvalidateStaffAggregationCache(): void {
    console.log(`🚨 [CACHE SERVICE] ========= FORCE INVALIDATING STAFF AGGREGATION CACHE =========`);
    
    const keysToRemove: string[] = [];
    
    // Find all keys that might contain old staff aggregation data
    for (const [key, entry] of this.cache.entries()) {
      const shouldRemove = 
        key.includes('staff') || 
        key.includes('staff-based') ||
        entry.aggregationStrategy === 'staff-based' ||
        (entry.data.aggregationStrategy && entry.data.aggregationStrategy.includes('staff'));
      
      if (shouldRemove) {
        keysToRemove.push(key);
      }
    }
    
    console.log(`🗑️ [CACHE SERVICE] Found ${keysToRemove.length} staff-related cache entries to remove:`, keysToRemove);
    
    keysToRemove.forEach(key => {
      this.cache.delete(key);
      console.log(`🗑️ [CACHE SERVICE] Removed staff cache entry: ${key}`);
    });
    
    console.log(`✅ [CACHE SERVICE] Force invalidation complete, removed ${keysToRemove.length} entries`);
  }

  /**
   * Get cache statistics with enhanced debugging
   */
  static getCacheStats() {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      aggregationStrategy: entry.aggregationStrategy,
      dataAggregationStrategy: entry.data.aggregationStrategy,
      age: Date.now() - entry.timestamp,
      dataPoints: entry.data.dataPoints.length,
      expired: (Date.now() - entry.timestamp) > this.CACHE_TTL
    }));

    console.log(`📊 [CACHE SERVICE] Cache Statistics:`, {
      totalEntries: this.cache.size,
      version: this.AGGREGATION_STRATEGY_VERSION,
      entries
    });

    return {
      size: this.cache.size,
      version: this.AGGREGATION_STRATEGY_VERSION,
      keys: Array.from(this.cache.keys()),
      entries,
      timestamps: Array.from(this.cache.values()).map(v => v.timestamp)
    };
  }
}
