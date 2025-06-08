
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { debugLog } from '../logger';

export interface DemandTrendAnalysis {
  skill: SkillType;
  trend: 'increasing' | 'decreasing' | 'stable';
  growthRate: number; // percentage change
  confidence: number; // 0-1
  monthlyData: Array<{
    month: string;
    hours: number;
    changePercent: number;
  }>;
}

export interface ClientWorkloadDistribution {
  clientId: string;
  clientName: string;
  totalHours: number;
  skillBreakdown: Record<SkillType, number>;
  monthlyDistribution: Record<string, number>;
  percentOfTotal: number;
}

export interface DemandAnalytics {
  trendAnalysis: DemandTrendAnalysis[];
  clientDistribution: ClientWorkloadDistribution[];
  skillUtilization: Array<{
    skill: SkillType;
    totalHours: number;
    averageMonthlyHours: number;
    peakMonth: string;
    peakHours: number;
    volatility: number; // coefficient of variation
  }>;
  seasonality: Array<{
    month: string;
    totalHours: number;
    skillBreakdown: Record<SkillType, number>;
    trendFactor: number; // seasonal adjustment factor
  }>;
}

/**
 * Demand Analytics Service
 * Provides specialized analytics for demand matrix data
 */
export class DemandAnalyticsService {
  /**
   * Generate comprehensive demand analytics
   */
  static generateDemandAnalytics(demandData: DemandMatrixData): DemandAnalytics {
    debugLog('Generating demand analytics');

    const trendAnalysis = this.analyzeDemandTrends(demandData);
    const clientDistribution = this.analyzeClientWorkloadDistribution(demandData);
    const skillUtilization = this.analyzeSkillUtilization(demandData);
    const seasonality = this.analyzeSeasonality(demandData);

    return {
      trendAnalysis,
      clientDistribution,
      skillUtilization,
      seasonality
    };
  }

  /**
   * Analyze demand trends for each skill over time
   */
  private static analyzeDemandTrends(demandData: DemandMatrixData): DemandTrendAnalysis[] {
    return demandData.skills.map(skill => {
      const skillData = demandData.dataPoints
        .filter(point => point.skillType === skill)
        .sort((a, b) => a.month.localeCompare(b.month));

      const monthlyData = skillData.map((point, index) => {
        const previousHours = index > 0 ? skillData[index - 1].demandHours : point.demandHours;
        const changePercent = previousHours > 0 
          ? ((point.demandHours - previousHours) / previousHours) * 100 
          : 0;

        return {
          month: point.monthLabel,
          hours: point.demandHours,
          changePercent
        };
      });

      // Calculate linear regression for trend
      const { slope, confidence } = this.calculateTrendSlope(monthlyData);
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (Math.abs(slope) > 0.1 && confidence > 0.7) {
        trend = slope > 0 ? 'increasing' : 'decreasing';
      }

      const growthRate = monthlyData.length > 1 
        ? ((monthlyData[monthlyData.length - 1].hours - monthlyData[0].hours) / monthlyData[0].hours) * 100
        : 0;

      return {
        skill,
        trend,
        growthRate,
        confidence,
        monthlyData
      };
    });
  }

  /**
   * Analyze client workload distribution
   */
  private static analyzeClientWorkloadDistribution(demandData: DemandMatrixData): ClientWorkloadDistribution[] {
    const clientMap = new Map<string, {
      clientName: string;
      totalHours: number;
      skillBreakdown: Record<SkillType, number>;
      monthlyDistribution: Record<string, number>;
    }>();

    // Aggregate data by client
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown.forEach(task => {
        const existing = clientMap.get(task.clientId) || {
          clientName: task.clientName,
          totalHours: 0,
          skillBreakdown: {} as Record<SkillType, number>,
          monthlyDistribution: {} as Record<string, number>
        };

        existing.totalHours += task.monthlyHours;
        existing.skillBreakdown[task.skillType] = (existing.skillBreakdown[task.skillType] || 0) + task.monthlyHours;
        existing.monthlyDistribution[point.monthLabel] = (existing.monthlyDistribution[point.monthLabel] || 0) + task.monthlyHours;

        clientMap.set(task.clientId, existing);
      });
    });

    // Convert to array and calculate percentages
    const totalHours = Array.from(clientMap.values()).reduce((sum, client) => sum + client.totalHours, 0);

    return Array.from(clientMap.entries())
      .map(([clientId, data]) => ({
        clientId,
        clientName: data.clientName,
        totalHours: data.totalHours,
        skillBreakdown: data.skillBreakdown,
        monthlyDistribution: data.monthlyDistribution,
        percentOfTotal: totalHours > 0 ? (data.totalHours / totalHours) * 100 : 0
      }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }

  /**
   * Analyze skill utilization patterns
   */
  private static analyzeSkillUtilization(demandData: DemandMatrixData): Array<{
    skill: SkillType;
    totalHours: number;
    averageMonthlyHours: number;
    peakMonth: string;
    peakHours: number;
    volatility: number;
  }> {
    return demandData.skills.map(skill => {
      const skillData = demandData.dataPoints.filter(point => point.skillType === skill);
      
      const totalHours = skillData.reduce((sum, point) => sum + point.demandHours, 0);
      const averageMonthlyHours = skillData.length > 0 ? totalHours / skillData.length : 0;
      
      // Find peak month
      const peakPoint = skillData.reduce((max, point) => 
        point.demandHours > max.demandHours ? point : max
      , skillData[0] || { demandHours: 0, monthLabel: 'N/A' });

      // Calculate volatility (coefficient of variation)
      const variance = skillData.length > 1 
        ? skillData.reduce((sum, point) => sum + Math.pow(point.demandHours - averageMonthlyHours, 2), 0) / skillData.length
        : 0;
      const standardDeviation = Math.sqrt(variance);
      const volatility = averageMonthlyHours > 0 ? standardDeviation / averageMonthlyHours : 0;

      return {
        skill,
        totalHours,
        averageMonthlyHours,
        peakMonth: peakPoint.monthLabel,
        peakHours: peakPoint.demandHours,
        volatility
      };
    });
  }

  /**
   * Analyze seasonal patterns
   */
  private static analyzeSeasonality(demandData: DemandMatrixData): Array<{
    month: string;
    totalHours: number;
    skillBreakdown: Record<SkillType, number>;
    trendFactor: number;
  }> {
    const monthlyTotals = demandData.months.map(month => {
      const monthData = demandData.dataPoints.filter(point => point.month === month.key);
      const totalHours = monthData.reduce((sum, point) => sum + point.demandHours, 0);
      
      const skillBreakdown: Record<SkillType, number> = {};
      monthData.forEach(point => {
        skillBreakdown[point.skillType] = point.demandHours;
      });

      return {
        month: month.label,
        totalHours,
        skillBreakdown
      };
    });

    // Calculate trend factors (seasonal adjustment)
    const overallAverage = monthlyTotals.reduce((sum, month) => sum + month.totalHours, 0) / monthlyTotals.length;
    
    return monthlyTotals.map(month => ({
      ...month,
      trendFactor: overallAverage > 0 ? month.totalHours / overallAverage : 1
    }));
  }

  /**
   * Calculate trend slope using linear regression
   */
  private static calculateTrendSlope(data: Array<{ hours: number }>): { slope: number; confidence: number } {
    if (data.length < 2) return { slope: 0, confidence: 0 };

    const n = data.length;
    const xSum = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const ySum = data.reduce((sum, point) => sum + point.hours, 0);
    const xySum = data.reduce((sum, point, index) => sum + (index * point.hours), 0);
    const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6; // sum of squares

    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    
    // Simple confidence calculation based on R-squared
    const yMean = ySum / n;
    const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.hours - yMean, 2), 0);
    const ssResidual = data.reduce((sum, point, index) => {
      const predicted = slope * index + (ySum - slope * xSum) / n;
      return sum + Math.pow(point.hours - predicted, 2);
    }, 0);
    
    const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;
    const confidence = Math.max(0, Math.min(1, rSquared));

    return { slope, confidence };
  }
}
