

import { SkillType } from '@/types/task';

/**
 * Type definitions for IntegratedMatrixControls
 * Updated to match DemandMatrixControlsPanel prop requirements
 */
export interface IntegratedMatrixControlsProps {
  // Skills controls - updated to match actual usage
  selectedSkills: string[]; // Changed from SkillType[] to string[]
  onSkillToggle: (skill: string) => void; // Changed from SkillType to string
  availableSkills: string[]; // Changed from SkillType[] to string[]
  isAllSkillsSelected: boolean;

  // Client controls
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  availableClients: Array<{ id: string; name: string }>;
  isAllClientsSelected: boolean;

  // Preferred staff controls
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllPreferredStaffSelected: boolean;

  // Time controls
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;

  // View controls
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  groupingMode: 'skill' | 'client';

  // Actions
  onExport: () => void;
  onReset: () => void;
  onPrintExport?: () => void;

  // Loading states
  skillsLoading?: boolean;
  clientsLoading?: boolean;
  preferredStaffLoading?: boolean;
}

export interface TimeRangeControlsProps {
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  isExpanded: boolean;
}

export interface FilterControlsProps {
  selectedSkills: string[]; // Updated to match
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void; // Updated to match
  onClientToggle: (clientId: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  availableSkills: string[]; // Updated to match
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  isExpanded: boolean;
}

export interface ControlHeaderProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  onReset: () => void;
}

