
import { MatrixData } from '../matrixUtils';
import { TrendAnalysis, CapacityRecommendation, ThresholdAlert } from '../analyticsService';
import { debugLog } from '../logger';

export interface CapacityReport {
  title: string;
  summary: string;
  sections: Array<{
    title: string;
    content: string;
    data?: any[];
  }>;
  generatedAt: Date;
}

/**
 * Capacity Report Generator
 * Generates comprehensive capacity planning reports
 */
export class CapacityReportGenerator {
  /**
   * Generate capacity planning report
   */
  static generateCapacityReport(
    matrixData: MatrixData,
    trends: TrendAnalysis[],
    recommendations: CapacityRecommendation[],
    alerts: ThresholdAlert[]
  ): CapacityReport {
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
        this.generateExecutiveSummary(totalDemand, totalCapacity, overallGap),
        this.generateCriticalIssuesSection(criticalAlerts),
        this.generateRecommendationsSection(recommendations),
        this.generateTrendAnalysisSection(trends)
      ],
      generatedAt: new Date()
    };
  }

  /**
   * Generate executive summary section
   */
  private static generateExecutiveSummary(
    totalDemand: number,
    totalCapacity: number,
    overallGap: number
  ) {
    return {
      title: 'Executive Summary',
      content: `Total demand: ${totalDemand.toFixed(0)} hours. Total capacity: ${totalCapacity.toFixed(0)} hours. Overall gap: ${overallGap >= 0 ? 'surplus' : 'shortage'} of ${Math.abs(overallGap).toFixed(0)} hours.`
    };
  }

  /**
   * Generate critical issues section
   */
  private static generateCriticalIssuesSection(criticalAlerts: ThresholdAlert[]) {
    return {
      title: 'Critical Issues',
      content: `${criticalAlerts.length} critical alerts requiring immediate attention.`,
      data: criticalAlerts.map(alert => ({
        skill: alert.skill,
        issue: alert.message,
        recommendation: alert.recommendation
      }))
    };
  }

  /**
   * Generate recommendations section
   */
  private static generateRecommendationsSection(recommendations: CapacityRecommendation[]) {
    return {
      title: 'Capacity Recommendations',
      content: `${recommendations.length} recommendations for capacity optimization.`,
      data: recommendations.map(rec => ({
        skill: rec.skill,
        action: rec.type,
        priority: rec.priority,
        description: rec.description,
        timeline: rec.timeline
      }))
    };
  }

  /**
   * Generate trend analysis section
   */
  private static generateTrendAnalysisSection(trends: TrendAnalysis[]) {
    return {
      title: 'Trend Analysis',
      content: `Analysis of demand trends across ${trends.length} skills.`,
      data: trends.map(trend => ({
        skill: trend.skill,
        trend: trend.trend,
        change: `${trend.trendPercent >= 0 ? '+' : ''}${trend.trendPercent.toFixed(1)}%`,
        prediction: `Next month: ${trend.prediction.nextMonth.toFixed(0)}h`
      }))
    };
  }
}
