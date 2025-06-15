
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixCell } from './DemandMatrixCell';
import { GridHeader } from './components/GridHeader';
import { ClientSummaryRow } from './components/ClientSummaryRow';
import { GrandTotalRow } from './components/GrandTotalRow';
import { 
  getAggregatedDataForClient, 
  getDataPointForSkill, 
  getUniqueClientsFromData 
} from './utils/gridDataUtils';
import { calculateGrandTotals, getClientValues } from './utils/gridCalculationUtils';

interface DemandMatrixGridProps {
  filteredData: DemandMatrixData;
  groupingMode: 'skill' | 'client';
}

/**
 * DemandMatrixGrid Component - Refactored for Maintainability
 * 
 * This component renders the demand matrix grid with support for both skill and client grouping modes.
 * It has been refactored into smaller, focused utilities and components while maintaining
 * exact functionality and UI appearance.
 * 
 * Key features:
 * - Dual grouping modes (skill/client) with different data aggregation
 * - Client-specific revenue calculations and totals
 * - Color-coded cells based on values
 * - Grand total calculations for client mode
 * - Responsive grid layout with proper accessibility
 * 
 * The refactoring improves:
 * - Code organization and maintainability
 * - Separation of concerns
 * - Testability of individual functions
 * - Reusability of utility functions
 */
export const DemandMatrixGrid: React.FC<DemandMatrixGridProps> = ({
  filteredData,
  groupingMode
}) => {
  const getRowLabel = (skillOrClient: string) => {
    // For both skill and client modes, the value is already the display name
    return skillOrClient;
  };

  // Determine the row items based on grouping mode
  const rowItems = groupingMode === 'client' ? getUniqueClientsFromData(filteredData) : filteredData.skills;

  console.log(`🎯 [MATRIX GRID] Rendering ${groupingMode} matrix with ${rowItems.length} ${groupingMode}s and ${filteredData.months.length} months`);

  // Calculate grid columns - add revenue columns for client mode (5 total columns)
  const extraColumnsCount = groupingMode === 'client' ? 5 : 0;
  const gridTemplateColumns = `180px repeat(${filteredData.months.length}, minmax(120px, 1fr))${
    groupingMode === 'client' ? ' repeat(5, minmax(140px, 1fr))' : ''
  }`;

  // Revenue data maps for client grouping mode
  const clientTotals = filteredData.clientTotals || new Map<string, number>();
  const clientRevenue = filteredData.clientRevenue || new Map<string, number>();
  const clientHourlyRates = filteredData.clientHourlyRates || new Map<string, number>();
  const clientSuggestedRevenue = filteredData.clientSuggestedRevenue || new Map<string, number>();
  const clientExpectedLessSuggested = filteredData.clientExpectedLessSuggested || new Map<string, number>();

  // Calculate grand totals for client mode
  const grandTotals = groupingMode === 'client' 
    ? calculateGrandTotals(clientTotals, clientRevenue, clientSuggestedRevenue, clientExpectedLessSuggested)
    : null;

  const additionalRows = groupingMode === 'client' && rowItems.length > 0 ? 1 : 0;

  return (
    <div className="overflow-x-auto">
      <div 
        className="grid gap-1 min-w-fit"
        style={{
          gridTemplateColumns,
          gridTemplateRows: `auto repeat(${rowItems.length + additionalRows}, auto)`
        }}
      >
        {/* Grid Headers */}
        <GridHeader groupingMode={groupingMode} months={filteredData.months} />
        
        {/* Skill/Client rows */}
        {rowItems.map((skillOrClient) => (
          <React.Fragment key={skillOrClient}>
            {/* Row label */}
            <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
              <div className="truncate" title={getRowLabel(skillOrClient)}>
                {getRowLabel(skillOrClient)}
              </div>
            </div>

            {/* Demand cells for each month */}
            {filteredData.months.map((month) => {
              let cellData;

              if (groupingMode === 'client') {
                cellData = getAggregatedDataForClient(skillOrClient, month.key, filteredData);
              } else {
                cellData = getDataPointForSkill(skillOrClient, month.key, filteredData);
              }

              return (
                <DemandMatrixCell
                  key={`${skillOrClient}-${month.key}`}
                  skillOrClient={skillOrClient}
                  month={month.key}
                  monthLabel={month.label}
                  demandHours={cellData.demandHours}
                  taskCount={cellData.taskCount}
                  clientCount={cellData.clientCount}
                  taskBreakdown={cellData.taskBreakdown}
                  groupingMode={groupingMode}
                />
              );
            })}

            {/* Revenue summary cells for client mode */}
            {groupingMode === 'client' && (() => {
              const clientValues = getClientValues(
                skillOrClient,
                clientTotals,
                clientRevenue,
                clientHourlyRates,
                clientSuggestedRevenue,
                clientExpectedLessSuggested
              );
              
              return (
                <ClientSummaryRow
                  key={`${skillOrClient}-summary`}
                  clientName={skillOrClient}
                  totalHours={clientValues.totalHours}
                  totalRevenue={clientValues.totalRevenue}
                  hourlyRate={clientValues.hourlyRate}
                  suggestedRevenue={clientValues.suggestedRevenue}
                  expectedLessSuggested={clientValues.expectedLessSuggested}
                />
              );
            })()}
          </React.Fragment>
        ))}

        {/* Grand total cells for client mode */}
        {groupingMode === 'client' && rowItems.length > 0 && grandTotals && (
          <GrandTotalRow 
            grandTotals={grandTotals} 
            monthsCount={filteredData.months.length} 
          />
        )}
      </div>
    </div>
  );
};
