import { DemandMatrixData } from '@/types/demand';
import { extractStaffId, extractStaffName, isStaffObject } from './utils/staffExtractionUtils';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * Demand Matrix Validator
 * Validates demand matrix data structure and content
 */
export class DemandMatrixValidator {
  /**
   * Validate the complete demand matrix data structure
   */
  static validateDemandMatrix(data: DemandMatrixData): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!data) {
      return {
        isValid: false,
        issues: ['Data is null or undefined'],
        warnings: []
      };
    }

    // Validate required top-level fields
    if (!data.months || !Array.isArray(data.months)) {
      issues.push('Missing or invalid months array');
    }

    if (!data.skills || !Array.isArray(data.skills)) {
      issues.push('Missing or invalid skills array');
    }

    if (!data.dataPoints || !Array.isArray(data.dataPoints)) {
      issues.push('Missing or invalid dataPoints array');
    }

    if (typeof data.totalDemand !== 'number' || data.totalDemand < 0) {
      issues.push('Invalid totalDemand value');
    }

    if (typeof data.totalTasks !== 'number' || data.totalTasks < 0) {
      issues.push('Invalid totalTasks value');
    }

    if (typeof data.totalClients !== 'number' || data.totalClients < 0) {
      issues.push('Invalid totalClients value');
    }

    if (!data.skillSummary || typeof data.skillSummary !== 'object') {
      issues.push('Missing or invalid skillSummary');
    }

    // Validate data points structure
    if (data.dataPoints) {
      data.dataPoints.forEach((point, index) => {
        if (!point.skillType || typeof point.skillType !== 'string') {
          issues.push(`Data point ${index}: missing or invalid skillType`);
        }

        if (!point.month || typeof point.month !== 'string') {
          issues.push(`Data point ${index}: missing or invalid month`);
        }

        if (typeof point.demandHours !== 'number' || point.demandHours < 0) {
          issues.push(`Data point ${index}: invalid demandHours (negative or non-numeric)`);
        }

        if (typeof point.taskCount !== 'number' || point.taskCount < 0) {
          issues.push(`Data point ${index}: invalid taskCount`);
        }

        if (typeof point.clientCount !== 'number' || point.clientCount < 0) {
          issues.push(`Data point ${index}: invalid clientCount`);
        }

        // Validate task breakdown if present
        if (point.taskBreakdown) {
          point.taskBreakdown.forEach((task: any, taskIndex) => {
            if (!task.clientId || typeof task.clientId !== 'string') {
              issues.push(`Data point ${index}, task ${taskIndex}: missing or invalid clientId`);
            }

            if (!task.clientName || typeof task.clientName !== 'string') {
              issues.push(`Data point ${index}, task ${taskIndex}: missing or invalid clientName`);
            }

            if (typeof task.estimatedHours !== 'number' || task.estimatedHours < 0) {
              issues.push(`Data point ${index}, task ${taskIndex}: invalid estimatedHours`);
            }

            if (typeof task.monthlyHours !== 'number' || task.monthlyHours < 0) {
              issues.push(`Data point ${index}, task ${taskIndex}: invalid monthlyHours`);
            }

            // Validate preferred staff if present
            if (task.preferredStaff) {
              // FIXED: Use safe staff extraction utilities
              const staffId = extractStaffId(task.preferredStaff);
              const staffName = extractStaffName(task.preferredStaff);
              
              if (!staffId && !staffName) {
                warnings.push(`Data point ${index}, task ${taskIndex}: Invalid preferred staff structure`);
              }

              // Check if it's an object but missing expected properties
              if (isStaffObject(task.preferredStaff)) {
                if (!task.preferredStaff.staffId) {
                  warnings.push(`Data point ${index}, task ${taskIndex}: Staff object missing staffId`);
                }
                if (!task.preferredStaff.full_name) {
                  warnings.push(`Data point ${index}, task ${taskIndex}: Staff object missing full_name`);
                }
              }
            }
          });
        }
      });
    }

    // Validate consistency between totals and data points
    if (data.dataPoints && data.dataPoints.length > 0) {
      const calculatedTotalDemand = data.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const calculatedTotalTasks = data.dataPoints.reduce((sum, point) => sum + point.taskCount, 0);

      if (Math.abs(calculatedTotalDemand - data.totalDemand) > 0.01) {
        issues.push(`Inconsistent totalDemand: calculated ${calculatedTotalDemand}, stored ${data.totalDemand}`);
      }

      if (calculatedTotalTasks !== data.totalTasks) {
        issues.push(`Inconsistent totalTasks: calculated ${calculatedTotalTasks}, stored ${data.totalTasks}`);
      }
    }

    // Validate skill summary consistency
    if (data.skillSummary && data.dataPoints) {
      const skillsFromDataPoints = new Set(data.dataPoints.map(point => point.skillType));
      const skillsFromSummary = new Set(Object.keys(data.skillSummary));

      skillsFromDataPoints.forEach(skill => {
        if (!skillsFromSummary.has(skill)) {
          issues.push(`Skill '${skill}' found in data points but missing from skillSummary`);
        }
      });

      Object.keys(data.skillSummary).forEach(skill => {
        const summary = data.skillSummary[skill];
        const relatedDataPoints = data.dataPoints.filter(point => point.skillType === skill);
        const calculatedHours = relatedDataPoints.reduce((sum, point) => sum + point.demandHours, 0);

        if (Math.abs(calculatedHours - summary.totalHours) > 0.01) {
          issues.push(`Inconsistent hours for skill '${skill}': calculated ${calculatedHours}, summary ${summary.totalHours}`);
        }
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }
}
