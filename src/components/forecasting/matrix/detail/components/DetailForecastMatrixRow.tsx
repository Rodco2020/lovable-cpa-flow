import React from 'react';
import { Task, TaskRevenueResult } from '@/services/forecasting/demand/calculators/detailTaskRevenueCalculator';
import { formatHours, formatCurrency, formatNumber } from '@/lib/numberUtils';
import { Badge } from '@/components/ui/badge';

interface DetailForecastMatrixRowProps {
  task: Task;
  months: string[];
  monthLabels: string[];
  revenueData?: TaskRevenueResult;
  isEvenRow: boolean;
}

export const DetailForecastMatrixRow: React.FC<DetailForecastMatrixRowProps> = ({
  task,
  months,
  monthLabels,
  revenueData,
  isEvenRow
}) => {
  const rowBg = isEvenRow ? 'bg-background' : 'bg-muted/20';
  
  // Get priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  // Get monthly hours for each month (for now, we'll show the monthlyHours for the task's month)
  const getMonthlyHours = (month: string) => {
    // If this is the task's month, show the hours, otherwise 0
    return task.month === month ? task.monthlyHours : 0;
  };

  // Enhanced revenue formatting with error handling
  const formatRevenueValue = (value: number | undefined, isNegative?: boolean, showNA?: boolean) => {
    if (value === undefined || value === null || isNaN(value)) {
      return <span className="text-muted-foreground text-xs">N/A</span>;
    }
    
    if (showNA && value === 0) {
      return <span className="text-muted-foreground text-xs">$0.00</span>;
    }
    
    const formatted = formatCurrency(value);
    const textColor = isNegative && value < 0 
      ? 'text-destructive font-medium' 
      : value > 0 
        ? 'text-foreground' 
        : 'text-muted-foreground';
    
    return (
      <span className={textColor}>
        {formatted}
      </span>
    );
  };

  // Format hours with error handling
  const formatHoursValue = (hours: number | undefined) => {
    if (hours === undefined || hours === null || isNaN(hours)) {
      return <span className="text-muted-foreground text-xs">N/A</span>;
    }
    return formatHours(hours, 1);
  };

  const Cell = ({ 
    children, 
    className = "", 
    align = "center" 
  }: { 
    children: React.ReactNode;
    className?: string;
    align?: string;
  }) => (
    <td className={`p-3 text-sm border-b border-border ${rowBg} text-${align} ${className}`}>
      {children}
    </td>
  );

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      {/* Task Identification Columns */}
      <Cell align="left" className="font-medium">
        {task.taskName}
      </Cell>
      
      <Cell align="left">
        {task.clientName}
      </Cell>
      
      <Cell>
        <Badge variant="outline" className="text-xs">
          {task.skillRequired}
        </Badge>
      </Cell>
      
      <Cell>
        <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
          {task.priority}
        </Badge>
      </Cell>
      
      <Cell>
        <Badge variant="secondary" className="text-xs">
          {task.category}
        </Badge>
      </Cell>
      
      <Cell>
        <span className="text-xs text-muted-foreground">
          {task.recurrencePattern}
        </span>
      </Cell>
      
      {/* Monthly Hour Columns */}
      {months.map((month) => {
        const hours = getMonthlyHours(month);
        return (
          <Cell key={month} className="font-mono">
            {hours > 0 ? formatHours(hours, 1) : '-'}
          </Cell>
        );
      })}
      
      {/* Revenue Calculation Columns with Enhanced Error Handling */}
      <Cell className="bg-slate-50 border-l-2 border-slate-300 font-semibold">
        {revenueData ? formatHoursValue(revenueData.totalHours) : <span className="text-muted-foreground">-</span>}
      </Cell>
      
      <Cell className="bg-green-50 border-l-2 border-green-300 font-semibold">
        {revenueData ? formatRevenueValue(revenueData.totalExpectedRevenue, false, true) : <span className="text-muted-foreground">-</span>}
      </Cell>
      
      <Cell className="bg-purple-50 border-l-2 border-purple-300 font-semibold">
        {revenueData ? formatRevenueValue(revenueData.expectedHourlyRate, false, true) : <span className="text-muted-foreground">-</span>}
      </Cell>
      
      <Cell className="bg-emerald-50 border-l-2 border-emerald-300 font-semibold">
        {revenueData ? formatRevenueValue(revenueData.totalSuggestedRevenue, false, true) : <span className="text-muted-foreground">-</span>}
      </Cell>
      
      <Cell className="bg-amber-50 border-l-2 border-amber-300 font-semibold">
        {revenueData ? formatRevenueValue(revenueData.expectedLessSuggested, true, false) : <span className="text-muted-foreground">-</span>}
      </Cell>
    </tr>
  );
};