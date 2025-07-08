import { useMemo, useCallback } from 'react';

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
  monthlyDistribution: Record<string, number>; // New aggregated format
  totalHours: number; // Sum of all monthly hours
  recurringTaskId: string; // For unique identification
  totalExpectedRevenue?: number;
  expectedHourlyRate?: number;
  totalSuggestedRevenue?: number;
  expectedLessSuggested?: number;
}

interface UseDetailMatrixFilteringProps {
  tasks: Task[];
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
  months: Array<{ key: string; label: string }>; // ADD THIS - months array for proper filtering
}

interface UseDetailMatrixFilteringResult {
  filteredTasks: Task[];
  filterStats: {
    originalCount: number;
    filteredCount: number;
    skillsFiltered: number;
    clientsFiltered: number;
    staffFiltered: number;
    monthRangeFiltered: number;
  };
  hasActiveFilters: boolean;
  activeFiltersCount: number;
}

/**
 * Detail Matrix Filtering Hook - Phase 3
 * 
 * Applies filters at the task level for both view modes.
 * Uses the same filter logic patterns as Demand Matrix but operates on individual tasks.
 */
export const useDetailMatrixFiltering = ({
  tasks,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  groupingMode,
  months
}: UseDetailMatrixFilteringProps): UseDetailMatrixFilteringResult => {
  
  // Memoize filter dependencies to prevent unnecessary recalculations
  const filterDeps = useMemo(() => ({
    skillsHash: selectedSkills.sort().join(','),
    clientsHash: selectedClients.sort().join(','),
    staffHash: selectedPreferredStaff.sort().join(','),
    monthHash: `${monthRange.start}-${monthRange.end}`
  }), [selectedSkills, selectedClients, selectedPreferredStaff, monthRange]);
  
  const filteredResult = useMemo(() => {
    // Apply filters to tasks
    let filteredTasks = [...tasks];
    const stats = {
      originalCount: tasks.length,
      filteredCount: 0,
      skillsFiltered: 0,
      clientsFiltered: 0,
      staffFiltered: 0,
      monthRangeFiltered: 0
    };

    // Apply Skills Filter
    if (selectedSkills.length > 0) {
      const beforeCount = filteredTasks.length;
      filteredTasks = filteredTasks.filter(task => 
        selectedSkills.includes(task.skillRequired)
      );
      stats.skillsFiltered = beforeCount - filteredTasks.length;
    }

    // Apply Clients Filter
    if (selectedClients.length > 0) {
      const beforeCount = filteredTasks.length;
      filteredTasks = filteredTasks.filter(task => 
        selectedClients.includes(task.clientId)
      );
      stats.clientsFiltered = beforeCount - filteredTasks.length;
    }

    // Apply Preferred Staff Filter (based on task assignments)
    // Note: For Phase 3, we'll filter based on client assignments
    // since individual task staff assignments may not be available yet
    if (selectedPreferredStaff.length > 0) {
      const beforeCount = filteredTasks.length;
      // For now, preserve all tasks but track the filter application
      // This can be enhanced when preferred staff task assignments are available
      stats.staffFiltered = 0;
    }

    // Apply Month Range Filter
    // Use array slicing approach (same as Demand Matrix) instead of parseInt
    const beforeCount = filteredTasks.length;
    if (monthRange.start !== 0 || monthRange.end !== 11) {
      // Get the filtered month keys using array slicing (same as Demand Matrix)
      const filteredMonths = months.slice(monthRange.start, monthRange.end + 1);
      const allowedMonthKeys = filteredMonths.map(m => m.key);
      
      filteredTasks = filteredTasks.filter(task => 
        allowedMonthKeys.includes(task.month)
      );
    }
    stats.monthRangeFiltered = beforeCount - filteredTasks.length;

    stats.filteredCount = filteredTasks.length;

    return {
      filteredTasks,
      stats
    };
  }, [tasks, filterDeps, groupingMode]);

  // Calculate active filters
  const hasActiveFilters = useMemo(() => {
    return selectedSkills.length > 0 || 
           selectedClients.length > 0 || 
           selectedPreferredStaff.length > 0 ||
           (monthRange.start !== 0 || monthRange.end !== 11); // Assuming 12 months (0-11)
  }, [selectedSkills, selectedClients, selectedPreferredStaff, monthRange]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSkills.length > 0) count++;
    if (selectedClients.length > 0) count++;
    if (selectedPreferredStaff.length > 0) count++;
    if (monthRange.start !== 0 || monthRange.end !== 11) count++;
    return count;
  }, [selectedSkills, selectedClients, selectedPreferredStaff, monthRange]);

  return {
    filteredTasks: filteredResult.filteredTasks,
    filterStats: filteredResult.stats,
    hasActiveFilters,
    activeFiltersCount
  };
};