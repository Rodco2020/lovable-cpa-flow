
import { MatrixData } from '../matrixUtils';
import { 
  TrendAnalysis,
  CapacityRecommendation,
  ThresholdAlert
} from '../analyticsService';
import { CapacityReportGenerator, CapacityReport } from '../reports/capacityReportGenerator';

/**
 * Report Generator
 * Handles capacity planning report generation
 */
export class ReportGenerator {
  /**
   * Generate comprehensive capacity planning report
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
}
