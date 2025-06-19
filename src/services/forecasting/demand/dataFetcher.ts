import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';
import { DataValidator } from './dataValidator';
import { SkillResolutionService } from './skillResolutionService';
import { startOfYear, addMonths, format } from 'date-fns';

/**
 * Enhanced Data Fetcher Service with validation, error handling, skill resolution, and preferred staff support
 */
export class DataFetcher {
  /**
   * Fetch forecast data for demand matrix generation
   */
  static async fetchForecastData(startDate: Date = startOfYear(new Date())): Promise<any[]> {
    debugLog('Fetching forecast data for demand matrix generation', { startDate });

    try {
      // Generate 12 months of forecast periods starting from startDate
      const forecastPeriods = Array.from({ length: 12 }, (_, index) => {
        const periodDate = addMonths(startDate, index);
        return {
          period: format(periodDate, 'yyyy-MM'),
          periodLabel: format(periodDate, 'MMM yyyy'),
          demand: [],
          capacity: [],
          demandHours: 0,
          capacityHours: 0
        };
      });

      debugLog(`Generated ${forecastPeriods.length} forecast periods`);
      return forecastPeriods;

    } catch (error) {
      console.error('Error fetching forecast data:', error);
      return [];
    }
  }

  /**
   * Fetch recurring tasks for matrix generation with skill resolution
   */
  static async fetchRecurringTasks(): Promise<RecurringTaskDB[]> {
    debugLog('Fetching recurring tasks with skill resolution for matrix generation');

    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          *,
          clients(id, legal_name, expected_monthly_revenue),
          preferred_staff:staff!recurring_tasks_preferred_staff_id_fkey(id, full_name, role_title)
        `)
        .eq('is_active', true)
        .range(0, 999);

      if (error) {
        console.error('Database query failed:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data) {
        debugLog('No recurring tasks found in database');
        return [];
      }

      debugLog(`Fetched ${data.length} recurring tasks from database`);

      // Type-cast and validate the data
      const typedData: RecurringTaskDB[] = data.map(task => ({
        ...task,
        priority: task.priority as TaskPriority,
        category: task.category as TaskCategory,
        status: task.status as TaskStatus,
        preferred_staff: task.preferred_staff
      }));

      // Apply validation in permissive mode so unresolved skills don't block processing
      const { validTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(typedData, { permissive: true });

      // Use tasks with resolved skills when available
      const tasksForResolution = resolvedTasks.length > 0 ? resolvedTasks : validTasks;

      // Resolve skills for the tasks we are keeping
      const tasksWithResolvedSkills = await this.resolveTaskSkills(tasksForResolution);
      
      debugLog(`Data validation and skill resolution complete: ${tasksWithResolvedSkills.length}/${typedData.length} tasks processed`);
      return tasksWithResolvedSkills;

    } catch (error) {
      console.error('Error fetching recurring tasks:', error);
      return [];
    }
  }

  /**
   * Resolve skill UUIDs to names for tasks
   */
  private static async resolveTaskSkills(tasks: RecurringTaskDB[]): Promise<RecurringTaskDB[]> {
    try {
      debugLog('Starting skill resolution for tasks...');

      const resolvedTasks = await Promise.all(
        tasks.map(async (task) => {
          if (!Array.isArray(task.required_skills) || task.required_skills.length === 0) {
            return task; // No skills to resolve
          }

          try {
            // Get the resolved skill names
            const resolvedSkillNames = await SkillResolutionService.getSkillNames(task.required_skills);
            
            // Create resolved task with updated skills
            const resolvedTask = {
              ...task,
              required_skills: resolvedSkillNames
            };

            return resolvedTask;

          } catch (skillError) {
            console.warn(`Could not resolve skills for task ${task.id}:`, skillError);
            // Return task with original skills as fallback
            return task;
          }
        })
      );

      const resolvedCount = resolvedTasks.filter(task => 
        Array.isArray(task.required_skills) && task.required_skills.length > 0
      ).length;

      debugLog(`Skill resolution completed: ${resolvedCount}/${tasks.length} tasks had skills resolved`);
      
      return resolvedTasks;

    } catch (error) {
      console.error('Error in skill resolution process:', error);
      return tasks; // Return original tasks as fallback
    }
  }

  /**
   * Fetch client-assigned tasks with comprehensive validation, error recovery, and preferred staff information
   */
  static async fetchClientAssignedTasks(filters: DemandFilters = { 
    skills: [], 
    clients: [], 
    timeHorizon: { start: new Date(), end: new Date() } 
  }): Promise<RecurringTaskDB[]> {
    debugLog('Fetching client-assigned tasks with enhanced validation and preferred staff data', { filters });

    try {
      // Build query with proper error handling and preferred staff information
      let query = supabase
        .from('recurring_tasks')
        .select(`
          *,
          clients(id, legal_name, expected_monthly_revenue),
          preferred_staff:staff!recurring_tasks_preferred_staff_id_fkey(id, full_name, role_title)
        `)
        .eq('is_active', true)
        // Explicit range to avoid default 10 row limit in some environments
        .range(0, 999);

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

      debugLog(`Fetched ${data.length} recurring tasks from database with preferred staff information`);

      // Type-cast the raw data to ensure proper typing, including preferred staff
      const typedData: RecurringTaskDB[] = data.map(task => ({
        ...task,
        priority: task.priority as TaskPriority,
        category: task.category as TaskCategory,
        status: task.status as TaskStatus,
        // Preserve preferred staff information in the task data
        preferred_staff: task.preferred_staff
      }));

      // Enhanced validation and cleaning with skill resolution
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(typedData, { permissive: true });

      // Apply skill resolution to valid tasks (or resolved tasks if available)
      const tasksForResolution = resolvedTasks.length > 0 ? resolvedTasks : validTasks;
      const resolvedTasksFinal = await this.resolveTaskSkills(tasksForResolution);

      // Provide detailed feedback about data quality
      if (invalidTasks.length > 0) {
        console.warn(`Data quality issues: ${invalidTasks.length}/${typedData.length} tasks excluded`);
        
        // Group errors for better reporting
        const errorSummary = this.summarizeValidationErrors(invalidTasks);
        console.warn('Validation error summary:', errorSummary);
      }

      const successRate = ((resolvedTasksFinal.length / typedData.length) * 100).toFixed(1);
      debugLog(`Data validation and skill resolution complete: ${resolvedTasksFinal.length}/${typedData.length} tasks valid (${successRate}%)`);

      return resolvedTasksFinal;

    } catch (error) {
      console.error('Error in fetchClientAssignedTasks:', error);
      
      // Instead of returning empty array, try a fallback approach
      return this.attemptFallbackDataFetch();
    }
  }

  /**
   * Attempt fallback data fetch with minimal filtering and preferred staff information
   */
  private static async attemptFallbackDataFetch(): Promise<RecurringTaskDB[]> {
    try {
      console.log('Attempting fallback data fetch with minimal filtering...');
      
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          *, 
          clients(id, legal_name, expected_monthly_revenue),
          preferred_staff:staff!recurring_tasks_preferred_staff_id_fkey(id, full_name, role_title)
        `)
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
          required_skills: Array.isArray(task.required_skills) ? task.required_skills : [],
          // Preserve preferred staff information in fallback as well
          preferred_staff: task.preferred_staff
        }));

      // Apply skill resolution even in fallback
      const resolvedFallbackTasks = await this.resolveTaskSkills(fallbackTasks);

      console.log(`Fallback fetch with skill resolution recovered ${resolvedFallbackTasks.length} tasks`);
      return resolvedFallbackTasks;

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
   * Fetch available skills with validation and resolution
   */
  static async fetchAvailableSkills(): Promise<string[]> {
    try {
      // Use the skill resolution service to get all skill names
      const skillNames = await SkillResolutionService.getAllSkillNames();
      
      debugLog(`Fetched ${skillNames.length} available skills via resolution service`);
      return skillNames;

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
