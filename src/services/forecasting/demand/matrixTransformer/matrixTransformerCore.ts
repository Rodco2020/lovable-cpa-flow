
import { debugLog } from '../../logger';
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { DataValidator } from '../dataValidator';
import { SkillMappingService } from './skillMappingService';
import { DataPointGenerationService } from './dataPointGenerationService';
import { PeriodProcessingService } from './periodProcessingService';
import { CalculationUtils } from './calculationUtils';
import { ClientResolutionService } from '../clientResolutionService';
import { ClientTotalsCalculator } from './clientTotalsCalculator';

/**
 * Core matrix transformation orchestrator
 * Coordinates the transformation process while maintaining separation of concerns
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast data to matrix format with client resolution and totals
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    debugLog('Transforming forecast data to matrix with enhanced client resolution and totals', { 
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

      // Initialize client resolution cache early and ensure it's populated
      await ClientResolutionService.initializeClientCache();
      const cacheStats = ClientResolutionService.getCacheStats();
      console.log('📊 [MATRIX TRANSFORM] Client cache initialized:', cacheStats);

      // Enhanced validation and cleaning with skill resolution
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(tasks);

      // Log resolution results
      if (resolvedTasks.length > 0) {
        console.log(`✅ [MATRIX TRANSFORM] Resolved skills for ${resolvedTasks.length} tasks`);
        debugLog('Skill resolution results', { resolvedTasks });
      }

      if (invalidTasks.length > 0) {
        console.warn(`⚠️ [MATRIX TRANSFORM] Excluded ${invalidTasks.length} invalid tasks from matrix generation`);
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
      
      // Generate data points with enhanced skill matching and consistent client resolution
      const dataPoints = await DataPointGenerationService.generateDataPointsWithSkillMapping({
        forecastData,
        tasks: validTasks,
        skills,
        skillMapping
      });
      
      // Calculate totals and summaries using the enhanced data points
      const totals = CalculationUtils.calculateTotals(dataPoints);
      const skillSummary = CalculationUtils.generateSkillSummary(dataPoints);

      // NEW: Calculate client totals
      const clientTotals = ClientTotalsCalculator.calculateClientTotals(dataPoints);

      const matrixData: DemandMatrixData = {
        months,
        skills,
        dataPoints,
        totalDemand: totals.totalDemand,
        totalTasks: totals.totalTasks,
        totalClients: totals.totalClients,
        skillSummary,
        clientTotals // NEW: Include client totals
      };

      const successMessage = `✅ [MATRIX TRANSFORM] Enhanced matrix generated: ${months.length} months, ${skills.length} skills, ${dataPoints.length} data points, total demand: ${totals.totalDemand}h, clients: ${totals.totalClients} (${cacheStats.clientsCount} cached), client totals: ${clientTotals.size}`;
      console.log(successMessage);
      debugLog(successMessage);

      return matrixData;

    } catch (error) {
      console.error('❌ [MATRIX TRANSFORM] Error transforming to matrix data:', error);
      
      // Return a minimal valid structure to prevent cascade failures
      return {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {},
        clientTotals: new Map() // NEW: Include empty client totals
      };
    }
  }
}
