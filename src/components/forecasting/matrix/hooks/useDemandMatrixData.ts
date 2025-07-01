
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { ConditionalAggregationService } from '@/services/forecasting/demand/matrixTransformer/conditionalAggregationService';

interface UseDemandMatrixDataResult {
  demandData: DemandMatrixData | null;
  isLoading: boolean;
  error: string | null;
  loadDemandData: (activeFilters?: any) => Promise<void>;
  handleRetryWithBackoff: () => Promise<void>;
}

// Circuit breaker for cache invalidation
let lastCacheInvalidation = 0;
const CACHE_INVALIDATION_COOLDOWN = 1000; // 1 second

function safeInvalidateCache() {
  const now = Date.now();
  if (now - lastCacheInvalidation < CACHE_INVALIDATION_COOLDOWN) {
    console.log('⚡ [CIRCUIT BREAKER] Cache invalidation blocked - too frequent');
    return false;
  }
  lastCacheInvalidation = now;
  console.log('🚨 [CIRCUIT BREAKER] Cache invalidation allowed');
  DemandMatrixService.forceInvalidateStaffAggregationCache();
  return true;
}

/**
 * FIXED: Hook for managing demand matrix data with stabilized dependencies
 * Eliminates infinite re-render loop through proper dependency management
 */
export const useDemandMatrixData = (
  groupingMode: 'skill' | 'client',
  activeFilters?: {
    preferredStaff?: (string | number | null | undefined)[];
    skills?: string[];
    clients?: string[];
  }
): UseDemandMatrixDataResult => {
  const [demandData, setDemandData] = useState<DemandMatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Track previous aggregation strategy to avoid unnecessary cache clears
  const prevAggregationStrategy = useRef<boolean>();

  // FIXED: Stabilize activeFilters using JSON serialization to prevent infinite loops
  const stableFiltersKey = useMemo(() => {
    if (!activeFilters) return 'no-filters';
    
    return JSON.stringify({
      preferredStaff: (activeFilters.preferredStaff || []).filter(Boolean).sort(),
      skills: (activeFilters.skills || []).sort(),
      clients: (activeFilters.clients || []).sort()
    });
  }, [activeFilters]);

  // FIXED: Determine staff aggregation strategy with stable dependency
  const shouldUseStaffAggregation = useMemo(() => {
    const preferredStaffFilter = activeFilters?.preferredStaff?.filter(Boolean) || [];
    const result = preferredStaffFilter.length > 0 ? 
      ConditionalAggregationService.shouldUseStaffBasedAggregation(preferredStaffFilter) : 
      false;
    
    console.log(`🎯 [FIXED HOOK] Staff aggregation decision:`, {
      preferredStaffFilter,
      shouldUseStaffAggregation: result,
      filterCount: preferredStaffFilter.length
    });
    
    return result;
  }, [stableFiltersKey]);

  // FIXED: Only invalidate cache when aggregation strategy actually changes
  useEffect(() => {
    if (prevAggregationStrategy.current !== shouldUseStaffAggregation) {
      console.log(`🔄 [AGGREGATION CHANGE] Strategy changed from ${prevAggregationStrategy.current} to ${shouldUseStaffAggregation}`);
      
      if (shouldUseStaffAggregation) {
        const invalidated = safeInvalidateCache();
        console.log(`🚨 [AGGREGATION CHANGE] Cache invalidation ${invalidated ? 'executed' : 'blocked'}`);
      }
      
      prevAggregationStrategy.current = shouldUseStaffAggregation;
    }
  }, [shouldUseStaffAggregation]);

  // FIXED: Stable loadDemandData function with proper dependencies
  const loadDemandData = useCallback(async (filters?: any) => {
    console.log(`🔄 [FIXED HOOK] ========= LOADING MATRIX DATA =========`);
    console.log(`🔄 [FIXED HOOK] Request details:`, {
      groupingMode,
      filtersProvided: !!filters,
      activeFilters,
      shouldUseStaffAggregation,
      stableFiltersKey
    });
    
    setIsLoading(true);
    setError(null);

    try {
      // Use filters parameter if provided, otherwise use activeFilters
      const filtersToUse = filters || activeFilters;
      
      console.log(`📋 [FIXED HOOK] Final filters to use:`, {
        filtersToUse,
        aggregationStrategy: shouldUseStaffAggregation ? 'STAFF-BASED' : 'SKILL-BASED'
      });

      // Call the matrix service
      console.log(`🚀 [FIXED HOOK] Calling DemandMatrixService.generateDemandMatrix...`);
      const result = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        filtersToUse
      );

      console.log(`✅ [FIXED HOOK] ========= MATRIX DATA LOADED =========`);
      console.log(`✅ [FIXED HOOK] Result summary:`, {
        aggregationStrategy: result.matrixData.aggregationStrategy,
        dataPoints: result.matrixData.dataPoints.length,
        skills: result.matrixData.skills.length,
        totalDemand: result.matrixData.totalDemand,
        totalTasks: result.matrixData.totalTasks,
        months: result.matrixData.months.length
      });

      // Enhanced logging for skills and clients extraction
      const uniqueSkills = result.matrixData.skills || [];
      const uniqueClients = new Set<string>();
      
      result.matrixData.dataPoints.forEach(point => {
        point.taskBreakdown?.forEach(task => {
          if (task.clientName && task.clientName.trim() !== '') {
            uniqueClients.add(`${task.clientId}:${task.clientName}`);
          }
        });
      });

      console.log(`📊 [FIXED HOOK] Extracted filter data:`, {
        skillsCount: uniqueSkills.length,
        skillsList: uniqueSkills,
        clientsCount: uniqueClients.size,
        clientsSample: Array.from(uniqueClients).slice(0, 5)
      });

      setDemandData(result.matrixData);
      setRetryCount(0);
    } catch (err) {
      console.error('❌ [FIXED HOOK] Error loading matrix data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demand data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [groupingMode, stableFiltersKey, shouldUseStaffAggregation]);

  const handleRetryWithBackoff = useCallback(async () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    console.log(`🔄 [FIXED HOOK] Retrying after ${backoffDelay}ms (attempt ${retryCount + 1})`);
    
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
    setRetryCount(prev => prev + 1);
    await loadDemandData();
  }, [loadDemandData, retryCount]);

  // FIXED: Load data with stable dependencies
  useEffect(() => {
    console.log(`🔄 [FIXED HOOK] useEffect triggered - loading data`);
    loadDemandData();
  }, [loadDemandData]);

  return {
    demandData,
    isLoading,
    error,
    loadDemandData,
    handleRetryWithBackoff
  };
};
