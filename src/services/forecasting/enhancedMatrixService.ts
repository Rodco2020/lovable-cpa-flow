
import { MatrixData, MatrixDataPoint } from './matrixUtils';
import { 
  AdvancedAnalyticsService,
  TrendAnalysis,
  CapacityRecommendation,
  ThresholdAlert,
  DrillDownData
} from './analyticsService';
import { debugLog } from './logger';
import { SkillType } from '@/types/task';

// Cache interface
interface MatrixCache {
  data: MatrixData;
  trends: TrendAnalysis[];
  recommendations: CapacityRecommendation[];
  alerts: ThresholdAlert[];
  generatedAt: Date;
  forecastType: 'virtual' | 'actual';
}

// Performance metrics
interface PerformanceMetrics {
  dataLoadTime: number;
  analysisTime: number;
  renderTime: number;
  totalCells: number;
  cacheHit: boolean;
}

export class EnhancedMatrixService {
  private static cache = new Map<string, MatrixCache>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 10;

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
    const cacheKey = this.getCacheKey(forecastType, includeAnalytics);
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.generatedAt.getTime() < this.CACHE_TTL) {
        debugLog('Using cached matrix data');
        progressCallback?.(100);
        
        return {
          ...cached,
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
    
    // Import the matrix service here to avoid circular dependencies
    const { generateMatrixForecast } = await import('./matrixService');
    const { matrixData } = await generateMatrixForecast(forecastType);
    
    const dataLoadTime = Date.now() - dataLoadStart;
    progressCallback?.(60);

    let trends: TrendAnalysis[] = [];
    let recommendations: CapacityRecommendation[] = [];
    let alerts: ThresholdAlert[] = [];

    if (includeAnalytics) {
      const analysisStart = Date.now();
      
      // Run analytics
      trends = AdvancedAnalyticsService.analyzeTrends(matrixData);
      recommendations = AdvancedAnalyticsService.generateRecommendations(matrixData, trends);
      alerts = AdvancedAnalyticsService.generateAlerts(matrixData);
      
      debugLog('Analytics completed', {
        trendsCount: trends.length,
        recommendationsCount: recommendations.length,
        alertsCount: alerts.length
      });
      
      progressCallback?.(90);
    }

    // Cache the results
    const cacheData: MatrixCache = {
      data: matrixData,
      trends,
      recommendations,
      alerts,
      generatedAt: new Date(),
      forecastType
    };

    this.updateCache(cacheKey, cacheData);
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
      const cached = Array.from(this.cache.values()).find(cache => 
        cache.data.skills.includes(skill)
      );
      
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
    debugLog('Generating CSV export');
    
    const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
    const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
    
    // Headers
    const headers = [
      'Skill',
      'Month',
      'Demand (Hours)',
      'Capacity (Hours)',
      'Gap (Hours)',
      'Utilization (%)',
      ...(includeAnalytics ? ['Trend', 'Alert Level'] : [])
    ];
    
    let csvData = headers.join(',') + '\n';
    
    // Data rows
    filteredSkills.forEach(skill => {
      filteredMonths.forEach(month => {
        const dataPoint = matrixData.dataPoints.find(
          point => point.skillType === skill && point.month === month.key
        );
        
        if (dataPoint) {
          const row = [
            `"${skill}"`,
            `"${month.label}"`,
            dataPoint.demandHours.toFixed(1),
            dataPoint.capacityHours.toFixed(1),
            dataPoint.gap.toFixed(1),
            dataPoint.utilizationPercent.toFixed(1)
          ];
          
          if (includeAnalytics) {
            const trend = trends?.find(t => t.skill === skill);
            const alert = alerts?.find(a => a.skill === skill && a.month === month.label);
            
            row.push(
              `"${trend?.trend || 'stable'}"`,
              `"${alert?.severity || 'none'}"`
            );
          }
          
          csvData += row.join(',') + '\n';
        }
      });
    });
    
    return csvData;
  }

  /**
   * Generate capacity planning report
   */
  static generateCapacityReport(
    matrixData: MatrixData,
    trends: TrendAnalysis[],
    recommendations: CapacityRecommendation[],
    alerts: ThresholdAlert[]
  ): {
    title: string;
    summary: string;
    sections: Array<{
      title: string;
      content: string;
      data?: any[];
    }>;
    generatedAt: Date;
  } {
    debugLog('Generating capacity planning report');
    
    const totalDemand = matrixData.totalDemand;
    const totalCapacity = matrixData.totalCapacity;
    const overallGap = totalCapacity - totalDemand;
    const overallUtilization = totalCapacity > 0 ? (totalDemand / totalCapacity) * 100 : 0;
    
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    const highPriorityRecs = recommendations.filter(rec => rec.priority === 'high');
    
    return {
      title: 'Capacity Planning Report',
      summary: `Overall utilization: ${overallUtilization.toFixed(1)}%. Gap: ${overallGap >= 0 ? '+' : ''}${overallGap.toFixed(0)} hours. ${criticalAlerts.length} critical alerts, ${highPriorityRecs.length} high-priority recommendations.`,
      sections: [
        {
          title: 'Executive Summary',
          content: `Total demand: ${totalDemand.toFixed(0)} hours. Total capacity: ${totalCapacity.toFixed(0)} hours. Overall gap: ${overallGap >= 0 ? 'surplus' : 'shortage'} of ${Math.abs(overallGap).toFixed(0)} hours.`
        },
        {
          title: 'Critical Issues',
          content: `${criticalAlerts.length} critical alerts requiring immediate attention.`,
          data: criticalAlerts.map(alert => ({
            skill: alert.skill,
            issue: alert.message,
            recommendation: alert.recommendation
          }))
        },
        {
          title: 'Capacity Recommendations',
          content: `${recommendations.length} recommendations for capacity optimization.`,
          data: recommendations.map(rec => ({
            skill: rec.skill,
            action: rec.type,
            priority: rec.priority,
            description: rec.description,
            timeline: rec.timeline
          }))
        },
        {
          title: 'Trend Analysis',
          content: `Analysis of demand trends across ${trends.length} skills.`,
          data: trends.map(trend => ({
            skill: trend.skill,
            trend: trend.trend,
            change: `${trend.trendPercent >= 0 ? '+' : ''}${trend.trendPercent.toFixed(1)}%`,
            prediction: `Next month: ${trend.prediction.nextMonth.toFixed(0)}h`
          }))
        }
      ],
      generatedAt: new Date()
    };
  }

  /**
   * Clear cache for specific forecast type or all
   */
  static clearCache(forecastType?: 'virtual' | 'actual'): void {
    if (forecastType) {
      Array.from(this.cache.keys())
        .filter(key => key.includes(forecastType))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
    
    debugLog('Cache cleared', { forecastType });
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      age: number;
      size: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.generatedAt.getTime(),
      size: JSON.stringify(value).length
    }));

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // This would be tracked separately in a real implementation
      entries
    };
  }

  /**
   * Private helper methods
   */
  private static getCacheKey(forecastType: string, includeAnalytics: boolean): string {
    return `matrix_${forecastType}_${includeAnalytics}`;
  }

  private static updateCache(key: string, data: MatrixCache): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, data);
  }
}
