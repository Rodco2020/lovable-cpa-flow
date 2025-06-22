import { format } from 'date-fns';
import { debugLog } from '../logger';
import { DemandForecastParameters, DemandFilters } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { DataFetcher } from './dataFetcher';
import { PeriodGenerator } from './periodGenerator';
import { SkillCalculator } from './skillCalculator';

/**
 * Forecast Generator Service
 * Handles the main demand forecast generation logic
 */
export class ForecastGenerator {
  /**
   * Generate demand forecast data for 12-month matrix display
   */
  static async generateDemandForecast(
    parameters: DemandForecastParameters
  ): Promise<ForecastData[]> {
    debugLog('Generating demand forecast', { parameters });

    const { dateRange, includeSkills, includeClients, includePreferredStaff } = parameters;
    
    // Create filters from parameters with updated interface
    const filters: DemandFilters = {
      skills: includeSkills === 'all' ? [] : includeSkills,
      clients: includeClients === 'all' ? [] : includeClients,
      preferredStaff: includePreferredStaff === 'all' ? [] : (includePreferredStaff || []), // NEW: Add missing preferredStaff
      timeHorizon: {
        start: dateRange.startDate,
        end: dateRange.endDate
      }
    };

    // Fetch client-assigned tasks
    const tasks = await DataFetcher.fetchClientAssignedTasks(filters);

    // Generate monthly periods
    const months = PeriodGenerator.generateMonthlyPeriods(dateRange.startDate, dateRange.endDate);
    
    // Process each month - make this async to handle the Promise from calculateMonthlyDemandBySkill
    const forecastData: ForecastData[] = await Promise.all(
      months.map(async (month) => {
        const monthStart = new Date(month.start);
        const monthEnd = new Date(month.end);
        
        // Calculate demand for this month - await the Promise
        const demandBySkill = await SkillCalculator.calculateMonthlyDemandBySkill(
          tasks,
          monthStart,
          monthEnd
        );

        return {
          period: format(monthStart, 'yyyy-MM'),
          demand: demandBySkill,
          capacity: [], // Demand-only forecast
          demandHours: demandBySkill.reduce((sum, skill) => sum + skill.hours, 0),
          capacityHours: 0
        };
      })
    );

    debugLog(`Generated demand forecast with ${forecastData.length} periods`);
    return forecastData;
  }
}
