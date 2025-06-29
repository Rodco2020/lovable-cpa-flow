import { debugLog } from '../../logger';
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { DataValidator } from '../dataValidator';
import { SkillMappingService } from './skillMappingService';
import { ConditionalAggregationService } from './conditionalAggregationService';
import { PeriodProcessingService } from './periodProcessingService';
import { CalculationUtils } from './calculationUtils';
import { ClientResolutionService } from '../clientResolutionService';
import { ClientTotalsCalculator } from './clientTotalsCalculator';
import { MatrixRevenueCalculator } from './matrixRevenueCalculator';
import { MatrixDataEnricher } from './matrixDataEnricher';
import { RevenueEnhancedDataPointContext } from './types';

/**
 * Core matrix transformation orchestrator - UPDATED FOR CONDITIONAL AGGREGATION
 * Now supports both skill-based and staff-based aggregation strategies
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast data to matrix format with conditional aggregation strategy
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    activeFilters?: {
      hasStaffFilter: boolean;
      hasSkillFilter: boolean;
      preferredStaffIds?: string[];
      skillTypes?: string[];
    }
  ): Promise<DemandMatrixData> {
    const startTime = performance.now();
    
    debugLog('Starting matrix transformation with conditional aggregation', { 
      periodsCount: forecastData.length, 
      tasksCount: tasks.length,
      hasStaffFilter: activeFilters?.hasStaffFilter || false,
      hasSkillFilter: activeFilters?.hasSkillFilter || false
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

      // Initialize client resolution cache early
      await ClientResolutionService.initializeClientCache();
      const cacheStats = ClientResolutionService.getCacheStats();
      console.log('📊 [MATRIX TRANSFORM] Client cache initialized:', cacheStats);

      // Enhanced validation and cleaning with skill resolution
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(tasks);

      if (resolvedTasks.length > 0) {
        console.log(`✅ [MATRIX TRANSFORM] Resolved skills for ${resolvedTasks.length} tasks`);
      }

      if (invalidTasks.length > 0) {
        console.warn(`⚠️ [MATRIX TRANSFORM] Excluded ${invalidTasks.length} invalid tasks from matrix generation`);
      }

      // Generate months from forecast data
      const months = PeriodProcessingService.generateMonthsFromForecast(forecastData);
      
      // Extract unique skills with proper resolution mapping
      const { skills, skillMapping } = await SkillMappingService.extractUniqueSkillsWithMapping(
        forecastData, 
        validTasks
      );

      // Enhanced data point generation context with conditional aggregation
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

      // Use conditional aggregation service to generate data points
      const dataPoints = await ConditionalAggregationService.generateDataPointsWithConditionalAggregation(
        revenueContext,
        {
          hasStaffFilter: activeFilters?.hasStaffFilter || false,
          hasSkillFilter: activeFilters?.hasSkillFilter || false,
          preferredStaffIds: activeFilters?.preferredStaffIds || [],
          skillTypes: activeFilters?.skillTypes || []
        }
      );
      
      // Calculate totals and summaries using the generated data points
      const totals = CalculationUtils.calculateTotals(dataPoints);
      
      // For staff-based aggregation, we need to extract unique skills from data points
      const actualSkills = activeFilters?.hasStaffFilter 
        ? this.extractSkillsFromStaffDataPoints(dataPoints)
        : skills;
      
      const skillSummary = CalculationUtils.generateSkillSummary(dataPoints);

      // Calculate client totals
      const clientTotals = ClientTotalsCalculator.calculateClientTotals(dataPoints);

      // Calculate revenue information
      const revenueResults = await MatrixRevenueCalculator.calculateMatrixRevenue(dataPoints, months);

      // Enhance skill summary with revenue information
      const enhancedSkillSummary = MatrixRevenueCalculator.enhanceSkillSummaryWithRevenue(
        skillSummary,
        revenueResults.skillFeeRates,
        dataPoints
      );

      const baseMatrixData: DemandMatrixData = {
        months,
        skills: actualSkills,
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
        revenueTotals: revenueResults.revenueTotals,
        // Add metadata about aggregation strategy
        aggregationStrategy: activeFilters?.hasStaffFilter ? 'staff-based' : 'skill-based'
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

      // Generate processing summary
      const successMessage = MatrixDataEnricher.generateProcessingSummary(enrichedMatrixData, processingTime);
      console.log(successMessage);
      
      // Log aggregation strategy used
      console.log(`🎯 [MATRIX TRANSFORM] Used ${baseMatrixData.aggregationStrategy} aggregation strategy`);

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
        },
        aggregationStrategy: 'skill-based'
      };
    }
  }
  
  /**
   * Extract unique skills from staff-based data points
   */
  private static extractSkillsFromStaffDataPoints(dataPoints: any[]): string[] {
    const skillSet = new Set<string>();
    
    dataPoints.forEach(dp => {
      if (dp.isStaffSpecific && dp.actualStaffName) {
        // For staff-specific data points, use the staff-skill combination as the "skill"
        skillSet.add(dp.skillType); // This will be "Staff Name (Skill)"
      } else if (dp.isUnassigned && dp.underlyingSkillType) {
        // For unassigned data points, use the unassigned-skill combination
        skillSet.add(dp.skillType); // This will be "Unassigned (Skill)"
      } else {
        // Fallback to regular skill type
        skillSet.add(dp.skillType);
      }
    });
    
    return Array.from(skillSet).sort();
  }
}
