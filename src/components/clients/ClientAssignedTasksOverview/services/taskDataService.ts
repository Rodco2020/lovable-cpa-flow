
import { Client } from '@/types/client';
import { FormattedTask } from '../types';
import { StaffOption } from '@/types/staffOption';
import { DataFetchingService } from './core/dataFetchingService';
import { TaskFormattingService } from './core/taskFormattingService';

/**
 * Task Data Service
 * 
 * High-level service that orchestrates data fetching and formatting
 * for the Client Assigned Tasks Overview component.
 */
export class TaskDataService {
  /**
   * Fetch clients from database
   */
  static async fetchClients(): Promise<Client[]> {
    try {
      return await DataFetchingService.fetchClients();
    } catch (error) {
      console.error('[TaskDataService] Error fetching clients:', error);
      throw error;
    }
  }

  /**
   * Fetch and format all client tasks
   */
  static async fetchAllClientTasks(
    clients: Client[],
    staffOptions: StaffOption[] = []
  ): Promise<{
    formattedTasks: FormattedTask[];
    uniqueSkills: Set<string>;
    uniquePriorities: Set<string>;
  }> {
    console.log(`[TaskDataService] Fetching tasks for ${clients.length} clients`);
    
    const allFormattedTasks: FormattedTask[] = [];
    const uniqueSkills = new Set<string>();
    const uniquePriorities = new Set<string>();

    for (const client of clients) {
      try {
        const { formattedTasks } = await this.fetchClientTasks(client, staffOptions);
        
        allFormattedTasks.push(...formattedTasks);
        
        // Collect unique skills and priorities
        formattedTasks.forEach(task => {
          task.requiredSkills.forEach(skill => uniqueSkills.add(skill));
          if (task.priority) {
            uniquePriorities.add(task.priority);
          }
        });
        
      } catch (error) {
        console.error(`[TaskDataService] Error fetching tasks for client ${client.id}:`, error);
        // Continue with other clients even if one fails
      }
    }

    console.log(`[TaskDataService] Total tasks processed: ${allFormattedTasks.length}`);
    console.log(`[TaskDataService] Unique skills collected: ${Array.from(uniqueSkills).join(',')}`);
    console.log(`[TaskDataService] Unique priorities collected: ${Array.from(uniquePriorities).join(',')}`);

    return {
      formattedTasks: allFormattedTasks,
      uniqueSkills,
      uniquePriorities
    };
  }

  /**
   * Fetch and format tasks for a specific client
   */
  static async fetchClientTasks(
    client: Client,
    staffOptions: StaffOption[] = []
  ): Promise<{
    formattedTasks: FormattedTask[];
    recurringCount: number;
    adHocCount: number;
  }> {
    try {
      // Fetch recurring tasks
      const recurringTasks = await DataFetchingService.fetchRecurringTasksForClient(client.id);
      
      // Format recurring tasks (now passing staff options)
      const formattedRecurringTasks = await TaskFormattingService.formatRecurringTasks(
        recurringTasks, 
        [client],
        staffOptions
      );

      // TODO: Fetch and format ad-hoc tasks when implemented
      const formattedAdHocTasks: FormattedTask[] = [];

      const allFormattedTasks = [
        ...formattedRecurringTasks,
        ...formattedAdHocTasks
      ];

      console.log(`[TaskDataService] Processed ${formattedRecurringTasks.length} recurring and ${formattedAdHocTasks.length} ad-hoc tasks for client ${client.legalName}`);

      return {
        formattedTasks: allFormattedTasks,
        recurringCount: formattedRecurringTasks.length,
        adHocCount: formattedAdHocTasks.length
      };
    } catch (error) {
      console.error(`[TaskDataService] Error fetching tasks for client ${client.id}:`, error);
      throw error;
    }
  }
}
