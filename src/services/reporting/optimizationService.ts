/**
 * Optimization Service for Client Detail Reports
 * 
 * Provides performance optimization utilities and monitoring
 */

import { ClientReportFilters, ClientDetailReportData } from '@/types/clientReporting';

export interface PerformanceMetrics {
  queryTime: number;
  processingTime: number;
  totalTime: number;
  cacheHit: boolean;
  recordsProcessed: number;
  memoryUsage: number;
}

export interface OptimizationConfig {
  enableCaching: boolean;
  maxCacheAge: number; // milliseconds
  batchSize: number;
  timeoutMs: number;
  enableCompression: boolean;
}

export class ReportOptimizationService {
  private config: OptimizationConfig;
  private performanceLog: PerformanceMetrics[] = [];
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableCaching: true,
      maxCacheAge: 15 * 60 * 1000, // 15 minutes
      batchSize: 50,
      timeoutMs: 30000, // 30 seconds
      enableCompression: false,
      ...config
    };
  }

  /**
   * Generate cache key for report request
   */
  generateCacheKey(clientId: string, filters: ClientReportFilters): string {
    const filterHash = JSON.stringify({
      dateRange: {
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString()
      },
      taskTypes: filters.taskTypes.sort(),
      status: filters.status.sort(),
      categories: filters.categories.sort(),
      includeCompleted: filters.includeCompleted
    });

    return `client-report:${clientId}:${btoa(filterHash)}`;
  }

  /**
   * Get cached report data
   */
  getCachedReport(cacheKey: string): ClientDetailReportData | null {
    if (!this.config.enableCaching) return null;

    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache report data
   */
  setCachedReport(
    cacheKey: string, 
    data: ClientDetailReportData, 
    ttl: number = this.config.maxCacheAge
  ): void {
    if (!this.config.enableCaching) return;

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Clean up expired entries
    this.cleanupExpiredCache();
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Record performance metrics
   */
  recordPerformance(metrics: PerformanceMetrics): void {
    this.performanceLog.push({
      ...metrics,
      memoryUsage: process.memoryUsage().heapUsed
    });

    // Keep only last 1000 entries
    if (this.performanceLog.length > 1000) {
      this.performanceLog = this.performanceLog.slice(-1000);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageQueryTime: number;
    averageProcessingTime: number;
    averageTotalTime: number;
    cacheHitRate: number;
    totalRequests: number;
    slowQueries: PerformanceMetrics[];
  } {
    if (this.performanceLog.length === 0) {
      return {
        averageQueryTime: 0,
        averageProcessingTime: 0,
        averageTotalTime: 0,
        cacheHitRate: 0,
        totalRequests: 0,
        slowQueries: []
      };
    }

    const total = this.performanceLog.length;
    const cacheHits = this.performanceLog.filter(m => m.cacheHit).length;
    
    const avgQueryTime = this.performanceLog.reduce((sum, m) => sum + m.queryTime, 0) / total;
    const avgProcessingTime = this.performanceLog.reduce((sum, m) => sum + m.processingTime, 0) / total;
    const avgTotalTime = this.performanceLog.reduce((sum, m) => sum + m.totalTime, 0) / total;

    // Define slow queries as those taking more than 2 seconds
    const slowQueries = this.performanceLog.filter(m => m.totalTime > 2000);

    return {
      averageQueryTime: avgQueryTime,
      averageProcessingTime: avgProcessingTime,
      averageTotalTime: avgTotalTime,
      cacheHitRate: (cacheHits / total) * 100,
      totalRequests: total,
      slowQueries
    };
  }

  /**
   * Optimize filters for better performance
   */
  optimizeFilters(filters: ClientReportFilters): ClientReportFilters {
    const optimized = { ...filters };

    // Limit date range to reasonable bounds (max 2 years)
    const maxRange = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
    const currentRange = optimized.dateRange.to.getTime() - optimized.dateRange.from.getTime();

    if (currentRange > maxRange) {
      console.warn('Date range exceeds recommended maximum, limiting to 2 years');
      optimized.dateRange.from = new Date(optimized.dateRange.to.getTime() - maxRange);
    }

    // Remove duplicate filter values
    optimized.taskTypes = [...new Set(optimized.taskTypes)];
    optimized.status = [...new Set(optimized.status)];
    optimized.categories = [...new Set(optimized.categories)];

    return optimized;
  }

  /**
   * Check if request should be throttled
   */
  shouldThrottle(clientId: string): boolean {
    const recentRequests = this.performanceLog
      .filter(m => Date.now() - (m as any).timestamp < 60000) // Last minute
      .length;

    // Throttle if more than 30 requests per minute for same client
    return recentRequests > 30;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Report optimization cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    memoryUsage: number;
    hitRate: number;
  } {
    const size = this.cache.size;
    const memoryUsage = JSON.stringify([...this.cache.values()]).length;
    const stats = this.getPerformanceStats();

    return {
      size,
      memoryUsage,
      hitRate: stats.cacheHitRate
    };
  }

  /**
   * Preload commonly accessed data
   */
  async preloadCommonData(commonClientIds: string[]): Promise<void> {
    const defaultFilters: ClientReportFilters = {
      dateRange: {
        from: new Date(new Date().getFullYear(), 0, 1), // Start of current year
        to: new Date()
      },
      taskTypes: [],
      status: [],
      categories: [],
      includeCompleted: true
    };

    console.log(`Preloading data for ${commonClientIds.length} common clients`);
    
    // Note: In a real implementation, this would trigger actual data loading
    // For now, we just prepare cache keys
    commonClientIds.forEach(clientId => {
      const cacheKey = this.generateCacheKey(clientId, defaultFilters);
      console.log(`Prepared cache key for client ${clientId}: ${cacheKey}`);
    });
  }
}

// Export singleton instance
export const reportOptimizationService = new ReportOptimizationService();
