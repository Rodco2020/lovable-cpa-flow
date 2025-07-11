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
  monthlyDistribution?: Record<string, number>; // New aggregated format (optional for compatibility)
  totalHours?: number; // Sum of all monthly hours (optional for compatibility)
  recurringTaskId?: string; // For unique identification (optional for compatibility)
  preferredStaffId?: string | null;
  preferredStaffName?: string;
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
    console.log(`🔍 [PHASE 4] Starting task filtering with ${tasks.length} aggregated tasks`);
    
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

    // Apply Preferred Staff Filter
    if (selectedPreferredStaff.length > 0) {
      const beforeCount = filteredTasks.length;
      filteredTasks = filteredTasks.filter(task => {
        // Only include tasks that have a preferred staff AND match selected staff
        const hasMatchingStaff = task.preferredStaffId && 
                               selectedPreferredStaff.includes(task.preferredStaffId);
        
        return hasMatchingStaff;
      });
      stats.staffFiltered = beforeCount - filteredTasks.length;
      
      console.log(`[DETAIL MATRIX] Preferred staff filter applied:`, {
        selectedStaff: selectedPreferredStaff,
        tasksBeforeFilter: beforeCount,
        tasksAfterFilter: filteredTasks.length,
        filtered: stats.staffFiltered
      });
    }

    // Apply Month Range Filter - Updated for Aggregated Tasks
    // Check if task has any hours in the selected month range
    const beforeCount = filteredTasks.length;
    if (monthRange.start !== 0 || monthRange.end !== 11) {
      // Get the filtered month keys using array slicing (same as Demand Matrix)
      const filteredMonths = months.slice(monthRange.start, monthRange.end + 1);
      const allowedMonthKeys = filteredMonths.map(m => m.key);
      
      console.log(`🗓️ [PHASE 4] Month range filter active:`, {
        monthRange,
        allowedMonths: allowedMonthKeys,
        totalMonths: months.length
      });
      
      filteredTasks = filteredTasks.filter(task => {
        // For aggregated tasks, check if any month in monthlyDistribution 
        // falls within the selected range AND has hours > 0
        if (task.monthlyDistribution) {
          const hasHoursInRange = allowedMonthKeys.some(monthKey => 
            (task.monthlyDistribution![monthKey] || 0) > 0
          );
          if (!hasHoursInRange) {
            console.log(`🗓️ [PHASE 4] Task ${task.taskName} filtered out - no hours in range`, {
              taskDistribution: task.monthlyDistribution,
              allowedMonths: allowedMonthKeys
            });
          }
          return hasHoursInRange;
        }
        // Fallback for backward compatibility with non-aggregated tasks
        return allowedMonthKeys.includes(task.month);
      });
    }
    stats.monthRangeFiltered = beforeCount - filteredTasks.length;

    stats.filteredCount = filteredTasks.length;

    // Phase 4 comprehensive logging for testing verification
    console.log(`✅ [PHASE 4] Filtering complete:`, {
      originalTasks: stats.originalCount,
      filteredTasks: stats.filteredCount,
      filtersApplied: {
        skills: selectedSkills.length > 0 ? `${selectedSkills.length} skills` : 'none',
        clients: selectedClients.length > 0 ? `${selectedClients.length} clients` : 'none',
        staff: selectedPreferredStaff.length > 0 ? `${selectedPreferredStaff.length} staff` : 'none',
        monthRange: monthRange.start !== 0 || monthRange.end !== 11 ? `${monthRange.start}-${monthRange.end}` : 'all months'
      },
      tasksSample: filteredTasks.slice(0, 2).map(task => ({
        name: task.taskName,
        client: task.clientName,
        skill: task.skillRequired,
        totalHours: task.totalHours,
        hasDistribution: !!task.monthlyDistribution,
        distributionMonths: task.monthlyDistribution ? Object.keys(task.monthlyDistribution).length : 0
      }))
    });

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