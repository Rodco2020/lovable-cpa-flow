
import { MatrixData } from '../matrixUtils';
import { 
  AdvancedAnalyticsService,
  TrendAnalysis,
  CapacityRecommendation,
  ThresholdAlert
} from '../analyticsService';
import { debugLog } from '../logger';

/**
 * Analytics Processor
 * Handles analytics calculations for matrix data
 */
export class AnalyticsProcessor {
  /**
   * Run comprehensive analytics on matrix data
   */
  static async runAnalytics(matrixData: MatrixData): Promise<{
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
}
