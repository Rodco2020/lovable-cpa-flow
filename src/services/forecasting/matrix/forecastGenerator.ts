
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

/**
 * Matrix Forecast Generator
 * Handles the core logic for generating forecast data for matrix display
 */
export class MatrixForecastGenerator {
  /**
   * Generate forecast data for 12-month matrix display
   */
  static async generateForecastData(
    forecastType: 'virtual' | 'actual',
    startDate: Date
  ): Promise<{ forecastResult: ForecastResult; availableSkills: SkillType[] }> {
    debugLog('=== MATRIX FORECAST GENERATION START - DATABASE SKILLS ONLY ===');
    debugLog('Generating 12-month matrix forecast with database-only skills', { forecastType, startDate });

    // Normalize start date to beginning of month
    const normalizedStartDate = startOfMonth(startDate);
    
    // Calculate end date (12 months from start)
    const endDate = endOfMonth(addMonths(normalizedStartDate, 11));

    debugLog('Step 1: Getting database skills only');
    
    // Get ONLY database skills - no fallbacks
    const availableSkills = await SkillsIntegrationService.getAvailableSkills();
    debugLog('Database skills retrieved:', { skillsCount: availableSkills.length, skills: availableSkills });
    
    if (availableSkills.length === 0) {
      debugLog('No database skills found - returning empty forecast');
      return await this.createEmptyForecastData(normalizedStartDate, endDate, forecastType);
    }

    debugLog('Step 2: Generating demand and capacity forecasts');
    
    // Generate demand and capacity forecasts using skill-aware service
    const [demandForecast, capacityForecast] = await Promise.all([
      SkillAwareForecastingService.generateDemandForecast(normalizedStartDate, endDate).catch(error => {
        debugLog('Demand forecast generation failed:', error);
        return []; // Return empty array as fallback
      }),
      SkillAwareForecastingService.generateCapacityForecast(normalizedStartDate, endDate).catch(error => {
        debugLog('Capacity forecast generation failed:', error);
        return []; // Return empty array as fallback
      })
    ]);

    debugLog('Forecast generation results:', {
      demandPeriods: demandForecast.length,
      capacityPeriods: capacityForecast.length,
      demandSample: demandForecast[0],
      capacitySample: capacityForecast[0]
    });

    debugLog('Step 3: Merging demand and capacity data');
    
    // Merge demand and capacity data with proper null checking
    const mergedForecastData = this.mergeForecastData(demandForecast, capacityForecast);

    debugLog(`Generated merged forecast with ${mergedForecastData.length} periods`);

    debugLog('Step 4: Creating forecast result');
    
    // Create forecast result
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
        totalDemand: mergedForecastData.reduce((sum, period) => sum + (period.demandHours || 0), 0),
        totalCapacity: mergedForecastData.reduce((sum, period) => sum + (period.capacityHours || 0), 0),
        gap: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      },
      generatedAt: new Date()
    };

    debugLog('=== MATRIX FORECAST GENERATION COMPLETE ===');

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
    debugLog('Creating empty forecast data - no database skills available');
    
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
    
    debugLog('Empty forecast data created - user needs to add skills to database');
    
    return { 
      forecastResult, 
      availableSkills: [] 
    };
  }
}
