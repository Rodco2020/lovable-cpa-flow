
import { debugLog } from '../../logger';
import { DemandDataPoint } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { DemandCalculationService } from './demandCalculationService';
import { PeriodProcessingService } from './periodProcessingService';
import { TaskBreakdownService } from './taskBreakdownService';
import { DataPointFactoryService } from './dataPointFactoryService';
import { RevenueEnhancedDataPointContext } from './types';

/**
 * Enhanced Data Point Generation Service
 * Orchestrates the generation of data points with revenue calculations
 * 
 * Refactored for improved maintainability while preserving all functionality
 */
export class DataPointGenerationService {
  /**
   * Generate data points with skill mapping and revenue calculations
   */
  static async generateDataPointsWithSkillMapping(
    context: RevenueEnhancedDataPointContext
  ): Promise<DemandDataPoint[]> {
    const { forecastData, tasks, skills, skillMapping, revenueContext, revenueCalculationConfig } = context;
    
    debugLog('Generating data points with enhanced revenue calculations', {
      periodsCount: forecastData.length,
      skillsCount: skills.length,
      tasksCount: tasks.length,
      revenueEnabled: revenueCalculationConfig?.enabled || false
    });

    try {
      const dataPoints: DemandDataPoint[] = [];
      const months = PeriodProcessingService.generateMonthsFromForecast(forecastData);

      console.log(`📊 [DATA POINTS] Generating ${months.length} × ${skills.length} data points with enhanced recurrence calculations`);

      // Generate data points for each month-skill combination
      for (const month of months) {
        for (const skill of skills) {
          try {
            const dataPoint = await this.generateSingleDataPoint(
              month,
              skill,
              forecastData,
              tasks,
              skillMapping,
              revenueContext
            );
            
            if (dataPoint) {
              dataPoints.push(dataPoint);
            }
          } catch (error) {
            console.warn(`⚠️ [DATA POINTS] Error generating data point for ${month.key}/${skill}:`, error);
            // Continue with other data points rather than failing
            const fallbackDataPoint = DataPointFactoryService.createFallbackDataPoint(month, skill);
            dataPoints.push(fallbackDataPoint);
          }
        }
      }

      console.log(`✅ [DATA POINTS] Generated ${dataPoints.length} data points with enhanced recurrence calculations`);
      return dataPoints;

    } catch (error) {
      console.error('❌ [DATA POINTS] Error generating data points:', error);
      return [];
    }
  }

  /**
   * Generate a single data point with revenue calculations
   */
  private static async generateSingleDataPoint(
    month: { key: string; label: string; startDate: Date; endDate: Date },
    skill: string,
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>,
    revenueContext?: any
  ): Promise<DemandDataPoint | null> {
    try {
      // Find matching forecast period
      const forecastPeriod = forecastData.find(period => period.period === month.key);
      if (!forecastPeriod) {
        return null;
      }

      // Calculate demand using existing logic (now enhanced with proper recurrence calculation)
      const demandCalculation = DemandCalculationService.calculateDemandForSkillPeriod(
        skill,
        forecastPeriod,
        tasks,
        skillMapping
      );

      // Generate task breakdown with client resolution
      const taskBreakdown = await TaskBreakdownService.generateTaskBreakdown(
        skill,
        forecastPeriod,
        tasks,
        skillMapping
      );

      // Create the complete data point using the factory
      return DataPointFactoryService.createDataPoint(
        month,
        skill,
        demandCalculation,
        taskBreakdown,
        revenueContext
      );

    } catch (error) {
      console.error(`❌ [DATA POINT] Error generating data point for ${month.key}/${skill}:`, error);
      return null;
    }
  }
}
