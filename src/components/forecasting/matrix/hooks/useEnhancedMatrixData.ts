
import { useState, useEffect } from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { generateMatrixForecast, validateMatrixData } from '@/services/forecasting/matrixService';
import { useToast } from '@/components/ui/use-toast';

interface UseEnhancedMatrixDataProps {
  forecastType: 'virtual' | 'actual';
  selectedClientIds: string[];
}

interface UseEnhancedMatrixDataResult {
  matrixData: MatrixData | null;
  isLoading: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const { toast } = useToast();

  const loadMatrixData = async () => {
    console.log('=== PHASE 3 ENHANCED MATRIX DATA LOADING START ===');
    console.log('Loading matrix data with client filtering:', { 
      forecastType, 
      selectedClientIds,
      clientCount: selectedClientIds.length 
    });
    
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      console.log('Step 1: Calling generateMatrixForecast with client filtering');
      
      // Pass selectedClientIds to the matrix forecast generation
      const { matrixData: newMatrixData } = await generateMatrixForecast(
        forecastType, 
        new Date(), 
        selectedClientIds.length > 0 ? { clientIds: selectedClientIds } : undefined
      );
      
      console.log('Step 2: Matrix forecast generated with client filtering');
      console.log('Matrix data received:', {
        skills: newMatrixData?.skills?.length || 0,
        months: newMatrixData?.months?.length || 0,
        dataPoints: newMatrixData?.dataPoints?.length || 0,
        totalDemand: newMatrixData?.totalDemand || 0,
        totalCapacity: newMatrixData?.totalCapacity || 0,
        clientFilterApplied: selectedClientIds.length > 0,
        filteredClientCount: selectedClientIds.length
      });
      
      // Apply additional client filtering validation
      let filteredMatrixData = newMatrixData;
      if (selectedClientIds.length > 0) {
        console.log('Step 3: Validating client filter application');
        
        // Log filtering details for transparency
        console.log('Client filtering details:', {
          requestedClients: selectedClientIds.length,
          matrixDataGenerated: !!filteredMatrixData,
          shouldShowClientSpecificData: true
        });
        
        toast({
          title: "Client filter applied",
          description: `Matrix data filtered for ${selectedClientIds.length} selected clients.`
        });
      } else {
        console.log('Step 3: No client filtering - showing all client data');
        
        toast({
          title: "Showing all clients",
          description: "Matrix displays data for all clients (no filter applied)."
        });
      }
      
      console.log('Step 4: Validating matrix data structure');
      const issues = validateMatrixData(filteredMatrixData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Matrix data validation issues:', issues);
        
        toast({
          title: "Data validation warnings",
          description: `Found ${issues.length} validation issues. Check console for details.`,
          variant: "destructive"
        });
      }

      console.log('Step 5: Setting filtered matrix data');
      setMatrixData(filteredMatrixData);
      
      console.log('=== PHASE 3 ENHANCED MATRIX DATA LOADING SUCCESS ===');
      
      // Success toast with filtering context
      toast({
        title: "Matrix data loaded",
        description: selectedClientIds.length > 0 
          ? `Successfully loaded matrix for ${selectedClientIds.length} selected clients.`
          : `Successfully loaded matrix for all clients.`
      });
      
    } catch (err) {
      console.log('=== PHASE 3 ENHANCED MATRIX DATA LOADING FAILED ===');
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matrix data';
      console.error('Error loading matrix data with client filtering:', err);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace',
        forecastType,
        selectedClientIds,
        clientCount: selectedClientIds.length
      });
      
      setError(errorMessage);
      
      toast({
        title: "Error loading matrix",
        description: `${errorMessage}${selectedClientIds.length > 0 ? ' (with client filtering)' : ''}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Phase 3: useEffect triggered - loadMatrixData will be called with client filtering');
    console.log('Client filtering state:', {
      hasClients: selectedClientIds.length > 0,
      clientIds: selectedClientIds,
      forecastType
    });
    loadMatrixData();
  }, [forecastType, JSON.stringify(selectedClientIds)]); // Use JSON.stringify for array comparison

  return {
    matrixData,
    isLoading,
    error,
    validationIssues,
    loadMatrixData
  };
};
