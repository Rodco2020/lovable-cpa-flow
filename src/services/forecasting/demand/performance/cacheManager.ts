
/**
 * Cache Management Optimizer
 * Handles intelligent cache management with LRU eviction
 */

import { debugLog } from '../../logger';
import { CacheManagementOptions } from './types';
import { PERFORMANCE_CONSTANTS } from './constants';

export class CacheManager {
  /**
   * Intelligent cache management with LRU eviction
   */
  static manageCacheSize<T>(
    cache: Map<string, T>, 
    options: CacheManagementOptions = {}
  ): void {
    const { maxSize = PERFORMANCE_CONSTANTS.CACHE_SIZE_LIMIT, enableLogging = true } = options;
    
    if (cache.size <= maxSize) return;
    
    const entriesToRemove = cache.size - maxSize;
    const keys = Array.from(cache.keys());
    
    // Remove oldest entries (assuming insertion order)
    for (let i = 0; i < entriesToRemove; i++) {
      cache.delete(keys[i]);
    }
    
    if (enableLogging) {
      debugLog(`Cache trimmed: removed ${entriesToRemove} entries, now ${cache.size} items`);
    }
  }
}
