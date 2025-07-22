
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

  

  const Cell = ({ 
    children, 
    className = "", 
    tooltip
  }: { 
    children: React.ReactNode;
    className?: string;
    tooltip?: string;
  }) => {
    const cellContent = (
      <div className={`text-center font-semibold text-sm border-t-2 border-primary bg-primary/5 p-2 ${className}`}>
        {children}
      </div>
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
    <div 
      className="grid gap-1 border-t-2 border-primary"
      style={{
        gridTemplateColumns: `200px repeat(${months.length}, 1fr) 120px 100px 120px 120px`
      }}
    >
      {/* Firm Totals Label */}
      <Cell 
        className="text-left text-primary font-bold"
        tooltip={`Aggregated metrics across ${totalStaffCount} staff members`}
      >
        <div className="flex items-center gap-2">
          📊 FIRM TOTALS
          <span className="text-xs text-muted-foreground">
            ({totalStaffCount} staff)
          </span>
        </div>
      </Cell>
      
      {/* Monthly Summary - Show aggregate placeholder cells */}
      {months.map((month) => (
        <Cell 
          key={month.key}
          className="bg-gray-100"
          tooltip="Monthly firm totals calculated from individual staff metrics"
        >
          <div className="h-16 flex items-center justify-center">
            <span className="text-muted-foreground text-xs">Aggregated</span>
          </div>
        </Cell>
      ))}
      
      {/* Summary Totals */}
      <Cell 
        className="border-l-2 border-slate-400 bg-slate-100 font-bold"
        tooltip={`Total demand/capacity: ${formatHours(totals.totalDemand, 1)}h / ${formatHours(totals.totalCapacity, 1)}h with gap of ${totals.totalGap > 0 ? '+' : ''}${formatHours(totals.totalGap, 1)}h and overall utilization of ${formatNumber(totals.overallUtilization, 1)}%`}
      >
        <div className="text-center space-y-1 py-2 bg-gray-50">
          <div className="text-xs font-bold">
            {totals.totalDemand.toFixed(1)} / {totals.totalCapacity.toFixed(1)}
          </div>
          <div className={`text-xs font-bold ${totals.totalGap > 0 ? 'text-green-600' : totals.totalGap < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {totals.totalGap > 0 ? '+' : ''}{totals.totalGap.toFixed(1)}
          </div>
          <div className={`text-xs font-bold ${getUtilizationColor(totals.overallUtilization)}`}>
            {totals.overallUtilization.toFixed(0)}%
          </div>
        </div>
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
    </div>
  );
};
