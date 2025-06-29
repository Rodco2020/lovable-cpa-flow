
import { DemandMatrixData } from '@/types/demand';

export interface StaffDistributionAnalysis {
  totalDataPoints: number;
  dataPointsWithTasks: number;
  staffTaskCounts: Map<string, number>;
  staffHourTotals: Map<string, number>;
  staffSkillTypes: Map<string, Set<string>>;
  averageTasksPerStaff: number;
  averageHoursPerStaff: number;
  staffCoveragePercentage: number;
}

export interface StaffComparisonData {
  staffId: string;
  staffName: string;
  taskCount: number;
  totalHours: number;
  skillTypes: string[];
  utilizationRate: number;
}

export interface MultiStaffComparisonResult {
  analysis: StaffDistributionAnalysis;
  summary: string;
  recommendations: string[];
  aggregatedMetrics: {
    totalStaff: number;
    totalTasks: number;
    totalHours: number;
    averageTasksPerStaff: number;
    averageHoursPerStaff: number;
    totalPreferredStaffTasks: number;
    totalPreferredStaffHours: number;
    totalSkillTasks: number;
    totalSkillHours: number;
    averageCommonTasks: number;
    staffWithMostTasks: string;
  };
  staffComparisons: StaffComparisonData[];
  testSubject: string;
  executionTime: number;
}

/**
 * Multi-Staff Comparison Service
 * 
 * Analyzes demand matrix data to provide insights into staff distribution,
 * workload allocation, and skill coverage across different staff members.
 */
export class MultiStaffComparisonService {
  /**
   * Analyze staff distribution in the demand matrix data
   */
  static analyzeStaffDistribution(data: DemandMatrixData): StaffDistributionAnalysis {
    const staffTaskCounts = new Map<string, number>();
    const staffHourTotals = new Map<string, number>();
    const staffSkillTypes = new Map<string, Set<string>>();
    
    // Analyze each data point
    data.dataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          if (task.preferredStaffId) {
            // Ensure preferredStaffId is converted to string
            const staffId = String(task.preferredStaffId);
            
            // Count tasks per staff member
            staffTaskCounts.set(staffId, (staffTaskCounts.get(staffId) || 0) + 1);
            
            // Sum hours per staff member
            staffHourTotals.set(staffId, (staffHourTotals.get(staffId) || 0) + task.monthlyHours);
            
            // Track skill types per staff member
            if (!staffSkillTypes.has(staffId)) {
              staffSkillTypes.set(staffId, new Set());
            }
            staffSkillTypes.get(staffId)!.add(task.skillType);
          }
        });
      }
    });

    // Calculate averages and coverage
    const totalDataPoints = data.dataPoints.length;
    const dataPointsWithTasks = data.dataPoints.filter(dp => dp.taskBreakdown && dp.taskBreakdown.length > 0).length;
    const totalStaff = staffTaskCounts.size;
    
    let totalTasks = 0;
    let totalHours = 0;
    
    staffTaskCounts.forEach(count => totalTasks += count);
    staffHourTotals.forEach(hours => totalHours += hours);
    
    const averageTasksPerStaff = totalStaff > 0 ? totalTasks / totalStaff : 0;
    const averageHoursPerStaff = totalStaff > 0 ? totalHours / totalStaff : 0;
    const staffCoveragePercentage = totalDataPoints > 0 ? (dataPointsWithTasks / totalDataPoints) * 100 : 0;

    return {
      totalDataPoints,
      dataPointsWithTasks,
      staffTaskCounts,
      staffHourTotals,
      staffSkillTypes,
      averageTasksPerStaff,
      averageHoursPerStaff,
      staffCoveragePercentage
    };
  }

  /**
   * Compare multiple staff members and provide detailed analysis
   */
  static compareMultipleStaff(data: DemandMatrixData): MultiStaffComparisonResult {
    const startTime = performance.now();
    const analysis = this.analyzeStaffDistribution(data);
    const summary = this.generateAnalysisSummary(analysis);
    const recommendations = this.generateRecommendations(analysis);
    
    // Create staff comparison data
    const staffComparisons: StaffComparisonData[] = [];
    analysis.staffTaskCounts.forEach((taskCount, staffId) => {
      const totalHours = analysis.staffHourTotals.get(staffId) || 0;
      const skillTypes = Array.from(analysis.staffSkillTypes.get(staffId) || []);
      
      staffComparisons.push({
        staffId,
        staffName: `Staff ${staffId}`, // This would normally come from a staff lookup
        taskCount,
        totalHours,
        skillTypes,
        utilizationRate: totalHours > 0 ? (totalHours / (40 * 4)) * 100 : 0 // Assuming 40 hours/week, 4 weeks
      });
    });

    // Calculate aggregated metrics with all required properties
    const totalStaff = analysis.staffTaskCounts.size;
    let totalTasks = 0;
    let totalHours = 0;
    
    analysis.staffTaskCounts.forEach(count => totalTasks += count);
    analysis.staffHourTotals.forEach(hours => totalHours += hours);

    // Find staff with most tasks
    let staffWithMostTasks = '';
    let maxTasks = 0;
    analysis.staffTaskCounts.forEach((count, staffId) => {
      if (count > maxTasks) {
        maxTasks = count;
        staffWithMostTasks = staffId;
      }
    });

    const aggregatedMetrics = {
      totalStaff,
      totalTasks,
      totalHours,
      averageTasksPerStaff: analysis.averageTasksPerStaff,
      averageHoursPerStaff: analysis.averageHoursPerStaff,
      totalPreferredStaffTasks: totalTasks,
      totalPreferredStaffHours: totalHours,
      totalSkillTasks: totalTasks,
      totalSkillHours: totalHours,
      averageCommonTasks: totalStaff > 0 ? totalTasks / totalStaff : 0,
      staffWithMostTasks
    };

    const executionTime = performance.now() - startTime;

    return {
      analysis,
      summary,
      recommendations,
      aggregatedMetrics,
      staffComparisons,
      testSubject: 'Multi-Staff Comparison Analysis',
      executionTime
    };
  }

  /**
   * Generate a summary of the staff distribution analysis
   */
  static generateAnalysisSummary(analysis: StaffDistributionAnalysis): string {
    return `
      Staff Distribution Analysis Summary:
      - Total Data Points: ${analysis.totalDataPoints}
      - Data Points with Tasks: ${analysis.dataPointsWithTasks}
      - Total Staff Members: ${analysis.staffTaskCounts.size}
      - Average Tasks per Staff: ${analysis.averageTasksPerStaff.toFixed(2)}
      - Average Hours per Staff: ${analysis.averageHoursPerStaff.toFixed(2)}
      - Staff Coverage Percentage: ${analysis.staffCoveragePercentage.toFixed(2)}%
    `;
  }

  /**
   * Generate recommendations based on the analysis
   */
  static generateRecommendations(analysis: StaffDistributionAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.staffCoveragePercentage < 50) {
      recommendations.push('Consider assigning preferred staff to more tasks to improve coverage');
    }

    if (analysis.averageTasksPerStaff < 2) {
      recommendations.push('Task distribution appears light - consider consolidating or redistributing tasks');
    }

    if (analysis.staffTaskCounts.size < 3) {
      recommendations.push('Consider involving more staff members to improve workload distribution');
    }

    return recommendations;
  }
}
