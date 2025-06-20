
/**
 * Preferred Staff Cache Invalidation Service
 * 
 * Phase 3: Automatic cache refresh on data changes
 * 
 * This service automatically invalidates and refreshes the preferred staff cache
 * when relevant data changes occur, ensuring the UI always shows current data.
 */

import { clearPreferredStaffCache, refreshPreferredStaffCache } from './preferredStaffDataService';
import { clearStaffOptionsCache, refreshStaffOptionsCache } from './staffDropdownService';

/**
 * Cache invalidation event types
 */
export type CacheInvalidationEvent = 
  | 'recurring_task_preferred_staff_updated'
  | 'recurring_task_created'
  | 'recurring_task_deleted'
  | 'staff_updated'
  | 'staff_deleted'
  | 'manual_refresh';

/**
 * Cache invalidation statistics
 */
interface CacheInvalidationStats {
  totalInvalidations: number;
  lastInvalidation: Date | null;
  invalidationsByEvent: Record<CacheInvalidationEvent, number>;
}

/**
 * In-memory stats tracking
 */
let cacheStats: CacheInvalidationStats = {
  totalInvalidations: 0,
  lastInvalidation: null,
  invalidationsByEvent: {
    recurring_task_preferred_staff_updated: 0,
    recurring_task_created: 0,
    recurring_task_deleted: 0,
    staff_updated: 0,
    staff_deleted: 0,
    manual_refresh: 0
  }
};

/**
 * Invalidate preferred staff cache due to data changes
 */
export const invalidatePreferredStaffCache = async (
  event: CacheInvalidationEvent,
  context?: {
    recurringTaskId?: string;
    staffId?: string;
    previousStaffId?: string;
    newStaffId?: string;
  }
): Promise<void> => {
  try {
    console.log('🔄 [CACHE INVALIDATION] Phase 3 - Invalidating preferred staff cache:', {
      event,
      context,
      timestamp: new Date().toISOString()
    });

    // Clear both caches
    clearPreferredStaffCache();
    clearStaffOptionsCache();

    // Update statistics
    cacheStats.totalInvalidations++;
    cacheStats.lastInvalidation = new Date();
    cacheStats.invalidationsByEvent[event]++;

    // Optionally pre-warm the cache for better user experience
    if (shouldPreWarmCache(event)) {
      console.log('🔥 [CACHE INVALIDATION] Phase 3 - Pre-warming cache after invalidation');
      
      // Pre-warm both caches in parallel
      await Promise.all([
        refreshPreferredStaffCache().catch(error => 
          console.warn('⚠️ [CACHE INVALIDATION] Failed to pre-warm preferred staff cache:', error)
        ),
        refreshStaffOptionsCache().catch(error => 
          console.warn('⚠️ [CACHE INVALIDATION] Failed to pre-warm staff options cache:', error)
        )
      ]);
    }

    console.log('✅ [CACHE INVALIDATION] Phase 3 - Cache invalidation completed:', {
      event,
      totalInvalidations: cacheStats.totalInvalidations
    });

  } catch (error) {
    console.error('❌ [CACHE INVALIDATION] Phase 3 - Cache invalidation failed:', error);
    throw error;
  }
};

/**
 * Determine if cache should be pre-warmed after invalidation
 */
const shouldPreWarmCache = (event: CacheInvalidationEvent): boolean => {
  // Pre-warm for events that are likely to be followed by immediate UI updates
  const preWarmEvents: CacheInvalidationEvent[] = [
    'recurring_task_preferred_staff_updated',
    'recurring_task_created',
    'manual_refresh'
  ];
  
  return preWarmEvents.includes(event);
};

/**
 * Invalidate cache when recurring task preferred staff is updated
 */
export const invalidateOnRecurringTaskPreferredStaffUpdate = async (
  recurringTaskId: string,
  previousStaffId?: string,
  newStaffId?: string
): Promise<void> => {
  await invalidatePreferredStaffCache('recurring_task_preferred_staff_updated', {
    recurringTaskId,
    previousStaffId,
    newStaffId
  });
};

/**
 * Invalidate cache when recurring task is created with preferred staff
 */
export const invalidateOnRecurringTaskCreated = async (
  recurringTaskId: string,
  preferredStaffId?: string
): Promise<void> => {
  if (preferredStaffId) {
    await invalidatePreferredStaffCache('recurring_task_created', {
      recurringTaskId,
      newStaffId: preferredStaffId
    });
  }
};

/**
 * Invalidate cache when recurring task with preferred staff is deleted
 */
export const invalidateOnRecurringTaskDeleted = async (
  recurringTaskId: string,
  preferredStaffId?: string
): Promise<void> => {
  if (preferredStaffId) {
    await invalidatePreferredStaffCache('recurring_task_deleted', {
      recurringTaskId,
      previousStaffId: preferredStaffId
    });
  }
};

/**
 * Invalidate cache when staff member is updated
 */
export const invalidateOnStaffUpdated = async (staffId: string): Promise<void> => {
  await invalidatePreferredStaffCache('staff_updated', { staffId });
};

/**
 * Invalidate cache when staff member is deleted
 */
export const invalidateOnStaffDeleted = async (staffId: string): Promise<void> => {
  await invalidatePreferredStaffCache('staff_deleted', { staffId });
};

/**
 * Manual cache refresh (for user-triggered refreshes)
 */
export const manualCacheRefresh = async (): Promise<void> => {
  await invalidatePreferredStaffCache('manual_refresh');
};

/**
 * Get cache invalidation statistics
 */
export const getCacheInvalidationStats = (): CacheInvalidationStats => {
  return { ...cacheStats };
};

/**
 * Reset cache invalidation statistics
 */
export const resetCacheInvalidationStats = (): void => {
  cacheStats = {
    totalInvalidations: 0,
    lastInvalidation: null,
    invalidationsByEvent: {
      recurring_task_preferred_staff_updated: 0,
      recurring_task_created: 0,
      recurring_task_deleted: 0,
      staff_updated: 0,
      staff_deleted: 0,
      manual_refresh: 0
    }
  };
};

/**
 * Batch invalidation for multiple events
 */
export const batchInvalidatePreferredStaffCache = async (
  events: Array<{
    event: CacheInvalidationEvent;
    context?: {
      recurringTaskId?: string;
      staffId?: string;
      previousStaffId?: string;
      newStaffId?: string;
    };
  }>
): Promise<void> => {
  if (events.length === 0) return;

  console.log('🔄 [CACHE INVALIDATION] Phase 3 - Batch invalidation started:', {
    eventCount: events.length,
    events: events.map(e => e.event)
  });

  // Clear caches once for all events
  clearPreferredStaffCache();
  clearStaffOptionsCache();

  // Update statistics for all events
  events.forEach(({ event }) => {
    cacheStats.totalInvalidations++;
    cacheStats.invalidationsByEvent[event]++;
  });
  
  cacheStats.lastInvalidation = new Date();

  // Pre-warm if any event requires it
  const shouldPreWarm = events.some(({ event }) => shouldPreWarmCache(event));
  
  if (shouldPreWarm) {
    console.log('🔥 [CACHE INVALIDATION] Phase 3 - Pre-warming cache after batch invalidation');
    
    await Promise.all([
      refreshPreferredStaffCache().catch(error => 
        console.warn('⚠️ [CACHE INVALIDATION] Failed to pre-warm preferred staff cache:', error)
      ),
      refreshStaffOptionsCache().catch(error => 
        console.warn('⚠️ [CACHE INVALIDATION] Failed to pre-warm staff options cache:', error)
      )
    ]);
  }

  console.log('✅ [CACHE INVALIDATION] Phase 3 - Batch invalidation completed');
};
