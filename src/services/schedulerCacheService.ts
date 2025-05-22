
// Import other dependencies as needed
import { v4 as uuidv4 } from 'uuid';

// Cache durations (in milliseconds)
export const DEFAULT_CACHE_DURATION = {
  STAFF: 300000, // 5 minutes
  TASKS: 60000, // 1 minute
  RECOMMENDATIONS: 120000, // 2 minutes
  TIME_SLOTS: 30000 // 30 seconds
};

// Track last cache operation timestamps to prevent frequent operations
let lastExpiredClearTime = 0;
let lastFullClearTime = 0;

const EXPIRED_CLEAR_COOLDOWN = 10000; // 10 seconds minimum between expired cache clears
const FULL_CLEAR_COOLDOWN = 5000; // 5 seconds minimum between full cache clears

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  expiry: number; // Timestamp when this entry expires
}

// Cache store class with proper typing and expiry management
export class CacheStore<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  
  // Set a value in the cache with an expiration time
  set(key: string, value: T, ttl: number): void {
    const expiry = Date.now() + ttl;
    this.store.set(key, { data: value, expiry });
  }
  
  // Get a value from the cache, return null if expired or not found
  get<R = T>(key: string): R | null {
    const entry = this.store.get(key);
    
    if (!entry) return null;
    
    // Check if the entry has expired
    if (entry.expiry < Date.now()) {
      this.delete(key);
      return null;
    }
    
    return entry.data as unknown as R;
  }
  
  // Check if a key exists and is not expired
  has(key: string): boolean {
    const entry = this.store.get(key);
    
    if (!entry) return false;
    
    // Check if the entry has expired
    if (entry.expiry < Date.now()) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  // Delete a key from the cache
  delete(key: string): boolean {
    return this.store.delete(key);
  }
  
  // Clear all entries from the cache
  clear(): void {
    this.store.clear();
  }
  
  // Get all keys in the cache
  keys(): string[] {
    return Array.from(this.store.keys());
  }
  
  // Get all valid (non-expired) entries in the cache
  entries(): [string, T][] {
    const now = Date.now();
    const validEntries: [string, T][] = [];
    
    this.store.forEach((entry, key) => {
      if (entry.expiry >= now) {
        validEntries.push([key, entry.data]);
      }
    });
    
    return validEntries;
  }
}

// Store for various scheduler-related caches
export const staffCache = new CacheStore<any>();
export const taskCache = new CacheStore<any>();
export const recommendationCache = new CacheStore<any>();
export const timeSlotCache = new CacheStore<any>();

const cacheStore = {
  staffSchedule: new Map(),
  unscheduledTasks: new Map(),
  recommendations: new Map(),
  // Add more caches as needed
};

/**
 * Generate a cache key with optional parameters
 */
export const generateCacheKey = (baseKey: string, params?: Record<string, any>): string => {
  if (!params) return baseKey;
  
  const paramString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');
  
  return paramString ? `${baseKey}?${paramString}` : baseKey;
};

/**
 * Clear all cached data to force fresh fetches
 */
export const clearAllCaches = () => {
  const now = Date.now();
  
  // Prevent rapid successive full cache clears
  if (now - lastFullClearTime < FULL_CLEAR_COOLDOWN) {
    console.log('[Cache] Full clear operation throttled');
    return;
  }
  
  lastFullClearTime = now;
  
  // Clear typed cache stores
  staffCache.clear();
  taskCache.clear();
  recommendationCache.clear();
  timeSlotCache.clear();
  
  // Clear legacy cache stores
  Object.values(cacheStore).forEach(cache => {
    if (cache instanceof Map) {
      cache.clear();
    }
  });
  
  console.log('[Cache] All caches cleared');
};

/**
 * Clear only expired cache entries
 */
export const clearExpiredCaches = () => {
  const now = Date.now();
  
  // Prevent rapid successive expired cache clears
  if (now - lastExpiredClearTime < EXPIRED_CLEAR_COOLDOWN) {
    console.log('[Cache] Expired clear operation throttled');
    return;
  }
  
  lastExpiredClearTime = now;
  
  let cleared = 0;
  
  // No need to manually clear from typed cache stores 
  // as they check expiration on access
  
  // Clean up legacy cache stores
  Object.values(cacheStore).forEach(cache => {
    if (cache instanceof Map) {
      cache.forEach((value, key) => {
        if (value.expiry && value.expiry < now) {
          cache.delete(key);
          cleared++;
        }
      });
    }
  });
  
  if (cleared > 0) {
    console.log(`[Cache] Cleared ${cleared} expired cache entries`);
  }
};
