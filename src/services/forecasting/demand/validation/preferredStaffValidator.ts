
/**
 * Preferred Staff Validation Service
 * Validates preferred staff data integrity and handles edge cases
 */
export class PreferredStaffValidator {
  /**
   * Validate preferred staff assignments in task data
   */
  static validatePreferredStaffAssignments(tasks: any[]): {
    isValid: boolean;
    validTasks: any[];
    invalidTasks: Array<{ task: any; issues: string[] }>;
    warnings: string[];
    statistics: {
      totalTasks: number;
      tasksWithPreferredStaff: number;
      validPreferredStaffAssignments: number;
      invalidPreferredStaffAssignments: number;
      orphanedAssignments: number;
    };
  } {
    const validTasks: any[] = [];
    const invalidTasks: Array<{ task: any; issues: string[] }> = [];
    const warnings: string[] = [];
    
    let tasksWithPreferredStaff = 0;
    let validPreferredStaffAssignments = 0;
    let invalidPreferredStaffAssignments = 0;
    let orphanedAssignments = 0;

    tasks.forEach(task => {
      const issues: string[] = [];
      let hasPreferredStaff = false;

      // Check if task has preferred staff information
      if (task.preferredStaff) {
        hasPreferredStaff = true;
        tasksWithPreferredStaff++;

        // Validate preferred staff structure
        if (!task.preferredStaff.staffId) {
          issues.push('Preferred staff missing staffId');
          invalidPreferredStaffAssignments++;
        } else if (typeof task.preferredStaff.staffId !== 'string' || task.preferredStaff.staffId.trim() === '') {
          issues.push('Invalid preferred staff staffId format');
          invalidPreferredStaffAssignments++;
        } else {
          // Valid preferred staff assignment
          validPreferredStaffAssignments++;
        }

        // Validate staff name
        if (!task.preferredStaff.staffName || task.preferredStaff.staffName.trim() === '') {
          issues.push('Preferred staff missing or empty staffName');
        }

        // Check for orphaned assignments (staff that may not exist)
        if (task.preferredStaff.staffId && task.preferredStaff.staffId.includes('deleted-') || 
            task.preferredStaff.staffName?.includes('[Deleted]')) {
          issues.push('Preferred staff appears to be deleted/orphaned');
          orphanedAssignments++;
          warnings.push(`Task ${task.id || task.name} has orphaned preferred staff assignment`);
        }
      }

      // Handle issues
      if (issues.length > 0) {
        invalidTasks.push({ task, issues });
        
        // Clean the task for processing
        const cleanedTask = { ...task };
        if (cleanedTask.preferredStaff && issues.some(issue => issue.includes('staffId'))) {
          delete cleanedTask.preferredStaff;
          warnings.push(`Removed invalid preferred staff from task ${task.id || task.name}`);
        }
        validTasks.push(cleanedTask);
      } else {
        validTasks.push(task);
      }
    });

    const statistics = {
      totalTasks: tasks.length,
      tasksWithPreferredStaff,
      validPreferredStaffAssignments,
      invalidPreferredStaffAssignments,
      orphanedAssignments
    };

    console.log('📋 [PREFERRED STAFF VALIDATION] Validation results:', statistics);

    return {
      isValid: invalidTasks.length === 0,
      validTasks,
      invalidTasks,
      warnings,
      statistics
    };
  }

  /**
   * Validate preferred staff filtering parameters
   */
  static validatePreferredStaffFilters(preferredStaffFilter: any): {
    isValid: boolean;
    cleanedFilter: any;
    issues: string[];
  } {
    const issues: string[] = [];
    let cleanedFilter = null;

    if (!preferredStaffFilter) {
      return { isValid: true, cleanedFilter: null, issues: [] };
    }

    // Validate structure
    if (typeof preferredStaffFilter !== 'object') {
      issues.push('Preferred staff filter must be an object');
      return { isValid: false, cleanedFilter: null, issues };
    }

    // Validate staffIds array
    if (preferredStaffFilter.staffIds) {
      if (!Array.isArray(preferredStaffFilter.staffIds)) {
        issues.push('staffIds must be an array');
      } else {
        // Clean staffIds array
        const validStaffIds = preferredStaffFilter.staffIds.filter((id: any) => 
          typeof id === 'string' && id.trim() !== ''
        );
        
        if (validStaffIds.length !== preferredStaffFilter.staffIds.length) {
          issues.push(`Removed ${preferredStaffFilter.staffIds.length - validStaffIds.length} invalid staff IDs`);
        }

        cleanedFilter = {
          ...preferredStaffFilter,
          staffIds: validStaffIds
        };
      }
    }

    // Validate boolean flags
    ['includeUnassigned', 'showOnlyPreferred'].forEach(flag => {
      if (preferredStaffFilter[flag] !== undefined && typeof preferredStaffFilter[flag] !== 'boolean') {
        issues.push(`${flag} must be a boolean value`);
        if (cleanedFilter) {
          cleanedFilter[flag] = Boolean(preferredStaffFilter[flag]);
        }
      }
    });

    // If no cleaned filter was created, create a default one
    if (!cleanedFilter) {
      cleanedFilter = {
        staffIds: [],
        includeUnassigned: false,
        showOnlyPreferred: false
      };
    }

    return {
      isValid: issues.length === 0,
      cleanedFilter,
      issues
    };
  }

  /**
   * Handle orphaned preferred staff assignments
   */
  static cleanOrphanedAssignments(tasks: any[]): {
    cleanedTasks: any[];
    orphanedCount: number;
    cleanedAssignments: string[];
  } {
    const cleanedTasks: any[] = [];
    let orphanedCount = 0;
    const cleanedAssignments: string[] = [];

    tasks.forEach(task => {
      const cleanedTask = { ...task };
      
      if (task.preferredStaff) {
        const isOrphaned = 
          !task.preferredStaff.staffId ||
          task.preferredStaff.staffId.includes('deleted-') ||
          task.preferredStaff.staffName?.includes('[Deleted]') ||
          task.preferredStaff.staffName?.includes('[Inactive]');

        if (isOrphaned) {
          delete cleanedTask.preferredStaff;
          orphanedCount++;
          cleanedAssignments.push(task.id || task.name || 'Unknown task');
          console.log(`🧹 [PREFERRED STAFF VALIDATION] Cleaned orphaned assignment from task: ${task.id || task.name}`);
        }
      }

      cleanedTasks.push(cleanedTask);
    });

    return {
      cleanedTasks,
      orphanedCount,
      cleanedAssignments
    };
  }
}
