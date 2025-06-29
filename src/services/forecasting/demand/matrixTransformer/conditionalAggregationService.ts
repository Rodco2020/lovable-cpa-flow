
import { DemandDataPoint } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { StaffBasedAggregationService } from './staffBasedAggregationService';
import { DataPointGenerationService } from './dataPointGenerationService';
import { RevenueEnhancedDataPointContext } from './types';
import { debugLog } from '../../logger';

/**
 * Conditional Aggregation Service
 * 
 * Determines the appropriate aggregation strategy based on active filters:
 * - Staff filtering active → aggregate by individual staff members
 * - Skill filtering active → aggregate by skill types
 * - Both active → aggregate by staff within skill
 * - Neither active → use default skill-based aggregation
 */
export class ConditionalAggregationService {
  /**
   * Generate data points using the appropriate aggregation strategy
   */
  static async generateDataPointsWithConditionalAggregation(
    context: RevenueEnhancedDataPointContext,
    activeFilters?: {
      hasStaffFilter: boolean;
      hasSkillFilter: boolean;
      preferredStaffIds: string[];
      skillTypes: string[];
    }
  ): Promise<DemandDataPoint[]> {
    const { forecastData, tasks, skills, skillMapping } = context;
    
    debugLog('Determining aggregation strategy', {
      hasStaffFilter: activeFilters?.hasStaffFilter || false,
      hasSkillFilter: activeFilters?.hasSkillFilter || false,
      staffFilterCount: activeFilters?.preferredStaffIds?.length || 0,
      skillFilterCount: activeFilters?.skillTypes?.length || 0
    });
    
    // Determine aggregation strategy
    if (activeFilters?.hasStaffFilter) {
      console.log(`🔄 [CONDITIONAL AGGREGATION] Using STAFF-BASED aggregation (staff filter active)`);
      return this.generateStaffBasedDataPoints(forecastData, tasks, skillMapping);
    } else {
      console.log(`🔄 [CONDITIONAL AGGREGATION] Using SKILL-BASED aggregation (no staff filter)`);
      return DataPointGenerationService.generateDataPointsWithSkillMapping(context);
    }
  }
  
  /**
   * Generate staff-based data points for all forecast periods
   */
  private static async generateStaffBasedDataPoints(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<DemandDataPoint[]> {
    const allDataPoints: DemandDataPoint[] = [];
    
    console.log(`📊 [STAFF AGGREGATION] Generating staff-based data points for ${forecastData.length} periods`);
    
    for (const forecastPeriod of forecastData) {
      try {
        const periodDataPoints = await StaffBasedAggregationService.generateStaffSpecificDataPoints(
          forecastPeriod,
          tasks,
          skillMapping
        );
        
        allDataPoints.push(...periodDataPoints);
        
        console.log(`✅ [STAFF AGGREGATION] Generated ${periodDataPoints.length} data points for ${forecastPeriod.period}`);
      } catch (error) {
        console.error(`❌ [STAFF AGGREGATION] Error generating data points for ${forecastPeriod.period}:`, error);
      }
    }
    
    console.log(`🏁 [STAFF AGGREGATION] Total staff-based data points generated: ${allDataPoints.length}`);
    return allDataPoints;
  }
  
  /**
   * Detect if staff filtering should be active based on current context
   */
  static shouldUseStaffBasedAggregation(
    preferredStaffFilter: (string | number | null | undefined)[]
  ): boolean {
    const hasStaffFilter = preferredStaffFilter && 
                          preferredStaffFilter.length > 0 && 
                          preferredStaffFilter.some(id => id !== null && id !== undefined && String(id).trim() !== '');
    
    console.log(`🔍 [AGGREGATION DETECTION] Staff filter analysis:`, {
      preferredStaffFilter,
      hasStaffFilter,
      filterLength: preferredStaffFilter?.length || 0,
      shouldUseStaffAggregation: hasStaffFilter
    });
    
    return hasStaffFilter;
  }
}
