
import { Client } from '@/types/client';
import { FormattedTask } from '../types';
import { 
  getClientRecurringTasks, 
  getClientAdHocTasks,
  getAllClients
} from '@/services/clientService';

/**
 * Service for fetching client and task data
 * Centralizes all data fetching operations for the Client Assigned Tasks Overview
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
   * Fetch all tasks for all clients
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
        // Get recurring tasks
        const recurringTasks = await this.fetchClientRecurringTasks(client.id);
        
        // Format recurring tasks
        const formattedRecurringTasks: FormattedTask[] = recurringTasks.map(task => {
          // Collect skills and priorities for filter options
          task.requiredSkills.forEach(skill => skills.add(skill));
          priorities.add(task.priority);
          
          return {
            id: task.id,
            clientId: client.id,
            clientName: client.legalName,
            taskName: task.name,
            taskType: 'Recurring',
            dueDate: task.dueDate,
            recurrencePattern: task.recurrencePattern,
            estimatedHours: task.estimatedHours,
            requiredSkills: task.requiredSkills,
            priority: task.priority,
            status: task.status,
            isActive: task.isActive
          };
        });
        
        // Get ad-hoc tasks
        const adHocTasks = await this.fetchClientAdHocTasks(client.id);
        
        // Format ad-hoc tasks
        const formattedAdHocTasks: FormattedTask[] = adHocTasks.map(task => {
          // Collect skills and priorities for filter options
          task.requiredSkills.forEach(skill => skills.add(skill));
          priorities.add(task.priority);
          
          return {
            id: task.id,
            clientId: client.id,
            clientName: client.legalName,
            taskName: task.name,
            taskType: 'Ad-hoc',
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            requiredSkills: task.requiredSkills,
            priority: task.priority,
            status: task.status
          };
        });
        
        // Add all tasks to the array
        allFormattedTasks.push(...formattedRecurringTasks, ...formattedAdHocTasks);
      } catch (error) {
        console.error(`Error processing tasks for client ${client.legalName}:`, error);
        // Continue with other clients even if one fails
      }
    }
    
    return {
      formattedTasks: allFormattedTasks,
      skills,
      priorities
    };
  }
}
