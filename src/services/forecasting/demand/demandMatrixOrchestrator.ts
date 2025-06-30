
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';
import { MatrixTransformerCore } from './matrixTransformer/matrixTransformerCore';
import { ForecastDataService } from './forecastDataService';
import { ConditionalAggregationService } from './matrixTransformer/conditionalAggregationService';
import { DemandMatrixCacheService } from './demandMatrixCacheService';
import { debugLog } from '../logger';

/**
 * Demand Matrix Orchestrator - ENHANCED WITH COMPREHENSIVE VERIFICATION LOGGING
 * Coordinates the demand matrix generation process with support for conditional aggregation strategies
 */
export class DemandMatrixOrchestrator {
  /**
   * Generate demand matrix with conditional aggregation based on active filters
   * ENHANCED: Comprehensive verification logging for staff aggregation
   */
  static async generateDemandMatrix(
    mode: DemandMatrixMode = 'demand-only',
    activeFilters?: {
      preferredStaff?: (string | number | null | undefined)[];
      skills?: string[];
      clients?: string[];
    }
  ): Promise<{ matrixData: DemandMatrixData }> {
    const startDate = new Date();
    
    console.log(`🚀 [VERIFICATION - MATRIX ORCHESTRATOR] ========= STARTING MATRIX GENERATION =========`);
    console.log(`🚀 [VERIFICATION - MATRIX ORCHESTRATOR] Request Parameters:`, { 
      mode, 
      startDate: startDate.toISOString(),
      hasActiveFilters: !!activeFilters,
      filterDetails: {
        preferredStaffCount: activeFilters?.preferredStaff?.length || 0,
        preferredStaff: activeFilters?.preferredStaff || 'NONE',
        skillsCount: activeFilters?.skills?.length || 0,
        skills: activeFilters?.skills || 'NONE',
        clientsCount: activeFilters?.clients?.length || 0,
        clients: activeFilters?.clients || 'NONE'
      }
    });

    debugLog('Starting demand matrix generation with conditional aggregation - VERIFICATION MODE', { 
      mode, 
      startDate: startDate.toISOString(),
      hasActiveFilters: !!activeFilters,
      preferredStaffCount: activeFilters?.preferredStaff?.length || 0,
      skillsCount: activeFilters?.skills?.length || 0,
      clientsCount: activeFilters?.clients?.length || 0
    });

    try {
      // CRITICAL: Determine if we should use staff-based aggregation
      const shouldUseStaffAggregation = activeFilters?.preferredStaff ? 
        ConditionalAggregationService.shouldUseStaffBasedAggregation(activeFilters.preferredStaff) : 
        false;

      console.log(`🎯 [VERIFICATION - MATRIX ORCHESTRATOR] ========= AGGREGATION STRATEGY DECISION =========`);
      console.log(`🎯 [VERIFICATION - MATRIX ORCHESTRATOR] Strategy Analysis:`, {
        shouldUseStaffAggregation,
        hasPreferredStaffFilter: !!activeFilters?.preferredStaff?.length,
        preferredStaffFilterValue: activeFilters?.preferredStaff,
        hasSkillsFilter: !!activeFilters?.skills?.length,
        hasClientsFilter: !!activeFilters?.clients?.length,
        finalStrategy: shouldUseStaffAggregation ? 'STAFF-BASED' : 'SKILL-BASED'
      });

      // Check cache first (with strategy-aware cache key)
      const cacheKey = this.getCacheKeyWithStrategy(mode, startDate, shouldUseStaffAggregation);
      const cachedData = DemandMatrixCacheService.getCachedData(cacheKey);
      
      if (cachedData) {
        console.log(`💾 [VERIFICATION - MATRIX ORCHESTRATOR] CACHE HIT - Using cached data:`, {
          aggregationStrategy: cachedData.aggregationStrategy,
          dataPoints: cachedData.dataPoints.length,
          skills: cachedData.skills.length,
          cacheKey: cacheKey.substring(0, 50) + '...'
        });
        return { matrixData: cachedData };
      }

      console.log(`💾 [VERIFICATION - MATRIX ORCHESTRATOR] CACHE MISS - Generating new data`);

      // Load forecast data and tasks
      const { forecastData, tasks } = await ForecastDataService.loadForecastData(startDate);
      
      if (!forecastData || !tasks) {
        throw new Error('Failed to load forecast data or tasks');
      }

      console.log(`📊 [VERIFICATION - MATRIX ORCHESTRATOR] Source Data Loaded:`, {
        forecastPeriods: forecastData.length,
        totalTasks: tasks.length,
        periodsRange: forecastData.length > 0 ? `${forecastData[0].period} to ${forecastData[forecastData.length - 1].period}` : 'NO PERIODS',
        tasksWithStaffAssignment: tasks.filter(t => t.preferred_staff_id).length,
        tasksWithoutStaffAssignment: tasks.filter(t => !t.preferred_staff_id).length
      });

      // Create filter context for matrix transformer
      const filterContext = {
        hasStaffFilter: shouldUseStaffAggregation,
        hasSkillFilter: !!activeFilters?.skills?.length,
        preferredStaffIds: activeFilters?.preferredStaff?.map(id => String(id)).filter(Boolean) || [],
        skillTypes: activeFilters?.skills || []
      };

      console.log(`🔧 [VERIFICATION - MATRIX ORCHESTRATOR] Filter Context Created:`, filterContext);

      // Transform to matrix data using conditional aggregation
      console.log(`⚙️ [VERIFICATION - MATRIX ORCHESTRATOR] Calling MatrixTransformerCore with filter context...`);
      const matrixData = await MatrixTransformerCore.transformToMatrixData(
        forecastData,
        tasks,
        filterContext
      );

      console.log(`✅ [VERIFICATION - MATRIX ORCHESTRATOR] ========= MATRIX GENERATION COMPLETE =========`);
      console.log(`✅ [VERIFICATION - MATRIX ORCHESTRATOR] Final Matrix Data:`, {
        aggregationStrategy: matrixData.aggregationStrategy,
        dataPoints: matrixData.dataPoints.length,
        skills: matrixData.skills.length,
        months: matrixData.months.length,
        totalDemand: matrixData.totalDemand,
        totalTasks: matrixData.totalTasks,
        totalClients: matrixData.totalClients,
        skillTypes: matrixData.skills,
        dataPointSample: matrixData.dataPoints.slice(0, 3).map(dp => ({
          skillType: dp.skillType,
          demandHours: dp.demandHours,
          taskCount: dp.taskCount,
          isStaffSpecific: dp.isStaffSpecific,
          actualStaffName: dp.actualStaffName
        }))
      });

      // Cache the result with strategy information
      DemandMatrixCacheService.setCachedData(cacheKey, matrixData);

      return { matrixData };

    } catch (error) {
      console.error('❌ [VERIFICATION - MATRIX ORCHESTRATOR] ERROR in matrix generation:', error);
      
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

      console.log(`🔄 [VERIFICATION - MATRIX ORCHESTRATOR] Returning fallback matrix`);
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
