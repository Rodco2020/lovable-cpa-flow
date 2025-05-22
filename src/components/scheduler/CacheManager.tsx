
import { useEffect, useState } from 'react';
import { clearAllCaches, clearExpiredCaches } from '@/services/schedulerCacheService';
import { toast } from '@/services/toastService';

/**
 * Hook to manage cache operations for the scheduler
 */
export const useCacheManager = () => {
  const [lastClearTime, setLastClearTime] = useState<number>(0);
  const CACHE_CLEAR_COOLDOWN = 5000; // 5 seconds minimum between cache clears
  
  // Periodically clean expired cache entries
  useEffect(() => {
    const intervalId = setInterval(() => {
      clearExpiredCaches();
      // Note: We don't show toasts for automatic periodic cache clearing
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleRefreshAll = () => {
    const now = Date.now();
    
    // Prevent rapid successive cache clears
    if (now - lastClearTime < CACHE_CLEAR_COOLDOWN) {
      console.log('[Cache] Refresh operation throttled');
      return;
    }
    
    setLastClearTime(now);
    
    // Clear all caches to force fresh data fetch
    clearAllCaches();
    
    // Show toast
    toast.info("Data Refreshed", "All cached data has been cleared and will be refreshed.");
  };
  
  return { handleRefreshAll };
};
