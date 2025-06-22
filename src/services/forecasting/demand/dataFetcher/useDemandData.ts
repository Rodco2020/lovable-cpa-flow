
import { useState, useEffect } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { DataFetcher } from './dataFetcher';
import { DemandCalculationService } from '../calculators/DemandCalculationService';

interface UseDemandDataProps {
  monthRange?: { start: number; end: number };
  selectedSkills?: SkillType[];
}

export const useDemandData = (props: UseDemandDataProps = {}) => {
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
            skillSummary: []
          });
          return;
        }

        // Calculate demand matrix data
        const calculatedData = await DemandCalculationService.calculateDemandMatrix(tasks);
        setDemandData(calculatedData);

      } catch (err) {
        console.error('Error loading demand data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load demand data';
        setError(errorMessage);
        
        // Set default empty data structure
        setDemandData({
          months: [],
          skills: [],
          dataPoints: [],
          totalDemand: 0,
          totalTasks: 0,
          totalClients: 0,
          skillSummary: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDemandData();
  }, [props.monthRange, props.selectedSkills]);

  const refetch = () => {
    setIsLoading(true);
    // Re-trigger the effect
  };

  return {
    data: demandData,
    demandData,
    isLoading,
    error,
    refetch
  };
};
