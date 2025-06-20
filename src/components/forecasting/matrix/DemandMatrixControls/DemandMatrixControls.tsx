
import React from 'react';
import { DemandMatrixControlsProps } from './types';
import { PreferredStaffFilterEnhanced } from '../components/demand/components/PreferredStaffFilterEnhanced';
import {
  PhaseIndicator,
  ActionButtons,
  SkillsFilter,
  ClientsFilter,
  FilterSection
} from './components';

/**
 * Refactored DemandMatrixControls Component
 * 
 * REFACTORING IMPROVEMENTS:
 * - Modular component structure for better maintainability
 * - Extracted reusable hooks for common logic
 * - Consistent prop interfaces and error handling
 * - Better separation of concerns
 * - Preserved exact UI and functionality
 * 
 * PRESERVED FUNCTIONALITY:
 * - All Phase 3 enhancements with visual indicators
 * - Three-mode preferred staff filtering system
 * - Exact same UI layout and styling
 * - All existing prop interfaces
 * - Complete loading state handling
 * - All accessibility features
 */
export const DemandMatrixControls: React.FC<DemandMatrixControlsProps> = ({
  availableSkills,
  selectedSkills,
  onSkillToggle,
  isAllSkillsSelected,
  availableClients,
  selectedClients,
  onClientToggle,
  isAllClientsSelected,
  availablePreferredStaff,
  selectedPreferredStaff,
  onPreferredStaffToggle,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode,
  onPreferredStaffFilterModeChange,
  onReset,
  onExport,
  onManualRefresh,
  skillsLoading = false,
  clientsLoading = false,
  preferredStaffLoading = false
}) => {
  return (
    <div className="space-y-4">
      {/* Phase 3 Status Indicator - Preserved exactly */}
      <PhaseIndicator />

      {/* Action Buttons - Refactored into component */}
      <ActionButtons
        onReset={onReset}
        onExport={onExport}
        onManualRefresh={onManualRefresh}
        loading={preferredStaffLoading}
      />

      {/* Skills Filter - Refactored into component */}
      <SkillsFilter
        availableSkills={availableSkills}
        selectedSkills={selectedSkills}
        onSkillToggle={onSkillToggle}
        isAllSkillsSelected={isAllSkillsSelected}
        loading={skillsLoading}
      />

      {/* Clients Filter - Refactored into component */}
      <ClientsFilter
        availableClients={availableClients}
        selectedClients={selectedClients}
        onClientToggle={onClientToggle}
        isAllClientsSelected={isAllClientsSelected}
        loading={clientsLoading}
      />

      {/* Phase 3: Enhanced Preferred Staff Filter - Preserved exactly */}
      <FilterSection
        title=""
        badge=""
        loading={preferredStaffLoading}
      >
        {!preferredStaffLoading && (
          <PreferredStaffFilterEnhanced
            availablePreferredStaff={availablePreferredStaff}
            selectedPreferredStaff={selectedPreferredStaff}
            onPreferredStaffToggle={onPreferredStaffToggle}
            preferredStaffFilterMode={preferredStaffFilterMode}
            onPreferredStaffFilterModeChange={onPreferredStaffFilterModeChange}
          />
        )}
      </FilterSection>
    </div>
  );
};

export default DemandMatrixControls;
