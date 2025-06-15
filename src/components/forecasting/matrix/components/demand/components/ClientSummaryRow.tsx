
/**
 * Client Summary Row Component for Demand Matrix
 * 
 * Renders the revenue summary cells for each client in client grouping mode
 */

import React from 'react';
import { 
  formatHoursDisplay, 
  formatCurrencyDisplay, 
  formatRateDisplay, 
  formatDifferenceDisplay 
} from '../utils/gridFormattingUtils';
import { 
  getHoursCellColorClass,
  getRevenueCellColorClass,
  getRateCellColorClass,
  getSuggestedRevenueCellColorClass,
  getExpectedLessSuggestedCellColorClass
} from '../utils/gridStyleUtils';

interface ClientSummaryRowProps {
  clientName: string;
  totalHours: number;
  totalRevenue: number;
  hourlyRate: number;
  suggestedRevenue: number;
  expectedLessSuggested: number;
}

export const ClientSummaryRow: React.FC<ClientSummaryRowProps> = ({
  clientName,
  totalHours,
  totalRevenue,
  hourlyRate,
  suggestedRevenue,
  expectedLessSuggested
}) => {
  const hoursColorClass = getHoursCellColorClass(totalHours);
  const revenueColorClass = getRevenueCellColorClass(totalRevenue);
  const rateColorClass = getRateCellColorClass(hourlyRate);
  const suggestedRevenueColorClass = getSuggestedRevenueCellColorClass(suggestedRevenue);
  const expectedLessSuggestedColorClass = getExpectedLessSuggestedCellColorClass(expectedLessSuggested);

  return (
    <>
      {/* Total Hours */}
      <div
        className={`p-3 border text-center text-sm font-medium border-l-2 border-slate-300 ${hoursColorClass}`}
        title={`Total: ${formatHoursDisplay(totalHours)} for ${clientName}`}
        role="gridcell"
        aria-label={`Total hours: ${formatHoursDisplay(totalHours)} for ${clientName}`}
      >
        {formatHoursDisplay(totalHours)}
      </div>
      
      {/* Total Expected Revenue */}
      <div
        className={`p-3 border text-center text-sm font-medium border-l-2 border-green-300 ${revenueColorClass}`}
        title={`Total Expected Revenue: ${formatCurrencyDisplay(totalRevenue)} for ${clientName}`}
        role="gridcell"
        aria-label={`Total expected revenue: ${formatCurrencyDisplay(totalRevenue)} for ${clientName}`}
      >
        {formatCurrencyDisplay(totalRevenue)}
      </div>
      
      {/* Expected Hourly Rate */}
      <div
        className={`p-3 border text-center text-sm font-medium border-l-2 border-purple-300 ${rateColorClass}`}
        title={`Expected Hourly Rate: ${formatRateDisplay(hourlyRate)} for ${clientName}`}
        role="gridcell"
        aria-label={`Expected hourly rate: ${formatRateDisplay(hourlyRate)} for ${clientName}`}
      >
        {formatRateDisplay(hourlyRate)}
      </div>

      {/* Total Suggested Revenue */}
      <div
        className={`p-3 border text-center text-sm font-medium border-l-2 border-emerald-300 ${suggestedRevenueColorClass}`}
        title={`Total Suggested Revenue: ${formatCurrencyDisplay(suggestedRevenue)} for ${clientName} (calculated using skill-based fee rates)`}
        role="gridcell"
        aria-label={`Total suggested revenue: ${formatCurrencyDisplay(suggestedRevenue)} for ${clientName}`}
      >
        {formatCurrencyDisplay(suggestedRevenue)}
      </div>

      {/* Expected Less Suggested */}
      <div
        className={`p-3 border text-center text-sm font-medium border-l-2 border-amber-300 ${expectedLessSuggestedColorClass}`}
        title={`Expected Less Suggested: ${formatDifferenceDisplay(expectedLessSuggested)} for ${clientName} (Expected ${formatCurrencyDisplay(totalRevenue)} - Suggested ${formatCurrencyDisplay(suggestedRevenue)})`}
        role="gridcell"
        aria-label={`Expected less suggested: ${formatDifferenceDisplay(expectedLessSuggested)} for ${clientName}`}
      >
        {formatDifferenceDisplay(expectedLessSuggested)}
      </div>
    </>
  );
};
