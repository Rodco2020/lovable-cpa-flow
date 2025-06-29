
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { supabaseService } from '@/services/supabase/supabaseService';
import { debugLog } from '../logger';

/**
 * Forecast Data Service
 * 
 * Handles loading forecast data and tasks for matrix generation
 */
export class ForecastDataService {
  /**
   * Load forecast data and tasks for matrix generation
   */
  static async loadForecastData(startDate: Date): Promise<{
    forecastData: ForecastData[];
    tasks: RecurringTaskDB[];
  }> {
    debugLog('Loading forecast data and tasks', { startDate: startDate.toISOString() });

    try {
      // Generate forecast periods (12 months from start date)
      const forecastData = this.generateForecastPeriods(startDate, 12);
      
      // Load active recurring tasks
      const tasks = await this.loadRecurringTasks();
      
      console.log(`✅ [FORECAST DATA] Loaded ${forecastData.length} periods and ${tasks.length} tasks`);
      
      return { forecastData, tasks };
    } catch (error) {
      console.error('❌ [FORECAST DATA] Error loading forecast data:', error);
      throw error;
    }
  }

  /**
   * Generate forecast periods
   */
  private static generateForecastPeriods(startDate: Date, monthCount: number): ForecastData[] {
    const periods: ForecastData[] = [];
    
    for (let i = 0; i < monthCount; i++) {
      const periodDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const period = periodDate.toISOString().substring(0, 7); // YYYY-MM format
      
      periods.push({
        period,
        demand: [],
        capacity: []
      });
    }
    
    return periods;
  }

  /**
   * Load active recurring tasks
   */
  private static async loadRecurringTasks(): Promise<RecurringTaskDB[]> {
    try {
      const { data, error } = await supabaseService.client
        .from('recurring_tasks')
        .select(`
          *,
          client:clients(*),
          staff:staff(*)
        `)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [FORECAST DATA] Error loading recurring tasks:', error);
      throw error;
    }
  }
}
