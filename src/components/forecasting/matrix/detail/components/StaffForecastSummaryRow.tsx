
import React from 'react';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { formatHours, formatCurrency, formatNumber } from '@/lib/numberUtils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StaffForecastSummaryRowProps {
  staff: StaffUtilizationData;
  months: MonthInfo[];
  isEvenRow: boolean;
}

export const StaffForecastSummaryRow: React.FC<StaffForecastSummaryRowProps> = ({
  staff,
  months,
  isEvenRow
}) => {
  const rowBg = isEvenRow ? 'bg-background' : 'bg-muted/20';
  
  // Get utilization color coding based on percentage
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600 bg-red-50 font-semibold'; // Over-utilized
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50 font-medium'; // High utilization
    if (percentage >= 50) return 'text-green-600 bg-green-50'; // Good utilization
    return 'text-gray-500 bg-gray-50'; // Under-utilized
  };

  // Get gap color coding
  const getGapColor = (gap: number) => {
    if (gap < 0) return 'text-red-600 font-semibold'; // Negative gap (shortage)
    if (gap > 0) return 'text-green-600'; // Positive gap (surplus)
    return 'text-gray-600'; // No gap
  };

  // Format values with error handling
  const formatValue = (value: number | undefined, formatter: (val: number) => string) => {
    if (value === undefined || value === null || isNaN(value)) {
      return <span className="text-muted-foreground text-xs">N/A</span>;
    }
    return formatter(value);
  };

  const Cell = ({ 
    children, 
    className = "", 
    align = "center",
    tooltip
  }: { 
    children: React.ReactNode;
    className?: string;
    align?: string;
    tooltip?: string;
  }) => {
    const cellContent = (
      <td className={`p-3 text-sm border-b border-border ${rowBg} text-${align} ${className}`}>
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

  // Handle special case for "Unassigned" staff
  const isUnassigned = staff.staffId === 'unassigned';

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      {/* Staff Name Column */}
      <Cell align="left" className="font-medium">
        <div className="flex items-center gap-2">
          {staff.staffName}
          {isUnassigned && (
            <Badge variant="outline" className="text-xs">
              Unassigned Tasks
            </Badge>
          )}
        </div>
      </Cell>
      
      {/* Monthly Metrics Columns */}
      {months.map((month) => {
        // FIXED: Changed from Map.get() to object access with proper null safety
        const monthlyMetrics = staff.monthlyData?.[month.key] || {
          demandHours: 0,
          capacityHours: 0,
          gap: 0,
          utilizationPercentage: 0
        };
        
        if (!monthlyMetrics || (monthlyMetrics.demandHours === 0 && monthlyMetrics.capacityHours === 0)) {
          return (
            <React.Fragment key={month.key}>
              <Cell className="font-mono">-</Cell>
              <Cell className="font-mono">-</Cell>
              <Cell className="font-mono">-</Cell>
              <Cell className="font-mono">-</Cell>
            </React.Fragment>
          );
        }

        const utilizationClass = getUtilizationColor(monthlyMetrics.utilizationPercentage);
        const gapClass = getGapColor(monthlyMetrics.gap);

        return (
          <React.Fragment key={month.key}>
            {/* Demand Hours */}
            <Cell 
              className="font-mono bg-blue-50"
              tooltip={`Demand: ${formatHours(monthlyMetrics.demandHours, 1)} hours`}
            >
              {monthlyMetrics.demandHours > 0 ? formatHours(monthlyMetrics.demandHours, 1) : '-'}
            </Cell>
            
            {/* Capacity Hours */}
            <Cell 
              className="font-mono bg-green-50"
              tooltip={`Capacity: ${formatHours(monthlyMetrics.capacityHours, 1)} hours`}
            >
              {monthlyMetrics.capacityHours > 0 ? formatHours(monthlyMetrics.capacityHours, 1) : '-'}
            </Cell>
            
            {/* Gap */}
            <Cell 
              className={`font-mono bg-orange-50 ${gapClass}`}
              tooltip={`Gap: ${formatHours(monthlyMetrics.gap, 1)} hours (${monthlyMetrics.gap >= 0 ? 'surplus' : 'shortage'})`}
            >
              {monthlyMetrics.gap !== 0 ? formatHours(monthlyMetrics.gap, 1) : '0.0h'}
            </Cell>
            
            {/* Utilization Percentage */}
            <Cell 
              className={`font-mono ${utilizationClass} rounded-sm`}
              tooltip={`Utilization: ${formatNumber(monthlyMetrics.utilizationPercentage, 1)}%`}
            >
              {formatNumber(monthlyMetrics.utilizationPercentage, 1)}%
            </Cell>
          </React.Fragment>
        );
      })}
      
      {/* Summary Columns */}
      <Cell className="bg-slate-50 border-l-2 border-slate-300 font-semibold">
        {formatValue(staff.totalHours, (val) => formatHours(val, 1))}
      </Cell>
      
      <Cell className={`bg-slate-50 border-l-2 border-slate-300 font-semibold ${getUtilizationColor(staff.utilizationPercentage)} rounded-sm`}>
        {formatValue(staff.utilizationPercentage, (val) => `${formatNumber(val, 1)}%`)}
      </Cell>
      
      <Cell className="bg-green-50 border-l-2 border-green-300 font-semibold">
        {formatValue(staff.totalExpectedRevenue, formatCurrency)}
      </Cell>
      
      <Cell className="bg-purple-50 border-l-2 border-purple-300 font-semibold">
        {formatValue(staff.expectedHourlyRate, formatCurrency)}
      </Cell>
      
      <Cell className="bg-emerald-50 border-l-2 border-emerald-300 font-semibold">
        {formatValue(staff.totalSuggestedRevenue, formatCurrency)}
      </Cell>
      
      <Cell className="bg-amber-50 border-l-2 border-amber-300 font-semibold">
        <span className={staff.expectedLessSuggested < 0 ? 'text-red-600' : staff.expectedLessSuggested > 0 ? 'text-green-600' : 'text-gray-600'}>
          {formatValue(staff.expectedLessSuggested, formatCurrency)}
        </span>
      </Cell>
    </tr>
  );
};
