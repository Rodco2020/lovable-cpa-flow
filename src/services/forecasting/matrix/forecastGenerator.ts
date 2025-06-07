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

interface MatrixGenerationOptions {
  clientIds?: string[];
  includeInactive?: boolean;
}

/**
 * Matrix Forecast Generator (Phase 3: Client Filtering Enhanced + Phase 4 Fix)
 * Handles the core logic for generating forecast data for matrix display with client filtering
 * 
 * CRITICAL FIX: Properly handles undefined clientIds to mean "include all clients"
 */
export class MatrixForecastGenerator {
  /**
   * Generate forecast data for 12-month matrix display with client filtering support
   * 
   * CRITICAL FIX: undefined clientIds means "include all clients" (no filtering)
   * Non-empty array means "filter to these specific clients only"
   */
  static async generateForecastData(
    forecastType: 'virtual' | 'actual',
    startDate: Date,
    options?: MatrixGenerationOptions
  ): Promise<{ forecastResult: ForecastResult; availableSkills: SkillType[] }> {
    debugLog('=== PHASE 3 MATRIX FORECAST GENERATION START - WITH CLIENT FILTERING FIX + STATUS FIX ===');
    debugLog('Generating 12-month matrix forecast with CLIENT FILTERING LOGIC FIX:', { 
      forecastType, 
      startDate,
      hasClientFilter: !!options?.clientIds,
      clientCount: options?.clientIds?.length || 0,
      clientIds: options?.clientIds,
      filteringMode: options?.clientIds ? 'specific clients only' : 'all clients (no filter)',
      statusFilterNote: 'Using lowercase "active" status for staff filtering'
    });

    // Normalize start date to beginning of month
    const normalizedStartDate = startOfMonth(startDate);
    
    // Calculate end date (12 months from start)
    const endDate = endOfMonth(addMonths(normalizedStartDate, 11));

    debugLog('Phase 3: Step 1 - Getting database skills only');
    
    // Get ONLY database skills - no fallbacks
    const availableSkills = await SkillsIntegrationService.getAvailableSkills();
    debugLog('Database skills retrieved:', { skillsCount: availableSkills.length, skills: availableSkills });
    
    if (availableSkills.length === 0) {
      debugLog('No database skills found - returning empty forecast');
      return await this.createEmptyForecastData(normalizedStartDate, endDate, forecastType);
    }

    debugLog('Phase 3: Step 2 - Generating demand and capacity forecasts with CLIENT FILTERING FIX + STATUS FIX');
    debugLog('Client filtering logic applied with staff status correction:', {
      optionsProvided: !!options,
      clientIdsProvided: !!options?.clientIds,
      clientIdsLength: options?.clientIds?.length || 0,
      filteringMode: options?.clientIds ? `filter to ${options.clientIds.length} specific clients` : 'include all clients (no filtering)',
      staffStatusFilter: 'active (lowercase)'
    });
    
    // Generate demand and capacity forecasts using skill-aware service with client filtering
    const [demandForecast, capacityForecast] = await Promise.all([
      SkillAwareForecastingService.generateDemandForecast(
        normalizedStartDate, 
        endDate, 
        options?.clientIds // Pass client filtering - undefined = all clients, array = specific clients
      ).catch(error => {
        debugLog('Demand forecast generation failed:', error);
        return []; // Return empty array as fallback
      }),
      SkillAwareForecastingService.generateCapacityForecast(
        normalizedStartDate, 
        endDate,
        options?.clientIds // Pass client filtering - undefined = all clients, array = specific clients
      ).catch(error => {
        debugLog('Capacity forecast generation failed:', error);
        return []; // Return empty array as fallback
      })
    ]);

    debugLog('Phase 3: Forecast generation results with CLIENT FILTERING FIX + STATUS FIX:', {
      demandPeriods: demandForecast.length,
      capacityPeriods: capacityForecast.length,
      clientFilteringMode: options?.clientIds ? 'filtered to specific clients' : 'all clients included',
      filteredClientCount: options?.clientIds?.length || 'all',
      demandSample: demandForecast[0],
      capacitySample: capacityForecast[0],
      totalDemandHours: demandForecast.reduce((sum: number, period) => sum + (period.demandHours || 0), 0),
      totalCapacityHours: capacityForecast.reduce((sum: number, period) => sum + (period.capacityHours || 0), 0)
    });

    debugLog('Phase 3: Step 3 - Merging demand and capacity data with client filtering applied');
    
    // Merge demand and capacity data with proper null checking
    const mergedForecastData = this.mergeForecastData(demandForecast, capacityForecast);

    debugLog(`Phase 3: Generated merged forecast with ${mergedForecastData.length} periods (client filtering mode: ${options?.clientIds ? 'specific clients' : 'all clients'})`);

    debugLog('Phase 3: Step 4 - Creating forecast result with client filtering metadata');
    
    // Create forecast result with client filtering metadata
    const forecastResult: ForecastResult = {
      parameters: {
        mode: forecastType,
        timeframe: 'custom',
        dateRange: {
          startDate: normalizedStartDate,
          endDate: endDate
        },
        granularity: 'monthly',
        includeSkills: 'all'
      },
      data: mergedForecastData,
      financials: [],
      summary: {
        totalDemand: mergedForecastData.reduce((sum: number, period) => sum + (period.demandHours || 0), 0),
        totalCapacity: mergedForecastData.reduce((sum: number, period) => sum + (period.capacityHours || 0), 0),
        gap: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      },
      generatedAt: new Date()
    };

    // Calculate gap after totals are computed
    forecastResult.summary.gap = forecastResult.summary.totalDemand - forecastResult.summary.totalCapacity;

    debugLog('=== PHASE 3 MATRIX FORECAST GENERATION COMPLETE WITH CLIENT FILTERING FIX + STATUS FIX ===');
    debugLog('Final result summary:', {
      periodsGenerated: mergedForecastData.length,
      totalDemand: forecastResult.summary.totalDemand,
      totalCapacity: forecastResult.summary.totalCapacity,
      totalGap: forecastResult.summary.gap,
      clientFilteringMode: options?.clientIds ? 'filtered' : 'all clients',
      clientsIncluded: options?.clientIds?.length || 'all'
    });

    return {
      forecastResult,
      availableSkills
    };
  }

  /**
   * Merge demand and capacity forecast data
   */
  private static mergeForecastData(
    demandForecast: ForecastData[],
    capacityForecast: ForecastData[]
  ): ForecastData[] {
    return demandForecast.map((demandPeriod, index) => {
      const capacityPeriod = capacityForecast[index];
      return {
        ...demandPeriod,
        capacity: capacityPeriod?.capacity || [],
        capacityHours: capacityPeriod?.capacityHours || 0
      };
    });
  }

  /**
   * Create empty forecast data when no database skills exist
   */
  private static async createEmptyForecastData(
    startDate: Date, 
    endDate: Date, 
    forecastType: 'virtual' | 'actual'
  ): Promise<{ forecastResult: ForecastResult; availableSkills: SkillType[] }> {
    debugLog('Phase 3: Creating empty forecast data - no database skills available');
    
    const forecastResult: ForecastResult = {
      parameters: {
        mode: forecastType,
        timeframe: 'custom',
        dateRange: { startDate, endDate },
        granularity: 'monthly',
        includeSkills: 'all'
      },
      data: [],
      financials: [],
      summary: {
        totalDemand: 0,
        totalCapacity: 0,
        gap: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      },
      generatedAt: new Date()
    };
    
    debugLog('Phase 3: Empty forecast data created - user needs to add skills to database');
    
    return { 
      forecastResult, 
      availableSkills: [] 
    };
  }
}
