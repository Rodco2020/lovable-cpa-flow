
import { useState, useEffect, useCallback } from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { generateMatrixForecast, validateMatrixData } from '@/services/forecasting/matrixService';
import { useToast } from '@/components/ui/use-toast';
import { debounce } from 'lodash';

interface UseEnhancedMatrixDataProps {
  forecastType: 'virtual' | 'actual';
  selectedClientIds: string[];
}

interface UseEnhancedMatrixDataResult {
  matrixData: MatrixData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  validationIssues: string[];
  loadMatrixData: () => Promise<void>;
}

export const useEnhancedMatrixData = ({
  forecastType,
  selectedClientIds
}: UseEnhancedMatrixDataProps): UseEnhancedMatrixDataResult => {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const { toast } = useToast();

  const loadMatrixData = useCallback(async (showRefreshIndicator = false) => {
    console.log('=== PHASE 4 ENHANCED MATRIX DATA LOADING START ===');
    console.log('Loading matrix data with enhanced UX:', { 
      forecastType, 
      selectedClientIds,
      clientCount: selectedClientIds.length,
      showRefreshIndicator
    });
    
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setValidationIssues([]);

    try {
      console.log('Phase 4: Generating matrix forecast with client filtering');
      
      const { matrixData: newMatrixData } = await generateMatrixForecast(
        forecastType, 
        new Date(), 
        selectedClientIds.length > 0 ? { clientIds: selectedClientIds } : undefined
      );
      
      console.log('Phase 4: Matrix data received:', {
        skills: newMatrixData?.skills?.length || 0,
        months: newMatrixData?.months?.length || 0,
        dataPoints: newMatrixData?.dataPoints?.length || 0,
        totalDemand: newMatrixData?.totalDemand || 0,
        totalCapacity: newMatrixData?.totalCapacity || 0,
        clientFilterApplied: selectedClientIds.length > 0,
        filteredClientCount: selectedClientIds.length
      });
      
      // Enhanced client filtering feedback
      if (selectedClientIds.length > 0) {
        console.log('Phase 4: Client filter applied - showing success toast');
        
        toast({
          title: "Matrix updated",
          description: `Showing data for ${selectedClientIds.length} selected client${selectedClientIds.length === 1 ? '' : 's'}.`,
          duration: 3000
        });
      } else {
        console.log('Phase 4: All clients selected - showing info toast');
        
        toast({
          title: "All clients included",
          description: "Matrix displays data for all active clients.",
          duration: 3000
        });
      }
      
      console.log('Phase 4: Validating matrix data structure');
      const issues = validateMatrixData(newMatrixData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Phase 4: Matrix data validation issues:', issues);
        
        toast({
          title: "Data validation warnings",
          description: `Found ${issues.length} validation issue${issues.length === 1 ? '' : 's'}. Check console for details.`,
          variant: "destructive",
          duration: 5000
        });
      }

      setMatrixData(newMatrixData);
      
      console.log('=== PHASE 4 ENHANCED MATRIX DATA LOADING SUCCESS ===');
      
    } catch (err) {
      console.log('=== PHASE 4 ENHANCED MATRIX DATA LOADING FAILED ===');
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matrix data';
      console.error('Phase 4: Error loading matrix data:', err);
      
      setError(errorMessage);
      
      toast({
        title: "Error loading matrix",
        description: `${errorMessage}. Please try again.`,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [forecastType, selectedClientIds, toast]);

  // Debounced version for rapid client selection changes
  const debouncedLoadMatrixData = useCallback(
    debounce(() => {
      console.log('Phase 4: Debounced matrix data reload triggered');
      loadMatrixData(true); // Show refresh indicator for debounced updates
    }, 800), // 800ms debounce for better UX
    [loadMatrixData]
  );

  useEffect(() => {
    console.log('Phase 4: useEffect triggered - client selection changed');
    console.log('Client filtering state:', {
      hasClients: selectedClientIds.length > 0,
      clientIds: selectedClientIds,
      forecastType
    });

    // Initial load should show loading state
    if (matrixData === null) {
      loadMatrixData();
    } else {
      // Subsequent updates use debounced refresh
      debouncedLoadMatrixData();
    }

    // Cleanup debounce on unmount
    return () => {
      debouncedLoadMatrixData.cancel();
    };
  }, [forecastType, JSON.stringify(selectedClientIds)]); // Use JSON.stringify for array comparison

  // Manual refresh function that always shows loading
  const manualRefresh = useCallback(() => {
    console.log('Phase 4: Manual refresh triggered');
    loadMatrixData();
  }, [loadMatrixData]);

  return {
    matrixData,
    isLoading,
    isRefreshing,
    error,
    validationIssues,
    loadMatrixData: manualRefresh
  };
};
