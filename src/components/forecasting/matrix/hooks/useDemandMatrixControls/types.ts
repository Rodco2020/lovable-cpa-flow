
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

export interface DemandMatrixControlsState {
  selectedSkills: SkillType[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
  selectedPreferredStaff: string[];
}

export interface UseDemandMatrixControlsProps {
  demandData?: DemandMatrixData | null;
  groupingMode: 'skill' | 'client';
}

export interface UseDemandMatrixControlsResult extends DemandMatrixControlsState {
  handleSkillToggle: (skill: SkillType) => void;
  handleClientToggle: (clientId: string) => void;
  handleMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  handleReset: () => void;
  handleExport: () => void;
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  skillsLoading: boolean;
  clientsLoading: boolean;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  handlePreferredStaffToggle: (staffId: string) => void;
  availablePreferredStaff: Array<{ id: string; name: string; roleTitle?: string }>;
  preferredStaffLoading: boolean;
  preferredStaffError: Error | null;
  isAllPreferredStaffSelected: boolean;
  refetchPreferredStaff: () => void;
}
