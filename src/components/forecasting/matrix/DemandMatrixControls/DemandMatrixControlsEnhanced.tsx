
import React from 'react';
import { DemandMatrixControlsProps } from './types';
import { PreferredStaffFilterEnhanced } from '../components/demand/components/PreferredStaffFilterEnhanced';
import { SkillsFilterEnhanced } from './components/SkillsFilterEnhanced';
import {
  PhaseIndicator,
  ActionButtons,
  ClientsFilter,
  FilterSection
} from './components';

/**
 * Phase 3: Enhanced DemandMatrixControls Component
 * 
 * PHASE 3 ENHANCEMENTS:
 * - Enhanced skill filtering with resolved skill names
 * - Improved filter validation and compatibility checking  
 * - Performance optimizations for large datasets
 * - Enhanced error handling and user feedback
 * - Backward compatibility with existing filter logic
 * - Better integration with skill resolution service
 */
export const DemandMatrixControlsEnhanced: React.FC<DemandMatrixControlsProps & {
  onRetrySkills?: () => void;
  skillsError?: string | null;
}> = ({
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
  preferredStaffLoading = false,
  onRetrySkills,
  skillsError = null
}) => {
  console.log('🎛️ [PHASE 3 CONTROLS] Enhanced DemandMatrixControls rendering:', {
    availableSkillsCount: availableSkills.length,
    selectedSkillsCount: selectedSkills.length,
    skillsLoading,
    skillsError: !!skillsError,
    hasRetryFunction: !!onRetrySkills
  });

  return (
    <div className="space-y-4">
      {/* Phase 3 Status Indicator - Enhanced */}
      <PhaseIndicator />

      {/* Action Buttons - Enhanced with retry functionality */}
      <ActionButtons
        onReset={onReset}
        onExport={onExport}
        onManualRefresh={onManualRefresh}
        loading={skillsLoading || clientsLoading || preferredStaffLoading}
      />

      {/* Phase 3: Enhanced Skills Filter with resolution support */}
      <SkillsFilterEnhanced
        availableSkills={availableSkills}
        selectedSkills={selectedSkills}
        onSkillToggle={onSkillToggle}
        isAllSkillsSelected={isAllSkillsSelected}
        loading={skillsLoading}
        error={skillsError}
        onRetrySkills={onRetrySkills}
      />

      {/* Clients Filter - Enhanced compatibility */}
      <ClientsFilter
        availableClients={availableClients}
        selectedClients={selectedClients}
        onClientToggle={onClientToggle}
        isAllClientsSelected={isAllClientsSelected}
        loading={clientsLoading}
      />

      {/* Phase 3: Enhanced Preferred Staff Filter with three-mode system */}
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

export default DemandMatrixControlsEnhanced;
