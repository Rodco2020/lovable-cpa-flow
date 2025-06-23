
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { MonthInfo, StaffInformation, StaffValidationResult } from './types';
import { MONTH_FORMAT_OPTIONS } from './constants';

/**
 * Data Extraction Utilities - Phase 4 Enhanced
 * Handles extraction with unassigned tasks support and enhanced staff validation
 */
export class DataExtractors {
  /**
   * Extract months information from forecast data
   */
  static extractMonths(forecastData: ForecastData[]): MonthInfo[] {
    const months = new Set<string>();
    
    forecastData.forEach(item => {
      if (item.period) {
        months.add(item.period);
      }
    });
    
    return Array.from(months)
      .sort()
      .map(monthKey => ({
        key: monthKey,
        label: this.formatMonthLabel(monthKey)
      }));
  }

  /**
   * Extract unique skills from forecast data
   */
  static extractSkills(forecastData: ForecastData[]): string[] {
    const skills = new Set<string>();
    
    forecastData.forEach(item => {
      item.demand?.forEach(d => {
        if (d.skill) {
          skills.add(d.skill);
        }
      });
    });
    
    return Array.from(skills).sort();
  }

  /**
   * Phase 4: Enhanced staff information extraction with unassigned task handling
   */
  static extractStaffInformationWithUnassigned(tasks: RecurringTaskDB[]): StaffValidationResult {
    const staffMap = new Map<string, string>();
    let unassignedTasksDetected = 0;
    const validationErrors: Array<{ staff: any; errors: string[] }> = [];
    
    console.log('🔍 [PHASE 4] Starting enhanced staff extraction with unassigned task detection');
    
    tasks.forEach((task, index) => {
      if (task.preferred_staff_id === null || task.preferred_staff_id === undefined) {
        unassignedTasksDetected++;
        console.log(`📋 [PHASE 4] Unassigned task detected: ${task.id} (${task.name})`);
      } else if (task.preferred_staff_id) {
        try {
          // Validate staff ID format
          if (typeof task.preferred_staff_id === 'string' && task.preferred_staff_id.trim().length > 0) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(task.preferred_staff_id)) {
              staffMap.set(task.preferred_staff_id, `Staff ${task.preferred_staff_id.slice(0, 8)}`);
            } else {
              validationErrors.push({
                staff: { id: task.preferred_staff_id, taskId: task.id },
                errors: ['Invalid staff ID format']
              });
            }
          }
        } catch (error) {
          validationErrors.push({
            staff: { id: task.preferred_staff_id, taskId: task.id },
            errors: [`Staff validation error: ${error}`]
          });
        }
      }
    });

    // Create staff information array including unassigned placeholder
    const validStaff: StaffInformation[] = Array.from(staffMap.entries()).map(([id, name]) => ({ 
      id, 
      name,
      isUnassigned: false 
    }));

    // Add special "Unassigned" entry if there are unassigned tasks
    if (unassignedTasksDetected > 0) {
      validStaff.push({
        id: 'UNASSIGNED',
        name: 'Unassigned Tasks',
        isUnassigned: true
      });
    }
    
    console.log(`👥 [PHASE 4] Enhanced staff extraction complete:`, {
      uniqueAssignedStaff: staffMap.size,
      unassignedTasksDetected,
      validationErrors: validationErrors.length,
      totalStaffEntries: validStaff.length
    });
    
    return {
      validStaff,
      invalidStaff: validationErrors,
      unassignedTasksDetected
    };
  }

  /**
   * Legacy method maintained for backward compatibility
   */
  static extractStaffInformation(tasks: RecurringTaskDB[]): StaffInformation[] {
    const result = this.extractStaffInformationWithUnassigned(tasks);
    return result.validStaff;
  }

  /**
   * Phase 4: Extract unassigned tasks specifically
   */
  static extractUnassignedTasks(tasks: RecurringTaskDB[]): RecurringTaskDB[] {
    const unassignedTasks = tasks.filter(task => 
      task.preferred_staff_id === null || task.preferred_staff_id === undefined
    );
    
    console.log(`📋 [PHASE 4] Extracted ${unassignedTasks.length} unassigned tasks from ${tasks.length} total tasks`);
    
    return unassignedTasks;
  }

  /**
   * Phase 4: Extract assigned tasks specifically
   */
  static extractAssignedTasks(tasks: RecurringTaskDB[]): RecurringTaskDB[] {
    const assignedTasks = tasks.filter(task => 
      task.preferred_staff_id !== null && task.preferred_staff_id !== undefined
    );
    
    console.log(`👤 [PHASE 4] Extracted ${assignedTasks.length} assigned tasks from ${tasks.length} total tasks`);
    
    return assignedTasks;
  }

  /**
   * Format month key into human-readable label
   */
  private static formatMonthLabel(monthKey: string): string {
    try {
      const date = new Date(monthKey);
      return date.toLocaleDateString('en-US', MONTH_FORMAT_OPTIONS);
    } catch {
      return monthKey;
    }
  }
}
