
import { useState } from 'react';
import { FilterState } from '../types';

/**
 * Hook for managing filter state operations
 * Encapsulates all filter state management logic
 */
export const useFilterState = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    clientFilter: 'all',
    skillFilter: 'all',
    priorityFilter: 'all',
    statusFilter: 'all'
  });

  /**
   * Update a specific filter key with a new value
   */
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Reset all filters to their default values
   */
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      clientFilter: 'all',
      skillFilter: 'all',
      priorityFilter: 'all',
      statusFilter: 'all'
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters
  };
};
