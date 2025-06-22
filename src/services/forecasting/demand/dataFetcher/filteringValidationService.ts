/**
 * Filtering Validation Service
 * 
 * Provides validation and diagnostics for demand matrix filtering operations
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

export class FilteringValidationService {
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
        point.taskBreakdown.forEach((task: any, taskIndex) => {
          if (task.preferredStaff) {
            if (this.isValidStaffReference(task.preferredStaff)) {
              diagnostics.staffAssignmentAnalysis.tasksWithStaff++;
            } else {
              diagnostics.staffAssignmentAnalysis.invalidStaffReferences++;
              diagnostics.warnings.push(`Data point ${index}, task ${taskIndex}: invalid staff reference`);
            }
          } else {
            diagnostics.staffAssignmentAnalysis.tasksWithoutStaff++;
          }
        });
      }

      // Validate basic properties
      if (typeof point.demandHours !== 'number') {
        diagnostics.issues.push(`Data point ${index}: invalid demandHours`);
      }

      if (typeof point.taskCount !== 'number') {
        diagnostics.issues.push(`Data point ${index}: invalid taskCount`);
      }
    });

    // Set overall validity
    diagnostics.isValid = diagnostics.issues.length === 0;

    console.log('📊 [VALIDATION] Validation complete:', diagnostics);
    return diagnostics;
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

  /**
   * Extract staff ID from various staff reference formats with proper type safety
   */
  static extractStaffId(staffRef: string | { staffId: string; full_name: string; } | null): string | null {
    if (!staffRef) return null;

    if (typeof staffRef === 'string') {
      return staffRef.trim() || null;
    }

    if (typeof staffRef === 'object' && 'staffId' in staffRef) {
      return staffRef.staffId?.trim() || null;
    }

    return null;
  }

  /**
   * Safe staff ID extraction with proper type checking
   */
  static safeExtractStaffId(staffRef: string | { staffId: string; full_name: string; } | null): string | null {
    if (!staffRef) return null;

    if (typeof staffRef === 'string') {
      return staffRef.trim() || null;
    }

    if (typeof staffRef === 'object' && 'staffId' in staffRef) {
      return staffRef.staffId?.trim() || null;
    }

    return null;
  }

  /**
   * Validate filter configuration
   */
  static validateFilterConfiguration(config: {
    preferredStaffFilterMode: string;
    selectedPreferredStaff: string[];
  }): { isValid: boolean; issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const validModes = ['all', 'specific', 'none'];
    if (!validModes.includes(config.preferredStaffFilterMode)) {
      issues.push(`Invalid preferred staff filter mode: ${config.preferredStaffFilterMode}`);
    }

    if (config.preferredStaffFilterMode === 'specific' && config.selectedPreferredStaff.length === 0) {
      recommendations.push('Specific mode selected but no staff chosen - this will show no results');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Generate filtering performance report
   */
  static generatePerformanceReport(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData,
    filterConfig: any
  ): any {
    const reductionPercentage = originalData.dataPoints.length > 0 
      ? Math.round(((originalData.dataPoints.length - filteredData.dataPoints.length) / originalData.dataPoints.length) * 100)
      : 0;

    return {
      filtering: {
        originalDataPoints: originalData.dataPoints.length,
        filteredDataPoints: filteredData.dataPoints.length,
        reductionPercentage,
        appliedFilters: this.getAppliedFilters(filterConfig)
      },
      metrics: {
        originalTotalDemand: originalData.totalDemand,
        filteredTotalDemand: filteredData.totalDemand,
        originalTotalTasks: originalData.totalTasks,
        filteredTotalTasks: filteredData.totalTasks,
        originalTotalClients: originalData.totalClients,
        filteredTotalClients: filteredData.totalClients
      },
      efficiency: {
        dataReduction: reductionPercentage > 0 ? 'Effective' : 'No reduction',
        filterComplexity: this.calculateFilterComplexity(filterConfig)
      }
    };
  }

  /**
   * Get list of applied filters
   */
  private static getAppliedFilters(config: any): string[] {
    const applied: string[] = [];

    if (config.selectedSkills && config.selectedSkills.length > 0 && !config.isAllSkillsSelected) {
      applied.push('Skills');
    }

    if (config.selectedClients && config.selectedClients.length > 0 && !config.isAllClientsSelected) {
      applied.push('Clients');
    }

    if (config.preferredStaffFilterMode && config.preferredStaffFilterMode !== 'all') {
      applied.push(`Preferred Staff (${config.preferredStaffFilterMode})`);
    }

    return applied;
  }

  /**
   * Calculate filter complexity
   */
  private static calculateFilterComplexity(config: any): 'Low' | 'Medium' | 'High' {
    let complexity = 0;

    if (config.selectedSkills && config.selectedSkills.length > 0) complexity += 1;
    if (config.selectedClients && config.selectedClients.length > 0) complexity += 1;
    if (config.preferredStaffFilterMode && config.preferredStaffFilterMode !== 'all') complexity += 2;

    if (complexity <= 1) return 'Low';
    if (complexity <= 3) return 'Medium';
    return 'High';
  }
}
