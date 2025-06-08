
import { useState, useEffect, useCallback } from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { generateMatrixForecast, validateMatrixData } from '@/services/forecasting/matrixService';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';

interface UseEnhancedMatrixDataProps {
  forecastType: 'virtual' | 'actual';
  selectedClientIds: string[];
  /**
   * Total number of available clients.
   *
   * Undefined indicates the client list has not loaded yet.
   */
  totalClientCount?: number;
  clientsLoading?: boolean;
  clientsError?: string | null;
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
  selectedClientIds,
  totalClientCount,
  clientsLoading = false,
  clientsError = null
}: UseEnhancedMatrixDataProps): UseEnhancedMatrixDataResult => {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const { toast } = useToast();

  const loadMatrixData = useCallback(async (showRefreshIndicator = false) => {
    console.log('=== PHASE 4 ENHANCED MATRIX DATA LOADING START ===');
    
    // CRITICAL FIX: Detect when all clients are selected
    const isAllClientsSelected =
      typeof totalClientCount === 'number' &&
      totalClientCount > 0 &&
      selectedClientIds.length === totalClientCount;
    const clientFilterForAPI = isAllClientsSelected ? undefined : selectedClientIds;
    
    console.log('Loading matrix data with enhanced UX and CLIENT FILTERING FIX:', { 
      forecastType, 
      selectedClientIds: selectedClientIds.length,
      totalClientCount,
      isAllClientsSelected,
      clientFilterForAPI: clientFilterForAPI ? `${clientFilterForAPI.length} clients` : 'undefined (all clients)',
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
      console.log('Phase 4: Generating matrix forecast with CLIENT FILTERING LOGIC FIX');
      console.log('Client filtering decision:', {
        selectedCount: selectedClientIds.length,
        totalCount: totalClientCount,
        isAllSelected: isAllClientsSelected,
        passToAPI: clientFilterForAPI ? 'specific clients' : 'undefined (all clients)'
      });
      
      const { matrixData: newMatrixData } = await generateMatrixForecast(
        forecastType, 
        new Date(), 
        clientFilterForAPI ? { clientIds: clientFilterForAPI } : undefined // KEY FIX: Pass undefined when all selected
      );
      
      console.log('Phase 4: Matrix data received with CLIENT FILTERING FIX:', {
        skills: newMatrixData?.skills?.length || 0,
        months: newMatrixData?.months?.length || 0,
        dataPoints: newMatrixData?.dataPoints?.length || 0,
        totalDemand: newMatrixData?.totalDemand || 0,
        totalCapacity: newMatrixData?.totalCapacity || 0,
        clientFilteringApplied: !isAllClientsSelected,
        effectiveClientFilter: isAllClientsSelected ? 'all clients (no filter)' : `${selectedClientIds.length} specific clients`
      });
      
      // Enhanced client filtering feedback with better logic
      if (isAllClientsSelected) {
        console.log('Phase 4: All clients selected - showing "all clients" feedback');
        
        toast({
          title: "Matrix updated",
          description: `Showing data for all ${totalClientCount} clients.`,
          duration: 3000
        });
      } else if (selectedClientIds.length > 0) {
        console.log('Phase 4: Specific clients selected - showing filtered feedback');
        
        toast({
          title: "Matrix filtered",
          description: `Showing data for ${selectedClientIds.length} of ${totalClientCount} clients.`,
          duration: 3000
        });
      } else {
        console.log('Phase 4: No clients selected - showing empty state feedback');
        
        toast({
          title: "No clients selected",
          description: "Select clients to view matrix data.",
          variant: "destructive",
          duration: 5000
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
  }, [forecastType, selectedClientIds, totalClientCount, toast]);

  // Debounced version for rapid client selection changes
  const debouncedLoadMatrixData = useCallback(
    debounce(() => {
      console.log('Phase 4: Debounced matrix data reload triggered');
      loadMatrixData(true); // Show refresh indicator for debounced updates
    }, 800), // 800ms debounce for better UX
    [loadMatrixData]
  );

  useEffect(() => {
    if (clientsError) {
      console.log('Phase 4: Client data error detected - loading matrix without client filter');
      if (matrixData === null) {
        loadMatrixData();
      } else {
        debouncedLoadMatrixData();
      }
      return;
    }

    if (typeof totalClientCount !== 'number') {
      if (!clientsLoading) {
        console.log('Phase 4: Client data unavailable - loading matrix without filter');
        if (matrixData === null) {
          loadMatrixData();
        } else {
          debouncedLoadMatrixData();
        }
      }
      return;
    }

    console.log('Phase 4: useEffect triggered - client selection changed');
    console.log('Client filtering state with TOTAL COUNT:', {
      hasClients: selectedClientIds.length > 0,
      selectedCount: selectedClientIds.length,
      totalCount: totalClientCount,
      isAllSelected:
        totalClientCount > 0 && selectedClientIds.length === totalClientCount,
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
  }, [forecastType, JSON.stringify(selectedClientIds), totalClientCount, clientsLoading, clientsError]);

  // Manual refresh function that always shows loading and returns Promise<void>
  const manualRefresh = useCallback(async () => {
    console.log('Phase 4: Manual refresh triggered');
    await loadMatrixData();
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
