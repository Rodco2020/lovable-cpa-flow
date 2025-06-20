
import React from 'react';
import { Card } from '@/components/ui/card';
import { ControlsPanelHeader } from './components/ControlsPanelHeader';
import { ExpandableControlsContent } from './components/ExpandableControlsContent';

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (clientId: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  // Phase 4: Enhanced props for three-mode filtering export
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  preferredStaffLoading?: boolean;
}

/**
 * Refactored Demand Matrix Controls Panel
 * 
 * REFACTORING IMPROVEMENTS:
 * - Separated header and content into focused components
 * - Extracted action buttons logic into dedicated component
 * - Created reusable time range controls component
 * - Improved code organization and maintainability
 * - Better separation of concerns
 * 
 * PRESERVED FUNCTIONALITY:
 * - Exact same UI layout and styling
 * - All Phase 4 enhancements with three-mode filtering export
 * - Complete loading state handling
 * - All existing prop interfaces
 * - Enhanced export functionality
 * - Reset filters functionality
 * - Responsive expand/collapse behavior
 */
export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = (props) => {
  const {
    isControlsExpanded,
    onToggleControls,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    onSkillToggle,
    onClientToggle,
    onPreferredStaffToggle,
    monthRange,
    onMonthRangeChange,
    onExport,
    onReset,
    groupingMode,
    availableSkills,
    availableClients,
    availablePreferredStaff,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode,
    onPreferredStaffFilterModeChange,
    preferredStaffLoading = false
  } = props;

  return (
    <Card className="h-fit">
      <ControlsPanelHeader
        isControlsExpanded={isControlsExpanded}
        onToggleControls={onToggleControls}
      />

      {isControlsExpanded && (
        <ExpandableControlsContent
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          selectedSkills={selectedSkills}
          onSkillToggle={onSkillToggle}
          availableSkills={availableSkills}
          isAllSkillsSelected={isAllSkillsSelected}
          selectedClients={selectedClients}
          onClientToggle={onClientToggle}
          availableClients={availableClients}
          isAllClientsSelected={isAllClientsSelected}
          selectedPreferredStaff={selectedPreferredStaff}
          onPreferredStaffToggle={onPreferredStaffToggle}
          availablePreferredStaff={availablePreferredStaff}
          isAllPreferredStaffSelected={isAllPreferredStaffSelected}
          preferredStaffFilterMode={preferredStaffFilterMode}
          onPreferredStaffFilterModeChange={onPreferredStaffFilterModeChange}
          preferredStaffLoading={preferredStaffLoading}
          onExport={onExport}
          onReset={onReset}
          groupingMode={groupingMode}
        />
      )}
    </Card>
  );
};

export default DemandMatrixControlsPanel;
