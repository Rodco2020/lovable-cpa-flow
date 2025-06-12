

import { MatrixData } from '../matrixUtils';
import { DemandMatrixData } from '@/types/demand';
import { 
  TrendAnalysis,
  CapacityRecommendation,
  ThresholdAlert
} from '../analyticsService';
import { PerformanceMetrics } from '../cache/matrixCacheManager';
import { debugLog } from '../logger';

// Import specialized services
import { MatrixDataLoader } from './dataLoader';
import { AnalyticsProcessor } from './analyticsProcessor';
import { EnhancedCacheManager } from './cacheManager';
import { ExportManager } from './exportManager';
import { DrillDownProvider } from './drillDownProvider';
import { ReportGenerator } from './reportGenerator';

// Import demand matrix service
import { DemandMatrixService } from '../demandMatrixService';

// Enhanced types to support both capacity and demand matrices
export interface EnhancedMatrixOptions {
  includeAnalytics?: boolean;
  useCache?: boolean;
  progressCallback?: (progress: number) => void;
  matrixType?: 'capacity' | 'demand';
}

export interface EnhancedMatrixResult {
  matrixData?: MatrixData;
  demandMatrixData?: DemandMatrixData;
  matrixType: 'capacity' | 'demand';
  trends: TrendAnalysis[];
  recommendations: CapacityRecommendation[];
  alerts: ThresholdAlert[];
  performance: PerformanceMetrics;
}

export interface ExportOptions {
  selectedSkills: string[];
  monthRange: { start: number; end: number };
  includeAnalytics?: boolean;
  trends?: TrendAnalysis[];
  alerts?: ThresholdAlert[];
}

/**
 * Enhanced Matrix Service (Refactored)
 * Now supports both capacity and demand matrices with unified interface
 */
export class EnhancedMatrixService {
  /**
   * Get enhanced matrix data supporting both capacity and demand modes
   */
  static async getEnhancedMatrixData(
    forecastType: 'virtual' | 'actual' | 'demand-only',
    options: EnhancedMatrixOptions = {}
  ): Promise<EnhancedMatrixResult> {
    const {
      includeAnalytics = true,
      useCache = true,
      progressCallback,
      matrixType = forecastType === 'demand-only' ? 'demand' : 'capacity'
    } = options;

    debugLog('Getting enhanced matrix data', { forecastType, matrixType, includeAnalytics, useCache });

    const startTime = Date.now();
    let dataLoadTime = 0;
    let analysisTime = 0;

    try {
      // Progress: Starting
      progressCallback?.(10);

      // Check cache first if enabled
      if (useCache && matrixType === 'capacity') {
        const cached = EnhancedCacheManager.getCachedResult(
          forecastType as 'virtual' | 'actual',
          includeAnalytics
        );
        
        if (cached) {
          progressCallback?.(100);
          return {
            ...cached,
            matrixType: 'capacity'
          };
        }
      }

      // Progress: Loading data
      progressCallback?.(30);
      const dataStart = Date.now();
      
      let matrixData: MatrixData | undefined;
      let demandMatrixData: DemandMatrixData | undefined;

      if (matrixType === 'demand') {
        // Load demand matrix data
        const { matrixData: demandData } = await DemandMatrixService.generateDemandMatrix('demand-only');
        demandMatrixData = demandData;
      } else {
        // Load capacity matrix data
        const { matrixData: capacityData } = await MatrixDataLoader.loadMatrixData(forecastType as 'virtual' | 'actual');
        matrixData = capacityData;
      }
      
      dataLoadTime = Date.now() - dataStart;

      // Progress: Running analytics
      progressCallback?.(60);
      let trends: TrendAnalysis[] = [];
      let recommendations: CapacityRecommendation[] = [];
      let alerts: ThresholdAlert[] = [];

      if (includeAnalytics) {
        const analysisStart = Date.now();
        
        if (matrixType === 'demand' && demandMatrixData) {
          // Convert demand matrix to capacity matrix format for analytics
          const adaptedMatrixData = this.adaptDemandMatrixForAnalytics(demandMatrixData);
          const analytics = await AnalyticsProcessor.runAnalytics(adaptedMatrixData);
          trends = analytics.trends;
          recommendations = analytics.recommendations;
          alerts = analytics.alerts;
        } else if (matrixData) {
          const analytics = await AnalyticsProcessor.runAnalytics(matrixData);
          trends = analytics.trends;
          recommendations = analytics.recommendations;
          alerts = analytics.alerts;
        }
        
        analysisTime = Date.now() - analysisStart;
      }

      // Progress: Finalizing
      progressCallback?.(90);

      const result: EnhancedMatrixResult = {
        matrixData,
        demandMatrixData,
        matrixType,
        trends,
        recommendations,
        alerts,
        performance: {
          dataLoadTime,
          analysisTime,
          renderTime: 0,
          totalCells: matrixData?.dataPoints.length || demandMatrixData?.dataPoints.length || 0,
          cacheHit: false
        }
      };

      // Cache capacity matrix results if enabled
      if (useCache && matrixType === 'capacity' && matrixData) {
        EnhancedCacheManager.setCachedResult(
          forecastType as 'virtual' | 'actual',
          includeAnalytics,
          {
            matrixData,
            trends,
            recommendations,
            alerts
          }
        );
      }

      progressCallback?.(100);
      debugLog(`Enhanced matrix data loaded in ${Date.now() - startTime}ms`);
      
      return result;

    } catch (error) {
      console.error('Error loading enhanced matrix data:', error);
      throw new Error(`Enhanced matrix loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate CSV export for both capacity and demand matrices
   */
  static generateCSVExport(
    matrixData: MatrixData | DemandMatrixData,
    selectedSkills: string[],
    monthRange: { start: number; end: number }
  ): string {
    if ('totalDemand' in matrixData && !('totalCapacity' in matrixData)) {
      // This is demand matrix data
      return this.generateDemandCSVExport(matrixData as DemandMatrixData, {
        selectedSkills,
        monthRange
      });
    } else {
      // This is capacity matrix data
      return ExportManager.generateCSVExport(matrixData as MatrixData, {
        selectedSkills,
        monthRange
      });
    }
  }

  /**
   * Generate JSON export for both capacity and demand matrices
   */
  static generateJSONExport(
    matrixData: MatrixData | DemandMatrixData,
    selectedSkills: string[],
    monthRange: { start: number; end: number }
  ): string {
    if ('totalDemand' in matrixData && !('totalCapacity' in matrixData)) {
      // This is demand matrix data
      return this.generateDemandJSONExport(matrixData as DemandMatrixData, {
        selectedSkills,
        monthRange
      });
    } else {
      // This is capacity matrix data
      return ExportManager.generateJSONExport(matrixData as MatrixData, {
        selectedSkills,
        monthRange
      });
    }
  }

  /**
   * Get drill-down data (delegated to DrillDownProvider)
   */
  static async getDrillDownData(
    skill: string,
    month: string,
    matrixData?: MatrixData
  ) {
    return DrillDownProvider.getDrillDownData(skill, month, matrixData);
  }

  /**
   * Generate capacity report (delegated to ReportGenerator)
   */
  static generateCapacityReport(
    matrixData: MatrixData,
    trends: TrendAnalysis[],
    recommendations: CapacityRecommendation[],
    alerts: ThresholdAlert[]
  ) {
    return ReportGenerator.generateCapacityReport(matrixData, trends, recommendations, alerts);
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    EnhancedCacheManager.clearCache();
    DemandMatrixService.clearCache();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return EnhancedCacheManager.getCacheStats();
  }

  /**
   * Adapt demand matrix data for analytics processing
   */
  private static adaptDemandMatrixForAnalytics(demandData: DemandMatrixData): MatrixData {
    return {
      months: demandData.months.map((month, index) => ({
        key: month.key,
        label: month.label,
        index: index
      })),
      skills: demandData.skills,
      dataPoints: demandData.dataPoints.map(point => ({
        skillType: point.skillType,
        month: point.month,
        monthLabel: point.monthLabel,
        demandHours: point.demandHours,
        capacityHours: 0, // No capacity data in demand-only mode
        gap: -point.demandHours, // All demand is "gap" in demand-only mode
        utilizationPercent: 0
      })),
      totalDemand: demandData.totalDemand,
      totalCapacity: 0,
      totalGap: -demandData.totalDemand
    };
  }

  /**
   * Generate CSV export for demand matrix
   */
  private static generateDemandCSVExport(
    demandData: DemandMatrixData,
    options: ExportOptions
  ): string {
    // Create months with index for proper handling
    const monthsWithIndex = demandData.months.map((month, index) => ({
      ...month,
      index: index
    }));
    
    const filteredMonths = monthsWithIndex.slice(options.monthRange.start, options.monthRange.end + 1);
    const filteredSkills = demandData.skills.filter(skill => options.selectedSkills.includes(skill));
    
    const headers = ['Skill', 'Month', 'Demand (Hours)', 'Task Count', 'Client Count'];
    let csvData = headers.join(',') + '\n';
    
    filteredSkills.forEach(skill => {
      filteredMonths.forEach(month => {
        const dataPoint = demandData.dataPoints.find(
          point => point.skillType === skill && point.month === month.key
        );
        
        if (dataPoint) {
          const row = [
            `"${skill}"`,
            `"${month.label}"`,
            dataPoint.demandHours.toFixed(1),
            dataPoint.taskCount.toString(),
            dataPoint.clientCount.toString()
          ];
          
          csvData += row.join(',') + '\n';
        }
      });
    });
    
    return csvData;
  }

  /**
   * Generate JSON export for demand matrix
   */
  private static generateDemandJSONExport(
    demandData: DemandMatrixData,
    options: ExportOptions
  ): string {
    // Create months with index for proper handling
    const monthsWithIndex = demandData.months.map((month, index) => ({
      ...month,
      index: index
    }));
    
    const filteredMonths = monthsWithIndex.slice(options.monthRange.start, options.monthRange.end + 1);
    const filteredSkills = demandData.skills.filter(skill => options.selectedSkills.includes(skill));
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        matrixType: 'demand',
        skills: filteredSkills,
        months: filteredMonths.map(m => ({
          key: m.key,
          label: m.label,
          index: m.index
        })),
        totalDemand: demandData.totalDemand,
        totalTasks: demandData.totalTasks,
        totalClients: demandData.totalClients
      },
      data: filteredSkills.map(skill => ({
        skill,
        months: filteredMonths.map((month, index) => {
          const dataPoint = demandData.dataPoints.find(
            point => point.skillType === skill && point.month === month.key
          );
          
          return {
            month: month.label,
            monthKey: month.key,
            monthIndex: month.index,
            demandHours: dataPoint?.demandHours || 0,
            taskCount: dataPoint?.taskCount || 0,
            clientCount: dataPoint?.clientCount || 0,
            taskBreakdown: dataPoint?.taskBreakdown || []
          };
        })
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}

