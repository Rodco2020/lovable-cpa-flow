import { useMemo } from 'react';
import { useDemandMatrixData } from '../../hooks/useDemandMatrixData';
import { useDemandMatrixControls } from '../../hooks/useDemandMatrixControls';

interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
}

interface UseDetailMatrixDataResult {
  data: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  activeFilters: {
    preferredStaff: (string | number | null | undefined)[];
    skills: string[];
    clients: string[];
  };
  demandMatrixControls: ReturnType<typeof useDemandMatrixControls>;
  months: Array<{ key: string; label: string }>; // ADD THIS - months array for filtering
}

interface UseDetailMatrixDataProps {
  groupingMode: 'skill' | 'client';
}

/**
 * Detail Matrix Data Hook - Step 1
 * 
 * Handles all data fetching and transformation logic for Detail Matrix.
 * Maintains exact same data structure and behavior as original container.
 */
export const useDetailMatrixData = ({
  groupingMode
}: UseDetailMatrixDataProps): UseDetailMatrixDataResult => {
  
  // Use existing demand matrix controls hook
  const demandMatrixControls = useDemandMatrixControls({
    demandData: null, // Will be populated after data loading
    groupingMode
  });

  // Create stable active filters
  const activeFilters = useMemo(() => ({
    preferredStaff: demandMatrixControls.selectedPreferredStaff,
    skills: demandMatrixControls.selectedSkills,
    clients: demandMatrixControls.selectedClients
  }), [
    JSON.stringify(demandMatrixControls.selectedPreferredStaff),
    JSON.stringify(demandMatrixControls.selectedSkills),
    JSON.stringify(demandMatrixControls.selectedClients)
  ]);

  // Use existing data loading hook
  const { demandData, isLoading, error, loadDemandData } = useDemandMatrixData(
    groupingMode, 
    activeFilters
  );

  // Transform demand data to task-level data
  const taskLevelData = useMemo(() => {
    if (!demandData?.dataPoints) return [];

    console.log('📊 [DETAIL MATRIX] Data loaded:', {
      totalDataPoints: demandData.dataPoints.length,
      availableMonths: demandData?.months?.map(m => m.label),
      monthRange: demandMatrixControls.monthRange,
      sampleDataPoint: demandData.dataPoints[0]
    });

    const tasks: Task[] = [];
    
    // Extract individual tasks from the demand data points
    demandData.dataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach(task => {
          tasks.push({
            id: `${task.taskName}-${task.clientName}-${point.month}`,
            taskName: task.taskName,
            clientName: task.clientName,
            clientId: task.clientId,
            skillRequired: point.skillType,
            monthlyHours: task.monthlyHours,
            month: point.month,
            monthLabel: demandData.months.find(m => m.key === point.month)?.label || point.month,
            recurrencePattern: typeof task.recurrencePattern === 'string' 
              ? task.recurrencePattern 
              : task.recurrencePattern?.type || 'Monthly',
            priority: 'Medium', // Default value since not available in data
            category: 'General' // Default value since not available in data
          });
        });
      }
    });

    console.log('📊 [DETAIL MATRIX] Data transformation complete:', {
      totalRecurringTasks: demandData.dataPoints.length,
      totalDetailTasks: tasks.length,
      sampleTask: tasks[0],
      monthRange: demandMatrixControls.monthRange
    });

    return tasks;
  }, [demandData, demandMatrixControls.monthRange]);

  return {
    data: taskLevelData,
    loading: isLoading,
    error,
    refetch: loadDemandData,
    activeFilters,
    demandMatrixControls,
    months: demandData?.months || [] // Pass months array for proper filtering
  };
};