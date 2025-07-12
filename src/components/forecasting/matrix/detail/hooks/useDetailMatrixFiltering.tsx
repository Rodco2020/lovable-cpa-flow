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
  filteredTasks: Task[];      // For display (all filters applied)
  tasksForRevenue: Task[];    // For revenue calculation (client + date only)
  filterStats: {
    originalCount: number;
    filteredCount: number;
    skillsFiltered: number;
    clientsFiltered: number;
    staffFiltered: number;
    monthRangeFiltered: number;
    revenueBaseTasks: number;
    displayTasks: number;
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
    console.log(`🔍 [TWO-STAGE FILTERING] Starting with ${tasks.length} aggregated tasks`);
    
    // STAGE 1: Revenue-affecting filters (Client + Date Range ONLY)
    let tasksForRevenue = [...tasks];

    // Apply client filter to revenue base
    if (selectedClients.length > 0) {
      tasksForRevenue = tasksForRevenue.filter(task => 
        selectedClients.includes(task.clientId)
      );
    }

    // Apply month range filter to revenue base
    if (monthRange.start !== 0 || monthRange.end !== 11) {
      const filteredMonths = months.slice(monthRange.start, monthRange.end + 1);
      const allowedMonthKeys = filteredMonths.map(m => m.key);
      
      tasksForRevenue = tasksForRevenue.filter(task => {
        if (task.monthlyDistribution) {
          const hasHoursInRange = allowedMonthKeys.some(monthKey => 
            (task.monthlyDistribution![monthKey] || 0) > 0
          );
          return hasHoursInRange;
        }
        // Fallback for backward compatibility with non-aggregated tasks
        return allowedMonthKeys.includes(task.month);
      });
    }

    // STAGE 2: Display filters (ALL filters including Skill + Staff)
    let filteredTasks = [...tasksForRevenue]; // Start with revenue-filtered tasks
    
    const stats = {
      originalCount: tasks.length,
      filteredCount: 0,
      skillsFiltered: 0,
      clientsFiltered: 0,
      staffFiltered: 0,
      monthRangeFiltered: 0,
      revenueBaseTasks: tasksForRevenue.length,
      displayTasks: 0
    };

    // Apply skill filter to display only
    if (selectedSkills.length > 0) {
      const beforeCount = filteredTasks.length;
      filteredTasks = filteredTasks.filter(task => 
        selectedSkills.includes(task.skillRequired)
      );
      stats.skillsFiltered = beforeCount - filteredTasks.length;
    }

    // Apply preferred staff filter to display only
    if (selectedPreferredStaff.length > 0) {
      const beforeCount = filteredTasks.length;
      filteredTasks = filteredTasks.filter(task => {
        // Only include tasks that have a preferred staff AND match selected staff
        const hasMatchingStaff = task.preferredStaffId && 
                               selectedPreferredStaff.includes(task.preferredStaffId);
        
        return hasMatchingStaff;
      });
      stats.staffFiltered = beforeCount - filteredTasks.length;
      
      console.log(`[TWO-STAGE] Preferred staff filter applied to display:`, {
        selectedStaff: selectedPreferredStaff,
        tasksBeforeFilter: beforeCount,
        tasksAfterFilter: filteredTasks.length,
        filtered: stats.staffFiltered
      });
    }

    stats.filteredCount = filteredTasks.length;
    stats.displayTasks = filteredTasks.length;

    // Calculate filter stats based on revenue-affecting filters
    stats.clientsFiltered = tasks.length - (selectedClients.length > 0 ? tasksForRevenue.length : tasks.length);
    stats.monthRangeFiltered = (selectedClients.length > 0 ? tasksForRevenue.length : tasks.length) - 
                              (monthRange.start !== 0 || monthRange.end !== 11 ? tasksForRevenue.length : 
                               (selectedClients.length > 0 ? tasksForRevenue.length : tasks.length));

    console.log(`✅ [TWO-STAGE] Filtering complete:`, {
      originalTasks: stats.originalCount,
      revenueBaseTasks: stats.revenueBaseTasks,
      displayTasks: stats.displayTasks,
      filtersApplied: {
        clients: selectedClients.length > 0 ? `${selectedClients.length} clients (revenue)` : 'none',
        monthRange: monthRange.start !== 0 || monthRange.end !== 11 ? `${monthRange.start}-${monthRange.end} (revenue)` : 'all months',
        skills: selectedSkills.length > 0 ? `${selectedSkills.length} skills (display)` : 'none',
        staff: selectedPreferredStaff.length > 0 ? `${selectedPreferredStaff.length} staff (display)` : 'none'
      },
      revenueSample: tasksForRevenue.slice(0, 2).map(task => ({
        name: task.taskName,
        client: task.clientName,
        totalHours: task.totalHours
      })),
      displaySample: filteredTasks.slice(0, 2).map(task => ({
        name: task.taskName,
        skill: task.skillRequired,
        staff: task.preferredStaffName || 'None'
      }))
    });

    return {
      filteredTasks,
      tasksForRevenue,
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
    tasksForRevenue: filteredResult.tasksForRevenue,
    filterStats: filteredResult.stats,
    hasActiveFilters,
    activeFiltersCount
  };
};