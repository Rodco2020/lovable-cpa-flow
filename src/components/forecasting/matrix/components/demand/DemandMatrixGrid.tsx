
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixCell } from './DemandMatrixCell';
import { GridHeader } from './components/GridHeader';
import { ClientSummaryRow } from './components/ClientSummaryRow';
import { GrandTotalRow } from './components/GrandTotalRow';
import { 
  getAggregatedDataForClient, 
  getDataPointForSkill
} from './utils/gridDataUtils';
import { getClientValues } from './utils/gridCalculationUtils';
import { getRowLabelSync, calculateGridTemplateRows, logMatrixRendering } from './utils/gridLayoutUtils';
import { useDemandMatrixGrid } from './hooks/useDemandMatrixGrid';

interface DemandMatrixGridProps {
  filteredData: DemandMatrixData;
  groupingMode: 'skill' | 'client';
}

/**
 * DemandMatrixGrid Component - Refactored for Enhanced Maintainability
 * 
 * This component renders the demand matrix grid with support for both skill and client grouping modes.
 * It has been further refactored to improve maintainability, testability, and separation of concerns.
 * 
 * Key features:
 * - Dual grouping modes (skill/client) with different data aggregation
 * - Client-specific revenue calculations and totals
 * - Color-coded cells based on values
 * - Grand total calculations for client mode
 * - Responsive grid layout with proper accessibility
 * 
 * The refactoring improvements:
 * - Extracted complex logic into custom hooks
 * - Created focused utility functions for layout calculations
 * - Improved separation of concerns for better testability
 * - Enhanced code organization and maintainability
 * - Preserved exact functionality and UI appearance
 */
export const DemandMatrixGrid: React.FC<DemandMatrixGridProps> = ({
  filteredData,
  groupingMode
}) => {
  // Use custom hook for grid logic and calculations
  const {
    rowItems,
    gridTemplateColumns,
    grandTotals,
    additionalRows,
    clientTotals,
    clientRevenue,
    clientHourlyRates,
    clientSuggestedRevenue,
    clientExpectedLessSuggested
  } = useDemandMatrixGrid({ filteredData, groupingMode });

  // Log rendering information for debugging
  logMatrixRendering(groupingMode, rowItems.length, filteredData.months.length);

  return (
    <div className="overflow-x-auto">
      <div 
        className="grid gap-1 min-w-fit"
        style={{
          gridTemplateColumns,
          gridTemplateRows: calculateGridTemplateRows(rowItems.length, additionalRows)
        }}
      >
        {/* Grid Headers */}
        <GridHeader groupingMode={groupingMode} months={filteredData.months} />
        
        {/* Skill/Client rows */}
        {rowItems.map((skillOrClient) => (
          <React.Fragment key={skillOrClient}>
            {/* Row label */}
            <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
              <div className="truncate" title={getRowLabelSync(skillOrClient)}>
                {getRowLabelSync(skillOrClient)}
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
