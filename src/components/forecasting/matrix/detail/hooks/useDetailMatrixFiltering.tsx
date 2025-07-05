import { useMemo } from 'react';

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

interface UseDetailMatrixFilteringProps {
  tasks: Task[];
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
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
  groupingMode
}: UseDetailMatrixFilteringProps): UseDetailMatrixFilteringResult => {
  
  const filteredResult = useMemo(() => {
    console.log('🔍 [DETAIL MATRIX FILTERING] Applying filters to tasks:', {
      totalTasks: tasks.length,
      selectedSkills: selectedSkills.length,
      selectedClients: selectedClients.length,
      selectedPreferredStaff: selectedPreferredStaff.length,
      monthRange
    });

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
      console.log('📊 Skills filter applied:', {
        before: beforeCount,
        after: filteredTasks.length,
        filtered: stats.skillsFiltered
      });
    }

    // Apply Clients Filter
    if (selectedClients.length > 0) {
      const beforeCount = filteredTasks.length;
      filteredTasks = filteredTasks.filter(task => 
        selectedClients.includes(task.clientId)
      );
      stats.clientsFiltered = beforeCount - filteredTasks.length;
      console.log('🏢 Clients filter applied:', {
        before: beforeCount,
        after: filteredTasks.length,
        filtered: stats.clientsFiltered
      });
    }

    // Apply Preferred Staff Filter (based on task assignments)
    // Note: For Phase 3, we'll filter based on client assignments
    // since individual task staff assignments may not be available yet
    if (selectedPreferredStaff.length > 0) {
      const beforeCount = filteredTasks.length;
      // For now, preserve all tasks but log the filter application
      // This can be enhanced when preferred staff task assignments are available
      console.log('👥 Preferred Staff filter (placeholder):', {
        before: beforeCount,
        selectedStaff: selectedPreferredStaff.length
      });
    }

    // Apply Month Range Filter
    // Convert month strings to numbers for comparison
    const beforeCount = filteredTasks.length;
    filteredTasks = filteredTasks.filter(task => {
      // Extract month number from monthLabel or month field
      const monthNum = parseInt(task.month) || 0;
      return monthNum >= monthRange.start && monthNum <= monthRange.end;
    });
    stats.monthRangeFiltered = beforeCount - filteredTasks.length;
    console.log('📅 Month range filter applied:', {
      before: beforeCount,
      after: filteredTasks.length,
      filtered: stats.monthRangeFiltered,
      range: `${monthRange.start}-${monthRange.end}`
    });

    stats.filteredCount = filteredTasks.length;

    console.log('✅ [DETAIL MATRIX FILTERING] Filtering complete:', {
      originalTasks: stats.originalCount,
      filteredTasks: stats.filteredCount,
      reductionPercentage: stats.originalCount > 0 
        ? ((stats.originalCount - stats.filteredCount) / stats.originalCount * 100).toFixed(1)
        : '0'
    });

    return {
      filteredTasks,
      stats
    };
  }, [tasks, selectedSkills, selectedClients, selectedPreferredStaff, monthRange, groupingMode]);

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