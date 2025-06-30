
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
 * Hook for managing demand matrix data with stabilized dependencies and circuit breaker
 * FIXED: Eliminates infinite re-render loop through dependency stabilization
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

  // STABILIZED: Memoize activeFilters to prevent object recreation on every render
  const stableActiveFilters = useMemo(() => {
    if (!activeFilters) return undefined;
    
    return {
      preferredStaff: activeFilters.preferredStaff,
      skills: activeFilters.skills,  
      clients: activeFilters.clients
    };
  }, [
    JSON.stringify(activeFilters?.preferredStaff || []),
    JSON.stringify(activeFilters?.skills || []),
    JSON.stringify(activeFilters?.clients || [])
  ]);

  // STABILIZED: Determine if staff-based aggregation should be used with stable dependency
  const shouldUseStaffAggregation = useMemo(() => {
    const result = stableActiveFilters?.preferredStaff ? 
      ConditionalAggregationService.shouldUseStaffBasedAggregation(stableActiveFilters.preferredStaff) : 
      false;
    
    console.log(`🎯 [STABLE HOOK] Staff aggregation decision:`, {
      stableActiveFilters,
      preferredStaffFilter: stableActiveFilters?.preferredStaff,
      shouldUseStaffAggregation: result,
      hookContext: 'useDemandMatrixData-STABILIZED'
    });
    
    return result;
  }, [stableActiveFilters?.preferredStaff]);

  // CIRCUIT BREAKER: Only invalidate cache when aggregation strategy actually changes
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

  // STABILIZED: loadDemandData with stable dependencies using useCallback
  const loadDemandData = useCallback(async (filters?: any) => {
    console.log(`🔄 [STABLE HOOK] ========= LOADING MATRIX DATA =========`);
    console.log(`🔄 [STABLE HOOK] Request details:`, {
      groupingMode,
      filtersProvided: !!filters,
      stableActiveFilters,
      passedFilters: filters,
      shouldUseStaffAggregation
    });
    
    setIsLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      
      // Use the stable filters to determine aggregation strategy
      const filtersToUse = filters || stableActiveFilters;
      
      console.log(`📋 [STABLE HOOK] Final filters to use:`, {
        filtersToUse,
        preferredStaff: filtersToUse?.preferredStaff,
        skills: filtersToUse?.skills,
        clients: filtersToUse?.clients,
        aggregationStrategy: shouldUseStaffAggregation ? 'STAFF-BASED' : 'SKILL-BASED'
      });

      // Call the matrix service with proper parameters
      console.log(`🚀 [STABLE HOOK] Calling DemandMatrixService.generateDemandMatrix...`);
      const result = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        filtersToUse
      );

      console.log(`✅ [STABLE HOOK] ========= MATRIX DATA LOADED =========`);
      console.log(`✅ [STABLE HOOK] Result summary:`, {
        aggregationStrategy: result.matrixData.aggregationStrategy,
        dataPoints: result.matrixData.dataPoints.length,
        skills: result.matrixData.skills.length,
        totalDemand: result.matrixData.totalDemand,
        totalTasks: result.matrixData.totalTasks,
        skillTypes: result.matrixData.skills,
        sampleDataPoints: result.matrixData.dataPoints.slice(0, 3).map(dp => ({
          skillType: dp.skillType,
          demandHours: dp.demandHours,
          taskCount: dp.taskCount,
          isStaffSpecific: dp.isStaffSpecific,
          actualStaffName: dp.actualStaffName,
          underlyingSkillType: dp.underlyingSkillType
        }))
      });

      // VALIDATION: Ensure we got the expected aggregation strategy
      if (shouldUseStaffAggregation && result.matrixData.aggregationStrategy !== 'staff-based') {
        console.error(`🚨 [STABLE HOOK] CRITICAL ERROR: Expected staff-based aggregation but got ${result.matrixData.aggregationStrategy}`);
        
        // One retry attempt with circuit breaker protection
        console.log(`🔄 [STABLE HOOK] Attempting controlled cache clear and retry...`);
        const retryInvalidated = safeInvalidateCache();
        
        if (retryInvalidated) {
          const retryResult = await DemandMatrixService.generateDemandMatrix('demand-only', filtersToUse);
          
          if (retryResult.matrixData.aggregationStrategy !== 'staff-based') {
            throw new Error(`Failed to get staff-based aggregation after controlled cache clearing. Got: ${retryResult.matrixData.aggregationStrategy}`);
          }
          
          console.log(`✅ [STABLE HOOK] Retry successful, now using staff-based aggregation`);
          setDemandData(retryResult.matrixData);
        } else {
          console.warn(`⚠️ [STABLE HOOK] Retry blocked by circuit breaker, using available data`);
          setDemandData(result.matrixData);
        }
      } else {
        console.log(`📊 [STABLE HOOK] Setting demandData state with validated aggregation strategy`);
        setDemandData(result.matrixData);
      }
      
      setRetryCount(0);
    } catch (err) {
      console.error('❌ [STABLE HOOK] Error loading matrix data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demand data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    groupingMode,
    JSON.stringify(stableActiveFilters), // Stable serialization
    shouldUseStaffAggregation
  ]);

  const handleRetryWithBackoff = useCallback(async () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    console.log(`🔄 [STABLE HOOK] Retrying after ${backoffDelay}ms (attempt ${retryCount + 1})`);
    
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
    setRetryCount(prev => prev + 1);
    await loadDemandData();
  }, [loadDemandData, retryCount]);

  // STABILIZED: Load data on mount and when stable dependencies change
  useEffect(() => {
    console.log(`🔄 [STABLE HOOK] useEffect triggered - loading data with stable dependencies`);
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
