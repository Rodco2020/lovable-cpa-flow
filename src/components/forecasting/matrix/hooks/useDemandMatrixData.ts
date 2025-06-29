
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
 * 
 * UPDATED: Now supports conditional aggregation based on active filters
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
    return activeFilters?.preferredStaff ? 
      ConditionalAggregationService.shouldUseStaffBasedAggregation(activeFilters.preferredStaff) : 
      false;
  }, [activeFilters?.preferredStaff]);

  const loadDemandData = useCallback(async (filters?: any) => {
    console.log(`🔄 [DEMAND DATA] Loading matrix with aggregation strategy detection...`);
    console.log(`🎯 [DEMAND DATA] Active filters:`, {
      preferredStaff: filters?.preferredStaff || activeFilters?.preferredStaff,
      skills: filters?.skills || activeFilters?.skills,
      clients: filters?.clients || activeFilters?.clients,
      shouldUseStaffAggregation
    });
    
    setIsLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      
      // Use the active filters to determine aggregation strategy
      const filtersToUse = filters || activeFilters;
      
      // FIXED: Use correct number of arguments for generateDemandMatrix
      const result = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        startDate,
        filtersToUse
      );

      console.log(`✅ [DEMAND DATA] Matrix loaded with ${result.matrixData.aggregationStrategy} aggregation:`, {
        dataPoints: result.matrixData.dataPoints.length,
        skills: result.matrixData.skills.length,
        totalDemand: result.matrixData.totalDemand,
        aggregationStrategy: result.matrixData.aggregationStrategy
      });

      setDemandData(result.matrixData);
      setRetryCount(0);
    } catch (err) {
      console.error('❌ [DEMAND DATA] Error loading matrix data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demand data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, shouldUseStaffAggregation]);

  const handleRetryWithBackoff = useCallback(async () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    console.log(`🔄 [DEMAND DATA] Retrying after ${backoffDelay}ms (attempt ${retryCount + 1})`);
    
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
    setRetryCount(prev => prev + 1);
    await loadDemandData();
  }, [loadDemandData, retryCount]);

  // Load data on mount and when aggregation strategy changes
  useEffect(() => {
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
