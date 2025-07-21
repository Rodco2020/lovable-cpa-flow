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
  preferredStaffId?: string | null;
  preferredStaffName?: string;
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
      // PHASE 1: Implement Task Aggregation Logic - FIXED with correct monthlyHours preservation
      
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
                preferredStaffId: task.preferredStaffId || null,
                preferredStaffName: task.preferredStaffName || undefined,
                // Revenue fields - defaults for now
                totalExpectedRevenue: 0,
                expectedHourlyRate: 0,
                totalSuggestedRevenue: 0,
                expectedLessSuggested: 0,
                // Legacy fields for compatibility
                month: '', // Not needed for aggregated view
                monthLabel: '', // Not needed for aggregated view
                // SURGICAL FIX: Preserve per-occurrence hours from original task
                monthlyHours: task.monthlyHours // FIXED: Use actual value instead of 0
              });
              
              console.log('[AGGREGATION] New task with staff:', {
                taskName: task.taskName,
                preferredStaffId: task.preferredStaffId,
                preferredStaffName: task.preferredStaffName,
                monthlyHours: task.monthlyHours // Log the preserved value
              });
              
              // PHASE 3: Add validation logging for Ana Florian
              if (task.taskName.includes('Monthly Bookkeeping') && task.preferredStaffName?.includes('Ana Florian')) {
                console.log('🎯 [FIX VALIDATION] Ana Florian task created:', {
                  taskName: task.taskName,
                  monthlyHours: task.monthlyHours, // Should be 1.0 for monthly tasks
                  totalHours: 0, // Initial value
                  monthlyDistribution: {}
                });
              }
            } else {
              // Update existing task - keep the most recent staff assignment
              const aggregatedTask = taskMap.get(taskKey)!;
              
              // Only update if this month's data has staff assignment
              if (task.preferredStaffId !== undefined && task.preferredStaffId !== null) {
                aggregatedTask.preferredStaffId = task.preferredStaffId;
                aggregatedTask.preferredStaffName = task.preferredStaffName;
              }
              
              // PHASE 2: Ensure monthlyHours is preserved during aggregation
              if (aggregatedTask.monthlyHours === 0 && task.monthlyHours > 0) {
                aggregatedTask.monthlyHours = task.monthlyHours;
                console.log('🔧 [AGGREGATION FIX] Updated monthlyHours for existing task:', {
                  taskName: task.taskName,
                  previousHours: 0,
                  newHours: task.monthlyHours
                });
              }
            }
            
            // Add hours for this month to the aggregated task
            const aggregatedTask = taskMap.get(taskKey)!;
            aggregatedTask.monthlyDistribution[point.month] = task.monthlyHours;
            aggregatedTask.totalHours += task.monthlyHours;
            
            // PHASE 3: Add validation logging for Ana Florian after aggregation
            if (task.taskName.includes('Monthly Bookkeeping') && task.preferredStaffName?.includes('Ana Florian')) {
              console.log('🎯 [FIX VALIDATION] Ana Florian task aggregated:', {
                taskName: aggregatedTask.taskName,
                monthlyHours: aggregatedTask.monthlyHours, // Should be 1.0 for monthly tasks
                totalHours: aggregatedTask.totalHours,     // Should be cumulative across months
                monthlyDistribution: Object.keys(aggregatedTask.monthlyDistribution).length
              });
            }
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
          monthlyHours: processedData[0].monthlyHours, // Log the preserved value
          monthlyDistribution: Object.keys(processedData[0].monthlyDistribution).length,
          preferredStaffId: processedData[0].preferredStaffId,
          preferredStaffName: processedData[0].preferredStaffName
        } : null
      });
      
      // PHASE 3: Final validation logging for Ana Florian
      const anaTask = processedData.find(task => 
        task.taskName.includes('Monthly Bookkeeping') && 
        task.preferredStaffName?.includes('Ana Florian')
      );
      
      if (anaTask) {
        console.log('✅ [FINAL VALIDATION] Ana Florian aggregated task:', {
          taskName: anaTask.taskName,
          monthlyHours: anaTask.monthlyHours, // Should be 1.0 for monthly tasks
          totalHours: anaTask.totalHours,     // Should be cumulative across months
          monthlyDistribution: anaTask.monthlyDistribution,
          preferredStaffName: anaTask.preferredStaffName
        });
      }
      
      console.log('[AGGREGATION] Sample aggregated task with staff:', 
        processedData.find(task => task.preferredStaffId) || 'No tasks with preferred staff found'
      );
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
