import { useMemo, useRef, useEffect } from 'react';
import { useDemandMatrixData } from '../../hooks/useDemandMatrixData';
import { useDemandMatrixControls } from '../../hooks/useDemandMatrixControls';
import { useMatrixFiltering } from '../../hooks/useMatrixFiltering';
import { formatRecurrencePattern } from '@/components/clients/ClientAssignedTasksOverview/utils';

interface UseDetailMatrixDataProps {
  groupingMode: 'skill' | 'client';
}

interface UseDetailMatrixDataResult {
  data: any[] | null;
  months: Array<{ key: string; label: string }>;
  loading: boolean;
  error: string | null;
  demandMatrixControls: any;
}

/**
 * FIXED: Detail Matrix Data Hook - Single Data Fetch Pattern
 * 
 * Eliminated infinite loop by using single data fetch with stabilized dependencies:
 * 1. Initialize controls with matrix filtering
 * 2. Create stable activeFilters with JSON.stringify for arrays
 * 3. Single useDemandMatrixData call with activeFilters
 * 4. Add loading state protection
 */
export const useDetailMatrixData = ({ 
  groupingMode 
}: UseDetailMatrixDataProps): UseDetailMatrixDataResult => {
  
  // Initialize controls first with matrix filtering to get available preferred staff
  const matrixFiltering = useMatrixFiltering({
    demandData: null, // Start with null to prevent premature filtering
    selectedSkills: [],
    selectedClients: [], 
    selectedPreferredStaff: [],
    monthRange: { start: 0, end: 11 },
    groupingMode
  });

  const demandMatrixControls = useDemandMatrixControls({
    demandData: null,
    groupingMode,
    availablePreferredStaff: matrixFiltering.availablePreferredStaff
  });

  // Track previous controls to prevent rendering while loading
  const prevControls = useRef(demandMatrixControls);
  
  // FIXED: Stabilize activeFilters using JSON.stringify to prevent infinite loops
  const activeFilters = useMemo(() => ({
    skills: demandMatrixControls.selectedSkills,
    clients: demandMatrixControls.selectedClients,
    preferredStaff: demandMatrixControls.selectedPreferredStaff,
  }), [
    // Use JSON.stringify for array dependencies to prevent reference changes
    JSON.stringify(demandMatrixControls.selectedSkills),
    JSON.stringify(demandMatrixControls.selectedClients),
    JSON.stringify(demandMatrixControls.selectedPreferredStaff),
  ]);

  // FIXED: Single data fetch with stabilized activeFilters
  const { demandData, isLoading, error } = useDemandMatrixData(
    groupingMode, 
    activeFilters
  );

  // Update prevControls when not loading
  useEffect(() => {
    if (!isLoading) {
      prevControls.current = demandMatrixControls;
    }
  }, [isLoading, demandMatrixControls]);

  // Generate months array for consistency
  const months = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => ({
      key: `${currentYear}-${String(i + 1).padStart(2, '0')}`,
      label: new Date(currentYear, i).toLocaleDateString('en', { month: 'short', year: 'numeric' })
    }));
  }, []);

  // Transform demand data to task format for Detail Matrix
  const transformedTasks = useMemo(() => {
    if (!demandData?.dataPoints) return [];

    const tasks: any[] = [];
    
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach((task: any) => {
        // Create task entries for each month with hours
        if (task.monthlyDistribution) {
          Object.entries(task.monthlyDistribution).forEach(([monthKey, hours]) => {
            if (typeof hours === 'number' && hours > 0) {
              tasks.push({
                id: `${task.recurringTaskId || task.taskName}-${monthKey}`,
                taskName: task.taskName,
                clientName: task.clientName,
                clientId: task.clientId,
                skillRequired: point.skillType || task.skillRequired,
                monthlyHours: hours,
                month: monthKey,
                monthLabel: months.find(m => m.key === monthKey)?.label || monthKey,
                recurrencePattern: task.recurrencePattern ? formatRecurrencePattern(task.recurrencePattern) : 'N/A',
                priority: task.priority || 'Medium',
                category: task.category || 'General',
                preferredStaffId: task.preferredStaffId,
                preferredStaffName: task.preferredStaffName,
                totalExpectedRevenue: task.totalExpectedRevenue,
                expectedHourlyRate: task.expectedHourlyRate,
                totalSuggestedRevenue: task.totalSuggestedRevenue,
                expectedLessSuggested: task.expectedLessSuggested,
                // Keep aggregated data for compatibility
                monthlyDistribution: task.monthlyDistribution,
                totalHours: task.totalHours,
                recurringTaskId: task.recurringTaskId
              });
            }
          });
        } else {
          // Fallback for non-aggregated data
          tasks.push({
            id: task.recurringTaskId || `${task.taskName}-fallback`,
            taskName: task.taskName,
            clientName: task.clientName,
            clientId: task.clientId,
            skillRequired: point.skillType || task.skillRequired,
            monthlyHours: task.estimatedHours || 0,
            month: '2024-01', // Default month
            monthLabel: 'Jan 2024',
            recurrencePattern: task.recurrencePattern ? formatRecurrencePattern(task.recurrencePattern) : 'N/A',
            priority: task.priority || 'Medium',
            category: task.category || 'General',
            preferredStaffId: task.preferredStaffId,
            preferredStaffName: task.preferredStaffName,
            totalExpectedRevenue: task.totalExpectedRevenue,
            expectedHourlyRate: task.expectedHourlyRate,
            totalSuggestedRevenue: task.totalSuggestedRevenue,
            expectedLessSuggested: task.expectedLessSuggested
          });
        }
      });
    });

    console.log(`✅ [DETAIL MATRIX DATA] Transformed ${tasks.length} task entries from ${demandData.dataPoints.length} data points`);
    return tasks;
  }, [demandData, months]);

  console.log(`🔄 [DETAIL MATRIX DATA] Hook state:`, {
    dataLoaded: !!demandData,
    controlsInitialized: !!demandMatrixControls,
    activeFiltersCount: Object.keys(activeFilters).length,
    finalTasksCount: transformedTasks.length,
    isLoading,
    hasError: !!error
  });

  return {
    data: transformedTasks,
    months,
    loading: isLoading,
    error,
    // Prevent controls from updating while loading
    demandMatrixControls: isLoading ? prevControls.current : demandMatrixControls
  };
};
