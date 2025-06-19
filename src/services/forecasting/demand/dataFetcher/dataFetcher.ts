
/**
 * Data Fetcher - Refactored Main Service
 * 
 * This refactored version maintains backward compatibility while addressing
 * the "0 client-assigned tasks" issue through improved error handling,
 * better query construction, and enhanced logging.
 */

import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { debugLog } from '../../logger';
import { TaskQueryBuilder } from './taskQueryBuilder';
import { FilterProcessor } from './filterProcessor';
import { ForecastDataService } from './forecastDataService';
import { TaskFetchResult, ForecastPeriod } from './types';

export class DataFetcher {
  /**
   * Fetch client-assigned tasks with enhanced error handling and logging
   * 
   * This method addresses the "0 client-assigned tasks" issue by:
   * - Improving query construction
   * - Adding comprehensive logging
   * - Better error handling
   * - Enhanced filter processing
   */
  static async fetchClientAssignedTasks(filters?: DemandFilters): Promise<RecurringTaskDB[]> {
    const startTime = Date.now();
    console.log('🚀 [DATA FETCHER] Starting client-assigned tasks fetch with enhanced pipeline');
    console.log('📊 [DATA FETCHER] Input filters:', filters);

    try {
      // Step 1: Validate and process filters
      const filterValidation = FilterProcessor.validateAndProcessFilters(filters);
      
      if (!filterValidation.isValid) {
        console.warn('⚠️ [DATA FETCHER] Filter validation issues:', filterValidation.issues);
        // Continue with processed filters instead of failing
      }

      const processedFilters = filterValidation.processedFilters;
      console.log('✅ [DATA FETCHER] Filters processed:', processedFilters);

      // Step 2: Build and execute query
      const query = TaskQueryBuilder.buildTaskQuery(processedFilters, {
        includeClients: true,
        includePreferredStaff: true,
        activeOnly: true
      });

      console.log('🔍 [DATA FETCHER] Executing database query...');
      const { data: queryData, error, count } = await query;

      // Step 3: Handle query results
      if (error) {
        console.error('❌ [DATA FETCHER] Database query error:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!queryData || !Array.isArray(queryData)) {
        console.warn('⚠️ [DATA FETCHER] Query returned null or invalid data');
        return [];
      }

      const queryTime = Date.now() - startTime;
      console.log('📈 [DATA FETCHER] Query completed successfully:', {
        taskCount: queryData.length,
        totalCount: count,
        queryTime: `${queryTime}ms`,
        hasFilters: !FilterProcessor.areFiltersEmpty(filters)
      });

      // Step 4: Validate and process results with proper typing
      const validTasks: RecurringTaskDB[] = [];
      
      for (const task of queryData) {
        // Type guard to ensure we have valid task data
        if (!task || typeof task !== 'object') {
          console.warn('⚠️ [DATA FETCHER] Invalid task object filtered out:', task);
          continue;
        }

        // Check if this looks like a RecurringTaskDB object
        if (this.isValidRecurringTask(task)) {
          validTasks.push(task as RecurringTaskDB);
        } else {
          console.warn('⚠️ [DATA FETCHER] Invalid task filtered out:', (task as any)?.id || 'unknown');
        }
      }

      console.log('✅ [DATA FETCHER] Task validation completed:', {
        originalCount: queryData.length,
        validCount: validTasks.length,
        filteredOut: queryData.length - validTasks.length
      });

      // Step 5: Debug task details for troubleshooting
      if (validTasks.length === 0) {
        console.warn('🔍 [DATA FETCHER] ZERO TASKS FOUND - Debugging information:');
        console.warn('  - Total rows in query result:', queryData.length);
        console.warn('  - Applied filters:', processedFilters);
        console.warn('  - Query included clients:', true);
        console.warn('  - Query included preferred staff:', true);
        console.warn('  - Active only filter:', true);
        
        // Check if there are any tasks in the database at all
        console.warn('  - Consider checking if there are any active recurring tasks in the database');
      } else {
        console.log('🎉 [DATA FETCHER] Successfully fetched tasks:', {
          taskCount: validTasks.length,
          sampleTasks: validTasks.slice(0, 3).map(t => ({
            id: t.id,
            name: t.name,
            client: t.clients?.legal_name,
            skills: t.required_skills
          }))
        });
      }

      debugLog(`Fetched ${validTasks.length} client-assigned tasks in ${queryTime}ms`);
      return validTasks;

    } catch (error) {
      const queryTime = Date.now() - startTime;
      console.error('❌ [DATA FETCHER] Critical error in fetchClientAssignedTasks:', error);
      console.error('   Query time before error:', `${queryTime}ms`);
      console.error('   Applied filters:', filters);
      
      debugLog('Error fetching client-assigned tasks', error);
      
      // Return empty array instead of throwing to prevent cascade failures
      return [];
    }
  }

  /**
   * Type guard to check if an object is a valid RecurringTaskDB
   */
  private static isValidRecurringTask(task: any): task is RecurringTaskDB {
    return task &&
      typeof task === 'object' &&
      typeof task.id === 'string' &&
      typeof task.name === 'string' &&
      typeof task.client_id === 'string' &&
      typeof task.is_active === 'boolean' &&
      task.is_active === true;
  }

  /**
   * Fetch recurring tasks (backward compatibility method)
   */
  static async fetchRecurringTasks(): Promise<RecurringTaskDB[]> {
    console.log('🔄 [DATA FETCHER] Fetching all recurring tasks (backward compatibility)');
    return this.fetchClientAssignedTasks();
  }

  /**
   * Fetch forecast data with enhanced error handling
   */
  static async fetchForecastData(startDate: Date): Promise<ForecastPeriod[]> {
    console.log('📊 [DATA FETCHER] Fetching forecast data');
    return ForecastDataService.fetchForecastData(startDate);
  }

  /**
   * Get task fetch statistics for debugging
   */
  static async getTaskFetchStats(filters?: DemandFilters): Promise<TaskFetchResult> {
    const startTime = Date.now();
    
    try {
      const tasks = await this.fetchClientAssignedTasks(filters);
      const queryTime = Date.now() - startTime;
      
      return {
        tasks,
        totalCount: tasks.length,
        filteredCount: tasks.length,
        queryTime
      };
    } catch (error) {
      console.error('❌ [DATA FETCHER] Error getting task stats:', error);
      return {
        tasks: [],
        totalCount: 0,
        filteredCount: 0,
        queryTime: Date.now() - startTime
      };
    }
  }
}
