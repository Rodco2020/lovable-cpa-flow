import React from 'react';
import { DetailMatrixTotalsCalculator } from '@/services/forecasting/detail/detailMatrixTotalsCalculator';

interface DetailMatrixTotalsRowProps {
  totals: ReturnType<typeof DetailMatrixTotalsCalculator.calculateDetailMatrixTotals>;
  months: Array<{ key: string; label: string }>;
}

export const DetailMatrixTotalsRow: React.FC<DetailMatrixTotalsRowProps> = ({ 
  totals, 
  months 
}) => {
  return (
    <tr className="border-t-2 border-border">
      {/* Task Name column - shows "TOTALS" */}
      <td className="px-3 py-4 font-bold text-center bg-muted whitespace-nowrap min-w-[200px]">
        TOTALS
      </td>
      
      {/* Other identification columns - show em dash */}
      <td className="px-3 py-4 text-center bg-muted whitespace-nowrap min-w-[150px]">—</td>
      <td className="px-3 py-4 text-center bg-muted whitespace-nowrap min-w-[100px]">—</td>
      <td className="px-3 py-4 text-center bg-muted whitespace-nowrap min-w-[80px]">—</td>
      <td className="px-3 py-4 text-center bg-muted whitespace-nowrap min-w-[100px]">—</td>
      <td className="px-3 py-4 text-center bg-muted whitespace-nowrap min-w-[120px]">—</td>
      
      {/* Monthly hour columns */}
      {months.map(month => (
        <td key={month.key} className="px-3 py-4 text-center font-bold bg-muted/50 whitespace-nowrap min-w-[80px]">
          {totals.monthlyHours[month.key]?.toFixed(1) || '0.0'}h
        </td>
      ))}
      
      {/* Total Hours */}
      <td className="px-3 py-4 text-center font-bold bg-accent/20 border-l-2 border-accent whitespace-nowrap min-w-[100px]">
        {totals.totalHours.toFixed(1)}h
      </td>
      
      {/* Total Expected Revenue */}
      <td className="px-3 py-4 text-center font-bold bg-green-100 border-l-2 border-green-300 whitespace-nowrap min-w-[150px]">
        ${totals.totalExpectedRevenue.toLocaleString('en-US', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        })}
      </td>
      
      {/* Expected Hourly Rate (Weighted Average) */}
      <td className="px-3 py-4 text-center font-bold bg-purple-100 border-l-2 border-purple-300 whitespace-nowrap min-w-[130px]">
        ${totals.expectedHourlyRate.toFixed(2)}
      </td>
      
      {/* Total Suggested Revenue */}
      <td className="px-3 py-4 text-center font-bold bg-emerald-100 border-l-2 border-emerald-300 whitespace-nowrap min-w-[150px]">
        ${totals.totalSuggestedRevenue.toLocaleString('en-US', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        })}
      </td>
      
      {/* Expected Less Suggested */}
      <td className={`px-3 py-4 text-center font-bold border-l-2 border-amber-300 whitespace-nowrap min-w-[160px] ${
        totals.expectedLessSuggested >= 0 ? 'bg-amber-100' : 'bg-red-100'
      }`}>
        {totals.expectedLessSuggested >= 0 ? '+' : ''}
        ${Math.abs(totals.expectedLessSuggested).toLocaleString('en-US', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        })}
      </td>
    </tr>
  );
};
