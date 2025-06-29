
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';
import { MatrixTransformerCore } from './matrixTransformer/matrixTransformerCore';
import { ForecastDataService } from './forecastDataService';
import { ConditionalAggregationService } from './matrixTransformer/conditionalAggregationService';
import { DemandMatrixCacheService } from './demandMatrixCacheService';
import { debugLog } from '../logger';

/**
 * Demand Matrix Orchestrator - UPDATED FOR CONDITIONAL AGGREGATION
 * Coordinates the demand matrix generation process with support for conditional aggregation strategies
 */
export class DemandMatrixOrchestrator {
  /**
   * Generate demand matrix with conditional aggregation based on active filters
   */
  static async generateDemandMatrix(
    mode: DemandMatrixMode = 'demand-only',
    startDate: Date = new Date(),
    activeFilters?: {
      preferredStaff?: (string | number | null | undefined)[];
      skills?: string[];
      clients?: string[];
    }
  ): Promise<{ matrixData: DemandMatrixData }> {
    debugLog('Starting demand matrix generation with conditional aggregation', { 
      mode, 
      startDate: startDate.toISOString(),
      hasActiveFilters: !!activeFilters,
      preferredStaffCount: activeFilters?.preferredStaff?.length || 0,
      skillsCount: activeFilters?.skills?.length || 0,
      clientsCount: activeFilters?.clients?.length || 0
    });

    try {
      // Determine if we should use staff-based aggregation
      const shouldUseStaffAggregation = activeFilters?.preferredStaff ? 
        ConditionalAggregationService.shouldUseStaffBasedAggregation(activeFilters.preferredStaff) : 
        false;

      console.log(`🎯 [MATRIX ORCHESTRATOR] Aggregation strategy decision:`, {
        shouldUseStaffAggregation,
        hasPreferredStaffFilter: !!activeFilters?.preferredStaff?.length,
        hasSkillsFilter: !!activeFilters?.skills?.length,
        hasClientsFilter: !!activeFilters?.clients?.length
      });

      // Check cache first (with strategy-aware cache key)
      const cacheKey = this.getCacheKeyWithStrategy(mode, startDate, shouldUseStaffAggregation);
      const cachedData = DemandMatrixCacheService.getCachedMatrix(cacheKey);
      
      if (cachedData) {
        console.log(`✅ [CACHE HIT] Using cached matrix data with ${cachedData.aggregationStrategy} strategy`);
        return { matrixData: cachedData };
      }

      // Load forecast data and tasks
      const { forecastData, tasks } = await ForecastDataService.loadForecastData(startDate);
      
      if (!forecastData || !tasks) {
        throw new Error('Failed to load forecast data or tasks');
      }

      console.log(`📊 [MATRIX ORCHESTRATOR] Loaded data: ${forecastData.length} periods, ${tasks.length} tasks`);

      // Create filter context for matrix transformer
      const filterContext = {
        hasStaffFilter: shouldUseStaffAggregation,
        hasSkillFilter: !!activeFilters?.skills?.length,
        preferredStaffIds: activeFilters?.preferredStaff?.map(id => String(id)).filter(Boolean) || [],
        skillTypes: activeFilters?.skills || []
      };

      // Transform to matrix data using conditional aggregation
      const matrixData = await MatrixTransformerCore.transformToMatrixData(
        forecastData,
        tasks,
        filterContext
      );

      // Cache the result with strategy information
      DemandMatrixCacheService.setCachedMatrix(cacheKey, matrixData);

      console.log(`✅ [MATRIX ORCHESTRATOR] Generated matrix with ${matrixData.aggregationStrategy} strategy:`, {
        dataPoints: matrixData.dataPoints.length,
        skills: matrixData.skills.length,
        totalDemand: matrixData.totalDemand,
        totalTasks: matrixData.totalTasks
      });

      return { matrixData };

    } catch (error) {
      console.error('❌ [MATRIX ORCHESTRATOR] Error generating demand matrix:', error);
      
      // Return minimal fallback matrix
      const fallbackMatrix: DemandMatrixData = {
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

      return { matrixData: fallbackMatrix };
    }
  }

  /**
   * Generate cache key that includes aggregation strategy
   */
  private static getCacheKeyWithStrategy(
    mode: DemandMatrixMode, 
    startDate: Date, 
    useStaffAggregation: boolean
  ): string {
    const baseKey = DemandMatrixCacheService.getDemandMatrixCacheKey(mode, startDate);
    const strategy = useStaffAggregation ? 'staff' : 'skill';
    return `${baseKey}_${strategy}`;
  }
}
