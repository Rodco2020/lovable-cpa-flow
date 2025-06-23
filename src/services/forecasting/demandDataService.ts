
import { debugLog } from './logger';
import { 
  DemandForecastParameters, 
  DemandMatrixData,
  DemandForecastResult
} from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';

// Import from the refactored demand module
import {
  DataFetcher,
  RecurrenceCalculator,
  ForecastGenerator,
  MatrixTransformer
} from './demand';

/**
 * Demand Data Service
 * Handles demand forecasting and matrix data transformation
 */
export class DemandDataService {
  /**
   * Calculate monthly demand for a recurring task
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ) {
    return RecurrenceCalculator.calculateMonthlyDemand(task, startDate, endDate);
  }

  /**
   * Generate demand forecast data
   */
  static async generateDemandForecast(
    parameters: DemandForecastParameters
  ): Promise<ForecastData[]> {
    debugLog('DemandDataService: Generating demand forecast', { parameters });
    return await ForecastGenerator.generateDemandForecast(parameters);
  }

  /**
   * Transform forecast data to matrix format
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    debugLog('DemandDataService: Transforming to matrix data', { 
      periodsCount: forecastData.length, 
      tasksCount: tasks.length 
    });
    return await MatrixTransformer.transformToMatrixData(forecastData, tasks);
  }

  /**
   * Get recurring tasks data from the database
   */
  static async getRecurringTasksData(): Promise<RecurringTaskDB[]> {
    debugLog('DemandDataService: Fetching recurring tasks data');
    
    try {
      const tasks = await DataFetcher.fetchClientAssignedTasks();
      
      // Filter only active tasks
      const activeTasks = tasks.filter(task => task.is_active);
      
      debugLog('DemandDataService: Successfully fetched recurring tasks', { 
        totalTasks: tasks.length,
        activeTasks: activeTasks.length 
      });
      
      return activeTasks;
    } catch (error) {
      console.error('Error fetching recurring tasks:', error);
      return [];
    }
  }

  /**
   * Generate complete demand forecast with matrix
   */
  static async generateDemandForecastWithMatrix(
    parameters: DemandForecastParameters
  ): Promise<DemandForecastResult> {
    debugLog('DemandDataService: Generating complete demand forecast with matrix', { parameters });

    try {
      // Generate forecast data
      const forecastData = await this.generateDemandForecast(parameters);
      
      // Fetch related tasks for matrix generation
      const tasks = await DataFetcher.fetchClientAssignedTasks({
        skills: parameters.includeSkills === 'all' ? [] : parameters.includeSkills,
        clients: parameters.includeClients === 'all' ? [] : parameters.includeClients,
        timeHorizon: {
          start: parameters.dateRange.startDate,
          end: parameters.dateRange.endDate
        }
      });
      
      // Transform to matrix
      const demandMatrix = await this.transformToMatrixData(forecastData, tasks);
      
      // Calculate summary
      const summary = {
        totalDemand: demandMatrix.totalDemand,
        totalTasks: demandMatrix.totalTasks,
        totalClients: demandMatrix.totalClients,
        averageMonthlyDemand: demandMatrix.months.length > 0 
          ? demandMatrix.totalDemand / demandMatrix.months.length 
          : 0
      };

      return {
        parameters,
        data: forecastData,
        demandMatrix,
        summary,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating demand forecast with matrix:', error);
      throw error;
    }
  }
}

export default DemandDataService;
