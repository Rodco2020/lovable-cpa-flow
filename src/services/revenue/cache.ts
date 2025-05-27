
/**
 * Revenue Cache Manager
 * 
 * Handles caching for revenue calculations
 */

export class RevenueCacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly cacheTTL: number;

  constructor(cacheTTL: number) {
    this.cacheTTL = cacheTTL;
  }

  /**
   * Get data from cache
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set data in cache
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}
