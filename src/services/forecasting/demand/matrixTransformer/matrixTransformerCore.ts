
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
import { MatrixRevenueCalculator } from './matrixRevenueCalculator';
import { MatrixDataEnricher } from './matrixDataEnricher';
import { RevenueEnhancedDataPointContext } from './types';

/**
 * Core matrix transformation orchestrator
 * Refactored to use focused services for revenue calculations and data enrichment
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast data to matrix format with enhanced revenue calculations
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    const startTime = performance.now();
    
    debugLog('Starting enhanced matrix transformation with revenue calculations', { 
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
          console.warn(`Task ${task.id}:`, errors.slice(0, 2));
        });
      }

      // Generate months from forecast data
      const months = PeriodProcessingService.generateMonthsFromForecast(forecastData);
      
      // Extract unique skills with proper resolution mapping
      const { skills, skillMapping } = await SkillMappingService.extractUniqueSkillsWithMapping(
        forecastData, 
        validTasks
      );

      // Enhanced data point generation context with revenue calculation support
      const revenueContext: RevenueEnhancedDataPointContext = {
        forecastData,
        tasks: validTasks,
        skills,
        skillMapping,
        revenueContext: {
          includeRevenueCalculations: true,
          skillFeeRates: new Map(),
          clientRevenueData: new Map(),
          useClientExpectedRevenue: true
        },
        revenueCalculationConfig: {
          enabled: true,
          useSkillFeeRates: true,
          useClientExpectedRevenue: true,
          fallbackToDefaultRates: true,
          includeProfitabilityAnalysis: false,
          cacheResults: true,
          batchSize: 100
        }
      };

      // Generate data points with enhanced skill matching and revenue calculations
      const dataPoints = await DataPointGenerationService.generateDataPointsWithSkillMapping(revenueContext);
      
      // Calculate totals and summaries using the enhanced data points
      const totals = CalculationUtils.calculateTotals(dataPoints);
      const skillSummary = CalculationUtils.generateSkillSummary(dataPoints);

      // Calculate client totals
      const clientTotals = ClientTotalsCalculator.calculateClientTotals(dataPoints);

      // Use extracted revenue calculator for all revenue-related calculations
      const revenueResults = await MatrixRevenueCalculator.calculateMatrixRevenue(dataPoints, months);

      // Enhance skill summary with revenue information
      const enhancedSkillSummary = MatrixRevenueCalculator.enhanceSkillSummaryWithRevenue(
        skillSummary,
        revenueResults.skillFeeRates,
        dataPoints
      );

      const baseMatrixData: DemandMatrixData = {
        months,
        skills,
        dataPoints,
        totalDemand: totals.totalDemand,
        totalTasks: totals.totalTasks,
        totalClients: totals.totalClients,
        skillSummary: enhancedSkillSummary,
        clientTotals,
        clientRevenue: revenueResults.clientRevenue,
        clientHourlyRates: revenueResults.clientHourlyRates,
        clientSuggestedRevenue: revenueResults.clientSuggestedRevenue,
        clientExpectedLessSuggested: revenueResults.clientExpectedLessSuggested,
        revenueTotals: revenueResults.revenueTotals
      };

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Use data enricher for validation and metadata enhancement
      const enrichedMatrixData = MatrixDataEnricher.enrichMatrixData(baseMatrixData, {
        processingTime,
        validTasks: validTasks.length,
        invalidTasks: invalidTasks.length,
        resolvedTasks: resolvedTasks.length
      });

      // Generate processing summary and check performance
      const successMessage = MatrixDataEnricher.generateProcessingSummary(enrichedMatrixData, processingTime);
      console.log(successMessage);
      debugLog(successMessage);

      MatrixDataEnricher.checkPerformanceWarnings(processingTime);

      return enrichedMatrixData;

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
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        }
      };
    }
  }
}
