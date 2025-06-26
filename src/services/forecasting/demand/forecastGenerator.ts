
import { format, addMonths, startOfMonth } from 'date-fns';
import { debugLog } from '../logger';
import { DemandForecastParameters, DemandFilters } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { DataFetcher } from './dataFetcher';
import { PeriodGenerator } from './periodGenerator';
import { SkillCalculator } from './skillCalculator';

/**
 * Forecast Generator Service
 * FIXED: Ensures proper 12-month forecast data generation
 */
export class ForecastGenerator {
  /**
   * FIXED: Generate demand forecast data ensuring 12-month matrix display
   */
  static async generateDemandForecast(
    parameters: DemandForecastParameters
  ): Promise<ForecastData[]> {
    debugLog('FIXED: Generating demand forecast', { parameters });

    const { dateRange, includeSkills, includeClients } = parameters;
    
    // Create filters from parameters
    const filters: DemandFilters = {
      skills: includeSkills === 'all' ? [] : includeSkills,
      clients: includeClients === 'all' ? [] : includeClients,
      preferredStaff: [],
      timeHorizon: {
        start: dateRange.startDate,
        end: dateRange.endDate
      }
    };

    // Fetch client-assigned tasks
    const tasks = await DataFetcher.fetchClientAssignedTasks(filters);

    // CRITICAL FIX: Generate proper monthly periods ensuring 12 months minimum
    let months = PeriodGenerator.generateMonthlyPeriods(dateRange.startDate, dateRange.endDate);
    
    // Ensure we have at least 12 months for proper matrix display
    if (months.length < 12) {
      console.warn(`⚠️ [FORECAST GENERATOR] Only ${months.length} months generated, extending to 12`);
      months = this.ensureTwelveMonthPeriods(dateRange.startDate);
    }

    console.log(`📅 [FORECAST GENERATOR] FIXED: Processing ${months.length} months for forecast`);
    
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

    console.log(`✅ [FORECAST GENERATOR] FIXED: Generated demand forecast with ${forecastData.length} periods`);
    return forecastData;
  }

  /**
   * FIXED: Ensure we always generate 12 months of periods
   */
  private static ensureTwelveMonthPeriods(startDate: Date) {
    const baseDate = startOfMonth(startDate);
    const periods = [];
    
    for (let i = 0; i < 12; i++) {
      const monthStart = addMonths(baseDate, i);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      periods.push({
        start: monthStart.toISOString(),
        end: monthEnd.toISOString()
      });
    }

    console.log(`🔧 [FORECAST GENERATOR] FIXED: Generated 12-month periods starting from ${format(baseDate, 'MMM yyyy')}`);
    return periods;
  }
}
