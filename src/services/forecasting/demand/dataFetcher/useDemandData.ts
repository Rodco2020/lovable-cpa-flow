
import { useState, useEffect } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { DataFetcher } from './dataFetcher';
import { DemandCalculationService } from '../calculators/DemandCalculationService';

export const useDemandData = () => {
  const [demandData, setDemandData] = useState<DemandMatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDemandData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch recurring tasks data
        const tasks = await DataFetcher.fetchClientAssignedTasks();
        
        if (!tasks || tasks.length === 0) {
          console.warn('No tasks found for demand calculation');
          setDemandData({
            months: [],
            skills: [],
            dataPoints: [],
            totalDemand: 0,
            totalTasks: 0,
            totalClients: 0,
            skillSummary: [] // FIXED: Initialize as empty array instead of object
          });
          return;
        }

        // Calculate demand matrix data
        const calculatedData = await DemandCalculationService.calculateDemandMatrix(tasks);
        setDemandData(calculatedData);

      } catch (err) {
        console.error('Error loading demand data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load demand data');
        
        // Set default empty data structure
        setDemandData({
          months: [],
          skills: [],
          dataPoints: [],
          totalDemand: 0,
          totalTasks: 0,
          totalClients: 0,
          skillSummary: [] // FIXED: Initialize as empty array
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDemandData();
  }, []);

  return {
    demandData,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      // Re-trigger the effect by updating a dependency
    }
  };
};
