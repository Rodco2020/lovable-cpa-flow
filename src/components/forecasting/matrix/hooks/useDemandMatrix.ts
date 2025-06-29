
import { useState, useEffect } from 'react';
import { DemandMatrixData } from '@/types/demand';

export interface UseDemandMatrixResult {
  matrixData: DemandMatrixData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDemandMatrix = (): UseDemandMatrixResult => {
  const [matrixData, setMatrixData] = useState<DemandMatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data for now
      const mockData: DemandMatrixData = {
        months: [
          { key: '2024-01', label: 'Jan 2024' },
          { key: '2024-02', label: 'Feb 2024' }
        ],
        skills: ['Tax Preparation', 'Bookkeeping', 'Senior'],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {},
        clientTotals: new Map(),
        aggregationStrategy: 'skill-based'
      };
      
      setMatrixData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matrix data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    matrixData,
    isLoading,
    error,
    refetch: fetchData
  };
};
