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
 * Detail Matrix Data Hook - Step 1
 * 
 * Handles all data fetching and transformation logic for Detail Matrix.
 * Maintains exact same data structure and behavior as original container.
 */
export const useDetailMatrixData = ({
  groupingMode
}: UseDetailMatrixDataProps): UseDetailMatrixDataResult => {
  
  try {
    // Step 1: Load data with empty filters
    const { demandData, isLoading, error, loadDemandData } = useDemandMatrixData(
      groupingMode, 
      {}
    );
    
    // Step 2: ALWAYS call controls hook (no conditions!)
    const demandMatrixControls = useDemandMatrixControls({
      demandData: demandData || null, // Safe null fallback
      groupingMode
    });
    
    // Step 3: ALWAYS call filtering hook (no ternary operators!)
    const matrixFiltering = useMatrixFiltering({
      demandData: demandData || null,
      selectedSkills: demandMatrixControls.selectedSkills || [],
      selectedClients: demandMatrixControls.selectedClients || [],
      selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff || [],
      monthRange: demandMatrixControls.monthRange || { start: 0, end: 11 },
      groupingMode
    });

    // Step 4: Create enhanced controls (after ALL hooks are called)
    const enhancedDemandMatrixControls = {
      ...demandMatrixControls,
      availableSkills: matrixFiltering.availableSkills,
      availableClients: matrixFiltering.availableClients,
      availablePreferredStaff: matrixFiltering.availablePreferredStaff,
    };
  
    // Step 5: Create stable active filters from the enhanced controls
    const activeFilters = useMemo(() => ({
      preferredStaff: enhancedDemandMatrixControls?.selectedPreferredStaff || [],
      skills: enhancedDemandMatrixControls?.selectedSkills || [],
      clients: enhancedDemandMatrixControls?.selectedClients || []
    }), [
      JSON.stringify(enhancedDemandMatrixControls?.selectedPreferredStaff),
      JSON.stringify(enhancedDemandMatrixControls?.selectedSkills),
      JSON.stringify(enhancedDemandMatrixControls?.selectedClients)
    ]);

    // Step 6: Handle loading state HERE (after all hooks are called)
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

    // Step 7: Transform demand data to task-level data
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
      loading: false,
      error,
      refetch: loadDemandData,
      activeFilters,
      demandMatrixControls: enhancedDemandMatrixControls,
      months: demandData?.months || [] // Pass months array for proper filtering
    };
    
  } catch (err) {
    console.error('useDetailMatrixData error:', err);
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      type: err instanceof Error ? err.name : typeof err
    });
    
    return {
      data: [],
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred loading detail matrix data',
      refetch: () => Promise.resolve(),
      activeFilters: {
        preferredStaff: [],
        skills: [],
        clients: []
      },
      demandMatrixControls: defaultDemandMatrixControls, // ✅ FIXED: Use default instead of null
      months: []
    };
  }
};