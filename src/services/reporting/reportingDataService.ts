
/**
 * Centralized Reporting Data Service - Refactored
 * 
 * Aggregates and optimizes data fetching for all reporting needs
 * with caching, error handling, and performance monitoring
 */

import { ClientDetailReportData, ClientReportFilters } from '@/types/clientReporting';
import { StaffLiaisonReportData, ReportFilters } from '@/types/reporting';
import { logError } from '@/services/errorLoggingService';
import { ReportingCacheManager } from './cache';
import { ReportingDataAccess } from './dataAccess';
import { ReportingDataProcessor } from './dataProcessor';
import { ReportingPerformanceMonitor } from './performanceMonitor';

class ReportingDataService {
  private cache: ReportingCacheManager;
  private dataAccess: ReportingDataAccess;
  private processor: ReportingDataProcessor;
  private performanceMonitor: ReportingPerformanceMonitor;

  constructor() {
    this.cache = new ReportingCacheManager();
    this.dataAccess = new ReportingDataAccess();
    this.processor = new ReportingDataProcessor();
    this.performanceMonitor = new ReportingPerformanceMonitor();
  }

  /**
   * Get aggregated client data with optimized queries
   */
  async getClientReportData(clientId: string, filters: ClientReportFilters): Promise<ClientDetailReportData> {
    const cacheKey = this.cache.getCacheKey('client-report', { clientId, filters });
    const cached = this.cache.getFromCache<ClientDetailReportData>(cacheKey);
    
    if (cached) {
      console.log('Returning cached client report data');
      return cached;
    }

    try {
      return await this.performanceMonitor.trackPerformance(
        'client-report-generation',
        async () => {
          // Get client data with liaison in single query
          const clientData = await this.dataAccess.getClientWithLiaison(clientId);

          // Parallel data fetching for better performance
          const [recurringTasks, taskInstances] = await Promise.all([
            this.dataAccess.getRecurringTasks(clientId),
            this.dataAccess.getTaskInstances(clientId)
          ]);

          // Process and aggregate data
          const reportData = this.processor.processClientReportData(
            clientData,
            recurringTasks,
            taskInstances
          );

          this.cache.setCache(cacheKey, reportData);
          return reportData;
        },
        { clientReference: clientId, filtersApplied: Object.keys(filters).length }
      );
    } catch (error) {
      logError('Failed to generate client report', 'error', {
        component: 'ReportingDataService',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: { clientReference: clientId }
      });
      throw error;
    }
  }

  /**
   * Get staff liaison report with optimized aggregations
   */
  async getStaffLiaisonData(filters: ReportFilters): Promise<StaffLiaisonReportData> {
    const cacheKey = this.cache.getCacheKey('staff-liaison', filters);
    const cached = this.cache.getFromCache<StaffLiaisonReportData>(cacheKey);
    
    if (cached) {
      console.log('Returning cached staff liaison data');
      return cached;
    }

    try {
      return await this.performanceMonitor.trackPerformance(
        'staff-liaison-report-generation',
        async () => {
          const aggregatedData = await this.dataAccess.getStaffLiaisonSummary(filters);
          const reportData = this.processor.processStaffLiaisonData(aggregatedData);
          
          this.cache.setCache(cacheKey, reportData);
          return reportData;
        }
      );
    } catch (error) {
      logError('Failed to generate staff liaison report', 'error', {
        component: 'ReportingDataService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Clear cache for specific report type or all cache
   */
  clearCache(type?: string): void {
    this.cache.clearCache(type);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getCacheStats();
  }
}

export const reportingDataService = new ReportingDataService();
export default reportingDataService;

