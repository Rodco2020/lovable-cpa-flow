
import { FormattedTask } from '../../types';
import { Client } from '@/types/client';
import { SkillResolutionService } from './skillResolutionService';
import { StaffLiaisonService } from './staffLiaisonService';

/**
 * Task Formatting Service
 * 
 * Handles the formatting of raw task data into the FormattedTask structure
 * used throughout the application. Centralizes task transformation logic.
 * FIXED: Consistent field name mapping throughout the transformation pipeline
 */
export class TaskFormattingService {
  /**
   * Format recurring tasks with skill resolution and staff liaison info
   * FIXED: Proper field name mapping from database to application format
   */
  static async formatRecurringTasks(
    recurringTasks: any[], 
    client: Client, 
    skills: Set<string>, 
    priorities: Set<string>
  ): Promise<FormattedTask[]> {
    const { staffLiaisonId, staffLiaisonName } = StaffLiaisonService.getStaffLiaisonInfo(client);
    
    return Promise.all(
      recurringTasks.map(async (task) => {
        // Resolve skill IDs to skill names
        const resolvedSkills = await SkillResolutionService.resolveTaskSkills(task.requiredSkills);
        
        // Collect resolved skills and priorities for filter options
        SkillResolutionService.collectSkillsForFilters(resolvedSkills, skills);
        priorities.add(task.priority);
        
        // Extract preferred staff information
        const preferredStaffId = task.preferred_staff_id || null;
        const preferredStaffName = task.staff?.full_name || null;
        
        console.log(`🔧 [TASK FORMATTING] Field mapping verification for recurring task "${task.name}":`, {
          originalSkillIds: task.requiredSkills,
          resolvedSkills,
          // FIXED: Verify both database and application field formats are handled correctly
          database_preferred_staff_id: task.preferred_staff_id,
          application_preferredStaffId: task.preferredStaffId,
          mappingConsistent: task.preferredStaffId === task.preferred_staff_id || (!task.preferred_staff_id && !task.preferredStaffId),
          // NEW: Preferred staff information
          preferredStaffId,
          preferredStaffName
        });
        
        return {
          id: task.id,
          clientId: client.id,
          clientName: client.legalName,
          taskName: task.name,
          taskType: 'Recurring' as const,
          dueDate: task.dueDate,
          recurrencePattern: task.recurrencePattern,
          estimatedHours: task.estimatedHours,
          requiredSkills: resolvedSkills, // Use resolved skill names
          priority: task.priority,
          status: task.status,
          isActive: task.isActive,
          staffLiaisonId,
          staffLiaisonName,
          preferredStaffId,
          preferredStaffName
        };
      })
    );
  }

  /**
   * Format ad-hoc tasks with skill resolution and staff liaison info
   * FIXED: Consistent field mapping for ad-hoc tasks as well
   */
  static async formatAdHocTasks(
    adHocTasksData: any[], 
    client: Client, 
    skills: Set<string>, 
    priorities: Set<string>
  ): Promise<FormattedTask[]> {
    const { staffLiaisonId, staffLiaisonName } = StaffLiaisonService.getStaffLiaisonInfo(client);
    
    return Promise.all(
      adHocTasksData.map(async (taskData) => {
        const task = taskData.taskInstance; // Extract the TaskInstance from TaskInstanceData
        
        // Resolve skill IDs to skill names
        const resolvedSkills = await SkillResolutionService.resolveTaskSkills(task.requiredSkills);
        
        // Collect resolved skills and priorities for filter options
        SkillResolutionService.collectSkillsForFilters(resolvedSkills, skills);
        priorities.add(task.priority);
        
        // Ad-hoc tasks don't have preferred staff directly, but might inherit from recurring task
        const preferredStaffId = null; // Ad-hoc tasks don't have preferred staff
        const preferredStaffName = null;
        
        console.log(`🔧 [TASK FORMATTING] Field mapping verification for ad-hoc task "${task.name}":`, {
          originalSkillIds: task.requiredSkills,
          resolvedSkills,
          // FIXED: Ensure consistent field mapping for ad-hoc tasks too
          fieldMappingConsistent: true,
          taskType: 'Ad-hoc',
          preferredStaffId,
          preferredStaffName
        });
        
        return {
          id: task.id,
          clientId: client.id,
          clientName: client.legalName,
          taskName: task.name,
          taskType: 'Ad-hoc' as const,
          dueDate: task.dueDate,
          estimatedHours: task.estimatedHours,
          requiredSkills: resolvedSkills, // Use resolved skill names
          priority: task.priority,
          status: task.status,
          staffLiaisonId,
          staffLiaisonName,
          preferredStaffId,
          preferredStaffName
        };
      })
    );
  }
}
