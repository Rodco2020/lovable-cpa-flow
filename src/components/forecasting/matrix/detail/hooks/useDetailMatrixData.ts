import { useMemo } from 'react';
import { useDemandMatrixData } from '../../hooks/useDemandMatrixData';
import { useDemandMatrixControls } from '../../hooks/useDemandMatrixControls';
import { useMatrixFiltering } from '../../hooks/useMatrixFiltering';

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
  
  // Step 1: Load data with empty filters
  const { demandData, isLoading, error, loadDemandData } = useDemandMatrixData(
    groupingMode, 
    {} // Empty filters initially
  );
  
  // Step 2: Call controls hook at TOP LEVEL (not in useEffect!)
  // This follows the exact pattern from DemandMatrixContainer
  const demandMatrixControls = useDemandMatrixControls({
    demandData: demandData || null, // Start with null, update when data loads
    groupingMode
  });
  
  // Step 3: Extract filter options from loaded data (like Demand Matrix does)
  const matrixFiltering = useMatrixFiltering({
    demandData,
    selectedSkills: demandMatrixControls?.selectedSkills || [],
    selectedClients: demandMatrixControls?.selectedClients || [],
    selectedPreferredStaff: demandMatrixControls?.selectedPreferredStaff || [],
    monthRange: demandMatrixControls?.monthRange || { start: 0, end: 11 },
    groupingMode
  });
  
  // Step 4: Create enhanced controls with extracted filter options
  const enhancedDemandMatrixControls = demandMatrixControls ? {
    ...demandMatrixControls,
    // Override with actual extracted data (CRITICAL FIX)
    availableSkills: matrixFiltering.availableSkills,
    availableClients: matrixFiltering.availableClients,
    availablePreferredStaff: matrixFiltering.availablePreferredStaff,
  } : null;
  
  // Create stable active filters from the enhanced controls
  const activeFilters = useMemo(() => ({
    preferredStaff: enhancedDemandMatrixControls?.selectedPreferredStaff || [],
    skills: enhancedDemandMatrixControls?.selectedSkills || [],
    clients: enhancedDemandMatrixControls?.selectedClients || []
  }), [
    JSON.stringify(enhancedDemandMatrixControls?.selectedPreferredStaff),
    JSON.stringify(enhancedDemandMatrixControls?.selectedSkills),
    JSON.stringify(enhancedDemandMatrixControls?.selectedClients)
  ]);

  // Transform demand data to task-level data
  const taskLevelData = useMemo(() => {
    if (!demandData?.dataPoints) return [];

    console.log('📊 [DETAIL MATRIX] Data loaded:', {
      totalDataPoints: demandData.dataPoints.length,
      availableMonths: demandData?.months?.map(m => m.label),
      monthRange: enhancedDemandMatrixControls?.monthRange,
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
      monthRange: enhancedDemandMatrixControls?.monthRange
    });

    return tasks;
  }, [demandData, enhancedDemandMatrixControls?.monthRange]);

  // Add diagnostic logging
  console.log('📊 [DETAIL MATRIX] Data flow status:', {
    hasData: !!demandData,
    hasControls: !!demandMatrixControls,
    availableSkillsCount: matrixFiltering.availableSkills.length,
    availableClientsCount: matrixFiltering.availableClients.length
  });

  return {
    data: taskLevelData,
    loading: isLoading,
    error,
    refetch: loadDemandData,
    activeFilters,
    demandMatrixControls: enhancedDemandMatrixControls,
    months: demandData?.months || [] // Pass months array for proper filtering
  };
};