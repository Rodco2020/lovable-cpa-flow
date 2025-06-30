
import { useState, useEffect, useCallback, useMemo } from 'react';
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

/**
 * Hook for managing demand matrix data with conditional aggregation support
 * ENHANCED: Force cache clearing for staff aggregation with comprehensive verification logging
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

  // Determine if staff-based aggregation should be used
  const shouldUseStaffAggregation = useMemo(() => {
    const result = activeFilters?.preferredStaff ? 
      ConditionalAggregationService.shouldUseStaffBasedAggregation(activeFilters.preferredStaff) : 
      false;
    
    console.log(`🎯 [DEMAND DATA HOOK] Staff aggregation decision:`, {
      activeFilters,
      preferredStaffFilter: activeFilters?.preferredStaff,
      shouldUseStaffAggregation: result,
      hookContext: 'useDemandMatrixData'
    });
    
    return result;
  }, [activeFilters?.preferredStaff]);

  const loadDemandData = useCallback(async (filters?: any) => {
    console.log(`🔄 [DEMAND DATA HOOK] ========= LOADING MATRIX DATA =========`);
    console.log(`🔄 [DEMAND DATA HOOK] Request details:`, {
      groupingMode,
      filtersProvided: !!filters,
      activeFiltersFromHook: activeFilters,
      passedFilters: filters,
      shouldUseStaffAggregation
    });
    
    setIsLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      
      // Use the active filters to determine aggregation strategy
      const filtersToUse = filters || activeFilters;
      
      console.log(`📋 [DEMAND DATA HOOK] Final filters to use:`, {
        filtersToUse,
        preferredStaff: filtersToUse?.preferredStaff,
        skills: filtersToUse?.skills,
        clients: filtersToUse?.clients,
        aggregationStrategy: shouldUseStaffAggregation ? 'STAFF-BASED' : 'SKILL-BASED'
      });

      // CRITICAL: Pre-clear cache if using staff aggregation
      if (shouldUseStaffAggregation) {
        console.log(`🚨 [DEMAND DATA HOOK] STAFF AGGREGATION MODE - Force clearing cache before request`);
        DemandMatrixService.forceInvalidateStaffAggregationCache();
        
        // Show cache state for debugging
        const cacheStats = DemandMatrixService.getCacheStats();
        console.log(`📊 [DEMAND DATA HOOK] Cache state after pre-clearing:`, cacheStats);
      }

      // Call the matrix service with proper parameters
      console.log(`🚀 [DEMAND DATA HOOK] Calling DemandMatrixService.generateDemandMatrix...`);
      const result = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        filtersToUse
      );

      console.log(`✅ [DEMAND DATA HOOK] ========= MATRIX DATA LOADED =========`);
      console.log(`✅ [DEMAND DATA HOOK] Result summary:`, {
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

      // CRITICAL VALIDATION: Ensure we got the expected aggregation strategy
      if (shouldUseStaffAggregation && result.matrixData.aggregationStrategy !== 'staff-based') {
        console.error(`🚨 [DEMAND DATA HOOK] CRITICAL ERROR: Expected staff-based aggregation but got ${result.matrixData.aggregationStrategy}`);
        console.error(`🚨 [DEMAND DATA HOOK] This indicates the cache clearing did not work properly!`);
        
        // Force clear cache again and retry once
        console.log(`🔄 [DEMAND DATA HOOK] Attempting cache clear and retry...`);
        DemandMatrixService.clearCache();
        DemandMatrixService.forceInvalidateStaffAggregationCache();
        
        // One retry attempt
        const retryResult = await DemandMatrixService.generateDemandMatrix('demand-only', filtersToUse);
        
        if (retryResult.matrixData.aggregationStrategy !== 'staff-based') {
          throw new Error(`Failed to get staff-based aggregation after cache clearing. Got: ${retryResult.matrixData.aggregationStrategy}`);
        }
        
        console.log(`✅ [DEMAND DATA HOOK] Retry successful, now using staff-based aggregation`);
        setDemandData(retryResult.matrixData);
      } else {
        // CRITICAL: Log the exact data structure being set
        console.log(`📊 [DEMAND DATA HOOK] Setting demandData state with:`, {
          dataPointsCount: result.matrixData.dataPoints.length,
          aggregationStrategy: result.matrixData.aggregationStrategy,
          validationPassed: shouldUseStaffAggregation ? result.matrixData.aggregationStrategy === 'staff-based' : true,
          allDataPoints: result.matrixData.dataPoints.map((dp, index) => ({
            index,
            skillType: dp.skillType,
            month: dp.month,
            demandHours: dp.demandHours,
            taskCount: dp.taskCount,
            isStaffSpecific: dp.isStaffSpecific,
            actualStaffName: dp.actualStaffName,
            underlyingSkillType: dp.underlyingSkillType
          }))
        });

        setDemandData(result.matrixData);
      }
      
      setRetryCount(0);
    } catch (err) {
      console.error('❌ [DEMAND DATA HOOK] Error loading matrix data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demand data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, shouldUseStaffAggregation, groupingMode]);

  const handleRetryWithBackoff = useCallback(async () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    console.log(`🔄 [DEMAND DATA HOOK] Retrying after ${backoffDelay}ms (attempt ${retryCount + 1})`);
    
    // Clear cache before retry
    if (shouldUseStaffAggregation) {
      console.log(`🚨 [DEMAND DATA HOOK] Clearing cache before retry attempt`);
      DemandMatrixService.clearCache();
    }
    
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
    setRetryCount(prev => prev + 1);
    await loadDemandData();
  }, [loadDemandData, retryCount, shouldUseStaffAggregation]);

  // Load data on mount and when aggregation strategy changes
  useEffect(() => {
    console.log(`🔄 [DEMAND DATA HOOK] useEffect triggered - loading data`);
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
