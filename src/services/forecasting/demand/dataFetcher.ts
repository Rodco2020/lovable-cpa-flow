import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';
import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';
import { DataValidator } from './dataValidator';
import { SkillResolutionService } from './skillResolutionService';
import { startOfYear, addMonths, format } from 'date-fns';

/**
 * Enhanced Data Fetcher Service - Phase 4: Skill Resolution Pipeline Fix
 * 
 * PIPELINE IMPROVEMENTS:
 * - Comprehensive error handling in skill resolution
 * - Non-blocking fallback mechanisms
 * - Detailed diagnostic logging for troubleshooting
 * - Graceful degradation when skills can't be resolved
 */
export class DataFetcher {
  /**
   * Enhanced skill resolution with comprehensive error handling and diagnostics
   * 
   * PIPELINE FIX: This method now includes detailed monitoring, fallback logic,
   * and ensures the pipeline never completely fails due to skill resolution issues.
   */
  private static async resolveTaskSkills(tasks: RecurringTaskDB[]): Promise<RecurringTaskDB[]> {
    console.log('🔧 [DATA FETCHER] Enhanced skill resolution starting:', {
      tasksCount: tasks.length,
      timestamp: new Date().toISOString()
    });

    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.log('✅ [DATA FETCHER] No tasks to process for skill resolution');
      return [];
    }

    const resolutionStats = {
      totalTasks: tasks.length,
      tasksWithSkills: 0,
      tasksProcessed: 0,
      skillsResolved: 0,
      skillsUnresolved: 0,
      errors: 0,
      fallbacksUsed: 0
    };

    try {
      const resolvedTasks = await Promise.all(
        tasks.map(async (task, index) => {
          try {
            console.log(`📋 [DATA FETCHER] Processing task ${index + 1}/${tasks.length}: ${task.id}`);

            // PIPELINE FIX: Handle missing or invalid skills gracefully
            if (!task.required_skills) {
              console.warn(`⚠️ [DATA FETCHER] Task ${task.id} has no required_skills property`);
              return {
                ...task,
                required_skills: [] // Provide empty array fallback
              };
            }

            if (!Array.isArray(task.required_skills)) {
              console.warn(`⚠️ [DATA FETCHER] Task ${task.id} required_skills is not an array:`, task.required_skills);
              return {
                ...task,
                required_skills: [] // Convert to empty array
              };
            }

            if (task.required_skills.length === 0) {
              console.log(`✅ [DATA FETCHER] Task ${task.id} has no skills to resolve`);
              resolutionStats.tasksProcessed++;
              return task;
            }

            resolutionStats.tasksWithSkills++;

            console.log(`🎯 [DATA FETCHER] Resolving ${task.required_skills.length} skills for task ${task.id}:`, task.required_skills);

            // PIPELINE FIX: Use enhanced skill resolution with comprehensive error handling
            const resolvedSkillNames = await SkillResolutionService.getSkillNames(task.required_skills);
            
            console.log(`✅ [DATA FETCHER] Skill resolution result for task ${task.id}:`, {
              originalSkills: task.required_skills,
              resolvedSkills: resolvedSkillNames,
              resolutionSuccess: resolvedSkillNames.length > 0
            });

            // PIPELINE FIX: Even if some skills couldn't be resolved, we keep the task
            if (resolvedSkillNames.length > 0) {
              resolutionStats.skillsResolved += resolvedSkillNames.length;
              resolutionStats.tasksProcessed++;
              
              return {
                ...task,
                required_skills: resolvedSkillNames
              };
            } else {
              // PIPELINE FIX: Fallback - keep original skills as placeholders
              console.warn(`⚠️ [DATA FETCHER] No skills resolved for task ${task.id}, using fallback`);
              resolutionStats.fallbacksUsed++;
              resolutionStats.tasksProcessed++;
              
              const fallbackSkills = task.required_skills.map(skill => 
                typeof skill === 'string' ? `Unresolved: ${skill.slice(0, 8)}` : 'Unknown Skill'
              );
              
              return {
                ...task,
                required_skills: fallbackSkills
              };
            }

          } catch (skillError) {
            // PIPELINE FIX: Individual task errors don't break the entire pipeline
            console.error(`❌ [DATA FETCHER] Error resolving skills for task ${task.id}:`, skillError);
            resolutionStats.errors++;
            resolutionStats.fallbacksUsed++;
            
            // Return task with error placeholder skills
            const errorSkills = Array.isArray(task.required_skills) 
              ? task.required_skills.map(() => 'Error: Skill Resolution Failed')
              : ['Error: Invalid Skills Data'];
              
            return {
              ...task,
              required_skills: errorSkills
            };
          }
        })
      );

      // Enhanced logging for pipeline health monitoring
      console.log('📊 [DATA FETCHER] Skill resolution pipeline complete:', {
        stats: resolutionStats,
        successRate: `${((resolutionStats.tasksProcessed / resolutionStats.totalTasks) * 100).toFixed(1)}%`,
        skillResolutionRate: resolutionStats.tasksWithSkills > 0 
          ? `${((resolutionStats.skillsResolved / (resolutionStats.skillsResolved + resolutionStats.skillsUnresolved)) * 100).toFixed(1)}%`
          : 'N/A',
        pipelineHealthy: resolutionStats.errors === 0 && resolutionStats.fallbacksUsed === 0,
        timestamp: new Date().toISOString()
      });

      debugLog(`Enhanced skill resolution completed: ${resolutionStats.tasksProcessed}/${resolutionStats.totalTasks} tasks processed`);
      return resolvedTasks;

    } catch (error) {
      // PIPELINE FIX: Total failure fallback - return tasks with placeholder skills
      console.error('❌ [DATA FETCHER] Critical error in skill resolution pipeline:', error);
      
      const fallbackTasks = tasks.map(task => ({
        ...task,
        required_skills: Array.isArray(task.required_skills)
          ? task.required_skills.map(() => 'Pipeline Error: Contact Support')
          : ['Pipeline Error: Invalid Data']
      }));
      
      console.log('🆘 [DATA FETCHER] Using fallback tasks due to pipeline failure');
      return fallbackTasks;
    }
  }

  /**
   * Enhanced fetch client assigned tasks with comprehensive skill resolution pipeline
   */
  static async fetchClientAssignedTasks(filters: DemandFilters = { 
    skills: [], 
    clients: [], 
    timeHorizon: { start: new Date(), end: new Date() } 
  }): Promise<RecurringTaskDB[]> {
    console.log('🚀 [DATA FETCHER] Enhanced fetchClientAssignedTasks starting:', { 
      filters,
      timestamp: new Date().toISOString()
    });

    try {
      // Enhanced query with explicit error handling
      let query = supabase
        .from('recurring_tasks')
        .select(`
          *,
          clients(id, legal_name, expected_monthly_revenue),
          preferred_staff:staff!recurring_tasks_preferred_staff_id_fkey(id, full_name, role_title)
        `)
        .eq('is_active', true)
        .range(0, 999); // Explicit limit

      // Apply filters safely with validation
      if (filters.clients && Array.isArray(filters.clients) && filters.clients.length > 0) {
        const validClientIds = filters.clients.filter(id => 
          typeof id === 'string' && id.trim().length > 0
        );
        
        if (validClientIds.length > 0) {
          query = query.in('client_id', validClientIds);
          console.log(`🔍 [DATA FETCHER] Applied client filter: ${validClientIds.length} clients`);
        }
      }

      // Execute query with comprehensive error handling
      const { data, error } = await query;

      if (error) {
        console.error('❌ [DATA FETCHER] Database query failed:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ [DATA FETCHER] No data or invalid data format returned');
        return [];
      }

      console.log(`✅ [DATA FETCHER] Fetched ${data.length} tasks from database`);

      // Type-cast with enhanced validation
      const typedData: RecurringTaskDB[] = data.map(task => ({
        ...task,
        priority: (task.priority as TaskPriority) || 'Medium',
        category: (task.category as TaskCategory) || 'Other',
        status: (task.status as TaskStatus) || 'Unscheduled',
        required_skills: Array.isArray(task.required_skills) ? task.required_skills : [],
        preferred_staff: task.preferred_staff
      }));

      // Enhanced validation with comprehensive reporting
      console.log('🔍 [DATA FETCHER] Starting enhanced task validation...');
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(typedData, { permissive: true });

      // Choose the best set of tasks for skill resolution
      const tasksForResolution = resolvedTasks.length > 0 ? resolvedTasks : validTasks;
      
      console.log(`📊 [DATA FETCHER] Task validation results:`, {
        totalInput: typedData.length,
        validTasks: validTasks.length,
        invalidTasks: invalidTasks.length,
        resolvedTasks: resolvedTasks.length,
        selectedForResolution: tasksForResolution.length,
        validationRate: `${((validTasks.length / typedData.length) * 100).toFixed(1)}%`
      });

      // PIPELINE FIX: Enhanced skill resolution with comprehensive monitoring
      console.log('🔧 [DATA FETCHER] Starting enhanced skill resolution pipeline...');
      const finalResolvedTasks = await this.resolveTaskSkills(tasksForResolution);

      // Final pipeline health check
      const pipelineStats = {
        initialTaskCount: typedData.length,
        validatedTaskCount: tasksForResolution.length,
        finalTaskCount: finalResolvedTasks.length,
        tasksWithResolvedSkills: finalResolvedTasks.filter(task => 
          Array.isArray(task.required_skills) && 
          task.required_skills.length > 0 &&
          !task.required_skills.some(skill => skill.includes('Error:') || skill.includes('Unresolved:'))
        ).length,
        pipelineIntegrity: finalResolvedTasks.length === tasksForResolution.length
      };

      console.log('🎯 [DATA FETCHER] Final pipeline results:', {
        ...pipelineStats,
        successRate: `${((pipelineStats.tasksWithResolvedSkills / pipelineStats.finalTaskCount) * 100).toFixed(1)}%`,
        pipelineHealthy: pipelineStats.pipelineIntegrity && pipelineStats.tasksWithResolvedSkills > 0,
        timestamp: new Date().toISOString()
      });

      // Enhanced error reporting for better diagnosis
      if (invalidTasks.length > 0) {
        console.warn(`⚠️ [DATA FETCHER] Data quality issues: ${invalidTasks.length}/${typedData.length} tasks excluded`);
        const errorSummary = this.summarizeValidationErrors(invalidTasks);
        console.warn('📋 [DATA FETCHER] Validation error summary:', errorSummary);
      }

      debugLog(`Enhanced data fetch complete: ${finalResolvedTasks.length}/${typedData.length} tasks ready for matrix`);
      return finalResolvedTasks;

    } catch (error) {
      console.error('❌ [DATA FETCHER] Critical error in fetchClientAssignedTasks:', error);
      
      // Enhanced fallback with skill resolution monitoring
      console.log('🆘 [DATA FETCHER] Attempting enhanced fallback data fetch...');
      return this.attemptEnhancedFallbackDataFetch();
    }
  }

  /**
   * Enhanced fallback data fetch with skill resolution pipeline
   */
  private static async attemptEnhancedFallbackDataFetch(): Promise<RecurringTaskDB[]> {
    try {
      console.log('🔄 [DATA FETCHER] Enhanced fallback fetch starting...');
      
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          *, 
          clients(id, legal_name, expected_monthly_revenue),
          preferred_staff:staff!recurring_tasks_preferred_staff_id_fkey(id, full_name, role_title)
        `)
        .eq('is_active', true)
        .range(0, 999);

      if (error || !data || !Array.isArray(data)) {
        console.error('❌ [DATA FETCHER] Enhanced fallback query failed:', error);
        return [];
      }

      console.log(`✅ [DATA FETCHER] Enhanced fallback fetched ${data.length} tasks`);

      // Apply minimal validation and typing
      const fallbackTasks: RecurringTaskDB[] = data
        .filter(task => task && task.id && task.client_id)
        .map(task => ({
          ...task,
          priority: (task.priority as TaskPriority) || 'Medium',
          category: (task.category as TaskCategory) || 'Other',
          status: (task.status as TaskStatus) || 'Unscheduled',
          required_skills: Array.isArray(task.required_skills) ? task.required_skills : [],
          preferred_staff: task.preferred_staff
        }));

      // PIPELINE FIX: Apply enhanced skill resolution even in fallback
      console.log('🔧 [DATA FETCHER] Applying enhanced skill resolution to fallback tasks...');
      const resolvedFallbackTasks = await this.resolveTaskSkills(fallbackTasks);

      console.log(`🎉 [DATA FETCHER] Enhanced fallback completed: ${resolvedFallbackTasks.length} tasks ready`);
      return resolvedFallbackTasks;

    } catch (fallbackError) {
      console.error('❌ [DATA FETCHER] Enhanced fallback failed completely:', fallbackError);
      return [];
    }
  }

  /**
   * Fetch forecast data for demand matrix generation
   */
  static async fetchForecastData(startDate: Date = startOfYear(new Date())): Promise<any[]> {
    debugLog('Fetching forecast data for demand matrix generation', { startDate });

    try {
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

      const typedData: RecurringTaskDB[] = data.map(task => ({
        ...task,
        priority: task.priority as TaskPriority,
        category: task.category as TaskCategory,
        status: task.status as TaskStatus,
        preferred_staff: task.preferred_staff
      }));

      const { validTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(typedData, { permissive: true });
      const tasksForResolution = resolvedTasks.length > 0 ? resolvedTasks : validTasks;
      const tasksWithResolvedSkills = await this.resolveTaskSkills(tasksForResolution);
      
      debugLog(`Data validation and skill resolution complete: ${tasksWithResolvedSkills.length}/${typedData.length} tasks processed`);
      return tasksWithResolvedSkills;

    } catch (error) {
      console.error('Error fetching recurring tasks:', error);
      return [];
    }
  }

  /**
   * Fetch available skills with validation and resolution
   */
  static async fetchAvailableSkills(): Promise<string[]> {
    try {
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

        errorCounts[category] = (errorCounts[category] || 0) + 1;
      });
    });

    return errorCounts;
  }
}
