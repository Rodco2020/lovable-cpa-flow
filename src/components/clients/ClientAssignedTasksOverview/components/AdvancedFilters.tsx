
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';
import {
  AdvancedFiltersHeader,
  QuickPresetsSection,
  DateRangeSection,
  MultiSelectFiltersGrid,
  AdvancedFiltersUtils,
  PresetHandlers,
  AdvancedFilterState,
  AdvancedFiltersProps
} from './AdvancedFiltersCore';

/**
 * Advanced Filters Component - Refactored
 * 
 * Provides multi-select filters, date range filtering, and quick presets
 * for complex filtering scenarios. Now includes staff liaison filtering.
 * 
 * This component has been refactored into smaller, focused components
 * while maintaining exact functionality and UI appearance.
 */
export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  clients,
  availableSkills,
  availablePriorities,
  staffOptions,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Debug logging for skills
  useEffect(() => {
    console.log('[AdvancedFilters] Received skills:', {
      count: availableSkills?.length || 0,
      skills: availableSkills,
      hasDuplicates: availableSkills ? new Set(availableSkills).size !== availableSkills.length : false
    });
  }, [availableSkills]);

  // Validate all input data using utility functions
  const validClients = React.useMemo(() => AdvancedFiltersUtils.validateClients(clients), [clients]);
  const validSkills = React.useMemo(() => AdvancedFiltersUtils.validateSkills(availableSkills), [availableSkills]);
  const validPriorities = React.useMemo(() => AdvancedFiltersUtils.validatePriorities(availablePriorities), [availablePriorities]);
  const validStaffOptions = React.useMemo(() => AdvancedFiltersUtils.validateStaffOptions(staffOptions), [staffOptions]);

  const updateMultiSelectFilter = (
    filterKey: keyof Pick<AdvancedFilterState, 'skillFilters' | 'clientFilters' | 'priorityFilters' | 'statusFilters' | 'staffLiaisonFilters' | 'preferredStaffFilters'>,
    value: string,
    checked: boolean
  ) => {
    // Comprehensive validation to ensure value is safe
    if (!value || typeof value !== 'string' || value.trim() === '') {
      console.warn('Invalid value passed to updateMultiSelectFilter:', value);
      return;
    }
    
    const currentValues = filters[filterKey];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    console.log(`[AdvancedFilters] Updating ${filterKey}:`, {
      action: checked ? 'add' : 'remove',
      value,
      before: currentValues,
      after: newValues
    });
    
    onFiltersChange({
      ...filters,
      [filterKey]: newValues,
      preset: null // Clear preset when manual changes are made
    });
  };

  const applyPreset = (presetId: string) => {
    const newFilters = PresetHandlers.applyPreset(presetId, filters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = AdvancedFiltersUtils.getClearedFilters();
    onFiltersChange(clearedFilters);
  };

  const handleDateRangeChange = (dateRange: { from: Date | undefined; to: Date | undefined }) => {
    onFiltersChange({
      ...filters,
      dateRange,
      preset: null
    });
  };

  const activeFilterCount = AdvancedFiltersUtils.getActiveFilterCount(filters);

  return (
    <Card className={className}>
      <CardHeader>
        <AdvancedFiltersHeader
          activeFilterCount={activeFilterCount}
          skillsCount={validSkills.length}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          onClearAllFilters={clearAllFilters}
        />
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Quick Presets */}
          <QuickPresetsSection
            filters={filters}
            onApplyPreset={applyPreset}
          />

          {/* Date Range Filter */}
          <DateRangeSection
            dateRange={filters.dateRange}
            onDateRangeChange={handleDateRangeChange}
          />

          {/* Multi-select Filters Grid */}
          <MultiSelectFiltersGrid
            skillFilters={filters.skillFilters}
            clientFilters={filters.clientFilters}
            priorityFilters={filters.priorityFilters}
            statusFilters={filters.statusFilters}
            staffLiaisonFilters={filters.staffLiaisonFilters}
            preferredStaffFilters={filters.preferredStaffFilters}
            validSkills={validSkills}
            validClients={validClients}
            validPriorities={validPriorities}
            validStaffOptions={validStaffOptions}
            onUpdateFilter={updateMultiSelectFilter}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedFilters;
export type { AdvancedFilterState };
