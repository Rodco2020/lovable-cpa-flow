// Import other dependencies as needed

// Track last cache operation timestamps to prevent frequent operations
let lastExpiredClearTime = 0;
let lastFullClearTime = 0;

const EXPIRED_CLEAR_COOLDOWN = 10000; // 10 seconds minimum between expired cache clears
const FULL_CLEAR_COOLDOWN = 5000; // 5 seconds minimum between full cache clears

// Store for various scheduler-related caches
const cacheStore = {
  staffSchedule: new Map(),
  unscheduledTasks: new Map(),
  recommendations: new Map(),
  // Add more caches as needed
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

// Other cache-related functions as needed
