
import { MatrixData } from './matrixUtils';
import { 
  AdvancedAnalyticsService,
  TrendAnalysis,
  CapacityRecommendation,
  ThresholdAlert,
  DrillDownData
} from './analyticsService';
import { debugLog } from './logger';
import { SkillType } from '@/types/task';
import { MatrixCacheManager, PerformanceMetrics } from './cache/matrixCacheManager';
import { MatrixExportUtils } from './export/matrixExportUtils';
import { CapacityReportGenerator, CapacityReport } from './reports/capacityReportGenerator';

/**
 * Enhanced Matrix Service
 * Main service for matrix data operations with caching, analytics, and export capabilities
 */
export class EnhancedMatrixService {
  /**
   * Get complete matrix data with analytics
   */
  static async getEnhancedMatrixData(
    forecastType: 'virtual' | 'actual' = 'virtual',
    options: {
      includeAnalytics?: boolean;
      useCache?: boolean;
      progressCallback?: (progress: number) => void;
    } = {}
  ): Promise<{
    matrixData: MatrixData;
    trends: TrendAnalysis[];
    recommendations: CapacityRecommendation[];
    alerts: ThresholdAlert[];
    performance: PerformanceMetrics;
  }> {
    const startTime = Date.now();
    const { includeAnalytics = true, useCache = true, progressCallback } = options;
    
    debugLog('Getting enhanced matrix data', { forecastType, includeAnalytics, useCache });
    
    progressCallback?.(10);

    // Check cache first
    if (useCache) {
      const cached = MatrixCacheManager.getCachedData(forecastType, includeAnalytics);
      if (cached) {
        progressCallback?.(100);
        
        return {
          matrixData: cached.data,
          trends: cached.trends,
          recommendations: cached.recommendations,
          alerts: cached.alerts,
          performance: {
            dataLoadTime: 0,
            analysisTime: 0,
            renderTime: Date.now() - startTime,
            totalCells: cached.data.dataPoints.length,
            cacheHit: true
          }
        };
      }
    }

    progressCallback?.(30);

    // Load fresh data
    const dataLoadStart = Date.now();
    const { matrixData } = await this.loadMatrixData(forecastType);
    const dataLoadTime = Date.now() - dataLoadStart;
    
    progressCallback?.(60);

    let trends: TrendAnalysis[] = [];
    let recommendations: CapacityRecommendation[] = [];
    let alerts: ThresholdAlert[] = [];

    if (includeAnalytics) {
      const analyticsResult = await this.runAnalytics(matrixData);
      trends = analyticsResult.trends;
      recommendations = analyticsResult.recommendations;
      alerts = analyticsResult.alerts;
      
      progressCallback?.(90);
    }

    // Cache the results
    MatrixCacheManager.setCachedData(forecastType, includeAnalytics, {
      data: matrixData,
      trends,
      recommendations,
      alerts
    });
    
    progressCallback?.(100);

    const performance: PerformanceMetrics = {
      dataLoadTime,
      analysisTime: includeAnalytics ? Date.now() - (dataLoadStart + dataLoadTime) : 0,
      renderTime: Date.now() - startTime,
      totalCells: matrixData.dataPoints.length,
      cacheHit: false
    };

    debugLog('Enhanced matrix data generated', performance);

    return {
      matrixData,
      trends,
      recommendations,
      alerts,
      performance
    };
  }

  /**
   * Get drill-down data with caching
   */
  static async getDrillDownData(
    skill: SkillType, 
    month: string,
    matrixData?: MatrixData
  ): Promise<DrillDownData> {
    debugLog(`Getting drill-down data for ${skill} in ${month}`);
    
    // Use provided matrix data or get from cache
    if (!matrixData) {
      const cached = this.findCachedMatrixData(skill);
      if (!cached) {
        throw new Error('No matrix data available for drill-down');
      }
      matrixData = cached.data;
    }

    return AdvancedAnalyticsService.getDrillDownData(matrixData, skill, month);
  }

  /**
   * Generate CSV export data
   */
  static generateCSVExport(
    matrixData: MatrixData,
    selectedSkills: SkillType[],
    monthRange: { start: number; end: number },
    includeAnalytics = false,
    trends?: TrendAnalysis[],
    alerts?: ThresholdAlert[]
  ): string {
    return MatrixExportUtils.generateCSVExport(
      matrixData,
      selectedSkills,
      monthRange,
      includeAnalytics,
      trends,
      alerts
    );
  }

  /**
   * Generate JSON export data
   */
  static generateJSONExport(
    matrixData: MatrixData,
    selectedSkills: SkillType[],
    monthRange: { start: number; end: number },
    includeAnalytics = false,
    trends?: TrendAnalysis[],
    alerts?: ThresholdAlert[]
  ): string {
    return MatrixExportUtils.generateJSONExport(
      matrixData,
      selectedSkills,
      monthRange,
      includeAnalytics,
      trends,
      alerts
    );
  }

  /**
   * Generate capacity planning report
   */
  static generateCapacityReport(
    matrixData: MatrixData,
    trends: TrendAnalysis[],
    recommendations: CapacityRecommendation[],
    alerts: ThresholdAlert[]
  ): CapacityReport {
    return CapacityReportGenerator.generateCapacityReport(
      matrixData,
      trends,
      recommendations,
      alerts
    );
  }

  /**
   * Clear cache for specific forecast type or all
   */
  static clearCache(forecastType?: 'virtual' | 'actual'): void {
    MatrixCacheManager.clearCache(forecastType);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return MatrixCacheManager.getCacheStats();
  }

  /**
   * Private helper methods
   */
  private static async loadMatrixData(forecastType: 'virtual' | 'actual'): Promise<{ matrixData: MatrixData }> {
    // Import the matrix service here to avoid circular dependencies
    const { generateMatrixForecast } = await import('./matrixService');
    return generateMatrixForecast(forecastType);
  }

  private static async runAnalytics(matrixData: MatrixData): Promise<{
    trends: TrendAnalysis[];
    recommendations: CapacityRecommendation[];
    alerts: ThresholdAlert[];
  }> {
    const analysisStart = Date.now();
    
    // Run analytics
    const trends = AdvancedAnalyticsService.analyzeTrends(matrixData);
    const recommendations = AdvancedAnalyticsService.generateRecommendations(matrixData, trends);
    const alerts = AdvancedAnalyticsService.generateAlerts(matrixData);
    
    debugLog('Analytics completed', {
      trendsCount: trends.length,
      recommendationsCount: recommendations.length,
      alertsCount: alerts.length,
      analysisTime: Date.now() - analysisStart
    });
    
    return { trends, recommendations, alerts };
  }

  private static findCachedMatrixData(skill: SkillType) {
    const cacheStats = MatrixCacheManager.getCacheStats();
    return cacheStats.entries.length > 0 ? MatrixCacheManager.getCachedData('virtual', true) : null;
  }
}
