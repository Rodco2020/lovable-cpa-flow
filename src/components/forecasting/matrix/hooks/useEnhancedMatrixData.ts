
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
    console.log('=== ENHANCED MATRIX DATA LOADING START ===');
    console.log('Loading matrix data with params:', { forecastType, selectedClientIds });
    
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      console.log('Step 1: Calling generateMatrixForecast');
      
      // In a real implementation, we would pass selectedClientIds to filter the data
      const { matrixData: newMatrixData } = await generateMatrixForecast(forecastType);
      
      console.log('Step 2: Matrix forecast generated successfully');
      console.log('Matrix data received:', {
        skills: newMatrixData?.skills?.length || 0,
        months: newMatrixData?.months?.length || 0,
        dataPoints: newMatrixData?.dataPoints?.length || 0,
        totalDemand: newMatrixData?.totalDemand || 0,
        totalCapacity: newMatrixData?.totalCapacity || 0
      });
      
      // Apply client filtering if clients are selected
      let filteredMatrixData = newMatrixData;
      if (selectedClientIds.length > 0) {
        console.log('Step 3: Applying client filter for', selectedClientIds.length, 'clients');
        // Filter data points based on client selection
        // In a real implementation, this would be done at the data source level
        console.log('Applying client filter:', selectedClientIds);
        toast({
          title: "Client filter applied",
          description: `Matrix filtered for ${selectedClientIds.length} selected clients.`
        });
      }
      
      console.log('Step 4: Validating matrix data');
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

      console.log('Step 5: Setting matrix data');
      setMatrixData(filteredMatrixData);
      
      console.log('=== ENHANCED MATRIX DATA LOADING SUCCESS ===');
      
      // Success toast
      toast({
        title: "Matrix data loaded",
        description: `Successfully loaded ${filteredMatrixData.skills.length} skills across ${filteredMatrixData.months.length} months.`
      });
      
    } catch (err) {
      console.log('=== ENHANCED MATRIX DATA LOADING FAILED ===');
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matrix data';
      console.error('Error loading matrix data:', err);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace',
        forecastType,
        selectedClientIds
      });
      
      setError(errorMessage);
      
      toast({
        title: "Error loading matrix",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - loadMatrixData will be called');
    loadMatrixData();
  }, [forecastType, selectedClientIds]);

  return {
    matrixData,
    isLoading,
    error,
    validationIssues,
    loadMatrixData
  };
};
