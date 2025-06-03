
import { FormattedTask } from '../../types';
import { Client } from '@/types/client';
import { SkillResolutionService } from './skillResolutionService';
import { StaffLiaisonService } from './staffLiaisonService';

/**
 * Task Formatting Service
 * 
 * Handles the formatting of raw task data into the FormattedTask structure
 * used throughout the application. Centralizes task transformation logic.
 */
export class TaskFormattingService {
  /**
   * Format recurring tasks with skill resolution and staff liaison info
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
        
        console.log(`[TaskFormattingService] Recurring task "${task.name}" skills:`, {
          originalSkillIds: task.requiredSkills,
          resolvedSkills
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
          staffLiaisonName
        };
      })
    );
  }

  /**
   * Format ad-hoc tasks with skill resolution and staff liaison info
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
        
        console.log(`[TaskFormattingService] Ad-hoc task "${task.name}" skills:`, {
          originalSkillIds: task.requiredSkills,
          resolvedSkills
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
          staffLiaisonName
        };
      })
    );
  }
}
