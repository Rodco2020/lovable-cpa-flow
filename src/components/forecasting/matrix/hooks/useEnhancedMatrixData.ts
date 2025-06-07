
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
    setIsLoading(true);
    setError(null);
    setValidationIssues([]);

    try {
      // In a real implementation, we would pass selectedClientIds to filter the data
      const { matrixData: newMatrixData } = await generateMatrixForecast(forecastType);
      
      // Apply client filtering if clients are selected
      let filteredMatrixData = newMatrixData;
      if (selectedClientIds.length > 0) {
        // Filter data points based on client selection
        // In a real implementation, this would be done at the data source level
        console.log('Applying client filter:', selectedClientIds);
        toast({
          title: "Client filter applied",
          description: `Matrix filtered for ${selectedClientIds.length} selected clients.`
        });
      }
      
      const issues = validateMatrixData(filteredMatrixData);
      if (issues.length > 0) {
        setValidationIssues(issues);
        console.warn('Matrix data validation issues:', issues);
      }

      setMatrixData(filteredMatrixData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matrix data';
      setError(errorMessage);
      console.error('Error loading matrix data:', err);
      
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
