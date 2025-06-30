
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';
import { MatrixTransformerCore } from './matrixTransformer/matrixTransformerCore';
import { ForecastDataService } from './forecastDataService';
import { ConditionalAggregationService } from './matrixTransformer/conditionalAggregationService';
import { DemandMatrixCacheService } from './demandMatrixCacheService';
import { debugLog } from '../logger';

/**
 * Demand Matrix Orchestrator - ENHANCED WITH CACHE INVALIDATION FOR STAFF AGGREGATION
 * Coordinates the demand matrix generation process with support for conditional aggregation strategies
 * and proper cache invalidation when switching aggregation modes
 */
export class DemandMatrixOrchestrator {
  /**
   * Generate demand matrix with conditional aggregation and enhanced cache management
   * ENHANCED: Proper cache invalidation for staff aggregation with comprehensive logging
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
    
    console.log(`🚀 [MATRIX ORCHESTRATOR] ========= STARTING MATRIX GENERATION =========`);
    console.log(`🚀 [MATRIX ORCHESTRATOR] Request Parameters:`, { 
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

    debugLog('Starting demand matrix generation with conditional aggregation - CACHE INVALIDATION MODE', { 
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

      console.log(`🎯 [MATRIX ORCHESTRATOR] ========= AGGREGATION STRATEGY DECISION =========`);
      console.log(`🎯 [MATRIX ORCHESTRATOR] Strategy Analysis:`, {
        shouldUseStaffAggregation,
        hasPreferredStaffFilter: !!activeFilters?.preferredStaff?.length,
        preferredStaffFilterValue: activeFilters?.preferredStaff,
        hasSkillsFilter: !!activeFilters?.skills?.length,
        hasClientsFilter: !!activeFilters?.clients?.length,
        finalStrategy: shouldUseStaffAggregation ? 'STAFF-BASED' : 'SKILL-BASED'
      });

      // CRITICAL FIX: Force clear staff aggregation cache if using staff-based aggregation
      if (shouldUseStaffAggregation) {
        console.log(`🚨 [MATRIX ORCHESTRATOR] STAFF AGGREGATION DETECTED - FORCE CLEARING CACHE`);
        DemandMatrixCacheService.forceInvalidateStaffAggregationCache();
        
        // Also clear any potential conflicting entries
        DemandMatrixCacheService.clearCache('staff-based');
        
        console.log(`✅ [MATRIX ORCHESTRATOR] Cache invalidation complete for staff aggregation`);
      }

      // Generate cache key with proper aggregation strategy
      const aggregationStrategy = shouldUseStaffAggregation ? 'staff-based' : 'skill-based';
      const cacheKey = DemandMatrixCacheService.getDemandMatrixCacheKey(mode, startDate, aggregationStrategy);
      
      console.log(`🔑 [MATRIX ORCHESTRATOR] Cache key details:`, {
        cacheKey,
        aggregationStrategy,
        shouldUseStaffAggregation
      });

      // Check cache with strategy validation (should be empty after invalidation for staff mode)
      const cachedData = DemandMatrixCacheService.getCachedData(cacheKey, aggregationStrategy);
      
      if (cachedData) {
        console.log(`💾 [MATRIX ORCHESTRATOR] CACHE HIT - Using cached data:`, {
          aggregationStrategy: cachedData.aggregationStrategy,
          dataPoints: cachedData.dataPoints.length,
          skills: cachedData.skills.length,
          cacheKey: cacheKey.substring(0, 50) + '...',
          warning: shouldUseStaffAggregation ? 'UNEXPECTED CACHE HIT FOR STAFF AGGREGATION' : 'Normal cache hit'
        });
        
        // Additional validation for staff aggregation
        if (shouldUseStaffAggregation && cachedData.aggregationStrategy !== 'staff-based') {
          console.log(`🚨 [MATRIX ORCHESTRATOR] CRITICAL: Cached data has wrong aggregation strategy!`);
          console.log(`🚨 [MATRIX ORCHESTRATOR] Expected: staff-based, Got: ${cachedData.aggregationStrategy}`);
          console.log(`🚨 [MATRIX ORCHESTRATOR] Clearing cache and regenerating...`);
          
          DemandMatrixCacheService.clearCache();
        } else {
          return { matrixData: cachedData };
        }
      }

      console.log(`💾 [MATRIX ORCHESTRATOR] CACHE MISS - Generating new data (this is expected for staff aggregation)`);

      // Load forecast data and tasks
      const { forecastData, tasks } = await ForecastDataService.loadForecastData(startDate);
      
      if (!forecastData || !tasks) {
        throw new Error('Failed to load forecast data or tasks');
      }

      console.log(`📊 [MATRIX ORCHESTRATOR] Source Data Loaded:`, {
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

      console.log(`🔧 [MATRIX ORCHESTRATOR] Filter Context Created:`, filterContext);

      // Transform to matrix data using conditional aggregation
      console.log(`⚙️ [MATRIX ORCHESTRATOR] Calling MatrixTransformerCore with filter context...`);
      const matrixData = await MatrixTransformerCore.transformToMatrixData(
        forecastData,
        tasks,
        filterContext
      );

      console.log(`✅ [MATRIX ORCHESTRATOR] ========= MATRIX GENERATION COMPLETE =========`);
      console.log(`✅ [MATRIX ORCHESTRATOR] Final Matrix Data:`, {
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
      console.error('❌ [MATRIX ORCHESTRATOR] ERROR in matrix generation:', error);
      
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

      console.log(`🔄 [MATRIX ORCHESTRATOR] Returning fallback matrix`);
      return { matrixData: fallbackMatrix };
    }
  }
}
