
import { Client } from '@/types/client';
import { FormattedTask } from '../types';
import { 
  getClientRecurringTasks, 
  getClientAdHocTasks,
  getAllClients
} from '@/services/clientService';
import { resolveSkillNames } from '@/services/bulkOperations/skillResolver';

/**
 * Service for fetching client and task data
 * Centralizes all data fetching operations for the Client Assigned Tasks Overview
 * Updated to resolve skill IDs to skill names during data transformation
 */
export class TaskDataService {
  /**
   * Fetch all clients from the service
   */
  static async fetchClients(): Promise<Client[]> {
    try {
      return await getAllClients();
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw new Error('Failed to fetch clients');
    }
  }

  /**
   * Fetch recurring tasks for a specific client
   */
  static async fetchClientRecurringTasks(clientId: string) {
    try {
      return await getClientRecurringTasks(clientId);
    } catch (error) {
      console.error(`Error fetching recurring tasks for client ${clientId}:`, error);
      throw new Error(`Failed to fetch recurring tasks for client ${clientId}`);
    }
  }

  /**
   * Fetch ad-hoc tasks for a specific client
   */
  static async fetchClientAdHocTasks(clientId: string) {
    try {
      return await getClientAdHocTasks(clientId);
    } catch (error) {
      console.error(`Error fetching ad-hoc tasks for client ${clientId}:`, error);
      throw new Error(`Failed to fetch ad-hoc tasks for client ${clientId}`);
    }
  }

  /**
   * Resolve skill IDs to skill names for a task
   * @param skillIds Array of skill UUIDs to resolve
   * @returns Promise resolving to array of skill names
   */
  private static async resolveTaskSkills(skillIds: string[]): Promise<string[]> {
    if (!skillIds || skillIds.length === 0) {
      return [];
    }

    try {
      console.log(`[TaskDataService] Resolving ${skillIds.length} skill IDs:`, skillIds);
      const resolvedNames = await resolveSkillNames(skillIds);
      console.log(`[TaskDataService] Resolved skill names:`, resolvedNames);
      return resolvedNames;
    } catch (error) {
      console.error('[TaskDataService] Error resolving skill names:', error);
      // Fallback to showing placeholder names
      return skillIds.map(id => `Skill ${id.slice(0, 8)}`);
    }
  }

  /**
   * Fetch all tasks for all clients with skill ID resolution
   */
  static async fetchAllClientTasks(clients: Client[]): Promise<{
    formattedTasks: FormattedTask[];
    skills: Set<string>;
    priorities: Set<string>;
  }> {
    const allFormattedTasks: FormattedTask[] = [];
    const skills = new Set<string>();
    const priorities = new Set<string>();
    
    for (const client of clients) {
      try {
        console.log(`[TaskDataService] Processing tasks for client: ${client.legalName}`);
        
        // Get recurring tasks
        const recurringTasks = await this.fetchClientRecurringTasks(client.id);
        
        // Format recurring tasks with skill resolution
        const formattedRecurringTasks: FormattedTask[] = await Promise.all(
          recurringTasks.map(async (task) => {
            // Resolve skill IDs to skill names
            const resolvedSkills = await this.resolveTaskSkills(task.requiredSkills);
            
            // Collect resolved skills and priorities for filter options
            resolvedSkills.forEach(skill => skills.add(skill));
            priorities.add(task.priority);
            
            console.log(`[TaskDataService] Recurring task "${task.name}" skills:`, {
              originalSkillIds: task.requiredSkills,
              resolvedSkills
            });
            
            return {
              id: task.id,
              clientId: client.id,
              clientName: client.legalName,
              taskName: task.name,
              taskType: 'Recurring',
              dueDate: task.dueDate,
              recurrencePattern: task.recurrencePattern,
              estimatedHours: task.estimatedHours,
              requiredSkills: resolvedSkills, // Use resolved skill names
              priority: task.priority,
              status: task.status,
              isActive: task.isActive
            };
          })
        );
        
        // Get ad-hoc tasks
        const adHocTasksData = await this.fetchClientAdHocTasks(client.id);
        
        // Format ad-hoc tasks with skill resolution
        const formattedAdHocTasks: FormattedTask[] = await Promise.all(
          adHocTasksData.map(async (taskData) => {
            const task = taskData.taskInstance; // Extract the TaskInstance from TaskInstanceData
            
            // Resolve skill IDs to skill names
            const resolvedSkills = await this.resolveTaskSkills(task.requiredSkills);
            
            // Collect resolved skills and priorities for filter options
            resolvedSkills.forEach(skill => skills.add(skill));
            priorities.add(task.priority);
            
            console.log(`[TaskDataService] Ad-hoc task "${task.name}" skills:`, {
              originalSkillIds: task.requiredSkills,
              resolvedSkills
            });
            
            return {
              id: task.id,
              clientId: client.id,
              clientName: client.legalName,
              taskName: task.name,
              taskType: 'Ad-hoc',
              dueDate: task.dueDate,
              estimatedHours: task.estimatedHours,
              requiredSkills: resolvedSkills, // Use resolved skill names
              priority: task.priority,
              status: task.status
            };
          })
        );
        
        // Add all tasks to the array
        allFormattedTasks.push(...formattedRecurringTasks, ...formattedAdHocTasks);
        
        console.log(`[TaskDataService] Processed ${formattedRecurringTasks.length} recurring and ${formattedAdHocTasks.length} ad-hoc tasks for client ${client.legalName}`);
      } catch (error) {
        console.error(`Error processing tasks for client ${client.legalName}:`, error);
        // Continue with other clients even if one fails
      }
    }
    
    console.log(`[TaskDataService] Total tasks processed: ${allFormattedTasks.length}`);
    console.log(`[TaskDataService] Unique skills collected: ${Array.from(skills)}`);
    console.log(`[TaskDataService] Unique priorities collected: ${Array.from(priorities)}`);
    
    return {
      formattedTasks: allFormattedTasks,
      skills,
      priorities
    };
  }
}
