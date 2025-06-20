
/**
 * Type definitions for DemandMatrixControlsPanel
 * 
 * CURRENT FUNCTIONALITY DOCUMENTATION:
 * - Collapsible controls panel with toggle functionality
 * - Time range selection with month range selector
 * - Skills filtering with multi-select checkboxes
 * - Clients filtering with multi-select checkboxes  
 * - Three-mode preferred staff filtering (all/specific/none)
 * - Enhanced export functionality with filtering context
 * - Reset filters functionality
 * - Loading states for all filter sections
 * - Badge counters showing selection counts
 * - Responsive design with expand/collapse on mobile
 */

export interface DemandMatrixControlsPanelProps {
  // Core panel state
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  
  // Skills filtering
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  availableSkills: string[];
  isAllSkillsSelected: boolean;
  
  // Clients filtering
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  availableClients: Array<{ id: string; name: string }>;
  isAllClientsSelected: boolean;
  
  // Preferred staff filtering (three-mode system)
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  preferredStaffLoading?: boolean;
  
  // Time controls
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  
  // Actions
  onExport: () => void;
  onReset: () => void;
  
  // Configuration
  groupingMode: 'skill' | 'client';
}

export interface ControlsPanelHeaderProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
}

export interface TimeRangeControlsProps {
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
}

export interface ActionButtonsProps {
  onExport: (exportConfig: any) => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}
