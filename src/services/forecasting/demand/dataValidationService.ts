
import { RecurringTaskDB } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { debugLog } from '../logger';

/**
 * Data Validation Service
 * Comprehensive validation for demand matrix data pipeline
 */
export class DataValidationService {
  /**
   * Validate recurring tasks data
   */
  static validateRecurringTasks(tasks: RecurringTaskDB[]): {
    isValid: boolean;
    issues: string[];
    validTasks: RecurringTaskDB[];
    invalidTasks: RecurringTaskDB[];
  } {
    const issues: string[] = [];
    const validTasks: RecurringTaskDB[] = [];
    const invalidTasks: RecurringTaskDB[] = [];

    console.group('🔍 [VALIDATION] Validating recurring tasks data');

    tasks.forEach((task, index) => {
      const taskIssues: string[] = [];

      // Validate required fields
      if (!task.id) taskIssues.push('Missing task ID');
      if (!task.name || task.name.trim() === '') taskIssues.push('Missing or empty task name');
      if (!task.client_id) taskIssues.push('Missing client ID');
      if (!task.template_id) taskIssues.push('Missing template ID');

      // Validate numeric fields
      if (task.estimated_hours === null || task.estimated_hours === undefined) {
        taskIssues.push('Missing estimated hours');
      } else if (task.estimated_hours <= 0) {
        taskIssues.push(`Invalid estimated hours: ${task.estimated_hours}`);
      }

      // Validate required skills array
      if (!Array.isArray(task.required_skills)) {
        taskIssues.push('Required skills is not an array');
      } else if (task.required_skills.length === 0) {
        taskIssues.push('No required skills specified');
      } else {
        const invalidSkills = task.required_skills.filter(skill => !skill || typeof skill !== 'string');
        if (invalidSkills.length > 0) {
          taskIssues.push(`Invalid skill references: ${invalidSkills.length} invalid entries`);
        }
      }

      // Validate recurrence pattern
      if (task.recurrence_type && task.recurrence_type !== 'None') {
        const validRecurrenceTypes = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'];
        if (!validRecurrenceTypes.includes(task.recurrence_type)) {
          taskIssues.push(`Invalid recurrence type: ${task.recurrence_type}`);
        }

        if (!task.recurrence_interval || task.recurrence_interval <= 0) {
          taskIssues.push(`Invalid recurrence interval: ${task.recurrence_interval}`);
        }
      }

      // Validate status and active flag
      if (!task.status) {
        taskIssues.push('Missing task status');
      }

      if (task.is_active === null || task.is_active === undefined) {
        taskIssues.push('Missing is_active flag');
      }

      // Categorize task
      if (taskIssues.length > 0) {
        issues.push(`Task ${index} (${task.name || 'unnamed'}): ${taskIssues.join(', ')}`);
        invalidTasks.push(task);
      } else {
        validTasks.push(task);
      }
    });

    console.log(`📊 Validation Summary:`, {
      totalTasks: tasks.length,
      validTasks: validTasks.length,
      invalidTasks: invalidTasks.length,
      issuesFound: issues.length
    });

    if (issues.length > 0) {
      console.warn(`⚠️ Validation Issues:`, issues);
    }

    console.groupEnd();

    return {
      isValid: issues.length === 0,
      issues,
      validTasks,
      invalidTasks
    };
  }

  /**
   * Validate matrix data integrity
   */
  static validateMatrixData(matrixData: DemandMatrixData): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    console.group('🔍 [VALIDATION] Validating matrix data integrity');

    // Validate basic structure
    if (!matrixData.months || !Array.isArray(matrixData.months)) {
      issues.push('Missing or invalid months array');
    }

    if (!matrixData.skills || !Array.isArray(matrixData.skills)) {
      issues.push('Missing or invalid skills array');
    }

    if (!matrixData.dataPoints || !Array.isArray(matrixData.dataPoints)) {
      issues.push('Missing or invalid dataPoints array');
    }

    // Validate data points
    if (matrixData.dataPoints) {
      matrixData.dataPoints.forEach((point, index) => {
        if (!point.skillType) {
          issues.push(`Data point ${index}: Missing skillType`);
        }

        if (!point.month) {
          issues.push(`Data point ${index}: Missing month`);
        }

        if (point.demandHours < 0) {
          issues.push(`Data point ${index}: Negative demand hours: ${point.demandHours}`);
        }

        if (point.taskCount < 0) {
          issues.push(`Data point ${index}: Negative task count: ${point.taskCount}`);
        }

        if (point.clientCount < 0) {
          issues.push(`Data point ${index}: Negative client count: ${point.clientCount}`);
        }

        // Check for suspicious data (1 task, 1 client consistently)
        if (point.taskCount === 1 && point.clientCount === 1 && point.demandHours > 0) {
          warnings.push(`Data point ${index} (${point.skillType}/${point.month}): Suspicious pattern (1 task, 1 client)`);
        }

        // Validate task breakdown
        if (point.taskBreakdown) {
          if (!Array.isArray(point.taskBreakdown)) {
            issues.push(`Data point ${index}: taskBreakdown is not an array`);
          } else if (point.taskBreakdown.length !== point.taskCount) {
            warnings.push(`Data point ${index}: taskBreakdown length (${point.taskBreakdown.length}) doesn't match taskCount (${point.taskCount})`);
          }
        }
      });
    }

    // Validate totals consistency
    if (matrixData.dataPoints) {
      const calculatedTotalDemand = matrixData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const calculatedTotalTasks = matrixData.dataPoints.reduce((sum, point) => sum + point.taskCount, 0);

      if (Math.abs(calculatedTotalDemand - matrixData.totalDemand) > 0.01) {
        issues.push(`Total demand mismatch: calculated ${calculatedTotalDemand}, reported ${matrixData.totalDemand}`);
      }

      if (calculatedTotalTasks !== matrixData.totalTasks) {
        issues.push(`Total tasks mismatch: calculated ${calculatedTotalTasks}, reported ${matrixData.totalTasks}`);
      }
    }

    // Check for missing data coverage
    if (matrixData.months && matrixData.skills && matrixData.dataPoints) {
      const expectedDataPoints = matrixData.months.length * matrixData.skills.length;
      const actualDataPoints = matrixData.dataPoints.length;
      
      if (actualDataPoints < expectedDataPoints * 0.1) { // Less than 10% coverage
        warnings.push(`Low data coverage: ${actualDataPoints} of ${expectedDataPoints} possible combinations have data`);
      }
    }

    console.log(`📊 Matrix Validation Summary:`, {
      dataPointsCount: matrixData.dataPoints?.length || 0,
      monthsCount: matrixData.months?.length || 0,
      skillsCount: matrixData.skills?.length || 0,
      totalDemand: matrixData.totalDemand,
      totalTasks: matrixData.totalTasks,
      totalClients: matrixData.totalClients,
      issuesFound: issues.length,
      warningsFound: warnings.length
    });

    if (issues.length > 0) {
      console.error(`❌ Validation Issues:`, issues);
    }

    if (warnings.length > 0) {
      console.warn(`⚠️ Validation Warnings:`, warnings);
    }

    console.groupEnd();

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Validate filter settings
   */
  static validateFilterSettings(filters: {
    selectedSkills: string[];
    selectedClients: string[];
    selectedPreferredStaff: string[];
    preferredStaffFilterMode: string;
    availableSkills: string[];
    availableClients: string[];
    availablePreferredStaff: string[];
  }): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    console.group('🔍 [VALIDATION] Validating filter settings');

    // Validate filter mode
    const validModes = ['all', 'specific', 'none'];
    if (!validModes.includes(filters.preferredStaffFilterMode)) {
      issues.push(`Invalid preferred staff filter mode: ${filters.preferredStaffFilterMode}`);
    }

    // Check for invalid skill selections
    const invalidSkills = filters.selectedSkills.filter(skill => 
      !filters.availableSkills.includes(skill)
    );
    if (invalidSkills.length > 0) {
      issues.push(`Invalid skill selections: ${invalidSkills.join(', ')}`);
    }

    // Check for invalid client selections
    const invalidClients = filters.selectedClients.filter(client => 
      !filters.availableClients.includes(client)
    );
    if (invalidClients.length > 0) {
      issues.push(`Invalid client selections: ${invalidClients.join(', ')}`);
    }

    // Check for invalid staff selections
    const invalidStaff = filters.selectedPreferredStaff.filter(staff => 
      !filters.availablePreferredStaff.includes(staff)
    );
    if (invalidStaff.length > 0) {
      issues.push(`Invalid staff selections: ${invalidStaff.join(', ')}`);
    }

    // Provide recommendations
    if (filters.selectedSkills.length === 0 && filters.availableSkills.length > 0) {
      recommendations.push('Consider selecting at least one skill to see relevant data');
    }

    if (filters.preferredStaffFilterMode === 'specific' && filters.selectedPreferredStaff.length === 0) {
      recommendations.push('Specific staff mode selected but no staff chosen - this will show no data');
    }

    console.log(`📊 Filter Validation Summary:`, {
      selectedSkills: filters.selectedSkills.length,
      selectedClients: filters.selectedClients.length,
      selectedStaff: filters.selectedPreferredStaff.length,
      filterMode: filters.preferredStaffFilterMode,
      invalidSkills: invalidSkills.length,
      invalidClients: invalidClients.length,
      invalidStaff: invalidStaff.length,
      issues: issues.length,
      recommendations: recommendations.length
    });

    console.groupEnd();

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
}
