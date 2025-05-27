
import { ClientDetailReportData, ClientReportFilters } from '@/types/clientReporting';
import { reportingDataService } from './reportingDataService';
import { reportCache } from '@/services/cacheService';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';
import { dataValidationService } from '@/services/dataValidationService';
import { logError } from '@/services/errorLoggingService';

/**
 * Optimized Client Detail Report Service
 * 
 * Integrates caching, performance monitoring, and validation
 * for production-ready client detail reports
 */

export const getOptimizedClientDetailReport = async (
  clientId: string, 
  filters: ClientReportFilters
): Promise<ClientDetailReportData> => {
  // Validate input parameters
  if (!clientId?.trim()) {
    throw new Error('Client ID is required');
  }

  const cacheKey = `client-detail:${clientId}:${JSON.stringify(filters)}`;
  
  return await performanceMonitoringService.timeAsync(
    'client-detail-report-generation',
    'OptimizedClientDetailReportService',
    async () => {
      return await reportCache.getOrSet(
        cacheKey,
        async () => {
          // Validate client exists before processing
          const validation = await dataValidationService.validateClientReference(clientId);
          if (!validation) {
            throw new Error(`Invalid client reference: ${clientId}`);
          }

          return await reportingDataService.getClientReportData(clientId, filters);
        },
        15 * 60 * 1000 // 15 minutes cache for reports
      );
    },
    { clientId, filtersApplied: Object.keys(filters).length }
  );
};

export const getClientsList = async (): Promise<Array<{ id: string; legalName: string }>> => {
  return await performanceMonitoringService.timeAsync(
    'clients-list-fetch',
    'OptimizedClientDetailReportService',
    async () => {
      return await reportCache.getOrSet(
        'clients-list-active',
        async () => {
          const { data, error } = await supabase
            .from('clients')
            .select('id, legal_name')
            .eq('status', 'Active')
            .order('legal_name');

          if (error) {
            logError('Failed to fetch clients list', 'error', {
              component: 'OptimizedClientDetailReportService',
              details: error.message
            });
            throw error;
          }

          return data.map(client => ({
            id: client.id,
            legalName: client.legal_name
          }));
        },
        10 * 60 * 1000 // 10 minutes cache for client list
      );
    }
  );
};

/**
 * Clear report cache for a specific client
 */
export const invalidateClientReportCache = (clientId: string): void => {
  const pattern = new RegExp(`^client-detail:${clientId}:`);
  const deletedCount = reportCache.invalidatePattern(pattern);
  console.log(`Invalidated ${deletedCount} cache entries for client ${clientId}`);
};

/**
 * Warm up cache with commonly accessed reports
 */
export const warmUpReportCache = async (): Promise<void> => {
  try {
    const clients = await getClientsList();
    const popularClients = clients.slice(0, 5); // Warm up top 5 clients
    
    const defaultFilters: ClientReportFilters = {
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date()
      },
      taskTypes: [],
      status: [],
      categories: [],
      includeCompleted: true
    };

    const warmUpTasks = popularClients.map(client => ({
      key: `client-detail:${client.id}:${JSON.stringify(defaultFilters)}`,
      loader: () => reportingDataService.getClientReportData(client.id, defaultFilters),
      ttl: 15 * 60 * 1000
    }));

    await reportCache.warmUp(warmUpTasks);
  } catch (error) {
    logError('Report cache warm-up failed', 'warning', {
      component: 'OptimizedClientDetailReportService',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Import supabase for the clients list query
import { supabase } from '@/lib/supabaseClient';
