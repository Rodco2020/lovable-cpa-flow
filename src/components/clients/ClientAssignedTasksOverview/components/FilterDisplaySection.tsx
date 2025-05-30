
import React from 'react';
import { TaskFilters } from './TaskFilters';
import { AdvancedFilters, AdvancedFilterState } from './AdvancedFilters';
import { FilterState } from '../types';
import { Client } from '@/types/client';

interface FilterDisplaySectionProps {
  showAdvancedFilters: boolean;
  advancedFilters: AdvancedFilterState;
  onAdvancedFiltersChange: (filters: AdvancedFilterState) => void;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  clients: Client[] | undefined;
  availableSkills: string[];
  availablePriorities: string[];
}

/**
 * FilterDisplaySection Component
 * 
 * Conditionally renders either the simple TaskFilters or AdvancedFilters
 * based on the current filter mode selection.
 */
export const FilterDisplaySection: React.FC<FilterDisplaySectionProps> = ({
  showAdvancedFilters,
  advancedFilters,
  onAdvancedFiltersChange,
  filters,
  onFilterChange,
  onResetFilters,
  clients,
  availableSkills,
  availablePriorities
}) => {
  if (showAdvancedFilters) {
    return (
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange}
        clients={clients}
        availableSkills={availableSkills}
        availablePriorities={availablePriorities}
      />
    );
  }

  return (
    <TaskFilters
      filters={filters}
      onFilterChange={onFilterChange}
      onResetFilters={onResetFilters}
      clients={clients}
      availableSkills={availableSkills}
      availablePriorities={availablePriorities}
    />
  );
};
