
import { DemandDataPoint } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { DataValidator } from '../dataValidator';
import { DemandCalculationService } from './demandCalculationService';
import { DataPointGenerationContext } from './types';
import { ClientResolutionService } from '../clientResolutionService';
import { format } from 'date-fns';

/**
 * Service responsible for generating data points for the matrix
 */
export class DataPointGenerationService {
  /**
   * Generate data points with correct skill mapping and client resolution
   */
  static async generateDataPointsWithSkillMapping(
    context: DataPointGenerationContext
  ): Promise<DemandDataPoint[]> {
    try {
      const { forecastData, tasks, skills, skillMapping } = context;
      const dataPoints: DemandDataPoint[] = [];

      console.log('🔄 [DATA POINT GEN] Generating data points with skill mapping and client resolution...');

      // Pre-warm the client resolution cache
      await ClientResolutionService.initializeClientCache();

      // Pre-resolve all client IDs to names for consistent aggregation
      const allClientIds = [...new Set(tasks.map(task => task.client_id).filter(Boolean))];
      const clientResolutionMap = await ClientResolutionService.resolveClientIds(allClientIds);
      
      console.log(`🏢 [DATA POINT GEN] Pre-resolved ${clientResolutionMap.size} clients for consistent aggregation`);

      for (const skill of skills) {
        for (const period of forecastData) {
          try {
            if (!period || !period.period) continue;

            // Calculate demand using both direct match and mapping
            const demandHours = DemandCalculationService.calculateDemandForSkillPeriodWithMapping(
              period, 
              skill, 
              skillMapping
            );
            
            const taskBreakdown = await DemandCalculationService.generateTaskBreakdownWithMapping(
              tasks, 
              skill, 
              period.period, 
              skillMapping,
              clientResolutionMap  // Pass pre-resolved client map
            );
            
            // Calculate derived metrics safely with consistent client counting using resolved names
            const taskCount = DataValidator.sanitizeArrayLength(taskBreakdown.length, 1000);
            
            // Count unique clients by resolved names (not UUIDs)
            const uniqueClientNames = new Set(
              taskBreakdown
                .map(t => t.clientName)
                .filter(name => typeof name === 'string' && name.length > 0 && !name.includes('...')) // Exclude fallback names
            );
            const clientCount = DataValidator.sanitizeArrayLength(uniqueClientNames.size, 1000);

            const dataPoint: DemandDataPoint = {
              skillType: skill,
              month: period.period,
              monthLabel: this.getMonthLabel(period.period),
              demandHours: Math.max(0, demandHours),
              taskCount,
              clientCount,
              taskBreakdown
            };

            dataPoints.push(dataPoint);

            console.log(`✅ [DATA POINT GEN] Generated data point for ${skill} in ${period.period}:`, {
              demandHours,
              taskCount,
              clientCount,
              uniqueClients: Array.from(uniqueClientNames).slice(0, 3)
            });

          } catch (pointError) {
            console.warn(`Error generating data point for ${skill} in ${period.period}:`, pointError);
          }
        }
      }

      console.log(`📊 [DATA POINT GEN] Generated ${dataPoints.length} total data points with consistent client resolution`);
      return dataPoints;
    } catch (error) {
      console.error('Error generating data points with skill mapping and client resolution:', error);
      return [];
    }
  }

  /**
   * Get month label safely
   */
  private static getMonthLabel(period: string): string {
    try {
      if (!period || !/^\d{4}-\d{2}$/.test(period)) {
        return 'Invalid Date';
      }
      
      const date = new Date(period + '-01');
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.warn(`Error formatting month label for ${period}:`, error);
      return 'Invalid Date';
    }
  }
}
