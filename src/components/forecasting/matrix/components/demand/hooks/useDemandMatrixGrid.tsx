
import { useMemo } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { getUniqueClientsFromData } from '../utils/gridDataUtils';
import { calculateGrandTotals } from '../utils/gridCalculationUtils';

interface UseDemandMatrixGridProps {
  filteredData: DemandMatrixData;
  groupingMode: 'skill' | 'client';
  selectedClients?: string[]; // Add optional selectedClients parameter
}

interface UseDemandMatrixGridReturn {
  rowItems: string[];
  gridTemplateColumns: string;
  grandTotals: ReturnType<typeof calculateGrandTotals> | null;
  additionalRows: number;
  clientTotals: Map<string, number>;
  clientRevenue: Map<string, number>;
  clientHourlyRates: Map<string, number>;
  clientSuggestedRevenue: Map<string, number>;
  clientExpectedLessSuggested: Map<string, number>;
}

/**
 * Custom hook for DemandMatrixGrid logic and calculations
 * 
 * Handles:
 * - Row items determination based on grouping mode
 * - Grid layout calculations
 * - Grand totals computation for client mode
 * - Revenue data maps extraction
 */
export const useDemandMatrixGrid = ({
  filteredData,
  groupingMode,
  selectedClients
}: UseDemandMatrixGridProps): UseDemandMatrixGridReturn => {
  // Determine row items based on grouping mode
  const rowItems = useMemo(() => {
    return groupingMode === 'client' 
      ? getUniqueClientsFromData(filteredData, selectedClients) 
      : filteredData.skills;
  }, [groupingMode, filteredData, selectedClients]);

  // Calculate grid template columns
  const gridTemplateColumns = useMemo(() => {
    const extraColumnsCount = groupingMode === 'client' ? 5 : 0;
    return `180px repeat(${filteredData.months.length}, minmax(120px, 1fr))${
      groupingMode === 'client' ? ' repeat(5, minmax(140px, 1fr))' : ''
    }`;
  }, [groupingMode, filteredData.months.length]);

  // Extract revenue data maps with defaults
  const clientTotals = filteredData.clientTotals || new Map<string, number>();
  const clientRevenue = filteredData.clientRevenue || new Map<string, number>();
  const clientHourlyRates = filteredData.clientHourlyRates || new Map<string, number>();
  const clientSuggestedRevenue = filteredData.clientSuggestedRevenue || new Map<string, number>();
  const clientExpectedLessSuggested = filteredData.clientExpectedLessSuggested || new Map<string, number>();

  // Calculate grand totals for client mode
  const grandTotals = useMemo(() => {
    return groupingMode === 'client' 
      ? calculateGrandTotals(clientTotals, clientRevenue, clientSuggestedRevenue, clientExpectedLessSuggested)
      : null;
  }, [groupingMode, clientTotals, clientRevenue, clientSuggestedRevenue, clientExpectedLessSuggested]);

  const additionalRows = groupingMode === 'client' && rowItems.length > 0 ? 1 : 0;

  return {
    rowItems,
    gridTemplateColumns,
    grandTotals,
    additionalRows,
    clientTotals,
    clientRevenue,
    clientHourlyRates,
    clientSuggestedRevenue,
    clientExpectedLessSuggested
  };
};
