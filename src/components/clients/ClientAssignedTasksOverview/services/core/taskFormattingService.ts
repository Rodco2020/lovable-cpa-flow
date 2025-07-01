
import { RecurringTaskDB } from '@/types/task';
import { FormattedTask } from '../../types';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';
import { SkillResolutionService } from './skillResolutionService';
import { StaffLiaisonService } from './staffLiaisonService';

/**
 * Core Task Formatting Service
 * 
 * Handles the transformation of raw database task data into formatted task objects
 * suitable for display in the Client Assigned Tasks Overview.
 * 
 * This service encapsulates all the complex logic for:
 * - Data type conversions
 * - Field mapping and validation
 * - Skill resolution
 * - Staff liaison resolution
 * - Error handling and fallbacks
 */
export class TaskFormattingService {
  /**
   * Format recurring tasks from database format to display format
   */
  static async formatRecurringTasks(
    tasks: RecurringTaskDB[],
    clients: Client[],
    staffOptions: StaffOption[] = []
  ): Promise<FormattedTask[]> {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.log('[TaskFormattingService] No recurring tasks to format');
      return [];
    }

    console.log(`[TaskFormattingService] Formatting ${tasks.length} recurring tasks`);

    const formattedTasks: FormattedTask[] = [];

    for (const task of tasks) {
      try {
        const formattedTask = await this.formatSingleRecurringTask(task, clients, staffOptions);
        if (formattedTask) {
          formattedTasks.push(formattedTask);
        }
      } catch (error) {
        console.error(`[TaskFormattingService] Error formatting recurring task ${task.id}:`, error);
        // Continue processing other tasks even if one fails
      }
    }

    console.log(`[TaskFormattingService] Successfully formatted ${formattedTasks.length} recurring tasks`);
    return formattedTasks;
  }

  /**
   * Format a single recurring task
   */
  private static async formatSingleRecurringTask(
    task: RecurringTaskDB,
    clients: Client[],
    staffOptions: StaffOption[]
  ): Promise<FormattedTask | null> {
    try {
      // Find client information
      const client = clients.find(c => c.id === task.client_id);
      if (!client) {
        console.warn(`[TaskFormattingService] Client not found for task ${task.id}, client_id: ${task.client_id}`);
        return null;
      }

      // Resolve required skills
      const resolvedSkills = await SkillResolutionService.resolveSkillIds(task.required_skills);

      // Resolve staff liaison
      const staffLiaisonInfo = await StaffLiaisonService.resolveStaffLiaison(client.staff_liaison_id);

      // NEW: Resolve preferred staff member
      const preferredStaffInfo = this.resolvePreferredStaff(task.preferred_staff_id, staffOptions);

      // Log field mapping for debugging
      console.log(`🔧 [TASK FORMATTING] Field mapping verification for recurring task "${task.name}":`, {
        originalSkillIds: task.required_skills,
        resolvedSkills,
        database_preferred_staff_id: {
          _type: typeof task.preferred_staff_id,
          value: task.preferred_staff_id || 'undefined'
        },
        application_preferredStaffId: preferredStaffInfo?.id || 'undefined',
        mappingConsistent: !!(task.preferred_staff_id && preferredStaffInfo?.id === task.preferred_staff_id)
      });

      const formattedTask: FormattedTask = {
        id: task.id,
        clientId: task.client_id,
        clientName: client.legalName,
        taskName: task.name,
        taskType: 'Recurring',
        dueDate: task.due_date ? new Date(task.due_date) : null,
        recurrencePattern: {
          type: this.mapRecurrenceType(task.recurrence_type),
          interval: task.recurrence_interval || 1,
          weekdays: task.weekdays || undefined,
          dayOfMonth: task.day_of_month || undefined,
          monthOfYear: task.month_of_year || undefined,
          endDate: task.end_date ? new Date(task.end_date) : null,
          customOffsetDays: task.custom_offset_days || undefined
        },
        estimatedHours: Number(task.estimated_hours) || 0,
        requiredSkills: resolvedSkills,
        priority: task.priority,
        status: task.status,
        isActive: task.is_active,
        staffLiaisonId: staffLiaisonInfo?.id,
        staffLiaisonName: staffLiaisonInfo?.name,
        // NEW: Add preferred staff information
        preferredStaffId: preferredStaffInfo?.id,
        preferredStaffName: preferredStaffInfo?.name
      };

      return formattedTask;
    } catch (error) {
      console.error(`[TaskFormattingService] Error formatting single recurring task ${task.id}:`, error);
      return null;
    }
  }

  /**
   * NEW: Resolve preferred staff member information
   */
  private static resolvePreferredStaff(
    preferredStaffId: string | null | undefined,
    staffOptions: StaffOption[]
  ): { id: string; name: string } | null {
    if (!preferredStaffId || !Array.isArray(staffOptions)) {
      return null;
    }

    const staffMember = staffOptions.find(staff => staff.id === preferredStaffId);
    
    if (staffMember) {
      return {
        id: staffMember.id,
        name: staffMember.full_name
      };
    }

    // Log when preferred staff is not found
    console.warn(`[TaskFormattingService] Preferred staff member not found: ${preferredStaffId}`);
    return null;
  }

  /**
   * Map database recurrence type to application format
   */
  private static mapRecurrenceType(recurrenceType: string): "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually" | "Custom" {
    const typeMap: Record<string, "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually" | "Custom"> = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'annually': 'Annually',
      'custom': 'Custom'
    };

    return typeMap[recurrenceType?.toLowerCase()] || 'Monthly';
  }

  /**
   * Format ad-hoc tasks (future implementation)
   */
  static async formatAdHocTasks(
    tasks: any[],
    clients: Client[],
    staffOptions: StaffOption[] = []
  ): Promise<FormattedTask[]> {
    // Placeholder for ad-hoc task formatting
    // Will be implemented when ad-hoc tasks are added to the system
    console.log('[TaskFormattingService] Ad-hoc task formatting not yet implemented');
    return [];
  }
}
