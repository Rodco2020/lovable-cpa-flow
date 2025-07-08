import { useMemo } from 'react';
import { useDemandMatrixData } from '../../hooks/useDemandMatrixData';
import { useDemandMatrixControls } from '../../hooks/useDemandMatrixControls';
import { useMatrixFiltering } from '../../hooks/useMatrixFiltering';

// Safe default controls object for error states
const defaultDemandMatrixControls = {
  // State properties
  selectedSkills: [],
  selectedClients: [],
  monthRange: { start: 0, end: 11 },
  selectedPreferredStaff: [],
  
  // Handler methods (all safe no-ops)
  handleSkillToggle: (skill: string) => {
    console.warn('Controls in error state - skill toggle ignored');
  },
  handleClientToggle: (clientId: string) => {
    console.warn('Controls in error state - client toggle ignored');
  },
  handleMonthRangeChange: (monthRange: { start: number; end: number }) => {
    console.warn('Controls in error state - month range change ignored');
  },
  handleReset: () => {
    console.warn('Controls in error state - reset ignored');
  },
  handleExport: () => {
    console.warn('Controls in error state - export ignored');
  },
  handlePreferredStaffToggle: (staffId: string) => {
    console.warn('Controls in error state - staff toggle ignored');
  },
  
  // Data arrays (empty but valid)
  availableSkills: [],
  availableClients: [],
  availablePreferredStaff: [],
  
  // Loading states (false in error state)
  skillsLoading: false,
  clientsLoading: false,
  preferredStaffLoading: false,
  
  // Selection states (false when empty)
  isAllSkillsSelected: false,
  isAllClientsSelected: false,
  isAllPreferredStaffSelected: false,
  
  // Error handling
  preferredStaffError: null,
  refetchPreferredStaff: () => {
    console.warn('Controls in error state - refetch ignored');
  }
};

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
  monthlyDistribution: Record<string, number>; // e.g., { "2025-01": 40, "2025-02": 40 }
  totalHours: number; // Sum of all monthly hours
  recurringTaskId: string; // For unique identification
  totalExpectedRevenue?: number;
  expectedHourlyRate?: number;
  totalSuggestedRevenue?: number;
  expectedLessSuggested?: number;
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
 * FIXED: Detail Matrix Data Hook - React Queue Error Resolved
 * 
 * Handles all data fetching and transformation logic for Detail Matrix.
 * ALL HOOKS CALLED UNCONDITIONALLY AT TOP TO PREVENT QUEUE CORRUPTION.
 */
export const useDetailMatrixData = ({
  groupingMode
}: UseDetailMatrixDataProps): UseDetailMatrixDataResult => {
  
  // Call ALL hooks OUTSIDE try/catch (unconditionally)
  
  const { demandData, isLoading, error: dataError, loadDemandData } = useDemandMatrixData(
    groupingMode, 
    {}
  );
  
  const demandMatrixControls = useDemandMatrixControls({
    demandData: demandData || null,
    groupingMode
  });
  
  const matrixFiltering = useMatrixFiltering({
    demandData: demandData || null,
    selectedSkills: demandMatrixControls.selectedSkills || [],
    selectedClients: demandMatrixControls.selectedClients || [],
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff || [],
    monthRange: demandMatrixControls.monthRange || { start: 0, end: 11 },
    groupingMode
  });

  // Create enhanced controls (always, even with errors)
  const enhancedDemandMatrixControls = {
    ...demandMatrixControls,
    availableSkills: matrixFiltering.availableSkills || [],
    availableClients: matrixFiltering.availableClients || [],
    availablePreferredStaff: matrixFiltering.availablePreferredStaff || [],
  };

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

  // STEP 2: Handle data processing with try/catch (NOT hook calls)
  let processedData: Task[] = [];
  let processError: string | null = null;
  
  try {
    // Data processing logic here (no hooks!)
    if (demandData && !isLoading && demandData.dataPoints) {
      // PHASE 1: Implement Task Aggregation Logic
      
      // Create a map to aggregate tasks
      const taskMap = new Map<string, Task>();

      // Process all data points to aggregate tasks
      demandData.dataPoints.forEach(point => {
        if (point.taskBreakdown) {
          point.taskBreakdown.forEach(task => {
            // Create unique key using recurringTaskId (fallback to taskName-clientName if not available)
            const recurringTaskId = task.recurringTaskId || `${task.taskName}-${task.clientName}`;
            const taskKey = `${task.taskName}-${task.clientName}-${recurringTaskId}`;
            
            if (!taskMap.has(taskKey)) {
              // Initialize new aggregated task
              taskMap.set(taskKey, {
                id: taskKey,
                taskName: task.taskName,
                clientName: task.clientName,
                clientId: task.clientId,
                skillRequired: point.skillType,
                recurringTaskId: recurringTaskId,
                category: 'General', // Default value
                priority: 'Medium', // Default value
                recurrencePattern: typeof task.recurrencePattern === 'string' 
                  ? task.recurrencePattern 
                  : task.recurrencePattern?.type || 'Monthly',
                monthlyDistribution: {},
                totalHours: 0,
                // Revenue fields - defaults for now
                totalExpectedRevenue: 0,
                expectedHourlyRate: 0,
                totalSuggestedRevenue: 0,
                expectedLessSuggested: 0,
                // Legacy fields for compatibility
                month: '', // Not needed for aggregated view
                monthLabel: '', // Not needed for aggregated view
                monthlyHours: 0 // Will use monthlyDistribution instead
              });
            }
            
            // Add hours for this month to the aggregated task
            const aggregatedTask = taskMap.get(taskKey)!;
            aggregatedTask.monthlyDistribution[point.month] = task.monthlyHours;
            aggregatedTask.totalHours += task.monthlyHours;
          });
        }
      });

      // Convert map to array
      processedData = Array.from(taskMap.values());
      
      console.log(`🎯 [PHASE 1] Task aggregation complete:`, {
        originalDataPoints: demandData.dataPoints.length,
        aggregatedTasks: processedData.length,
        sampleTask: processedData[0] ? {
          name: processedData[0].taskName,
          client: processedData[0].clientName,
          totalHours: processedData[0].totalHours,
          monthlyDistribution: Object.keys(processedData[0].monthlyDistribution).length
        } : null
      });
    }
  } catch (err) {
    console.error('Data processing error:', err);
    processError = err instanceof Error ? err.message : 'Data processing failed';
  }
  
  // STEP 3: Return with proper error handling
  const finalError = dataError || processError;
  
  if (isLoading || !demandData) {
    return {
      data: [],
      loading: true,
      error: null,
      refetch: loadDemandData,
      activeFilters,
      demandMatrixControls: enhancedDemandMatrixControls,
      months: []
    };
  }
  
  if (finalError) {
    return {
      data: [],
      loading: false,
      error: finalError,
      refetch: loadDemandData,
      activeFilters,
      demandMatrixControls: enhancedDemandMatrixControls,
      months: demandData?.months || []
    };
  }
  
  // Return processed data with all required properties

  return {
    data: processedData,
    loading: false,
    error: null,
    refetch: loadDemandData,
    activeFilters,
    demandMatrixControls: enhancedDemandMatrixControls,
    months: demandData?.months || []
  };
};