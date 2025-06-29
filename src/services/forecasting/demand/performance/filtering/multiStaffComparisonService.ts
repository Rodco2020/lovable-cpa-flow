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
}
