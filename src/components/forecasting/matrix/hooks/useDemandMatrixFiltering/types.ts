
import { DemandMatrixData } from '@/types/demand';

export interface UseDemandMatrixFilteringProps {
  demandData?: DemandMatrixData | null;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

export interface FilteredDataResult {
  data: DemandMatrixData | null;
}

export interface UseDemandMatrixFilteringResult {
  getFilteredData: () => DemandMatrixData | null;
}
