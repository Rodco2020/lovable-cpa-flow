
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

export interface DiagnosticsData {
  filteringSteps: string[];
  performanceMetrics: {
    startTime: number;
    endTime: number;
    duration: number;
  };
  dataStats: {
    originalDataPoints: number;
    filteredDataPoints: number;
    filterEfficiency: number;
  };
}

export interface FallbackDataset {
  isEmpty: boolean;
  reason: string;
  fallbackData: DemandMatrixData | null;
}
