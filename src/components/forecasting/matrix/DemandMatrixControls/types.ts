
import { SkillType } from '@/types/task';

/**
 * Type definitions for DemandMatrixControls
 * Preserves all existing prop interfaces for backward compatibility
 */
export interface DemandMatrixControlsProps {
  // Skill controls
  availableSkills: SkillType[];
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  isAllSkillsSelected: boolean;

  // Client controls
  availableClients: Array<{ id: string; name: string }>;
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  isAllClientsSelected: boolean;

  // Phase 3: Enhanced preferred staff controls with three-mode system
  availablePreferredStaff: Array<{ id: string; name: string }>;
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;

  // Actions
  onReset: () => void;
  onExport: () => void;
  onManualRefresh?: () => void;

  // Loading states
  skillsLoading?: boolean;
  clientsLoading?: boolean;
  preferredStaffLoading?: boolean;
}

export interface FilterSectionProps {
  title: string;
  badge: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}
