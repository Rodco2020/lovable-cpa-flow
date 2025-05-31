
import { MatrixData, MatrixDataPoint } from './matrixUtils';
import { SkillType } from '@/types/task';
import { debugLog } from './logger';

export interface TrendAnalysis {
  skill: SkillType;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercent: number;
  prediction: {
    nextMonth: number;
    nextQuarter: number;
  };
}

export interface CapacityRecommendation {
  skill: SkillType;
  type: 'hire' | 'reduce' | 'optimize' | 'maintain';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: number;
  timeline: string;
}

export interface ThresholdAlert {
  id: string;
  skill: SkillType;
  month: string;
  type: 'shortage' | 'surplus' | 'utilization';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  threshold: number;
  actualValue: number;
  recommendation?: string;
}

export interface DrillDownData {
  skill: SkillType;
  month: string;
  demandBreakdown: Array<{
    source: string;
    hours: number;
    clientCount: number;
  }>;
  capacityBreakdown: Array<{
    staffName: string;
    availableHours: number;
    scheduledHours: number;
    utilizationPercent: number;
  }>;
  trends: {
    demandTrend: number;
    capacityTrend: number;
    utilizationTrend: number;
  };
}

export class AdvancedAnalyticsService {
  /**
   * Analyze trends across months for all skills
   */
  static analyzeTrends(matrixData: MatrixData): TrendAnalysis[] {
    debugLog('Analyzing trends for matrix data');
    
    return matrixData.skills.map(skill => {
      const skillData = matrixData.dataPoints
        .filter(point => point.skillType === skill)
        .sort((a, b) => a.month.localeCompare(b.month));

      if (skillData.length < 3) {
        return {
          skill,
          trend: 'stable',
          trendPercent: 0,
          prediction: { nextMonth: 0, nextQuarter: 0 }
        };
      }

      // Calculate trend using linear regression
      const demandValues = skillData.map(point => point.demandHours);
      const trend = this.calculateTrend(demandValues);
      
      return {
        skill,
        trend: trend.direction,
        trendPercent: trend.percent,
        prediction: {
          nextMonth: Math.max(0, demandValues[demandValues.length - 1] + trend.slope),
          nextQuarter: Math.max(0, demandValues[demandValues.length - 1] + (trend.slope * 3))
        }
      };
    });
  }

  /**
   * Generate capacity planning recommendations
   */
  static generateRecommendations(matrixData: MatrixData, trends: TrendAnalysis[]): CapacityRecommendation[] {
    debugLog('Generating capacity recommendations');
    
    const recommendations: CapacityRecommendation[] = [];

    matrixData.skills.forEach(skill => {
      const skillData = matrixData.dataPoints.filter(point => point.skillType === skill);
      const avgUtilization = skillData.reduce((sum, point) => sum + point.utilizationPercent, 0) / skillData.length;
      const avgGap = skillData.reduce((sum, point) => sum + point.gap, 0) / skillData.length;
      const trend = trends.find(t => t.skill === skill);

      // Critical shortage recommendation
      if (avgGap < -20 && avgUtilization > 120) {
        recommendations.push({
          skill,
          type: 'hire',
          priority: 'high',
          description: `Immediate hiring needed for ${skill}. Current shortage of ${Math.abs(avgGap).toFixed(0)} hours with ${avgUtilization.toFixed(0)}% utilization.`,
          impact: Math.abs(avgGap),
          timeline: 'Immediate (1-2 weeks)'
        });
      }
      // Moderate shortage with increasing trend
      else if (avgGap < -10 && trend?.trend === 'increasing') {
        recommendations.push({
          skill,
          type: 'hire',
          priority: 'medium',
          description: `Consider hiring for ${skill}. Growing demand trend (+${trend.trendPercent.toFixed(1)}%) with current shortage.`,
          impact: Math.abs(avgGap),
          timeline: 'Short-term (1-2 months)'
        });
      }
      // Surplus with decreasing demand
      else if (avgGap > 20 && trend?.trend === 'decreasing') {
        recommendations.push({
          skill,
          type: 'optimize',
          priority: 'medium',
          description: `Optimize ${skill} allocation. Decreasing demand (-${Math.abs(trend.trendPercent).toFixed(1)}%) with surplus capacity.`,
          impact: avgGap,
          timeline: 'Medium-term (2-3 months)'
        });
      }
      // Stable utilization
      else if (avgUtilization >= 80 && avgUtilization <= 100) {
        recommendations.push({
          skill,
          type: 'maintain',
          priority: 'low',
          description: `${skill} capacity is well-balanced. Maintain current staffing levels.`,
          impact: 0,
          timeline: 'Ongoing'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate threshold-based alerts
   */
  static generateAlerts(matrixData: MatrixData, thresholds = {
    criticalShortage: 150,
    warningShortage: 120,
    lowUtilization: 60,
    highSurplus: 50
  }): ThresholdAlert[] {
    debugLog('Generating threshold alerts');
    
    const alerts: ThresholdAlert[] = [];

    matrixData.dataPoints.forEach((point, index) => {
      const monthData = matrixData.months.find(m => m.key === point.month);
      
      // Critical shortage alert
      if (point.utilizationPercent >= thresholds.criticalShortage) {
        alerts.push({
          id: `alert-${index}-critical`,
          skill: point.skillType,
          month: monthData?.label || point.month,
          type: 'shortage',
          severity: 'critical',
          message: `Critical capacity shortage: ${point.utilizationPercent.toFixed(0)}% utilization`,
          threshold: thresholds.criticalShortage,
          actualValue: point.utilizationPercent,
          recommendation: 'Immediate action required: Consider emergency staffing or task redistribution'
        });
      }
      // Warning shortage alert
      else if (point.utilizationPercent >= thresholds.warningShortage) {
        alerts.push({
          id: `alert-${index}-warning`,
          skill: point.skillType,
          month: monthData?.label || point.month,
          type: 'shortage',
          severity: 'warning',
          message: `Capacity shortage warning: ${point.utilizationPercent.toFixed(0)}% utilization`,
          threshold: thresholds.warningShortage,
          actualValue: point.utilizationPercent,
          recommendation: 'Monitor closely and consider capacity adjustments'
        });
      }
      // Low utilization alert
      else if (point.utilizationPercent <= thresholds.lowUtilization && point.capacityHours > 0) {
        alerts.push({
          id: `alert-${index}-low-util`,
          skill: point.skillType,
          month: monthData?.label || point.month,
          type: 'utilization',
          severity: 'info',
          message: `Low utilization: ${point.utilizationPercent.toFixed(0)}% capacity used`,
          threshold: thresholds.lowUtilization,
          actualValue: point.utilizationPercent,
          recommendation: 'Consider reallocating resources or taking on additional work'
        });
      }
      // High surplus alert
      else if (point.gap >= thresholds.highSurplus) {
        alerts.push({
          id: `alert-${index}-surplus`,
          skill: point.skillType,
          month: monthData?.label || point.month,
          type: 'surplus',
          severity: 'info',
          message: `Significant capacity surplus: ${point.gap.toFixed(0)} extra hours`,
          threshold: thresholds.highSurplus,
          actualValue: point.gap,
          recommendation: 'Opportunity for growth or resource optimization'
        });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Get detailed drill-down data for a specific skill and month
   */
  static getDrillDownData(matrixData: MatrixData, skill: SkillType, month: string): DrillDownData {
    debugLog(`Getting drill-down data for ${skill} in ${month}`);
    
    const dataPoint = matrixData.dataPoints.find(
      point => point.skillType === skill && point.month === month
    );

    if (!dataPoint) {
      throw new Error(`No data found for ${skill} in ${month}`);
    }

    // Mock detailed breakdowns (in real implementation, this would come from actual data)
    const demandBreakdown = [
      { source: 'Recurring Tasks', hours: dataPoint.demandHours * 0.7, clientCount: 12 },
      { source: 'Ad-hoc Tasks', hours: dataPoint.demandHours * 0.2, clientCount: 5 },
      { source: 'Project Work', hours: dataPoint.demandHours * 0.1, clientCount: 2 }
    ];

    const capacityBreakdown = [
      { staffName: 'John Smith', availableHours: dataPoint.capacityHours * 0.4, scheduledHours: dataPoint.demandHours * 0.3, utilizationPercent: 75 },
      { staffName: 'Jane Doe', availableHours: dataPoint.capacityHours * 0.35, scheduledHours: dataPoint.demandHours * 0.4, utilizationPercent: 85 },
      { staffName: 'Mike Johnson', availableHours: dataPoint.capacityHours * 0.25, scheduledHours: dataPoint.demandHours * 0.3, utilizationPercent: 90 }
    ];

    // Calculate trends (simplified)
    const trends = {
      demandTrend: Math.random() * 20 - 10, // -10% to +10%
      capacityTrend: Math.random() * 10 - 5, // -5% to +5%
      utilizationTrend: Math.random() * 15 - 7.5 // -7.5% to +7.5%
    };

    return {
      skill,
      month,
      demandBreakdown,
      capacityBreakdown,
      trends
    };
  }

  /**
   * Calculate trend direction and slope using linear regression
   */
  private static calculateTrend(values: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    percent: number;
    slope: number;
  } {
    if (values.length < 2) {
      return { direction: 'stable', percent: 0, slope: 0 };
    }

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;
    const percent = avgY > 0 ? (slope / avgY) * 100 : 0;

    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(percent) > 5) {
      direction = percent > 0 ? 'increasing' : 'decreasing';
    }

    return { direction, percent, slope };
  }
}
