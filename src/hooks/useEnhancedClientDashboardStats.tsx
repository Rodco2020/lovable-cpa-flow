
import { useQuery } from '@tanstack/react-query';
import { getEnhancedClientDashboardStats } from '@/services/client/enhancedClientDashboardService';
import { ClientMetricsFilters, EnhancedClientDashboardStats } from '@/types/clientMetrics';

/**
 * Enhanced Client Dashboard Stats Hook - Phase 1
 * 
 * Provides both global and filtered dashboard statistics with optimized caching
 */
export const useEnhancedClientDashboardStats = (filters?: ClientMetricsFilters) => {
  // Create a stable query key that includes filter values
  const filtersKey = filters ? JSON.stringify(filters) : 'no-filters';
  
  return useQuery<EnhancedClientDashboardStats, Error>({
    queryKey: ['enhancedClientDashboardStats', filtersKey],
    queryFn: () => getEnhancedClientDashboardStats(filters),
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes (shorter for filtered data)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // Always enabled, filters are handled in the service
  });
};
