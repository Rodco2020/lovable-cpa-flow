
import React from 'react';
import { ClientMetricsFilters } from '@/types/clientMetrics';
import { StaffOption } from '@/types/staffOption';
import { useFilterHandlers } from './hooks/useFilterHandlers';
import {
  IndustryFilter,
  StatusFilter,
  StaffLiaisonFilter,
  ResetFiltersButton
} from './components';

interface FilterControlsProps {
  filters: ClientMetricsFilters;
  onFiltersChange: (filters: ClientMetricsFilters) => void;
  availableIndustries?: string[];
  availableStatuses?: Array<'Active' | 'Inactive'>;
  onResetFilters: () => void;
  staffOptions?: StaffOption[];
  isStaffLoading?: boolean;
  onFilterChange?: (key: keyof ClientMetricsFilters, value: any) => void;
}

/**
 * Filter Controls Component - Refactored
 * 
 * Main container for all filter controls. This component has been refactored
 * into smaller, focused sub-components for better maintainability while
 * preserving the exact same functionality and UI behavior.
 * 
 * Key improvements:
 * - Separated each filter type into its own component
 * - Extracted filter handler logic into a custom hook
 * - Maintained all existing validation and console logging
 * - Preserved all prop interfaces and callback patterns
 * - Kept the exact same UI layout and styling
 */
export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  availableIndustries = [],
  availableStatuses = [],
  onResetFilters,
  staffOptions = [],
  isStaffLoading = false,
  onFilterChange
}) => {
  const {
    handleIndustryChange,
    handleStatusChange,
    handleStaffLiaisonChange
  } = useFilterHandlers({
    filters,
    onFiltersChange,
    onFilterChange
  });

  return (
    <div className="flex flex-wrap gap-4">
      <IndustryFilter
        value={filters.industry}
        onChange={handleIndustryChange}
        availableIndustries={availableIndustries}
      />

      <StatusFilter
        value={filters.status}
        onChange={handleStatusChange}
        availableStatuses={availableStatuses}
      />

      <StaffLiaisonFilter
        value={filters.staffLiaisonId}
        onChange={handleStaffLiaisonChange}
        staffOptions={staffOptions}
        isLoading={isStaffLoading}
      />

      <ResetFiltersButton onReset={onResetFilters} />
    </div>
  );
};
