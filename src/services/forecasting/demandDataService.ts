
import { debugLog } from './logger';
import { 
  DemandForecastParameters, 
  DemandMatrixData, 
  DemandFilters,
  RecurrenceCalculation,
  ClientTaskDemand
} from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { ForecastData } from '@/types/forecasting';
import { 
  DataFetcher,
  RecurrenceCalculator,
  ForecastGenerator,
  MatrixTransformer
} from './demand';

/**
 * Demand Data Service (Refactored)
 * 
 * This service now acts as a facade that delegates to specialized services
 * for better maintainability and testability. All public methods maintain
 * exactly the same interface and behavior as before.
 * 
 * Responsibilities:
 * - Provides backwards-compatible API
 * - Delegates to specialized services
 * - Maintains existing functionality without changes
 */
export class DemandDataService {
  /**
   * Fetch all client-assigned recurring tasks with filtering
   * @deprecated Use DataFetcher.fetchClientAssignedTasks directly for new code
   */
  static async fetchClientAssignedTasks(filters?: DemandFilters): Promise<RecurringTaskDB[]> {
    return DataFetcher.fetchClientAssignedTasks(filters);
  }

  /**
   * Calculate monthly demand from recurrence patterns
   * @deprecated Use RecurrenceCalculator.calculateMonthlyDemand directly for new code
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): RecurrenceCalculation {
    return RecurrenceCalculator.calculateMonthlyDemand(task, startDate, endDate);
  }

  /**
   * Generate demand forecast data for 12-month matrix display
   * @deprecated Use ForecastGenerator.generateDemandForecast directly for new code
   */
  static async generateDemandForecast(
    parameters: DemandForecastParameters
  ): Promise<ForecastData[]> {
    return ForecastGenerator.generateDemandForecast(parameters);
  }

  /**
   * Transform demand forecast into matrix format
   * @deprecated Use MatrixTransformer.transformToMatrixData directly for new code
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    return MatrixTransformer.transformToMatrixData(forecastData, tasks);
  }

  // Legacy private methods - keeping for backwards compatibility but marking as deprecated
  
  /**
   * @deprecated This method is now handled by RecurrenceCalculator
   */
  private static calculateRecurrenceFrequency(task: RecurringTaskDB): number {
    const { recurrence_type, recurrence_interval = 1 } = task;

    switch (recurrence_type) {
      case 'Daily':
        return 30 / recurrence_interval;
      case 'Weekly':
        return 4 / recurrence_interval;
      case 'Monthly':
        return 1 / recurrence_interval;
      case 'Quarterly':
        return (1 / recurrence_interval) / 3;
      case 'Annually':
        return (1 / recurrence_interval) / 12;
      default:
        return 1;
    }
  }

  /**
   * @deprecated This method is now handled by specialized services
   */
  private static createTaskBreakdown(
    tasks: RecurringTaskDB[],
    skillType: any,
    month: string
  ): ClientTaskDemand[] {
    return MatrixTransformer['createTaskBreakdown'](tasks, skillType, month);
  }
}
