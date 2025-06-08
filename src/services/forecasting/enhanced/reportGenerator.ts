
import { MatrixData } from '../matrixUtils';
import { 
  TrendAnalysis,
  CapacityRecommendation,
  ThresholdAlert
} from '../analyticsService';

export interface CapacityReport {
  title: string;
  summary: string;
  sections: Array<{
    title: string;
    content: string;
    data?: any;
  }>;
  generatedAt: string;
}

/**
 * Report Generator
 * Generates formatted reports from matrix data and analytics
 */
export class ReportGenerator {
  /**
   * Generate capacity report
   */
  static generateCapacityReport(
    matrixData: MatrixData,
    trends: TrendAnalysis[],
    recommendations: CapacityRecommendation[],
    alerts: ThresholdAlert[]
  ): CapacityReport {
    const sections = [];

    // Summary section
    sections.push({
      title: 'Executive Summary',
      content: `Total Capacity: ${matrixData.totalCapacity} hours\nTotal Demand: ${matrixData.totalDemand} hours\nGap: ${matrixData.totalGap} hours`
    });

    // Trends section
    if (trends.length > 0) {
      sections.push({
        title: 'Trend Analysis',
        content: `${trends.length} skills analyzed for trends`,
        data: trends
      });
    }

    // Recommendations section
    if (recommendations.length > 0) {
      sections.push({
        title: 'Recommendations',
        content: `${recommendations.length} recommendations generated`,
        data: recommendations
      });
    }

    // Alerts section
    if (alerts.length > 0) {
      sections.push({
        title: 'Alerts',
        content: `${alerts.length} alerts require attention`,
        data: alerts
      });
    }

    return {
      title: 'Capacity Planning Report',
      summary: `Report covering ${matrixData.skills.length} skills over ${matrixData.months.length} months`,
      sections,
      generatedAt: new Date().toISOString()
    };
  }
}
