
import { DemandMatrixData } from '@/types/demand';

/**
 * Type definitions for the useDemandMatrixFiltering hook
 */

export interface FilteredDataResult {
  getFilteredData: () => DemandMatrixData | null;
}

export interface UseDemandMatrixFilteringProps {
  demandData: DemandMatrixData | null;
  demandMatrixControls: any;
  groupingMode: 'skill' | 'client';
}

export interface UseDemandMatrixFilteringResult {
  getFilteredData: () => DemandMatrixData | null;
}

export interface MonthRangeValidation {
  start: number;
  end: number;
}

export interface TimeHorizonResult {
  start: Date;
  end: Date;
}

export interface DiagnosticsData {
  originalData: DemandMatrixData;
  filters: any;
  filteredMonths: Array<{ key: string; label: string }>;
}

export interface FallbackDataset {
  months: Array<{ key: string; label: string }>;
  dataPoints: any[];
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
}
