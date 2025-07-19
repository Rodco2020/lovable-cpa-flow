import React from 'react';
import { MonthInfo } from '@/types/demand';
import { formatHours, formatCurrency, formatNumber } from '@/lib/numberUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FirmTotals {
  totalDemand: number;
  totalCapacity: number;
  overallUtilization: number;
  totalRevenue: number;
  totalGap: number;
}

interface StaffSummaryTotalsRowProps {
  totals: FirmTotals;
  months: MonthInfo[];
  totalStaffCount: number;
}

export const StaffSummaryTotalsRow: React.FC<StaffSummaryTotalsRowProps> = ({
  totals,
  months,
  totalStaffCount
}) => {
  // Get overall utilization color coding
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600 bg-red-100 font-bold'; // Over-capacity
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100 font-semibold'; // High utilization
    if (percentage >= 50) return 'text-green-600 bg-green-100 font-semibold'; // Good utilization
    return 'text-gray-600 bg-gray-100'; // Under-utilized
  };

  // Get gap health indicator
  const getGapHealthColor = (gap: number) => {
    if (gap < 0) return 'text-red-600 font-semibold'; // Shortage
    if (gap > 0) return 'text-green-600 font-semibold'; // Surplus
    return 'text-gray-600'; // Balanced
  };

  const utilizationClass = getUtilizationColor(totals.overallUtilization);
  const gapClass = getGapHealthColor(totals.totalGap);

  const Cell = ({ 
    children, 
    className = "", 
    align = "center",
    colSpan = 1,
    tooltip
  }: { 
    children: React.ReactNode;
    className?: string;
    align?: string;
    colSpan?: number;
    tooltip?: string;
  }) => {
    const cellContent = (
      <td 
        className={`p-3 text-sm border-t-2 border-primary bg-primary/5 text-${align} font-semibold ${className}`}
        colSpan={colSpan}
      >
        {children}
      </td>
    );

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {cellContent}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return cellContent;
  };

  return (
    <tr className="border-t-2 border-primary">
      {/* Firm Totals Label */}
      <Cell 
        align="left" 
        className="font-bold text-primary"
        tooltip={`Aggregated metrics across ${totalStaffCount} staff members`}
      >
        <div className="flex items-center gap-2">
          📊 FIRM TOTALS
          <span className="text-xs text-muted-foreground">
            ({totalStaffCount} staff)
          </span>
        </div>
      </Cell>
      
      {/* Monthly Summary - Show aggregate metrics per month */}
      {months.map((month) => (
        <React.Fragment key={month.key}>
          <Cell 
            className="bg-blue-100 font-mono"
            tooltip="Total firm demand for this month"
          >
            {/* We don't have monthly breakdowns in totals, so show dash */}
            <span className="text-muted-foreground">-</span>
          </Cell>
          
          <Cell 
            className="bg-green-100 font-mono"
            tooltip="Total firm capacity for this month"
          >
            <span className="text-muted-foreground">-</span>
          </Cell>
          
          <Cell 
            className="bg-orange-100 font-mono"
            tooltip="Total firm gap for this month"
          >
            <span className="text-muted-foreground">-</span>
          </Cell>
          
          <Cell 
            className="bg-purple-100 font-mono"
            tooltip="Average firm utilization for this month"
          >
            <span className="text-muted-foreground">-</span>
          </Cell>
        </React.Fragment>
      ))}
      
      {/* Summary Totals */}
      <Cell 
        className="bg-slate-100 border-l-2 border-slate-400 font-bold"
        tooltip={`Total demand hours across all staff: ${formatHours(totals.totalDemand, 1)}`}
      >
        {formatHours(totals.totalDemand, 1)}
      </Cell>
      
      <Cell 
        className={`bg-slate-100 border-l-2 border-slate-400 font-bold ${utilizationClass} rounded-sm`}
        tooltip={`Overall firm utilization: ${formatNumber(totals.overallUtilization, 1)}%`}
      >
        {formatNumber(totals.overallUtilization, 1)}%
      </Cell>
      
      <Cell 
        className="bg-green-100 border-l-2 border-green-400 font-bold"
        tooltip={`Total expected revenue across all staff: ${formatCurrency(totals.totalRevenue)}`}
      >
        {formatCurrency(totals.totalRevenue)}
      </Cell>
      
      <Cell 
        className="bg-purple-100 border-l-2 border-purple-400"
        tooltip="Average rate varies by staff member"
      >
        <span className="text-muted-foreground text-xs">Varies</span>
      </Cell>
      
      <Cell 
        className="bg-emerald-100 border-l-2 border-emerald-400"
        tooltip="Total suggested revenue calculated from individual staff rates"
      >
        <span className="text-muted-foreground text-xs">Calculated</span>
      </Cell>
      
      <Cell 
        className="bg-amber-100 border-l-2 border-amber-400"
        tooltip="Net difference between expected and suggested revenue"
      >
        <span className="text-muted-foreground text-xs">Net Diff</span>
      </Cell>
    </tr>
  );
};