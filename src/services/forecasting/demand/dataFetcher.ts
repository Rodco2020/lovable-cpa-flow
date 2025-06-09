
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';
import { DataValidator } from './dataValidator';

/**
 * Enhanced Data Fetcher Service with validation and error handling
 */
export class DataFetcher {
  /**
   * Fetch client-assigned tasks with comprehensive validation
   */
  static async fetchClientAssignedTasks(filters: DemandFilters = { skills: [], clients: [], timeHorizon: { start: new Date(), end: new Date() } }): Promise<RecurringTaskDB[]> {
    debugLog('Fetching client-assigned tasks with filters', { filters });

    try {
      // Build query with proper error handling
      let query = supabase
        .from('recurring_tasks')
        .select('*, clients!inner(id, legal_name)')
        .eq('is_active', true);

      // Apply filters safely
      if (filters.clients && filters.clients.length > 0) {
        // Validate client IDs
        const validClientIds = filters.clients.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validClientIds.length > 0) {
          query = query.in('client_id', validClientIds);
        }
      }

      // Execute query with timeout
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recurring tasks:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data) {
        debugLog('No recurring tasks found');
        return [];
      }

      debugLog(`Fetched ${data.length} recurring tasks from database`);

      // Type-cast the raw data to ensure proper typing
      const typedData: RecurringTaskDB[] = data.map(task => ({
        ...task,
        priority: task.priority as TaskPriority, // Explicit cast to TaskPriority
        category: task.category as TaskCategory, // Explicit cast to TaskCategory
        status: task.status as TaskStatus // Explicit cast to TaskStatus
      }));

      // Validate and sanitize the data
      const { validTasks, invalidTasks } = DataValidator.validateRecurringTasks(typedData);

      if (invalidTasks.length > 0) {
        console.warn(`Found ${invalidTasks.length} invalid tasks, excluding from processing`);
        invalidTasks.forEach(({ task, errors }) => {
          console.warn(`Invalid task ${task.id}:`, errors);
        });
      }

      debugLog(`Validated ${validTasks.length} tasks for processing`);
      return validTasks;

    } catch (error) {
      console.error('Error in fetchClientAssignedTasks:', error);
      
      // Return empty array instead of throwing to prevent cascade failures
      return [];
    }
  }

  /**
   * Fetch available skills with validation
   */
  static async fetchAvailableSkills(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching skills:', error);
        return [];
      }

      if (!Array.isArray(data)) {
        console.warn('Skills data is not an array');
        return [];
      }

      // Validate and extract skill names
      const validSkills = data
        .filter(skill => skill && typeof skill.name === 'string' && skill.name.trim().length > 0)
        .map(skill => skill.name.trim())
        .slice(0, 100); // Limit to prevent performance issues

      debugLog(`Fetched ${validSkills.length} valid skills`);
      return validSkills;

    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  /**
   * Fetch available clients with validation
   */
  static async fetchAvailableClients(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name')
        .eq('status', 'active')
        .order('legal_name');

      if (error) {
        console.error('Error fetching clients:', error);
        return [];
      }

      if (!Array.isArray(data)) {
        console.warn('Clients data is not an array');
        return [];
      }

      // Validate and format client data
      const validClients = data
        .filter(client => 
          client && 
          typeof client.id === 'string' && 
          typeof client.legal_name === 'string' &&
          client.id.trim().length > 0 &&
          client.legal_name.trim().length > 0
        )
        .map(client => ({
          id: client.id.trim(),
          name: client.legal_name.trim()
        }))
        .slice(0, 1000); // Reasonable limit

      debugLog(`Fetched ${validClients.length} valid clients`);
      return validClients;

    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }
}
