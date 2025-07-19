
import React from 'react';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { formatHours, formatCurrency, formatNumber } from '@/lib/numberUtils';
import { Badge } from '@/components/ui/badge';
import { StaffMatrixCell } from './StaffMatrixCell';

interface StaffForecastSummaryRowProps {
  staff: StaffUtilizationData;
  months: MonthInfo[];
  index: number;
}

export const StaffForecastSummaryRow: React.FC<StaffForecastSummaryRowProps> = ({
  staff,
  months,
  index
}) => {
  const bgColor = index % 2 === 0 ? 'bg-background' : 'bg-muted/20';

  // Handle special case for "Unassigned" staff
  const isUnassigned = staff.staffId === 'unassigned';

  // Get utilization color coding based on percentage
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600 bg-red-50 font-semibold'; // Over-utilized
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50 font-medium'; // High utilization
    if (percentage >= 50) return 'text-green-600 bg-green-50'; // Good utilization
    return 'text-gray-500 bg-gray-50'; // Under-utilized
  };

  const utilizationClass = getUtilizationColor(staff.utilizationPercentage);

  return (
    <div 
      className={`grid gap-1 p-2 hover:bg-muted/30 transition-colors ${bgColor}`}
      style={{
        gridTemplateColumns: `200px repeat(${months.length}, 1fr) 100px 120px 100px 120px 120px`
      }}
    >
      {/* Staff Name */}
      <div className="font-medium truncate flex items-center gap-2">
        {staff.staffName}
        {isUnassigned && (
          <Badge variant="outline" className="text-xs">
            Unassigned Tasks
          </Badge>
        )}
      </div>
      
      {/* Monthly Cells - Single consolidated cell per month */}
      {months.map((month) => (
        <StaffMatrixCell
          key={month.key}
          staffName={staff.staffName}
          month={month.label}
          metrics={staff.monthlyData?.[month.key] || null}
        />
      ))}
      
      {/* Summary Columns */}
      <div className="text-center border-l-2 border-slate-300 bg-slate-50 rounded p-1 flex items-center justify-center">
        <span className="font-semibold text-sm">
          {staff.totalHours > 0 ? formatHours(staff.totalHours, 1) : '-'}
        </span>
      </div>
      
      <div className={`text-center bg-slate-50 rounded p-1 flex items-center justify-center ${utilizationClass}`}>
        <span className="font-semibold text-sm">
          {staff.utilizationPercentage > 0 ? `${formatNumber(staff.utilizationPercentage, 1)}%` : '-'}
        </span>
      </div>
      
      <div className="text-center bg-green-50 border-l-2 border-green-300 rounded p-1 flex items-center justify-center">
        <span className="font-semibold text-sm">
          {staff.totalExpectedRevenue > 0 ? formatCurrency(staff.totalExpectedRevenue) : '-'}
        </span>
      </div>
      
      <div className="text-center bg-purple-50 border-l-2 border-purple-300 rounded p-1 flex items-center justify-center">
        <span className="font-semibold text-sm">
          {staff.expectedHourlyRate > 0 ? formatCurrency(staff.expectedHourlyRate) : '-'}
        </span>
      </div>
      
      <div className="text-center bg-emerald-50 border-l-2 border-emerald-300 rounded p-1 flex items-center justify-center">
        <span className="font-semibold text-sm">
          {staff.totalSuggestedRevenue > 0 ? formatCurrency(staff.totalSuggestedRevenue) : '-'}
        </span>
      </div>
      
      <div className="text-center bg-amber-50 border-l-2 border-amber-300 rounded p-1 flex items-center justify-center">
        <span className={`font-semibold text-sm ${staff.expectedLessSuggested < 0 ? 'text-red-600' : staff.expectedLessSuggested > 0 ? 'text-green-600' : 'text-gray-600'}`}>
          {staff.expectedLessSuggested !== 0 ? formatCurrency(staff.expectedLessSuggested) : '-'}
        </span>
      </div>
    </div>
  );
};
