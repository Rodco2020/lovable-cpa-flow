
/**
 * Grand Total Row Component for Demand Matrix
 * 
 * Renders the grand total row for client grouping mode
 */

import React from 'react';
import { GrandTotals } from '../utils/gridCalculationUtils';
import { 
  formatHoursDisplay, 
  formatCurrencyDisplay, 
  formatRateDisplay, 
  formatDifferenceDisplay 
} from '../utils/gridFormattingUtils';
import { getExpectedLessSuggestedCellColorClass } from '../utils/gridStyleUtils';

interface GrandTotalRowProps {
  grandTotals: GrandTotals;
  monthsCount: number;
}

export const GrandTotalRow: React.FC<GrandTotalRowProps> = ({ grandTotals, monthsCount }) => {
  const expectedLessSuggestedColorClass = getExpectedLessSuggestedCellColorClass(grandTotals.grandTotalExpectedLessSuggested);

  return (
    <>
      {/* Grand Total Hours */}
      <div
        className="p-3 bg-slate-100 border border-l-2 border-slate-400 text-center text-sm font-bold text-slate-800"
        style={{ gridColumnStart: monthsCount + 2 }}
        role="gridcell"
        aria-label={`Grand total hours: ${formatHoursDisplay(grandTotals.grandTotalHours)}`}
      >
        {formatHoursDisplay(grandTotals.grandTotalHours)}
      </div>
      
      {/* Grand Total Revenue */}
      <div
        className="p-3 bg-green-100 border border-l-2 border-green-400 text-center text-sm font-bold text-green-800"
        role="gridcell"
        aria-label={`Grand total expected revenue: ${formatCurrencyDisplay(grandTotals.grandTotalRevenue)}`}
      >
        {formatCurrencyDisplay(grandTotals.grandTotalRevenue)}
      </div>
      
      {/* Weighted Average Rate */}
      <div
        className="p-3 bg-purple-100 border border-l-2 border-purple-400 text-center text-sm font-bold text-purple-800"
        role="gridcell"
        aria-label={`Weighted average rate: ${formatRateDisplay(grandTotals.grandAverageRate)}`}
      >
        {formatRateDisplay(grandTotals.grandAverageRate)}
      </div>

      {/* Grand Total Suggested Revenue */}
      <div
        className="p-3 bg-emerald-100 border border-l-2 border-emerald-400 text-center text-sm font-bold text-emerald-800"
        role="gridcell"
        aria-label={`Grand total suggested revenue: ${formatCurrencyDisplay(grandTotals.grandTotalSuggestedRevenue)}`}
        title={`Total suggested revenue across all clients: ${formatCurrencyDisplay(grandTotals.grandTotalSuggestedRevenue)}`}
      >
        {formatCurrencyDisplay(grandTotals.grandTotalSuggestedRevenue)}
      </div>

      {/* Grand Total Expected Less Suggested */}
      <div
        className={`p-3 border border-l-2 border-amber-400 text-center text-sm font-bold ${expectedLessSuggestedColorClass}`}
        role="gridcell"
        aria-label={`Grand total expected less suggested: ${formatDifferenceDisplay(grandTotals.grandTotalExpectedLessSuggested)}`}
        title={`Total difference between expected and suggested revenue: ${formatDifferenceDisplay(grandTotals.grandTotalExpectedLessSuggested)}`}
      >
        {formatDifferenceDisplay(grandTotals.grandTotalExpectedLessSuggested)}
      </div>
    </>
  );
};
