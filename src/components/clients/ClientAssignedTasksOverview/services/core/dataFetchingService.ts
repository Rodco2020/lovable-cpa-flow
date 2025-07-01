
import { Client } from '@/types/client';
import { 
  getAllClients
} from '@/services/clientService';
import { supabase } from '@/lib/supabaseClient';
import { RecurringTaskDB } from '@/types/task';

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
   * Fetch recurring tasks for a specific client (raw database format)
   * Returns RecurringTaskDB[] for use with TaskFormattingService
   */
  static async fetchRecurringTasksForClient(clientId: string): Promise<RecurringTaskDB[]> {
    try {
      console.log(`[DataFetchingService] Fetching raw recurring tasks for client ${clientId}`);
      
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recurring tasks from database:', error);
        throw error;
      }

      console.log(`[DataFetchingService] Successfully fetched ${data?.length || 0} recurring tasks`);
      return data || [];
    } catch (error) {
      console.error(`Error fetching recurring tasks for client ${clientId}:`, error);
      throw new Error(`Failed to fetch recurring tasks for client ${clientId}`);
    }
  }

  /**
   * Legacy method name for backward compatibility
   */
  static async fetchClientRecurringTasks(clientId: string): Promise<RecurringTaskDB[]> {
    return this.fetchRecurringTasksForClient(clientId);
  }

  /**
   * Fetch ad-hoc tasks for a specific client
   */
  static async fetchClientAdHocTasks(clientId: string) {
    try {
      // TODO: Implement when ad-hoc tasks are added to the system
      console.log(`[DataFetchingService] Ad-hoc tasks not yet implemented for client ${clientId}`);
      return [];
    } catch (error) {
      console.error(`Error fetching ad-hoc tasks for client ${clientId}:`, error);
      throw new Error(`Failed to fetch ad-hoc tasks for client ${clientId}`);
    }
  }
}
