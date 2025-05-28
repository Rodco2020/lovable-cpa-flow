
import { useQuery } from '@tanstack/react-query';
import { getClientDashboardStats, ClientDashboardStats } from '@/services/client/clientDashboardService';

/**
 * Custom hook for fetching and managing client dashboard statistics
 * 
 * Provides real-time client metrics including counts, revenue, and engagements
 * with automatic caching and error handling.
 */
export const useClientDashboardStats = () => {
  return useQuery<ClientDashboardStats, Error>({
    queryKey: ['clientDashboardStats'],
    queryFn: getClientDashboardStats,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
