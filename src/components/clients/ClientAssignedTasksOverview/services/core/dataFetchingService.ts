
import { Client } from '@/types/client';
import { 
  getClientRecurringTasks, 
  getClientAdHocTasks,
  getAllClients
} from '@/services/clientService';

/**
 * Core Data Fetching Service
 * 
 * Handles basic data fetching operations with error handling and logging.
 * Centralized error handling and consistent logging across all fetch operations.
 */
export class DataFetchingService {
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
  static async fetchRecurringTasksForClient(clientId: string) {
    try {
      return await getClientRecurringTasks(clientId);
    } catch (error) {
      console.error(`Error fetching recurring tasks for client ${clientId}:`, error);
      throw new Error(`Failed to fetch recurring tasks for client ${clientId}`);
    }
  }

  /**
   * Legacy method name for backward compatibility
   */
  static async fetchClientRecurringTasks(clientId: string) {
    return this.fetchRecurringTasksForClient(clientId);
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
}
