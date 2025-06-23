
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
import { revenueComparisonService } from '../calculators/RevenueComparisonService';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';
import { MatrixRevenueCalculationResult, RevenueEnhancedDataPointContext } from './types';

/**
 * Core matrix transformation orchestrator
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

      // NEW: Fetch skill fee rates for revenue calculations
      let skillFeeRates = new Map<string, number>();
      try {
        console.log('💰 [MATRIX TRANSFORM] Fetching skill fee rates...');
        skillFeeRates = await getSkillFeeRatesMap();
        console.log(`💰 [MATRIX TRANSFORM] Loaded ${skillFeeRates.size} skill fee rates`);
      } catch (error) {
        console.warn('⚠️ [MATRIX TRANSFORM] Error fetching skill fee rates:', error);
        // Continue without fee rates - calculations will use fallback values
      }

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
      const dataPoints = await DataPointGenerationService.generateDataPointsWithSkillMapping(revenueContext);
      
      // Calculate totals and summaries using the enhanced data points
      const totals = CalculationUtils.calculateTotals(dataPoints);
      const skillSummary = CalculationUtils.generateSkillSummary(dataPoints);

      // Calculate client totals
      const clientTotals = ClientTotalsCalculator.calculateClientTotals(dataPoints);

      // Fetch client revenue data and calculate revenue metrics
      let clientRevenue = new Map<string, number>();
      let clientHourlyRates = new Map<string, number>();
      let clientSuggestedRevenue = new Map<string, number>();
      let clientExpectedLessSuggested = new Map<string, number>();

      try {
        console.log('💰 [MATRIX TRANSFORM] Fetching client revenue data...');
        const clientsWithRevenue = await DataFetcher.fetchClientsWithRevenue();
        
        if (clientsWithRevenue.length > 0) {
          // Build client revenue map
          const clientRevenueMap = ClientRevenueCalculator.buildClientRevenueMap(clientsWithRevenue);
          
          // Calculate total expected revenue per client
          const monthCount = months.length;
          clientRevenue = ClientRevenueCalculator.calculateClientRevenue(
            clientTotals,
            clientRevenueMap,
            monthCount
          );
          
          // Calculate expected hourly rates per client
          clientHourlyRates = ClientRevenueCalculator.calculateClientHourlyRates(
            clientTotals,
            clientRevenue
          );

          // NEW: Calculate suggested revenue and expected less suggested per client
          const revenueCalculationResult = await this.calculateClientRevenueMetrics(
            clientTotals,
            clientRevenue,
            skillFeeRates,
            dataPoints
          );

          clientSuggestedRevenue = revenueCalculationResult.clientSuggestedRevenue;
          clientExpectedLessSuggested = revenueCalculationResult.clientExpectedLessSuggested;
          
          console.log(`💰 [MATRIX TRANSFORM] Revenue calculations complete: ${clientRevenue.size} clients processed`);
        } else {
          console.warn('⚠️ [MATRIX TRANSFORM] No client revenue data available');
        }
      } catch (revenueError) {
        console.error('❌ [MATRIX TRANSFORM] Error calculating client revenue:', revenueError);
        // Continue without revenue data rather than failing the entire operation
      }

      // NEW: Calculate matrix-level revenue totals
      const revenueTotals = this.calculateMatrixRevenueTotals(
        dataPoints,
        clientRevenue,
        clientSuggestedRevenue
      );

      // NEW: Enhance skill summary with revenue information
      const enhancedSkillSummary = this.enhanceSkillSummaryWithRevenue(
        skillSummary,
        skillFeeRates,
        dataPoints
      );

      const matrixData: DemandMatrixData = {
        months,
        skills,
        dataPoints,
        totalDemand: totals.totalDemand,
        totalTasks: totals.totalTasks,
        totalClients: totals.totalClients,
        skillSummary: enhancedSkillSummary,
        clientTotals,
        clientRevenue,
        clientHourlyRates,
        // NEW: Enhanced revenue fields
        clientSuggestedRevenue,
        clientExpectedLessSuggested,
        revenueTotals
      };

      // NEW: Validate enhanced data structure
      const validationResult = this.validateEnhancedMatrixData(matrixData);
      if (!validationResult.isValid) {
        console.warn('⚠️ [MATRIX TRANSFORM] Data validation issues:', validationResult.issues);
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      const successMessage = `✅ [MATRIX TRANSFORM] Enhanced matrix generated in ${processingTime.toFixed(2)}ms: ${months.length} months, ${skills.length} skills, ${dataPoints.length} data points, total demand: ${totals.totalDemand}h, clients: ${totals.totalClients}, revenue totals: $${revenueTotals?.totalSuggestedRevenue?.toFixed(2) || 0}`;
      console.log(successMessage);
      debugLog(successMessage);

      // Performance check
      if (processingTime > 2000) {
        console.warn(`⚠️ [MATRIX TRANSFORM] Processing time exceeded 2s target: ${processingTime.toFixed(2)}ms`);
      }

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

  /**
   * NEW: Calculate client-level revenue metrics
   */
  private static async calculateClientRevenueMetrics(
    clientTotals: Map<string, number>,
    clientRevenue: Map<string, number>,
    skillFeeRates: Map<string, number>,
    dataPoints: any[]
  ): Promise<{
    clientSuggestedRevenue: Map<string, number>;
    clientExpectedLessSuggested: Map<string, number>;
  }> {
    const clientSuggestedRevenue = new Map<string, number>();
    const clientExpectedLessSuggested = new Map<string, number>();

    try {
      // Group data points by client for revenue calculation
      const clientDataPoints = new Map<string, any[]>();
      
      dataPoints.forEach(point => {
        if (point.taskBreakdown) {
          point.taskBreakdown.forEach((task: any) => {
            if (!clientDataPoints.has(task.clientName)) {
              clientDataPoints.set(task.clientName, []);
            }
            clientDataPoints.get(task.clientName)!.push({
              ...point,
              clientSpecificHours: task.monthlyHours || point.demandHours
            });
          });
        }
      });

      // Calculate suggested revenue for each client
      for (const [clientName, points] of clientDataPoints) {
        let totalSuggestedRevenue = 0;

        for (const point of points) {
          const feeRate = skillFeeRates.get(point.skillType) || 75.00; // Fallback rate
          const suggestedRevenue = (point.clientSpecificHours || point.demandHours) * feeRate;
          totalSuggestedRevenue += suggestedRevenue;
        }

        const expectedRevenue = clientRevenue.get(clientName) || 0;
        const expectedLessSuggested = expectedRevenue - totalSuggestedRevenue;

        clientSuggestedRevenue.set(clientName, totalSuggestedRevenue);
        clientExpectedLessSuggested.set(clientName, expectedLessSuggested);

        console.log(`💰 [CLIENT REVENUE] ${clientName}: Expected $${expectedRevenue}, Suggested $${totalSuggestedRevenue.toFixed(2)}, Difference $${expectedLessSuggested.toFixed(2)}`);
      }

      return { clientSuggestedRevenue, clientExpectedLessSuggested };
    } catch (error) {
      console.error('❌ [MATRIX TRANSFORM] Error calculating client revenue metrics:', error);
      return { clientSuggestedRevenue, clientExpectedLessSuggested };
    }
  }

  /**
   * NEW: Calculate matrix-level revenue totals
   */
  private static calculateMatrixRevenueTotals(
    dataPoints: any[],
    clientRevenue: Map<string, number>,
    clientSuggestedRevenue: Map<string, number>
  ) {
    const totalSuggestedRevenue = Array.from(clientSuggestedRevenue.values())
      .reduce((sum, revenue) => sum + revenue, 0);
    
    const totalExpectedRevenue = Array.from(clientRevenue.values())
      .reduce((sum, revenue) => sum + revenue, 0);
    
    const totalExpectedLessSuggested = totalExpectedRevenue - totalSuggestedRevenue;

    return {
      totalSuggestedRevenue,
      totalExpectedRevenue,
      totalExpectedLessSuggested
    };
  }

  /**
   * NEW: Enhance skill summary with revenue information
   */
  private static enhanceSkillSummaryWithRevenue(
    skillSummary: any,
    skillFeeRates: Map<string, number>,
    dataPoints: any[]
  ) {
    const enhancedSummary = { ...skillSummary };

    Object.keys(enhancedSummary).forEach(skillName => {
      const skillData = enhancedSummary[skillName];
      const feeRate = skillFeeRates.get(skillName) || 75.00;

      // Calculate total suggested revenue for this skill
      const totalSuggestedRevenue = skillData.totalHours * feeRate;
      
      // Calculate expected less suggested (this would need client allocation logic)
      const totalExpectedLessSuggested = 0; // Simplified for now

      skillData.totalSuggestedRevenue = totalSuggestedRevenue;
      skillData.totalExpectedLessSuggested = totalExpectedLessSuggested;
      skillData.averageFeeRate = feeRate;
    });

    return enhancedSummary;
  }

  /**
   * NEW: Validate enhanced matrix data structure
   */
  private static validateEnhancedMatrixData(matrixData: DemandMatrixData): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate core structure
      if (!matrixData.months || matrixData.months.length === 0) {
        issues.push('Months array is missing or empty');
      }

      if (!matrixData.skills || matrixData.skills.length === 0) {
        issues.push('Skills array is missing or empty');
      }

      // Validate revenue structure
      if (!matrixData.revenueTotals) {
        warnings.push('Revenue totals are missing');
      } else {
        if (typeof matrixData.revenueTotals.totalSuggestedRevenue !== 'number') {
          issues.push('Total suggested revenue is not a number');
        }
        if (typeof matrixData.revenueTotals.totalExpectedRevenue !== 'number') {
          issues.push('Total expected revenue is not a number');
        }
      }

      // Validate data point revenue fields
      const dataPointsWithRevenue = matrixData.dataPoints.filter(dp => 
        dp.suggestedRevenue !== undefined || dp.expectedLessSuggested !== undefined
      );

      if (dataPointsWithRevenue.length === 0) {
        warnings.push('No data points contain revenue information');
      }

      return {
        isValid: issues.length === 0,
        issues,
        warnings
      };
    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        issues,
        warnings
      };
    }
  }
}
