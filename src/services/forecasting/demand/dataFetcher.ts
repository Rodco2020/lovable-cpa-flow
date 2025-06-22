import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters, StaffFilterOption } from '@/types/demand';
import { RecurringTaskDB, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';
import { DataValidator } from './dataValidator';

/**
 * Enhanced Data Fetcher Service with staff data support
 * Phase 1: Database Analysis and Backend Preparation
 */
export class DataFetcher {
  /**
   * ENHANCED: Fetch client-assigned tasks with staff information
   */
  static async fetchClientAssignedTasks(filters: DemandFilters = { 
    skills: [], 
    clients: [], 
    preferredStaff: [], // NEW: Add preferred staff filter
    timeHorizon: { start: new Date(), end: new Date() } 
  }): Promise<RecurringTaskDB[]> {
    debugLog('Fetching client-assigned tasks with staff information', { filters });

    try {
      // ENHANCED: Build query with staff information join
      let query = supabase
        .from('recurring_tasks')
        .select(`
          *,
          clients!inner(id, legal_name, expected_monthly_revenue),
          staff(id, full_name, role_title)
        `)
        .eq('is_active', true)
        .range(0, 999);

      // Apply existing filters
      if (filters.clients && filters.clients.length > 0) {
        const validClientIds = filters.clients.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validClientIds.length > 0) {
          query = query.in('client_id', validClientIds);
        }
      }

      // NEW: Apply preferred staff filter
      if (filters.preferredStaff && filters.preferredStaff.length > 0) {
        const validStaffIds = filters.preferredStaff.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        
        if (validStaffIds.length > 0) {
          query = query.in('preferred_staff_id', validStaffIds);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database query failed:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data) {
        debugLog('No recurring tasks found in database');
        return [];
      }

      debugLog(`Fetched ${data.length} recurring tasks with staff information from database`);

      // Type-cast and enhance with staff data
      const typedData: RecurringTaskDB[] = data.map(task => ({
        ...task,
        priority: task.priority as TaskPriority,
        category: task.category as TaskCategory,
        status: task.status as TaskStatus,
        // Include staff information if available
        staff_info: task.staff ? {
          id: task.staff.id,
          full_name: task.staff.full_name,
          role_title: task.staff.role_title
        } : null
      }));

      // Enhanced validation with staff data
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(typedData);

      if (invalidTasks.length > 0) {
        console.warn(`Data quality issues: ${invalidTasks.length}/${typedData.length} tasks excluded`);
        
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
      return this.attemptFallbackDataFetch();
    }
  }

  /**
   * NEW: Fetch available staff for preferred staff filtering
   */
  static async fetchAvailableStaff(): Promise<StaffFilterOption[]> {
    try {
      debugLog('Fetching available staff for filtering');

      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('status', 'active')
        .order('full_name')
        .range(0, 999);

      if (error) {
        console.error('Error fetching staff:', error);
        return [];
      }

      if (!Array.isArray(data)) {
        console.warn('Staff data is not an array');
        return [];
      }

      // Validate and format staff data
      const validStaff = data
        .filter(staff => 
          staff && 
          typeof staff.id === 'string' && 
          typeof staff.full_name === 'string' &&
          staff.id.trim().length > 0 &&
          staff.full_name.trim().length > 0
        )
        .map(staff => ({
          id: staff.id.trim(),
          name: staff.full_name.trim()
        }));

      debugLog(`Fetched ${validStaff.length} valid staff members`);
      return validStaff;

    } catch (error) {
      console.error('Error fetching available staff:', error);
      return [];
    }
  }

  /**
   * NEW: Fetch staff with task assignment statistics
   */
  static async fetchStaffWithTaskStats(): Promise<Array<StaffFilterOption & { taskCount: number; totalHours: number }>> {
    try {
      debugLog('Fetching staff with task assignment statistics');

      // Get staff with their task assignments
      const { data, error } = await supabase
        .from('staff')
        .select(`
          id,
          full_name,
          recurring_tasks!left(id, estimated_hours)
        `)
        .eq('status', 'active')
        .order('full_name');

      if (error) {
        console.error('Error fetching staff with task stats:', error);
        return [];
      }

      if (!Array.isArray(data)) {
        console.warn('Staff with task stats data is not an array');
        return [];
      }

      // Calculate statistics for each staff member
      const staffWithStats = data
        .filter(staff => staff && staff.id && staff.full_name)
        .map(staff => {
          const tasks = Array.isArray(staff.recurring_tasks) ? staff.recurring_tasks : [];
          const taskCount = tasks.length;
          const totalHours = tasks.reduce((sum, task) => {
            return sum + (typeof task.estimated_hours === 'number' ? task.estimated_hours : 0);
          }, 0);

          return {
            id: staff.id,
            name: staff.full_name,
            taskCount,
            totalHours
          };
        });

      debugLog(`Fetched ${staffWithStats.length} staff members with task statistics`);
      return staffWithStats;

    } catch (error) {
      console.error('Error fetching staff with task statistics:', error);
      return [];
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

      const fallbackTasks: RecurringTaskDB[] = data
        .filter(task => task && task.id && task.client_id)
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
        let category = 'Other';
        
        if (error.includes('skill')) category = 'Invalid Skills';
        else if (error.includes('hours')) category = 'Invalid Hours';
        else if (error.includes('date')) category = 'Invalid Dates';
        else if (error.includes('ID')) category = 'Missing IDs';
        else if (error.includes('recurrence')) category = 'Invalid Recurrence';
        else if (error.includes('staff')) category = 'Invalid Staff';

        errorCounts[category] = (errorCounts[category] || 0) + 1;
      });
    });

    return errorCounts;
  }

  /**
   * Fetch available skills with validation
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

      if (!Array.isArray(data)) {
        console.warn('Skills data is not an array');
        return [];
      }

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
   * Fetch available clients with validation
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

      if (!Array.isArray(data)) {
        console.warn('Clients data is not an array');
        return [];
      }

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

      if (!Array.isArray(data)) {
        console.warn('Clients revenue data is not an array');
        return [];
      }

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
