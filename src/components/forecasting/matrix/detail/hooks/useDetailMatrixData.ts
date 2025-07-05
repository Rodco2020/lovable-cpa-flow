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
  
  // STEP 1: Call ALL hooks OUTSIDE try/catch (unconditionally)
  console.log('[useDetailMatrixData] ✅ Calling all hooks unconditionally');
  
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
      console.log('📊 [DETAIL MATRIX] Processing data loaded:', {
        totalDataPoints: demandData.dataPoints.length,
        availableMonths: demandData?.months?.map(m => m.label),
        monthRange: enhancedDemandMatrixControls?.monthRange,
        sampleDataPoint: demandData.dataPoints[0]
      });

      // Extract individual tasks from the demand data points
      demandData.dataPoints.forEach(point => {
        if (point.taskBreakdown) {
          point.taskBreakdown.forEach(task => {
            processedData.push({
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
        totalDetailTasks: processedData.length,
        sampleTask: processedData[0],
        monthRange: enhancedDemandMatrixControls?.monthRange
      });
    }
  } catch (err) {
    console.error('Data processing error:', err);
    processError = err instanceof Error ? err.message : 'Data processing failed';
  }
  
  // STEP 3: Return with proper error handling
  const finalError = dataError || processError;
  
  if (isLoading || !demandData) {
    console.log('[useDetailMatrixData] ⏳ Loading state');
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
    console.log('[useDetailMatrixData] ❌ Error state:', finalError);
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
  
  // STEP 4: Normal return with processed data
  console.log('[useDetailMatrixData] ✅ Success state - data loaded');
  
  // Add diagnostic logging
  console.log('📊 [DETAIL MATRIX] Data flow status:', {
    hasData: !!demandData,
    hasControls: !!demandMatrixControls,
    availableSkillsCount: matrixFiltering.availableSkills.length,
    availableClientsCount: matrixFiltering.availableClients.length,
    processedTasksCount: processedData.length
  });

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