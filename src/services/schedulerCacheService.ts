
// Define a generic cache item with expiration functionality
interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiry: number | null; // null means no expiration
}

// Generic in-memory cache
class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Set an item in the cache with optional expiration time
   */
  set<T>(key: string, value: T, expiryMs: number | null = null): void {
    const timestamp = Date.now();
    this.cache.set(key, {
      value,
      timestamp,
      expiry: expiryMs ? timestamp + expiryMs : null
    });
  }
  
  /**
   * Get an item from the cache
   * Returns undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value as T;
  }
  
  /**
   * Check if an item exists in the cache and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Remove an item from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clear all expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
      }
    });
  }
  
  /**
   * Get all keys in the cache (excluding expired items)
   */
  keys(): string[] {
    this.clearExpired();
    return Array.from(this.cache.keys());
  }
  
  /**
   * Return the size of the cache (excluding expired items)
   */
  size(): number {
    this.clearExpired();
    return this.cache.size;
  }
}

// Create instances for various cache types
export const staffCache = new MemoryCache();
export const taskCache = new MemoryCache();
export const recommendationCache = new MemoryCache();

// Default expiration times
export const DEFAULT_CACHE_DURATION = {
  STAFF: 5 * 60 * 1000, // 5 minutes
  TASKS: 2 * 60 * 1000, // 2 minutes
  RECOMMENDATIONS: 3 * 60 * 1000 // 3 minutes
};

// Utilities for common cache operations

/**
 * Generate a cache key based on query parameters
 */
export const generateCacheKey = (base: string, params: Record<string, any> = {}): string => {
  const sortedParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  
  const paramString = sortedParams.length
    ? sortedParams
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join('&')
    : '';
  
  return paramString ? `${base}?${paramString}` : base;
};

/**
 * Clear all scheduler-related caches
 */
export const clearAllCaches = (): void => {
  staffCache.clear();
  taskCache.clear();
  recommendationCache.clear();
  console.log("[Cache] All scheduler caches cleared");
};

/**
 * Clear expired entries from all caches
 */
export const clearExpiredCaches = (): void => {
  staffCache.clearExpired();
  taskCache.clearExpired();
  recommendationCache.clearExpired();
  console.log("[Cache] Expired cache entries cleared");
};

export default {
  staffCache,
  taskCache,
  recommendationCache,
  DEFAULT_CACHE_DURATION,
  generateCacheKey,
  clearAllCaches,
  clearExpiredCaches
};
