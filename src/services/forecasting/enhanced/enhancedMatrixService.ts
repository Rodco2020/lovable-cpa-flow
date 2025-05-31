
import { SkillType } from '@/types/task';
import { debugLog } from '../logger';
import { MatrixData } from '../matrixUtils';
import { CapacityReport } from '../reports/capacityReportGenerator';

// Import refactored modules
import { EnhancedMatrixOptions, EnhancedMatrixResult, ExportOptions } from './types';
import { MatrixDataLoader } from './dataLoader';
import { AnalyticsProcessor } from './analyticsProcessor';
import { EnhancedCacheManager } from './cacheManager';
import { ExportManager } from './exportManager';
import { DrillDownProvider } from './drillDownProvider';
import { ReportGenerator } from './reportGenerator';

/**
 * Enhanced Matrix Service (Refactored)
 * 
 * Main orchestration service for matrix data operations with caching, analytics, and export capabilities.
 * This service has been refactored for better maintainability while preserving all existing functionality.
 * 
 * Key Features:
 * - Matrix data generation with virtual/actual forecasts
 * - Advanced analytics including trends, recommendations, and alerts
 * - Intelligent caching with LRU eviction
 * - Export capabilities (CSV, JSON, reports)
 * - Drill-down data retrieval
 * - Performance monitoring and metrics
 */
export class EnhancedMatrixService {
  /**
   * Get complete matrix data with analytics
   * 
   * This is the main entry point for enhanced matrix functionality.
   * Provides comprehensive matrix data with optional analytics and caching.
   */
  static async getEnhancedMatrixData(
    forecastType: 'virtual' | 'actual' = 'virtual',
    options: EnhancedMatrixOptions = {}
  ): Promise<EnhancedMatrixResult> {
    const startTime = Date.now();
    const { includeAnalytics = true, useCache = true, progressCallback } = options;
    
    debugLog('Getting enhanced matrix data', { forecastType, includeAnalytics, useCache });
    
    progressCallback?.(10);

    // Check cache first
    if (useCache) {
      const cached = EnhancedCacheManager.getCachedResult(forecastType, includeAnalytics);
      if (cached) {
        progressCallback?.(100);
        return {
          ...cached,
          performance: {
            ...cached.performance,
            renderTime: Date.now() - startTime
          }
        };
      }
    }

    progressCallback?.(30);

    // Load fresh data
    const dataLoadStart = Date.now();
    const { matrixData } = await MatrixDataLoader.loadMatrixData(forecastType);
    const dataLoadTime = Date.now() - dataLoadStart;
    
    progressCallback?.(60);

    // Run analytics if requested
    let trends: any[] = [];
    let recommendations: any[] = [];
    let alerts: any[] = [];

    if (includeAnalytics) {
      const analyticsResult = await AnalyticsProcessor.runAnalytics(matrixData);
      trends = analyticsResult.trends;
      recommendations = analyticsResult.recommendations;
      alerts = analyticsResult.alerts;
      
      progressCallback?.(90);
    }

    // Cache the results
    EnhancedCacheManager.setCachedResult(forecastType, includeAnalytics, {
      matrixData,
      trends,
      recommendations,
      alerts
    });
    
    progressCallback?.(100);

    const result: EnhancedMatrixResult = {
      matrixData,
      trends,
      recommendations,
      alerts,
      performance: {
        dataLoadTime,
        analysisTime: includeAnalytics ? Date.now() - (dataLoadStart + dataLoadTime) : 0,
        renderTime: Date.now() - startTime,
        totalCells: matrixData.dataPoints.length,
        cacheHit: false
      }
    };

    debugLog('Enhanced matrix data generated', result.performance);
    return result;
  }

  /**
   * Get drill-down data with caching support
   */
  static async getDrillDownData(
    skill: SkillType, 
    month: string,
    matrixData?: MatrixData
  ) {
    return DrillDownProvider.getDrillDownData(skill, month, matrixData);
  }

  /**
   * Export Functions
   */
  static generateCSVExport(
    matrixData: MatrixData,
    selectedSkills: SkillType[],
    monthRange: { start: number; end: number },
    includeAnalytics = false,
    trends?: any[],
    alerts?: any[]
  ): string {
    const options: ExportOptions = {
      selectedSkills,
      monthRange,
      includeAnalytics,
      trends,
      alerts
    };
    return ExportManager.generateCSVExport(matrixData, options);
  }

  static generateJSONExport(
    matrixData: MatrixData,
    selectedSkills: SkillType[],
    monthRange: { start: number; end: number },
    includeAnalytics = false,
    trends?: any[],
    alerts?: any[]
  ): string {
    const options: ExportOptions = {
      selectedSkills,
      monthRange,
      includeAnalytics,
      trends,
      alerts
    };
    return ExportManager.generateJSONExport(matrixData, options);
  }

  /**
   * Generate capacity planning report
   */
  static generateCapacityReport(
    matrixData: MatrixData,
    trends: any[],
    recommendations: any[],
    alerts: any[]
  ): CapacityReport {
    return ReportGenerator.generateCapacityReport(matrixData, trends, recommendations, alerts);
  }

  /**
   * Cache Management Functions
   */
  static clearCache(forecastType?: 'virtual' | 'actual'): void {
    EnhancedCacheManager.clearCache(forecastType);
  }

  static getCacheStats() {
    return EnhancedCacheManager.getCacheStats();
  }
}
