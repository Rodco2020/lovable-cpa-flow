
import { Client } from '@/types/client';
import { FormattedTask } from '../types';
import { DataFetchingService } from './core/dataFetchingService';
import { TaskFormattingService } from './core/taskFormattingService';

/**
 * Main Task Data Service - Refactored for better maintainability
 * 
 * Orchestrates data fetching and formatting operations using specialized services.
 * This service maintains the same external interface while improving internal structure.
 * 
 * Key improvements:
 * - Separated concerns into focused services
 * - Better error handling and logging
 * - Improved testability through smaller, focused modules
 * - Maintained backward compatibility
 */
export class TaskDataService {
  /**
   * Fetch all clients from the service
   */
  static async fetchClients(): Promise<Client[]> {
    return DataFetchingService.fetchClients();
  }

  /**
   * Fetch recurring tasks for a specific client
   */
  static async fetchClientRecurringTasks(clientId: string) {
    return DataFetchingService.fetchClientRecurringTasks(clientId);
  }

  /**
   * Fetch ad-hoc tasks for a specific client
   */
  static async fetchClientAdHocTasks(clientId: string) {
    return DataFetchingService.fetchClientAdHocTasks(clientId);
  }

  /**
   * Fetch all tasks for all clients with skill ID resolution and staff liaison information
   * 
   * This is the main orchestration method that coordinates all the specialized services
   * to fetch, format, and return task data in the expected format.
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
        
        // Format recurring tasks with skill resolution and staff liaison info
        const formattedRecurringTasks = await TaskFormattingService.formatRecurringTasks(
          recurringTasks, 
          client, 
          skills, 
          priorities
        );
        
        // Get ad-hoc tasks
        const adHocTasksData = await this.fetchClientAdHocTasks(client.id);
        
        // Format ad-hoc tasks with skill resolution and staff liaison info
        const formattedAdHocTasks = await TaskFormattingService.formatAdHocTasks(
          adHocTasksData, 
          client, 
          skills, 
          priorities
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
