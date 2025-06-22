
/**
 * Diagnostics Service
 * 
 * Provides diagnostic information for demand matrix filtering operations
 */

import { DemandMatrixData } from '@/types/demand';

export interface FilteringDiagnostics {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  dataQuality: {
    totalDataPoints: number;
    validTaskBreakdowns: number;
    invalidTaskBreakdowns: number;
    emptyDataPoints: number;
  };
  staffAssignmentAnalysis: {
    tasksWithStaff: number;
    tasksWithoutStaff: number;
    invalidStaffReferences: number;
  };
}

export class DiagnosticsService {
  /**
   * Validate data structure before filtering
   */
  static validateDataStructure(demandData: DemandMatrixData): FilteringDiagnostics {
    console.log('🔍 [VALIDATION] Validating data structure for filtering');

    const diagnostics: FilteringDiagnostics = {
      isValid: true,
      issues: [],
      warnings: [],
      dataQuality: {
        totalDataPoints: demandData.dataPoints.length,
        validTaskBreakdowns: 0,
        invalidTaskBreakdowns: 0,
        emptyDataPoints: 0
      },
      staffAssignmentAnalysis: {
        tasksWithStaff: 0,
        tasksWithoutStaff: 0,
        invalidStaffReferences: 0
      }
    };

    // Validate data points
    demandData.dataPoints.forEach((point, index) => {
      this.validateDataPoint(point, index, diagnostics);
      this.validateBasicProperties(point, index, diagnostics);
    });

    // Set overall validity
    diagnostics.isValid = diagnostics.issues.length === 0;

    console.log('📊 [VALIDATION] Validation complete:', diagnostics);
    return diagnostics;
  }

  /**
   * Validate individual data point
   */
  private static validateDataPoint(point: any, index: number, diagnostics: FilteringDiagnostics): void {
    // Check task breakdown validity
    if (!point.taskBreakdown || !Array.isArray(point.taskBreakdown)) {
      diagnostics.dataQuality.invalidTaskBreakdowns++;
      diagnostics.issues.push(`Data point ${index}: missing or invalid taskBreakdown`);
    } else {
      diagnostics.dataQuality.validTaskBreakdowns++;
      
      if (point.taskBreakdown.length === 0) {
        diagnostics.dataQuality.emptyDataPoints++;
        diagnostics.warnings.push(`Data point ${index}: empty taskBreakdown`);
      }

      // Analyze staff assignments
      point.taskBreakdown.forEach((task: any, taskIndex: number) => {
        this.analyzeStaffAssignment(task, index, taskIndex, diagnostics);
      });
    }
  }

  /**
   * Analyze staff assignment for a task
   */
  private static analyzeStaffAssignment(task: any, pointIndex: number, taskIndex: number, diagnostics: FilteringDiagnostics): void {
    if (task.preferredStaff) {
      if (this.isValidStaffReference(task.preferredStaff)) {
        diagnostics.staffAssignmentAnalysis.tasksWithStaff++;
      } else {
        diagnostics.staffAssignmentAnalysis.invalidStaffReferences++;
        diagnostics.warnings.push(`Data point ${pointIndex}, task ${taskIndex}: invalid staff reference`);
      }
    } else {
      diagnostics.staffAssignmentAnalysis.tasksWithoutStaff++;
    }
  }

  /**
   * Validate basic properties of a data point
   */
  private static validateBasicProperties(point: any, index: number, diagnostics: FilteringDiagnostics): void {
    if (typeof point.demandHours !== 'number') {
      diagnostics.issues.push(`Data point ${index}: invalid demandHours`);
    }

    if (typeof point.taskCount !== 'number') {
      diagnostics.issues.push(`Data point ${index}: invalid taskCount`);
    }
  }

  /**
   * Validate staff reference structure
   */
  private static isValidStaffReference(staffRef: any): boolean {
    if (!staffRef) return false;

    if (typeof staffRef === 'string') {
      return staffRef.trim().length > 0;
    }

    if (typeof staffRef === 'object') {
      const staffId = staffRef.staffId || staffRef.id || staffRef.full_name || staffRef.name;
      return staffId && typeof staffId === 'string' && staffId.trim().length > 0;
    }

    return false;
  }
}
