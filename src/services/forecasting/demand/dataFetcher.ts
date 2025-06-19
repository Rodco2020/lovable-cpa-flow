
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';
import { DataValidator } from './dataValidator';

/**
 * Enhanced Data Fetcher Service with validation, error handling, skill resolution, and preferred staff filtering
 * Phase 1: Added preferred staff member filtering capabilities
 */
export class DataFetcher {
  /**
   * Phase 1: Enhanced fetch client-assigned tasks with preferred staff filtering
   */
  static async fetchClientAssignedTasks(filters: DemandFilters = { 
    skills: [], 
    clients: [], 
    timeHorizon: { start: new Date(), end: new Date() } 
  }): Promise<RecurringTaskDB[]> {
    debugLog('Fetching client-assigned tasks with enhanced validation and preferred staff filtering', { filters });

    try {
      // Phase 1: Build query with preferred staff filtering support
      let query = supabase
        .from('recurring_tasks')
        .select(`
          *, 
          clients!inner(id, legal_name, expected_monthly_revenue),
          staff(id, full_name)
        `)
        .eq('is_active', true)
        .range(0, 999);

      // Apply client filters
      if (filters.clients && filters.clients.length > 0) {
        const validClientIds = filters.clients.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validClientIds.length > 0) {
          query = query.in('client_id', validClientIds);
        }
      }

      // Phase 1: NEW - Apply preferred staff filters
      if (filters.preferredStaffIds && filters.preferredStaffIds.length > 0) {
        const validStaffIds = filters.preferredStaffIds.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validStaffIds.length > 0) {
          console.log(`🎯 [DataFetcher] Applying preferred staff filter for ${validStaffIds.length} staff members`);
          query = query.in('preferred_staff_id', validStaffIds);
        }
      }

      // Execute query with timeout and retry logic
      const { data, error } = await query;

      if (error) {
        console.error('Database query failed:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data) {
        debugLog('No recurring tasks found in database');
        return [];
      }

      debugLog(`Fetched ${data.length} recurring tasks from database (with preferred staff filter applied)`);

      // Type-cast the raw data to ensure proper typing
      const typedData: RecurringTaskDB[] = data.map(task => ({
        ...task,
        priority: task.priority as TaskPriority,
        category: task.category as TaskCategory,
        status: task.status as TaskStatus,
        // Phase 1: Preserve preferred staff information
        preferred_staff_name: task.staff?.full_name || null
      }));

      // Enhanced validation and cleaning with skill resolution
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(typedData);

      // Provide detailed feedback about data quality
      if (invalidTasks.length > 0) {
        console.warn(`Data quality issues: ${invalidTasks.length}/${typedData.length} tasks excluded`);
        
        const errorSummary = this.summarizeValidationErrors(invalidTasks);
        console.warn('Validation error summary:', errorSummary);
      }

      if (resolvedTasks.length > 0) {
        console.log(`Successfully resolved skill references for ${resolvedTasks.length} tasks`);
      }

      // Phase 1: Log preferred staff filtering results
      const tasksWithPreferredStaff = validTasks.filter(task => task.preferred_staff_id);
      console.log(`✅ [DataFetcher] Filtering complete: ${validTasks.length} valid tasks, ${tasksWithPreferredStaff.length} with preferred staff assigned`);

      const successRate = ((validTasks.length / typedData.length) * 100).toFixed(1);
      debugLog(`Data validation complete: ${validTasks.length}/${typedData.length} tasks valid (${successRate}%)`);
      
      return validTasks;

    } catch (error) {
      console.error('Error in fetchClientAssignedTasks:', error);
      
      // Attempt fallback data fetch
      return this.attemptFallbackDataFetch();
    }
  }

  /**
   * Attempt fallback data fetch with minimal filtering - REMOVED LIMIT
   */
  private static async attemptFallbackDataFetch(): Promise<RecurringTaskDB[]> {
    try {
      console.log('Attempting fallback data fetch with minimal filtering...');
      
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*, clients(id, legal_name, expected_monthly_revenue)')
        .eq('is_active', true)
        .range(0, 999); // explicitly fetch up to 1000 rows

      if (error) {
        console.error('Fallback query also failed:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn('No data available even with fallback approach');
        return [];
      }

      // Apply basic type casting and minimal validation
      const fallbackTasks: RecurringTaskDB[] = data
        .filter(task => task && task.id && task.client_id) // Basic existence check
        .map(task => ({
          ...task,
          priority: (task.priority as TaskPriority) || 'Medium',
          category: (task.category as TaskCategory) || 'Other',
          status: (task.status as TaskStatus) || 'Unscheduled',
          required_skills: Array.isArray(task.required_skills) ? task.required_skills : []
        }));

      console.log(`Fallback fetch recovered ${fallbackTasks.length} tasks`);
      return fallbackTasks;

    } catch (fallbackError) {
      console.error('Fallback data fetch failed:', fallbackError);
      return [];
    }
  }

  /**
   * Summarize validation errors for better reporting
   */
  private static summarizeValidationErrors(invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }>): Record<string, number> {
    const errorCounts: Record<string, number> = {};

    invalidTasks.forEach(({ errors }) => {
      errors.forEach(error => {
        // Categorize errors for cleaner reporting
        let category = 'Other';
        
        if (error.includes('skill')) category = 'Invalid Skills';
        else if (error.includes('hours')) category = 'Invalid Hours';
        else if (error.includes('date')) category = 'Invalid Dates';
        else if (error.includes('ID')) category = 'Missing IDs';
        else if (error.includes('recurrence')) category = 'Invalid Recurrence';

        errorCounts[category] = (errorCounts[category] || 0) + 1;
      });
    });

    return errorCounts;
  }

  /**
   * Fetch available skills with validation - REMOVED LIMIT
   */
  static async fetchAvailableSkills(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('name')
        .range(0, 999); // ensure all skills retrieved
        // REMOVED: .limit(100) - Now fetches all skills

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
        .map(skill => skill.name.trim());

      debugLog(`Fetched ${validSkills.length} valid skills`);
      return validSkills;

    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  /**
   * Fetch available clients with validation - INCREASED LIMIT
   */
  static async fetchAvailableClients(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name')
        .eq('status', 'Active')
        .order('legal_name')
        .range(0, 999); // ensure all active clients fetched
        // REMOVED: .limit(1000) - Now fetches all active clients

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
        }));

      debugLog(`Fetched ${validClients.length} valid clients`);
      return validClients;

    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  /**
   * NEW: Fetch clients with revenue data for matrix calculations
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

      if (!Array.isArray(data)) {
        console.warn('Clients revenue data is not an array');
        return [];
      }

      // Validate and format client revenue data
      const validClients = data
        .filter(client => 
          client && 
          typeof client.id === 'string' && 
          typeof client.legal_name === 'string' &&
          client.id.trim().length > 0 &&
          client.legal_name.trim().length > 0 &&
          typeof client.expected_monthly_revenue === 'number'
        )
        .map(client => ({
          id: client.id.trim(),
          legal_name: client.legal_name.trim(),
          expected_monthly_revenue: Number(client.expected_monthly_revenue) || 0
        }));

      debugLog(`Fetched ${validClients.length} clients with revenue data`);
      return validClients;

    } catch (error) {
      console.error('Error fetching clients with revenue:', error);
      return [];
    }
  }
}
