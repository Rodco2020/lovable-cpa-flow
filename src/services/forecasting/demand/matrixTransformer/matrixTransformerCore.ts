
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
import { ClientRevenueCalculator } from './clientRevenueCalculator';
import { DataFetcher } from '../dataFetcher';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';
import { RevenueEnhancedDataPointContext } from './types';

// Import refactored services
import { PerformanceOptimizer } from './core/performanceOptimizer';
import { ValidationService } from './core/validationService';
import { RevenueCalculatorService } from './core/revenueCalculatorService';
import { MatrixAssemblerService } from './core/matrixAssemblerService';
import { LoggingService } from './core/loggingService';

/**
 * Core matrix transformation orchestrator - Refactored for better maintainability
 * Enhanced with Phase 3 revenue calculation integration
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast data to matrix format with enhanced revenue calculations
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    const monitor = PerformanceOptimizer.createPerformanceMonitor('Matrix Transformation');
    monitor.start();
    
    LoggingService.logTransformationStart(forecastData.length, tasks.length);

    try {
      // Phase 1: Validate and prepare data
      monitor.checkpoint('Data Validation');
      const validatedData = await this.validateAndPrepareData(forecastData, tasks);
      
      // Phase 2: Extract foundational data
      monitor.checkpoint('Foundation Data Extraction');
      const foundationData = await this.extractFoundationData(validatedData);
      
      // Phase 3: Generate data points with revenue calculations
      monitor.checkpoint('Data Points Generation');
      const dataPoints = await this.generateEnhancedDataPoints(foundationData);
      
      // Phase 4: Calculate summaries and totals
      monitor.checkpoint('Summary Generation');
      const summaryData = await this.calculateSummariesAndTotals(dataPoints, foundationData);
      
      // Phase 5: Assemble final matrix
      monitor.checkpoint('Matrix Assembly');
      const matrixData = this.assembleMatrixData(foundationData, dataPoints, summaryData);
      
      // Phase 6: Validate and finalize
      monitor.checkpoint('Validation');
      this.validateAndFinalize(matrixData);

      const metrics = monitor.finish();
      LoggingService.logTransformationComplete(matrixData, metrics);
      LoggingService.logPerformanceWarning(metrics.duration);

      return matrixData;

    } catch (error) {
      console.error('❌ [MATRIX TRANSFORMER] Error during transformation:', error);
      return MatrixAssemblerService.createEmptyMatrix();
    }
  }

  /**
   * Phase 1: Validate and prepare input data
   */
  private static async validateAndPrepareData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ) {
    // Validate inputs
    const safeForecastData = Array.isArray(forecastData) ? forecastData : [];
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    // Initialize client resolution cache
    await ClientResolutionService.initializeClientCache();
    const cacheStats = ClientResolutionService.getCacheStats();
    console.log('📊 [MATRIX TRANSFORM] Client cache initialized:', cacheStats);

    // Enhanced validation and cleaning with skill resolution
    const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(safeTasks);

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

    return {
      forecastData: safeForecastData,
      validTasks,
      invalidTasks,
      resolvedTasks
    };
  }

  /**
   * Phase 2: Extract foundational data structures
   */
  private static async extractFoundationData(validatedData: any) {
    const { forecastData, validTasks } = validatedData;

    // Generate months from forecast data
    const months = PeriodProcessingService.generateMonthsFromForecast(forecastData);
    
    // Extract unique skills with proper resolution mapping
    const { skills, skillMapping } = await SkillMappingService.extractUniqueSkillsWithMapping(
      forecastData, 
      validTasks
    );

    // Fetch skill fee rates for revenue calculations
    let skillFeeRates = new Map<string, number>();
    try {
      console.log('💰 [MATRIX TRANSFORM] Fetching skill fee rates...');
      skillFeeRates = await getSkillFeeRatesMap();
      console.log(`💰 [MATRIX TRANSFORM] Loaded ${skillFeeRates.size} skill fee rates`);
    } catch (error) {
      console.warn('⚠️ [MATRIX TRANSFORM] Error fetching skill fee rates:', error);
    }

    return {
      forecastData,
      validTasks,
      months,
      skills,
      skillMapping,
      skillFeeRates
    };
  }

  /**
   * Phase 3: Generate enhanced data points with revenue calculations
   */
  private static async generateEnhancedDataPoints(foundationData: any) {
    const { forecastData, validTasks, skills, skillMapping, skillFeeRates } = foundationData;

    // Enhanced data point generation context with revenue calculation support
    const revenueContext: RevenueEnhancedDataPointContext = {
      forecastData,
      tasks: validTasks,
      skills,
      skillMapping,
      revenueContext: {
        includeRevenueCalculations: true,
        skillFeeRates,
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
    return await DataPointGenerationService.generateDataPointsWithSkillMapping(revenueContext);
  }

  /**
   * Phase 4: Calculate summaries and totals
   */
  private static async calculateSummariesAndTotals(dataPoints: any[], foundationData: any) {
    const { skillFeeRates } = foundationData;

    // Calculate totals and summaries using the enhanced data points
    const totals = CalculationUtils.calculateTotals(dataPoints);
    const skillSummary = CalculationUtils.generateSkillSummary(dataPoints);

    // Calculate client totals
    const clientTotals = ClientTotalsCalculator.calculateClientTotals(dataPoints);

    // Fetch and calculate client revenue data
    const clientRevenueData = await this.calculateClientRevenueData(clientTotals, skillFeeRates, dataPoints);

    return {
      totals,
      skillSummary,
      clientTotals,
      ...clientRevenueData
    };
  }

  /**
   * Calculate client revenue data and metrics
   */
  private static async calculateClientRevenueData(
    clientTotals: Map<string, number>,
    skillFeeRates: Map<string, number>,
    dataPoints: any[]
  ) {
    let clientRevenue = new Map<string, number>();
    let clientHourlyRates = new Map<string, number>();
    let clientSuggestedRevenue = new Map<string, number>();
    let clientExpectedLessSuggested = new Map<string, number>();
    let revenueTotals = {
      totalSuggestedRevenue: 0,
      totalExpectedRevenue: 0,
      totalExpectedLessSuggested: 0
    };

    try {
      console.log('💰 [MATRIX TRANSFORM] Fetching client revenue data...');
      const clientsWithRevenue = await DataFetcher.fetchClientsWithRevenue();
      
      if (clientsWithRevenue.length > 0) {
        // Build client revenue calculations
        const clientRevenueMap = ClientRevenueCalculator.buildClientRevenueMap(clientsWithRevenue);
        const monthCount = dataPoints.length > 0 ? new Set(dataPoints.map(dp => dp.month)).size : 1;
        
        clientRevenue = ClientRevenueCalculator.calculateClientRevenue(
          clientTotals,
          clientRevenueMap,
          monthCount
        );
        
        clientHourlyRates = ClientRevenueCalculator.calculateClientHourlyRates(
          clientTotals,
          clientRevenue
        );

        // Calculate suggested revenue and expected less suggested per client
        const revenueMetrics = await RevenueCalculatorService.calculateClientRevenueMetrics(
          clientTotals,
          clientRevenue,
          skillFeeRates,
          dataPoints
        );

        clientSuggestedRevenue = revenueMetrics.clientSuggestedRevenue;
        clientExpectedLessSuggested = revenueMetrics.clientExpectedLessSuggested;

        // Calculate matrix-level revenue totals
        revenueTotals = RevenueCalculatorService.calculateMatrixRevenueTotals(
          dataPoints,
          clientRevenue,
          clientSuggestedRevenue
        );
        
        console.log(`💰 [MATRIX TRANSFORM] Revenue calculations complete: ${clientRevenue.size} clients processed`);
      } else {
        console.warn('⚠️ [MATRIX TRANSFORM] No client revenue data available');
      }
    } catch (revenueError) {
      console.error('❌ [MATRIX TRANSFORM] Error calculating client revenue:', revenueError);
    }

    return {
      clientRevenue,
      clientHourlyRates,
      clientSuggestedRevenue,
      clientExpectedLessSuggested,
      revenueTotals
    };
  }

  /**
   * Phase 5: Assemble final matrix data structure
   */
  private static assembleMatrixData(foundationData: any, dataPoints: any[], summaryData: any): DemandMatrixData {
    const { months, skills, skillFeeRates } = foundationData;
    const {
      skillSummary,
      clientTotals,
      clientRevenue,
      clientHourlyRates,
      clientSuggestedRevenue,
      clientExpectedLessSuggested,
      revenueTotals
    } = summaryData;

    // Enhance skill summary with revenue information
    const enhancedSkillSummary = RevenueCalculatorService.enhanceSkillSummaryWithRevenue(
      skillSummary,
      skillFeeRates,
      dataPoints
    );

    return MatrixAssemblerService.assembleMatrixData({
      months,
      skills,
      dataPoints,
      skillSummary: enhancedSkillSummary,
      staffSummary: {}, // Will be populated by future enhancements
      clientMaps: {
        clientTotals,
        clientRevenue,
        clientHourlyRates,
        clientSuggestedRevenue,
        clientExpectedLessSuggested
      },
      revenueTotals,
      staffInformation: []
    });
  }

  /**
   * Phase 6: Validate and finalize matrix data
   */
  private static validateAndFinalize(matrixData: DemandMatrixData): void {
    const validationResult = ValidationService.validateEnhancedMatrixData(matrixData);
    LoggingService.logValidationWarnings(validationResult);
  }
}
