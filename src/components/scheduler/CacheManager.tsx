
import { useEffect } from 'react';
import { clearAllCaches, clearExpiredCaches } from '@/services/schedulerCacheService';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook to manage cache operations for the scheduler
 */
export const useCacheManager = () => {
  // Periodically clean expired cache entries
  useEffect(() => {
    const intervalId = setInterval(() => {
      clearExpiredCaches();
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleRefreshAll = () => {
    // Clear all caches to force fresh data fetch
    clearAllCaches();
    
    // Show toast
    toast({
      title: "Data Refreshed",
      description: "All cached data has been cleared and will be refreshed.",
    });
  };
  
  return { handleRefreshAll };
};
