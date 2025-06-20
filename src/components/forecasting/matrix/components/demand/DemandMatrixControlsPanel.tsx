
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
  // Convert SkillType[] to string[] - handle both string and object types safely
  const selectedSkillsAsStrings = props.selectedSkills.map(skill => {
    if (typeof skill === 'string') {
      return skill;
    }
    // Handle case where skill might be an object with a name property
    if (skill && typeof skill === 'object' && 'name' in skill) {
      return (skill as any).name;
    }
    // Fallback to string conversion
    return String(skill);
  });
  
  const availableSkillsAsStrings = props.availableSkills.map(skill => {
    if (typeof skill === 'string') {
      return skill;
    }
    // Handle case where skill might be an object with a name property
    if (skill && typeof skill === 'object' && 'name' in skill) {
      return (skill as any).name;
    }
    // Fallback to string conversion
    return String(skill);
  });
  
  const handleSkillToggle = (skill: string) => {
    // Find the original SkillType that matches this string
    const originalSkill = props.availableSkills.find(s => {
      if (typeof s === 'string') {
        return s === skill;
      }
      // Handle case where skill might be an object with a name property
      if (s && typeof s === 'object' && 'name' in s) {
        return (s as any).name === skill;
      }
      // Fallback to string conversion
      return String(s) === skill;
    });
    
    if (originalSkill) {
      props.onSkillToggle(originalSkill);
    }
  };

  return (
    <IntegratedMatrixControls
      selectedSkills={selectedSkillsAsStrings}
      onSkillToggle={handleSkillToggle}
      availableSkills={availableSkillsAsStrings}
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
