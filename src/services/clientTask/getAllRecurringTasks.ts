
import { getClientRecurringTasks } from './recurringTaskOperations';
import { getAllClients } from '../clientService';
import { RecurringTask } from '@/types/task';

/**
 * Get all recurring tasks from all clients
 * 
 * @returns Promise resolving to array of all recurring tasks
 */
export const getAllRecurringTasks = async (): Promise<RecurringTask[]> => {
  try {
    const clients = await getAllClients();
    const allRecurringTasks: RecurringTask[] = [];
    
    // Fetch recurring tasks for each client
    for (const client of clients) {
      try {
        const clientTasks = await getClientRecurringTasks(client.id);
        allRecurringTasks.push(...clientTasks);
      } catch (error) {
        console.warn(`Failed to fetch recurring tasks for client ${client.id}:`, error);
      }
    }
    
    console.log(`Retrieved ${allRecurringTasks.length} recurring tasks from ${clients.length} clients`);
    return allRecurringTasks;
  } catch (error) {
    console.error('Error fetching all recurring tasks:', error);
    throw error;
  }
};
