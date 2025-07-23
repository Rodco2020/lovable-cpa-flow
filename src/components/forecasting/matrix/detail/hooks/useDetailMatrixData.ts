import { useMemo } from 'react';
import { useDemandMatrixData } from '../../hooks/useDemandMatrixData';
import { useDemandMatrixControls } from '../../hooks/useDemandMatrixControls';
import { useMatrixFiltering } from '../../hooks/useMatrixFiltering';

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
 * FIXED: Detail Matrix Data Hook - Proper Data Initialization Order
 * 
 * Fixed the initialization sequence to ensure controls have actual data:
 * 1. Load initial data without filters
 * 2. Initialize controls with loaded data
 * 3. Create filtering with control selections
 * 4. Reload data with active filters
 * 5. Handle loading states properly
 */
export const useDetailMatrixData = ({ 
  groupingMode 
}: UseDetailMatrixDataProps): UseDetailMatrixDataResult => {
  
  // STEP 1: Load initial data without filters to get all available options
  const { 
    demandData: initialData, 
    isLoading: initialLoading, 
    error: initialError 
  } = useDemandMatrixData(groupingMode, {}); // Empty filters for initial load

  // STEP 2: Initialize controls only after we have data
  const demandMatrixControls = useDemandMatrixControls({
    demandData: initialData || null, // Pass actual data, not null
    groupingMode
  });

  // STEP 3: Create matrix filtering with the control selections
  const matrixFiltering = useMatrixFiltering({
    demandData: initialData || null,
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // STEP 4: Create active filters object
  const activeFilters = useMemo(() => {
    const hasActiveFilters = demandMatrixControls.selectedSkills.length > 0 ||
                            demandMatrixControls.selectedClients.length > 0 ||
                            demandMatrixControls.selectedPreferredStaff.length > 0 ||
                            (demandMatrixControls.monthRange.start !== 0 || demandMatrixControls.monthRange.end !== 11);

    if (!hasActiveFilters) {
      return {}; // No filters = show all data
    }

    return {
      skills: demandMatrixControls.selectedSkills,
      clients: demandMatrixControls.selectedClients,
      preferredStaff: demandMatrixControls.selectedPreferredStaff
    };
  }, [
    demandMatrixControls.selectedSkills,
    demandMatrixControls.selectedClients,
    demandMatrixControls.selectedPreferredStaff,
    demandMatrixControls.monthRange
  ]);

  // STEP 5: Reload data with active filters (if any)
  const { 
    demandData: filteredData, 
    isLoading: filteredLoading, 
    error: filteredError 
  } = useDemandMatrixData(groupingMode, activeFilters);

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
    const dataToUse = filteredData || initialData;
    if (!dataToUse?.dataPoints) return [];

    const tasks: any[] = [];
    
    dataToUse.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        // Create task entries for each month with hours
        if (task.monthlyDistribution) {
          Object.entries(task.monthlyDistribution).forEach(([monthKey, hours]) => {
            if (hours > 0) {
              tasks.push({
                id: `${task.recurringTaskId || task.taskName}-${monthKey}`,
                taskName: task.taskName,
                clientName: task.clientName,
                clientId: task.clientId,
                skillRequired: point.skillType || task.skillRequired,
                monthlyHours: hours,
                month: monthKey,
                monthLabel: months.find(m => m.key === monthKey)?.label || monthKey,
                recurrencePattern: task.recurrencePattern || 'N/A',
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
            recurrencePattern: task.recurrencePattern || 'N/A',
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

    console.log(`✅ [DETAIL MATRIX DATA] Transformed ${tasks.length} task entries from ${dataToUse.dataPoints.length} data points`);
    return tasks;
  }, [filteredData, initialData, months]);

  // STEP 6: Handle loading states properly
  const isLoading = initialLoading || (Object.keys(activeFilters).length > 0 && filteredLoading);
  const error = initialError || filteredError;

  console.log(`🔄 [DETAIL MATRIX DATA] Hook state:`, {
    initialDataLoaded: !!initialData,
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
    demandMatrixControls
  };
};
