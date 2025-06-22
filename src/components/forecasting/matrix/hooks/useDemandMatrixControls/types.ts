
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

/**
 * Configuration props for the demand matrix controls hook
 */
export interface UseDemandMatrixControlsProps {
  groupingMode: 'skill' | 'client';
  enablePreferredStaffFiltering?: boolean;
}

/**
 * State management interface for matrix controls
 */
export interface DemandMatrixControlsState {
  monthRange: { start: number; end: number };
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}

/**
 * Available options extracted from data
 */
export interface AvailableOptions {
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
}

/**
 * Selection state flags
 */
export interface SelectionStates {
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
}

/**
 * Event handlers for user interactions
 */
export interface ControlsEventHandlers {
  onSkillToggle: (skill: SkillType) => void;
  onClientToggle: (clientId: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  onRefresh: () => void;
}

/**
 * Complete return interface for the hook
 */
export interface UseDemandMatrixControlsResult {
  // Data
  demandData: DemandMatrixData | null;
  isLoading: boolean;
  error: string | null;
  
  // Available options
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  
  // Current selections
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  
  // Selection states
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  
  // Event handlers
  onSkillToggle: (skill: SkillType) => void;
  onClientToggle: (clientId: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  onRefresh: () => void;
}
