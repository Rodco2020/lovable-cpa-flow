
import { DemandMatrixData } from '@/types/demand';
import { debugLog } from '../logger';

/**
 * Demand Matrix Data Validator
 * Validates the integrity and consistency of demand matrix data
 */
export class DemandMatrixValidator {
  /**
   * Validate demand matrix data structure and content
   */
  static validateDemandMatrixData(data: DemandMatrixData): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Validate basic structure
    if (!data) {
      issues.push('Demand matrix data is null or undefined');
      return { isValid: false, issues };
    }

    // Validate months array
    if (!Array.isArray(data.months)) {
      issues.push('Months data is not an array');
    } else if (data.months.length !== 12) {
      issues.push(`Expected 12 months, got ${data.months.length}`);
    }

    // Validate skills array
    if (!Array.isArray(data.skills)) {
      issues.push('Skills data is not an array');
    } else if (data.skills.length === 0) {
      issues.push('No skills found in demand matrix data');
    }

    // Validate data points
    if (!Array.isArray(data.dataPoints)) {
      issues.push('Data points is not an array');
    } else {
      data.dataPoints.forEach((point, index) => {
        if (point.demandHours < 0) {
          issues.push(`Data point ${index} has negative demand hours: ${point.demandHours}`);
        }
        
        if (!point.skillType || !data.skills.includes(point.skillType)) {
          issues.push(`Data point ${index} has invalid skill type: ${point.skillType}`);
        }

        if (!point.month || !data.months.some(m => m.key === point.month)) {
          issues.push(`Data point ${index} has invalid month: ${point.month}`);
        }

        if (point.taskCount < 0) {
          issues.push(`Data point ${index} has negative task count: ${point.taskCount}`);
        }

        if (point.clientCount < 0) {
          issues.push(`Data point ${index} has negative client count: ${point.clientCount}`);
        }
      });
    }

    // Validate totals consistency
    const calculatedTotalDemand = data.dataPoints?.reduce((sum, point) => sum + point.demandHours, 0) || 0;
    if (Math.abs(calculatedTotalDemand - data.totalDemand) > 0.01) {
      issues.push(`Total demand mismatch: calculated ${calculatedTotalDemand}, reported ${data.totalDemand}`);
    }

    const calculatedTotalTasks = data.dataPoints?.reduce((sum, point) => sum + point.taskCount, 0) || 0;
    if (calculatedTotalTasks !== data.totalTasks) {
      issues.push(`Total tasks mismatch: calculated ${calculatedTotalTasks}, reported ${data.totalTasks}`);
    }

    debugLog(`Matrix validation completed: ${issues.length} issues found`);

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate preferred staff data in matrix
   */
  static validatePreferredStaffData(data: DemandMatrixData): {
    isValid: boolean;
    issues: string[];
    stats: {
      totalTasks: number;
      tasksWithPreferredStaff: number;
      tasksWithoutPreferredStaff: number;
      preferredStaffCoverage: number;
    };
  } {
    const issues: string[] = [];
    let totalTasks = 0;
    let tasksWithPreferredStaff = 0;

    data.dataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach(task => {
          totalTasks++;
          if (task.preferredStaff?.staffId) {
            tasksWithPreferredStaff++;
            
            // Validate preferred staff structure
            if (!task.preferredStaff.staffName) {
              issues.push(`Task ${task.taskName} has preferred staff ID but missing staff name`);
            }
          }
        });
      }
    });

    const tasksWithoutPreferredStaff = totalTasks - tasksWithPreferredStaff;
    const preferredStaffCoverage = totalTasks > 0 ? (tasksWithPreferredStaff / totalTasks) * 100 : 0;

    return {
      isValid: issues.length === 0,
      issues,
      stats: {
        totalTasks,
        tasksWithPreferredStaff,
        tasksWithoutPreferredStaff,
        preferredStaffCoverage
      }
    };
  }
}
