
import { debugLog } from '../../logger';
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { DataValidator } from '../dataValidator';
import { SkillMappingService } from './skillMappingService';
import { DataPointGenerationService } from './dataPointGenerationService';
import { PeriodProcessingService } from './periodProcessingService';
import { CalculationUtils } from './calculationUtils';

/**
 * Core matrix transformation orchestrator
 * Coordinates the transformation process while maintaining separation of concerns
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast data to matrix format with fixed skill resolution
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    debugLog('Transforming forecast data to matrix with fixed skill resolution', { 
      periodsCount: forecastData.length, 
      tasksCount: tasks.length 
    });

    try {
      // Validate inputs
      if (!Array.isArray(forecastData)) {
        console.warn('Forecast data is not an array');
        forecastData = [];
      }

      if (!Array.isArray(tasks)) {
        console.warn('Tasks data is not an array');
        tasks = [];
      }

      // Enhanced validation and cleaning with skill resolution
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(tasks);

      // Log resolution results
      if (resolvedTasks.length > 0) {
        console.log(`Resolved skills for ${resolvedTasks.length} tasks`);
        debugLog('Skill resolution results', { resolvedTasks });
      }

      if (invalidTasks.length > 0) {
        console.warn(`Excluded ${invalidTasks.length} invalid tasks from matrix generation`);
        invalidTasks.slice(0, 3).forEach(({ task, errors }) => {
          console.warn(`Task ${task.id}:`, errors.slice(0, 2)); // Limit error spam
        });
      }

      // Generate months from forecast data
      const months = PeriodProcessingService.generateMonthsFromForecast(forecastData);
      
      // Extract unique skills with proper resolution mapping
      const { skills, skillMapping } = await SkillMappingService.extractUniqueSkillsWithMapping(
        forecastData, 
        validTasks
      );
      
      // Generate data points with corrected skill matching
      const dataPoints = await DataPointGenerationService.generateDataPointsWithSkillMapping({
        forecastData,
        tasks: validTasks,
        skills,
        skillMapping
      });
      
      // Calculate totals and summaries
      const totals = CalculationUtils.calculateTotals(dataPoints);
      const skillSummary = CalculationUtils.generateSkillSummary(dataPoints);

      const matrixData: DemandMatrixData = {
        months,
        skills,
        dataPoints,
        totalDemand: totals.totalDemand,
        totalTasks: totals.totalTasks,
        totalClients: totals.totalClients,
        skillSummary
      };

      const successMessage = `Generated matrix: ${months.length} months, ${skills.length} skills, ${dataPoints.length} data points, total demand: ${totals.totalDemand}h`;
      debugLog(successMessage);

      return matrixData;

    } catch (error) {
      console.error('Error transforming to matrix data:', error);
      
      // Return a minimal valid structure to prevent cascade failures
      return {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };
    }
  }
}
