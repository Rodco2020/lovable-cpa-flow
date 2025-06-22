
import { DemandMatrixData } from '@/types/demand';

export interface DemandMatrixControlsFixedProps {
  demandData: DemandMatrixData | null;
  isLoading?: boolean;
  onExport?: () => void;
  groupingMode?: 'skill' | 'client';
}

export interface FilterState {
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}

export interface AvailableOptions {
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
}
