
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getStaffForLiaisonDropdown } from '@/services/client/staffLiaisonService';
import { ClientMetricsFilters } from '@/types/clientMetrics';
import { FilterToggleHeader } from './FilterToggleHeader';
import { ActiveFiltersDisplay } from './ActiveFiltersDisplay';
import { FilterControls } from './FilterControls';

interface ClientMetricsFiltersComponentProps {
  filters: ClientMetricsFilters;
  onFiltersChange: (filters: ClientMetricsFilters) => void;
  className?: string;
}

/**
 * Client Metrics Filters Component - Phase 1
 * 
 * Provides filtering controls for client dashboard metrics
 * 
 * Refactored into modular sub-components for better maintainability:
 * - FilterToggleHeader: Handles expand/collapse and clear all functionality
 * - ActiveFiltersDisplay: Shows active filter badges with remove buttons
 * - FilterControls: Contains the actual filter form controls
 */
export const ClientMetricsFiltersComponent: React.FC<ClientMetricsFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch staff for liaison dropdown
  const { data: staffOptions = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff-liaison-dropdown'],
    queryFn: getStaffForLiaisonDropdown,
    staleTime: 10 * 60 * 1000, // 10 minutes cache for staff data
  });

  const handleFilterChange = useCallback((key: keyof ClientMetricsFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    onFiltersChange({});
    setIsExpanded(false);
  }, [onFiltersChange]);

  const removeFilter = useCallback((key: keyof ClientMetricsFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(
    key => filters[key as keyof ClientMetricsFilters] != null
  ).length;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <FilterToggleHeader
          activeFilterCount={activeFilterCount}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          onClearFilters={clearFilters}
        />

        <ActiveFiltersDisplay
          filters={filters}
          staffOptions={staffOptions}
          activeFilterCount={activeFilterCount}
          onRemoveFilter={removeFilter}
        />

        {isExpanded && (
          <FilterControls
            filters={filters}
            staffOptions={staffOptions}
            isStaffLoading={isStaffLoading}
            onFilterChange={handleFilterChange}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ClientMetricsFiltersComponent;
