
import React from 'react';
import { IntegratedMatrixControls } from '../../IntegratedMatrixControls';
import { SkillType } from '@/types/task';

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: SkillType) => void;
  onClientToggle: (client: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  onPrintExport?: () => void;
}

/**
 * Refactored DemandMatrixControlsPanel
 * 
 * Now uses the modular IntegratedMatrixControls component
 * for improved maintainability and consistency
 */
export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = (props) => {
  return (
    <IntegratedMatrixControls
      selectedSkills={props.selectedSkills}
      onSkillToggle={props.onSkillToggle}
      availableSkills={props.availableSkills}
      isAllSkillsSelected={props.isAllSkillsSelected}
      selectedClients={props.selectedClients}
      onClientToggle={props.onClientToggle}
      availableClients={props.availableClients}
      isAllClientsSelected={props.isAllClientsSelected}
      selectedPreferredStaff={props.selectedPreferredStaff}
      onPreferredStaffToggle={props.onPreferredStaffToggle}
      availablePreferredStaff={props.availablePreferredStaff}
      isAllPreferredStaffSelected={props.isAllPreferredStaffSelected}
      monthRange={props.monthRange}
      onMonthRangeChange={props.onMonthRangeChange}
      isControlsExpanded={props.isControlsExpanded}
      onToggleControls={props.onToggleControls}
      groupingMode={props.groupingMode}
      onExport={props.onExport}
      onReset={props.onReset}
      onPrintExport={props.onPrintExport}
    />
  );
};
