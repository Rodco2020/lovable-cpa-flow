
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { StaffInformation } from './types';
import { RECURRENCE_MULTIPLIERS, MATRIX_TRANSFORMER_CONFIG } from './constants';

/**
 * Calculation Engine - Phase 4 Enhanced
 * Handles demand calculations with unassigned task support
 */
export class CalculationEngine {
  /**
   * Phase 4: Enhanced demand calculation with unassigned task handling
   */
  static calculateDemandForSkillMonth(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skill: string,
    monthKey: string,
    staffInformation: StaffInformation[],
    filterByStaffAssignment?: 'assigned' | 'unassigned' | 'all'
  ): {
    demandHours: number;
    taskCount: number;
    clientCount: number;
    taskBreakdown: any[];
    unassignedHours?: number; // Phase 4: Track unassigned hours specifically
    assignedHours?: number;   // Phase 4: Track assigned hours specifically
  } {
    console.log(`🧮 [PHASE 4] Calculating demand for skill "${skill}" in month "${monthKey}" with filter: ${filterByStaffAssignment || 'all'}`);

    const matchingTasks = this.findMatchingTasks(tasks, skill, monthKey, filterByStaffAssignment);
    
    let totalHours = 0;
    let unassignedHours = 0;
    let assignedHours = 0;
    const clients = new Set<string>();
    const taskBreakdown: any[] = [];

    for (const task of matchingTasks) {
      try {
        const monthlyHours = this.calculateMonthlyHours(task);
        const isUnassigned = task.preferred_staff_id === null || task.preferred_staff_id === undefined;
        
        // Track hours by assignment status
        if (isUnassigned) {
          unassignedHours += monthlyHours;
        } else {
          assignedHours += monthlyHours;
        }
        
        totalHours += monthlyHours;
        clients.add(task.client_id);

        // Enhanced task breakdown with staff information
        const taskEntry = {
          recurringTaskId: task.id,
          clientId: task.client_id,
          clientName: `Client ${task.client_id.slice(0, 8)}...`,
          taskName: task.name || `Task ${task.id.slice(0, 8)}`,
          skillType: skill,
          estimatedHours: task.estimated_hours,
          monthlyHours,
          recurrencePattern: {
            type: task.recurrence_type,
            frequency: task.recurrence_interval || 1
          },
          // Phase 4: Enhanced staff information
          preferredStaffId: task.preferred_staff_id,
          isUnassigned: isUnassigned,
          staffInfo: isUnassigned ? null : this.getStaffInfo(task.preferred_staff_id!, staffInformation)
        };

        taskBreakdown.push(taskEntry);

        console.log(`📊 [PHASE 4] Task processed: ${task.name} - ${monthlyHours}h (${isUnassigned ? 'UNASSIGNED' : 'ASSIGNED'})`);
      } catch (error) {
        console.error(`❌ [PHASE 4] Error calculating hours for task ${task.id}:`, error);
        // Continue processing other tasks rather than failing completely
      }
    }

    const result = {
      demandHours: totalHours,
      taskCount: matchingTasks.length,
      clientCount: clients.size,
      taskBreakdown,
      unassignedHours,
      assignedHours
    };

    console.log(`✅ [PHASE 4] Demand calculation complete for ${skill}/${monthKey}:`, {
      totalHours: result.demandHours,
      taskCount: result.taskCount,
      unassignedHours: result.unassignedHours,
      assignedHours: result.assignedHours,
      filterUsed: filterByStaffAssignment || 'all'
    });

    return result;
  }

  /**
   * Phase 4: Find matching tasks with optional staff assignment filtering
   */
  private static findMatchingTasks(
    tasks: RecurringTaskDB[],
    skill: string,
    monthKey: string,
    filterByStaffAssignment?: 'assigned' | 'unassigned' | 'all'
  ): RecurringTaskDB[] {
    let filteredTasks = tasks.filter(task => {
      // Basic skill and active checks
      const hasMatchingSkill = task.required_skills && 
        Array.isArray(task.required_skills) && 
        task.required_skills.includes(skill);
      
      const isActive = task.is_active === true;
      
      if (!hasMatchingSkill || !isActive) {
        return false;
      }

      // Phase 4: Apply staff assignment filter if specified
      if (filterByStaffAssignment) {
        const isUnassigned = task.preferred_staff_id === null || task.preferred_staff_id === undefined;
        
        switch (filterByStaffAssignment) {
          case 'unassigned':
            return isUnassigned;
          case 'assigned':
            return !isUnassigned;
          case 'all':
          default:
            return true;
        }
      }

      return true;
    });

    console.log(`🔍 [PHASE 4] Task filtering results for ${skill}/${monthKey}:`, {
      originalTasksCount: tasks.length,
      afterBasicFilter: filteredTasks.length,
      filterByStaffAssignment,
      unassignedInResults: filteredTasks.filter(t => !t.preferred_staff_id).length,
      assignedInResults: filteredTasks.filter(t => t.preferred_staff_id).length
    });

    return filteredTasks;
  }

  /**
   * Phase 4: Get staff information with error handling
   */
  private static getStaffInfo(staffId: string, staffInformation: StaffInformation[]): any {
    try {
      const staff = staffInformation.find(s => s.id === staffId);
      return staff ? {
        id: staff.id,
        name: staff.name,
        isUnassigned: staff.isUnassigned || false
      } : {
        id: staffId,
        name: `Unknown Staff (${staffId.slice(0, 8)})`,
        isUnassigned: false,
        hasError: true
      };
    } catch (error) {
      console.warn(`⚠️ [PHASE 4] Error getting staff info for ${staffId}:`, error);
      return {
        id: staffId,
        name: `Error Loading Staff`,
        isUnassigned: false,
        hasError: true
      };
    }
  }

  /**
   * Calculate monthly hours based on recurrence pattern
   */
  private static calculateMonthlyHours(task: RecurringTaskDB): number {
    try {
      const estimatedHours = task.estimated_hours || MATRIX_TRANSFORMER_CONFIG.DEFAULT_ESTIMATED_HOURS;
      const recurrenceType = task.recurrence_type?.toLowerCase();
      
      if (!recurrenceType || !RECURRENCE_MULTIPLIERS[recurrenceType as keyof typeof RECURRENCE_MULTIPLIERS]) {
        console.warn(`Unknown recurrence type: ${recurrenceType} for task ${task.id}`);
        return estimatedHours; // Default to estimated hours
      }
      
      const multiplier = RECURRENCE_MULTIPLIERS[recurrenceType as keyof typeof RECURRENCE_MULTIPLIERS];
      return estimatedHours * multiplier;
    } catch (error) {
      console.error(`Error calculating monthly hours for task ${task.id}:`, error);
      return MATRIX_TRANSFORMER_CONFIG.DEFAULT_ESTIMATED_HOURS;
    }
  }
}
