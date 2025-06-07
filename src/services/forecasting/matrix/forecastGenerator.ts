
import { 
  ForecastParameters, 
  ForecastResult,
  ForecastData
} from '@/types/forecasting';
import { SkillsIntegrationService } from '../skillsIntegrationService';
import { SkillAwareForecastingService } from '../skillAwareForecastingService';
import { SkillType } from '@/types/task';
import { debugLog } from '../logger';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';

// Import refactored modules
import { MatrixGenerationOptions, MatrixForecastResult } from './types';
import { MatrixForecastValidators } from './validators';
import { MatrixDataProcessor } from './dataProcessor';
import { EmptyStateHandler } from './emptyStateHandler';

/**
 * Matrix Forecast Generator (Refactored for Maintainability)
 * 
 * Core responsibilities:
 * - Orchestrates 12-month forecast generation with client filtering
 * - Coordinates skill validation, data fetching, and result assembly
 * - Handles empty states and error scenarios gracefully
 * 
 * Key Features:
 * - Client filtering support (undefined = all clients, array = specific clients)
 * - Database skill validation and integration
 * - Modular architecture for improved maintainability
 * - Comprehensive logging for debugging
 * 
 * Architecture:
 * - MatrixForecastValidators: Input validation and data integrity checks
 * - MatrixDataProcessor: Data merging and summary calculations  
 * - EmptyStateHandler: Empty state management
 * - SkillAwareForecastingService: Core forecast generation logic
 */
export class MatrixForecastGenerator {
  /**
   * Generate forecast data for 12-month matrix display with client filtering support
   * 
   * CRITICAL: undefined clientIds means "include all clients" (no filtering)
   * Non-empty array means "filter to these specific clients only"
   * 
   * @param forecastType - 'virtual' or 'actual' forecast mode
   * @param startDate - Start date for forecast period
   * @param options - Optional client filtering and other configuration
   * @returns Promise resolving to forecast result and available skills
   */
  static async generateForecastData(
    forecastType: 'virtual' | 'actual',
    startDate: Date,
    options?: MatrixGenerationOptions
  ): Promise<MatrixForecastResult> {
    debugLog('=== MATRIX FORECAST GENERATION START (REFACTORED) ===');
    debugLog('Generating 12-month matrix forecast:', { 
      forecastType, 
      startDate,
      hasClientFilter: !!options?.clientIds,
      clientCount: options?.clientIds?.length || 0,
      clientIds: options?.clientIds,
      filteringMode: options?.clientIds ? 'specific clients only' : 'all clients (no filter)'
    });

    // Step 1: Validate inputs
    if (!MatrixForecastValidators.validateClientOptions(options?.clientIds)) {
      throw new Error('Invalid client options provided');
    }

    // Step 2: Normalize date range and align with earliest task data
    let normalizedStartDate = startOfMonth(startDate);
    const earliestDate = await SkillAwareForecastingService.getEarliestTaskDate(
      options?.clientIds
    );

    if (earliestDate && earliestDate < normalizedStartDate) {
      normalizedStartDate = startOfMonth(earliestDate);
    }

    const endDate = endOfMonth(addMonths(normalizedStartDate, 11));

    debugLog('Step 1: Date normalization complete', {
      originalStart: startDate,
      normalizedStart: normalizedStartDate,
      calculatedEnd: endDate
    });

    // Step 3: Fetch and validate skills
    debugLog('Step 2: Fetching database skills');
    const availableSkills = await SkillsIntegrationService.getAvailableSkills();
    
    if (!MatrixForecastValidators.validateSkillsAvailability(availableSkills)) {
      debugLog('No skills available - returning empty forecast');
      return await EmptyStateHandler.createEmptyForecastData(
        normalizedStartDate, 
        endDate, 
        forecastType
      );
    }

    debugLog('Step 2 complete: Skills validated', { 
      skillsCount: availableSkills.length, 
      skills: availableSkills 
    });

    // Step 4: Generate demand and capacity forecasts
    debugLog('Step 3: Generating demand and capacity forecasts');
    const [demandForecast, capacityForecast] = await this.generateForecasts(
      normalizedStartDate,
      endDate,
      options?.clientIds
    );

    debugLog('Step 3 complete: Forecasts generated', {
      demandPeriods: demandForecast.length,
      capacityPeriods: capacityForecast.length,
      clientFilteringMode: options?.clientIds ? 'filtered to specific clients' : 'all clients included'
    });

    // Step 5: Process and merge data
    debugLog('Step 4: Processing and merging forecast data');
    const mergedForecastData = MatrixDataProcessor.mergeForecastData(
      demandForecast, 
      capacityForecast
    );

    if (!MatrixForecastValidators.validateForecastData(mergedForecastData)) {
      debugLog('Warning: Generated forecast data failed validation');
    }

    // Step 6: Create final result
    debugLog('Step 5: Creating forecast result');
    const forecastResult = MatrixDataProcessor.createForecastResult(
      mergedForecastData,
      normalizedStartDate,
      endDate,
      forecastType
    );

    debugLog('=== MATRIX FORECAST GENERATION COMPLETE (REFACTORED) ===');
    debugLog('Final result summary:', {
      periodsGenerated: mergedForecastData.length,
      totalDemand: forecastResult.summary.totalDemand,
      totalCapacity: forecastResult.summary.totalCapacity,
      totalGap: forecastResult.summary.gap,
      clientFilteringMode: options?.clientIds ? 'filtered' : 'all clients'
    });

    return {
      forecastResult,
      availableSkills
    };
  }

  /**
   * Generate demand and capacity forecasts in parallel
   * Handles error scenarios with fallback to empty arrays
   * 
   * @private
   */
  private static async generateForecasts(
    startDate: Date,
    endDate: Date,
    clientIds?: string[]
  ): Promise<[ForecastData[], ForecastData[]]> {
    try {
      const [demandForecast, capacityForecast] = await Promise.all([
        SkillAwareForecastingService.generateDemandForecast(
          startDate, 
          endDate, 
          clientIds
        ).catch(error => {
          debugLog('Demand forecast generation failed:', error);
          return []; // Fallback to empty array
        }),
        SkillAwareForecastingService.generateCapacityForecast(
          startDate, 
          endDate,
          clientIds
        ).catch(error => {
          debugLog('Capacity forecast generation failed:', error);
          return []; // Fallback to empty array
        })
      ]);

      return [demandForecast, capacityForecast];
    } catch (error) {
      debugLog('Critical error in forecast generation:', error);
      return [[], []]; // Fallback for any unexpected errors
    }
  }
}
