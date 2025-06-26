
import { useEffect } from 'react';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { useToast } from '@/components/ui/use-toast';
import { useDemandMatrixState } from '../DemandMatrixStateProvider';

/**
 * Hook for managing demand matrix data loading and caching
 * 
 * Handles all data fetching, validation, performance optimization,
 * and retry logic with exponential backoff.
 */
export const useDemandMatrixData = (groupingMode: 'skill' | 'client') => {
  const { toast } = useToast();
  const {
    demandData,
    isLoading,
    error,
    retryCount,
    customDateRange,
    setDemandData,
    setIsLoading,
    setError,
    setValidationIssues,
    setRetryCount,
  } = useDemandMatrixState();

  // Load demand matrix data with performance optimization
  const loadDemandData = async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      console.log(`Loading demand data (attempt ${retryCount + 1})`);
      
      const { matrixData: newDemandData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // Validate the data
      const issues = DemandMatrixService.validateDemandMatrixData(newDemandData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Demand matrix validation issues:', issues);
        
        toast({
          title: "Data quality issues detected",
          description: `${issues.length} validation issues found. Functionality may be limited.`,
          variant: "destructive"
        });
      } else {
        const loadTime = performance.now() - startTime;
        console.log(`Demand matrix loaded successfully in ${loadTime.toFixed(2)}ms`);
        
        toast({
          title: "Demand matrix loaded",
          description: `${newDemandData.months.length} months × ${newDemandData.skills.length} ${groupingMode}s loaded`,
        });
      }

      // Apply performance optimization
      const optimizedData = DemandPerformanceOptimizer.optimizeFiltering(newDemandData, {
        skills: [],
        clients: [],
        preferredStaff: [], // Phase 3: Add preferredStaff field
        timeHorizon: customDateRange ? {
          start: customDateRange.start,
          end: customDateRange.end
        } : {
          start: new Date(),
          end: new Date()
        }
      });

      setDemandData(optimizedData);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demand matrix data';
      setError(errorMessage);
      console.error('Error loading demand matrix data:', err);
      
      setRetryCount(retryCount + 1);
      
      toast({
        title: "Error loading demand matrix",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced retry with exponential backoff
  const handleRetryWithBackoff = async () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
    
    if (retryCount > 0) {
      toast({
        title: "Retrying...",
        description: `Waiting ${backoffDelay / 1000}s before retry attempt ${retryCount + 1}`,
      });
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
    
    await loadDemandData();
  };

  // Load data on mount
  useEffect(() => {
    loadDemandData();
  }, []);

  return {
    demandData,
    isLoading,
    error,
    loadDemandData,
    handleRetryWithBackoff
  };
};
