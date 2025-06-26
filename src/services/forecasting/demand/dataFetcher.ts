
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { DataTransformationService } from './dataTransformationService';

/**
 * Pure Data Fetcher Service
 * Focused on database queries and data retrieval without validation logic
 */
export class DataFetcher {
  /**
   * Fetch client-assigned tasks with basic error handling
   * Phase 3: Enhanced to include preferred staff filtering
   */
  static async fetchClientAssignedTasks(filters: DemandFilters = { 
    skills: [], 
    clients: [], 
    preferredStaff: [], // Phase 3: Include preferred staff in default filters
    timeHorizon: { start: new Date(), end: new Date() } 
  }): Promise<RecurringTaskDB[]> {
    debugLog('Fetching client-assigned tasks', { filters });

    try {
      // Build query with proper error handling and preferred staff information
      let query = supabase
        .from('recurring_tasks')
        .select(`
          *, 
          clients!inner(id, legal_name, expected_monthly_revenue),
          staff(id, full_name, role_title)
        `)
        .eq('is_active', true)
        .range(0, 999); // Explicit range to avoid default 10 row limit

      // Apply client filters safely
      if (filters.clients && filters.clients.length > 0) {
        const validClientIds = filters.clients.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validClientIds.length > 0) {
          query = query.in('client_id', validClientIds);
        }
      }

      // Phase 3: Apply preferred staff filters
      if (filters.preferredStaff && filters.preferredStaff.length > 0) {
        const validStaffIds = filters.preferredStaff.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validStaffIds.length > 0) {
          console.log(`🎯 [DATA FETCHER] Applying preferred staff filter for ${validStaffIds.length} staff members`);
          query = query.in('preferred_staff_id', validStaffIds);
        }
      }

      // Execute query
      const { data, error } = await query;

      if (error) {
        console.error('Database query failed:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data) {
        debugLog('No recurring tasks found in database');
        return [];
      }

      debugLog(`Fetched ${data.length} recurring tasks from database`);

      // Transform raw data to typed objects
      const typedData = DataTransformationService.transformRecurringTasks(data);
      return typedData;

    } catch (error) {
      console.error('Error in fetchClientAssignedTasks:', error);
      return this.attemptFallbackDataFetch();
    }
  }

  /**
   * Attempt fallback data fetch with minimal filtering
   */
  private static async attemptFallbackDataFetch(): Promise<RecurringTaskDB[]> {
    try {
      console.log('Attempting fallback data fetch with minimal filtering...');
      
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*, clients(id, legal_name, expected_monthly_revenue)')
        .eq('is_active', true)
        .range(0, 999);

      if (error) {
        console.error('Fallback query also failed:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn('No data available even with fallback approach');
        return [];
      }

      // Apply basic type casting and minimal validation
      const fallbackTasks = DataTransformationService.createFallbackTasks(data);
      console.log(`Fallback fetch recovered ${fallbackTasks.length} tasks`);
      return fallbackTasks;

    } catch (fallbackError) {
      console.error('Fallback data fetch failed:', fallbackError);
      return [];
    }
  }

  /**
   * Fetch available skills
   */
  static async fetchAvailableSkills(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('name')
        .range(0, 999);

      if (error) {
        console.error('Error fetching skills:', error);
        return [];
      }

      return DataTransformationService.transformSkillData(data);

    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  /**
   * Fetch available clients
   */
  static async fetchAvailableClients(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name')
        .eq('status', 'Active')
        .order('legal_name')
        .range(0, 999);

      if (error) {
        console.error('Error fetching clients:', error);
        return [];
      }

      return DataTransformationService.transformClientData(data);

    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  /**
   * Fetch clients with revenue data for matrix calculations
   */
  static async fetchClientsWithRevenue(): Promise<Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name, expected_monthly_revenue')
        .eq('status', 'Active')
        .order('legal_name')
        .range(0, 999);

      if (error) {
        console.error('Error fetching clients with revenue:', error);
        return [];
      }

      return DataTransformationService.transformClientsWithRevenue(data);

    } catch (error) {
      console.error('Error fetching clients with revenue:', error);
      return [];
    }
  }
}
