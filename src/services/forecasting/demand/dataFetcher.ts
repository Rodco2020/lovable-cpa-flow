import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { DataTransformationService } from './dataTransformationService';

/**
 * FIXED: Pure Data Fetcher Service - Enhanced with preferred staff information
 * Focused on database queries and data retrieval including staff details
 */
export class DataFetcher {
  /**
   * FIXED: Fetch client-assigned tasks with preferred staff information
   */
  static async fetchClientAssignedTasks(filters: DemandFilters = { 
    skills: [], 
    clients: [], 
    preferredStaff: [], 
    timeHorizon: { start: new Date(), end: new Date() } 
  }): Promise<RecurringTaskDB[]> {
    debugLog('FIXED: Fetching client-assigned tasks with preferred staff info', { filters });

    try {
      // FIXED: Enhanced query to include staff information for preferred staff filtering
      let query = supabase
        .from('recurring_tasks')
        .select(`
          *, 
          clients!inner(id, legal_name, expected_monthly_revenue),
          staff(id, full_name, role_title)
        `)
        .eq('is_active', true)
        .range(0, 999);

      // Apply client filters safely
      if (filters.clients && filters.clients.length > 0) {
        const validClientIds = filters.clients.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validClientIds.length > 0) {
          query = query.in('client_id', validClientIds);
        }
      }

      // FIXED: Apply preferred staff filters with proper validation
      if (filters.preferredStaff && filters.preferredStaff.length > 0) {
        const validStaffIds = filters.preferredStaff.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validStaffIds.length > 0) {
          console.log(`🎯 [DATA FETCHER] FIXED: Applying preferred staff filter for ${validStaffIds.length} staff members:`, validStaffIds);
          query = query.in('preferred_staff_id', validStaffIds);
        }
      }

      // Execute query
      const { data, error } = await query;

      if (error) {
        console.error('❌ [DATA FETCHER] Database query failed:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data) {
        debugLog('No recurring tasks found in database');
        return [];
      }

      console.log(`✅ [DATA FETCHER] FIXED: Fetched ${data.length} recurring tasks from database with staff info`);

      // Log preferred staff statistics
      const tasksWithPreferredStaff = data.filter(task => task.preferred_staff_id);
      console.log(`📊 [DATA FETCHER] Preferred staff statistics:`, {
        totalTasks: data.length,
        tasksWithPreferredStaff: tasksWithPreferredStaff.length,
        uniquePreferredStaff: new Set(tasksWithPreferredStaff.map(task => task.preferred_staff_id)).size,
        preferredStaffNames: Array.from(new Set(
          tasksWithPreferredStaff
            .filter(task => task.staff?.full_name)
            .map(task => task.staff.full_name)
        ))
      });

      // Transform raw data to typed objects
      const typedData = DataTransformationService.transformRecurringTasks(data);
      return typedData;

    } catch (error) {
      console.error('❌ [DATA FETCHER] Error in fetchClientAssignedTasks:', error);
      return this.attemptFallbackDataFetch();
    }
  }

  
  private static async attemptFallbackDataFetch(): Promise<RecurringTaskDB[]> {
    try {
      console.log('Attempting fallback data fetch with minimal filtering...');
      
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*, clients(id, legal_name, expected_monthly_revenue), staff(id, full_name, role_title)')
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

      const fallbackTasks = DataTransformationService.createFallbackTasks(data);
      console.log(`Fallback fetch recovered ${fallbackTasks.length} tasks`);
      return fallbackTasks;

    } catch (fallbackError) {
      console.error('Fallback data fetch failed:', fallbackError);
      return [];
    }
  }

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
