
import { useState, useEffect } from 'react';
import { FormattedTask } from '../types';
import { useFilterState } from './useFilterState';
import { FilteringUtils } from '../utils/filteringUtils';

/**
 * Custom hook for managing task filtering functionality
 * 
 * This hook provides comprehensive filtering capabilities for the Client Assigned Tasks Overview.
 * It manages filter state and applies multiple filter criteria to the task list.
 * 
 * Features:
 * - Search filtering by task name or client name
 * - Tab-based filtering (All/Recurring/Ad-hoc)
 * - Client-specific filtering
 * - Skill-based filtering
 * - Priority-based filtering
 * - Status filtering (Active/Paused for different task types)
 * 
 * Architecture:
 * - Uses FilteringUtils for pure filter functions
 * - Uses useFilterState for state management
 * - Maintains the same interface as the original hook for backward compatibility
 * 
 * @param formattedTasks - Array of formatted tasks to filter
 * @param activeTab - Current active tab ('all', 'recurring', 'adhoc')
 * @returns Object containing filtered tasks and filter management functions
 */
export const useTaskFiltering = (formattedTasks: FormattedTask[], activeTab: string) => {
  const [filteredTasks, setFilteredTasks] = useState<FormattedTask[]>([]);
  
  // Use the filter state management hook
  const { filters, updateFilter, resetFilters } = useFilterState();

  /**
   * Apply all filters whenever tasks or filter criteria change
   * Uses the FilteringUtils to maintain pure function approach
   */
  useEffect(() => {
    const filtered = FilteringUtils.applyAllFilters(
      formattedTasks,
      filters,
      activeTab
    );
    
    setFilteredTasks(filtered);
  }, [formattedTasks, filters, activeTab]);

  // Return the same interface as the original hook
  return {
    filteredTasks,
    filters,
    updateFilter,
    resetFilters
  };
};
