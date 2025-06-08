
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB, SkillType } from '@/types/task';

/**
 * Data Fetcher Service
 * Handles all data fetching operations for demand forecasting
 */
export class DataFetcher {
  /**
   * Fetch all client-assigned recurring tasks with filtering
   */
  static async fetchClientAssignedTasks(filters?: DemandFilters): Promise<RecurringTaskDB[]> {
    debugLog('Fetching client-assigned recurring tasks', { filters });

    try {
      let query = supabase
        .from('recurring_tasks')
        .select(`
          *,
          clients!inner(id, legal_name)
        `)
        .eq('is_active', true);

      // Apply client filters if specified
      if (filters?.clients && filters.clients.length > 0 && !filters.clients.includes('all')) {
        query = query.in('client_id', filters.clients);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching client-assigned tasks:', error);
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }

      let tasks = data || [];

      // Apply skill filters if specified
      if (filters?.skills && filters.skills.length > 0) {
        tasks = tasks.filter(task => 
          task.required_skills.some((skill: SkillType) => 
            filters.skills.includes(skill)
          )
        );
      }

      // Include inactive tasks if requested
      if (!filters?.includeInactive) {
        tasks = tasks.filter(task => task.is_active);
      }

      debugLog(`Found ${tasks.length} client-assigned tasks`);
      return tasks as RecurringTaskDB[];
    } catch (error) {
      console.error('Error in fetchClientAssignedTasks:', error);
      throw error;
    }
  }
}
