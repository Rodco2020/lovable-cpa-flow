
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DemandMatrixControlsFixedProps } from './types';
import { useFilterState } from './hooks/useFilterState';
import { useAvailableOptions } from './hooks/useAvailableOptions';
import { useDemandMatrixFilteringFixed } from '../../hooks/useDemandMatrixFilteringFixed';
import { FilteringValidationService } from '@/services/forecasting/demand/dataFetcher/filteringValidationService';

// Import existing components to preserve exact functionality
import { SkillsFilterSection } from '../../components/demand/components/SkillsFilterSection';
import { ClientsFilterSection } from '../../components/demand/ClientsFilterSection';
import { PreferredStaffFilterSection } from '../../components/demand/PreferredStaffFilterSection';
import { MonthRangeSelector } from '../../components/demand/MonthRangeSelector';

// Import refactored components
import { ControlsHeader } from './components/ControlsHeader';
import { ValidationStatus } from './components/ValidationStatus';
import { ActionButtons } from './components/ActionButtons';
import { DebugInfo } from './components/DebugInfo';

/**
 * REFACTORED: Demand Matrix Controls Fixed Component
 * 
 * REFACTORING IMPROVEMENTS:
 * - Broken down into focused, reusable components
 * - Extracted hooks for state management and data processing
 * - Improved maintainability through modular structure
 * - Enhanced type safety with dedicated interfaces
 * - Better separation of concerns
 * 
 * PRESERVED FUNCTIONALITY:
 * - Exact same UI layout and styling
 * - Identical filter behavior and state management
 * - Same validation and error handling
 * - Preserved debugging capabilities
 * - All user interactions work exactly the same
 * - No changes to business logic or data processing
 */
export const DemandMatrixControlsFixedRefactored: React.FC<DemandMatrixControlsFixedProps> = ({
  demandData,
  isLoading = false,
  onExport,
  groupingMode = 'skill'
}) => {
  // UI state - preserved from original
  const [isControlsExpanded, setIsControlsExpanded] = useState(true);
  
  // Filter state management - extracted to hook
  const {
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    preferredStaffFilterMode,
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle,
    setMonthRange,
    setPreferredStaffFilterMode,
    handleReset
  } = useFilterState();

  // Available options extraction - extracted to hook
  const {
    availableSkills,
    availableClients,
    availablePreferredStaff
  } = useAvailableOptions(demandData);

  // Selection states - preserved exact logic
  const isAllSkillsSelected = selectedSkills.length === 0 || selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = selectedClients.length === 0 || selectedClients.length === availableClients.length;
  const isAllPreferredStaffSelected = selectedPreferredStaff.length === 0 || selectedPreferredStaff.length === availablePreferredStaff.length;

  // Filtering - preserved exact implementation
  const filteredData = useDemandMatrixFilteringFixed({
    demandData,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode
  });

  // Validation - preserved exact implementation
  const validationResult = React.useMemo(() => {
    if (!demandData) return null;
    return FilteringValidationService.validateDataStructure(demandData);
  }, [demandData]);

  // Loading state - preserved exact behavior
  if (isLoading) {
    return (
      <Card className="h-fit">
        <ControlsHeader 
          isControlsExpanded={true}
          onToggleControls={() => {}}
        />
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <ControlsHeader
        isControlsExpanded={isControlsExpanded}
        onToggleControls={() => setIsControlsExpanded(!isControlsExpanded)}
        filteredDataPointsCount={filteredData?.dataPoints.length}
        totalDemand={filteredData?.totalDemand}
      />

      {isControlsExpanded && (
        <CardContent className="space-y-6">
          {/* Validation Status */}
          <ValidationStatus validationResult={validationResult} />

          {/* Month Range - preserved exact component usage */}
          <MonthRangeSelector
            monthRange={monthRange}
            onMonthRangeChange={setMonthRange}
          />

          {/* Skills Filter - preserved exact component usage */}
          <SkillsFilterSection
            selectedSkills={selectedSkills}
            onSkillToggle={handleSkillToggle}
            availableSkills={availableSkills}
            isAllSelected={isAllSkillsSelected}
          />

          {/* Clients Filter - preserved exact component usage */}
          <ClientsFilterSection
            selectedClients={selectedClients}
            onClientToggle={handleClientToggle}
            availableClients={availableClients}
            isAllSelected={isAllClientsSelected}
          />

          {/* Preferred Staff Filter - preserved exact component usage */}
          <PreferredStaffFilterSection
            selectedPreferredStaff={selectedPreferredStaff}
            onPreferredStaffToggle={handlePreferredStaffToggle}
            availablePreferredStaff={availablePreferredStaff}
            isAllSelected={isAllPreferredStaffSelected}
            filterMode={preferredStaffFilterMode}
            onFilterModeChange={setPreferredStaffFilterMode}
          />

          {/* Action Buttons */}
          <ActionButtons
            onReset={handleReset}
            onExport={onExport}
            preferredStaffFilterMode={preferredStaffFilterMode}
            selectedPreferredStaffCount={selectedPreferredStaff.length}
            filteredDataPointsCount={filteredData?.dataPoints.length || 0}
          />

          {/* Debug Info */}
          <DebugInfo
            filteredData={filteredData}
            preferredStaffFilterMode={preferredStaffFilterMode}
            selectedPreferredStaffCount={selectedPreferredStaff.length}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default DemandMatrixControlsFixedRefactored;
