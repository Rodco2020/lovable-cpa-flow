
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
        skills: Array.isArray(parameters.skills) ? parameters.skills : [],
        clients: Array.isArray(parameters.clients) ? parameters.clients : [],
        preferredStaff: [], // Phase 3: Add preferredStaff field
        timeHorizon: {
          start: parameters.dateRange.start,
          end: parameters.dateRange.end
        }
      });
      
      // Transform to matrix
      const demandMatrix = await this.transformToMatrixData(forecastData, tasks);
      
      return {
        matrixData: demandMatrix,
        success: true
      };
    } catch (error) {
      console.error('Error generating demand forecast with matrix:', error);
      return {
        matrixData: {
          months: [],
          skills: [],
          dataPoints: [],
          totalDemand: 0,
          totalTasks: 0,
          totalClients: 0,
          skillSummary: {},
          clientTotals: new Map(),
          aggregationStrategy: 'skill-based'
        },
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export default DemandDataService;
