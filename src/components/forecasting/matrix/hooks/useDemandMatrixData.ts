
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
 * ENHANCED: Comprehensive verification logging for staff aggregation
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
    
    console.log(`🎯 [VERIFICATION - DEMAND DATA HOOK] Staff aggregation decision:`, {
      activeFilters,
      preferredStaffFilter: activeFilters?.preferredStaff,
      shouldUseStaffAggregation: result,
      hookContext: 'useDemandMatrixData'
    });
    
    return result;
  }, [activeFilters?.preferredStaff]);

  const loadDemandData = useCallback(async (filters?: any) => {
    console.log(`🔄 [VERIFICATION - DEMAND DATA HOOK] ========= LOADING MATRIX DATA =========`);
    console.log(`🔄 [VERIFICATION - DEMAND DATA HOOK] Request details:`, {
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
      
      console.log(`📋 [VERIFICATION - DEMAND DATA HOOK] Final filters to use:`, {
        filtersToUse,
        preferredStaff: filtersToUse?.preferredStaff,
        skills: filtersToUse?.skills,
        clients: filtersToUse?.clients,
        aggregationStrategy: shouldUseStaffAggregation ? 'STAFF-BASED' : 'SKILL-BASED'
      });

      // Call the matrix service with proper parameters
      console.log(`🚀 [VERIFICATION - DEMAND DATA HOOK] Calling DemandMatrixService.generateDemandMatrix...`);
      const result = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        filtersToUse
      );

      console.log(`✅ [VERIFICATION - DEMAND DATA HOOK] ========= MATRIX DATA LOADED =========`);
      console.log(`✅ [VERIFICATION - DEMAND DATA HOOK] Result summary:`, {
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

      // CRITICAL: Log the exact data structure being set
      console.log(`📊 [VERIFICATION - DEMAND DATA HOOK] Setting demandData state with:`, {
        dataPointsCount: result.matrixData.dataPoints.length,
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
      setRetryCount(0);
    } catch (err) {
      console.error('❌ [VERIFICATION - DEMAND DATA HOOK] Error loading matrix data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demand data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, shouldUseStaffAggregation, groupingMode]);

  const handleRetryWithBackoff = useCallback(async () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    console.log(`🔄 [VERIFICATION - DEMAND DATA HOOK] Retrying after ${backoffDelay}ms (attempt ${retryCount + 1})`);
    
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
    setRetryCount(prev => prev + 1);
    await loadDemandData();
  }, [loadDemandData, retryCount]);

  // Load data on mount and when aggregation strategy changes
  useEffect(() => {
    console.log(`🔄 [VERIFICATION - DEMAND DATA HOOK] useEffect triggered - loading data`);
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
