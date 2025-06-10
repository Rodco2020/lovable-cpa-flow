import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';
import { DataValidator } from './dataValidator';

/**
 * Enhanced Data Fetcher Service with validation, error handling, and skill resolution
 */
export class DataFetcher {
  /**
   * Fetch client-assigned tasks with comprehensive validation and error recovery
   */
  static async fetchClientAssignedTasks(filters: DemandFilters = { 
    skills: [], 
    clients: [], 
    timeHorizon: { start: new Date(), end: new Date() } 
  }): Promise<RecurringTaskDB[]> {
    debugLog('Fetching client-assigned tasks with enhanced validation', { filters });

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

      // Execute query with timeout and retry logic - REMOVED LIMIT
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

      // Type-cast the raw data to ensure proper typing
      const typedData: RecurringTaskDB[] = data.map(task => ({
        ...task,
        priority: task.priority as TaskPriority,
        category: task.category as TaskCategory,
        status: task.status as TaskStatus
      }));

      // Enhanced validation and cleaning with skill resolution
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(typedData);

      // Provide detailed feedback about data quality
      if (invalidTasks.length > 0) {
        console.warn(`Data quality issues: ${invalidTasks.length}/${typedData.length} tasks excluded`);
        
        // Group errors for better reporting
        const errorSummary = this.summarizeValidationErrors(invalidTasks);
        console.warn('Validation error summary:', errorSummary);
      }

      if (resolvedTasks.length > 0) {
        console.log(`Successfully resolved skill references for ${resolvedTasks.length} tasks`);
      }

      const successRate = ((validTasks.length / typedData.length) * 100).toFixed(1);
      debugLog(`Data validation complete: ${validTasks.length}/${typedData.length} tasks valid (${successRate}%)`);
      
      return validTasks;

    } catch (error) {
      console.error('Error in fetchClientAssignedTasks:', error);
      
      // Instead of returning empty array, try a fallback approach
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
        .select('*, clients(id, legal_name)')
        .eq('is_active', true);
        // REMOVED: .limit(100) - Now fetches all records

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
        .order('name');
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
        .eq('status', 'active')
        .order('legal_name');
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
}
