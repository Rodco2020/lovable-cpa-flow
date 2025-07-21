import React from 'react';
import { TaskRevenueResult } from '@/services/forecasting/demand/calculators/detailTaskRevenueCalculator';
import { formatHours, formatCurrency, formatNumber } from '@/lib/numberUtils';
import { Badge } from '@/components/ui/badge';

// Use the aggregated Task interface from Detail Matrix
interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
  monthlyDistribution?: Record<string, number>; // New aggregated format (optional for compatibility)
  totalHours?: number; // Sum of all monthly hours (optional for compatibility)
  recurringTaskId?: string; // For unique identification (optional for compatibility)
  totalExpectedRevenue?: number;
  expectedHourlyRate?: number;
  totalSuggestedRevenue?: number;
  expectedLessSuggested?: number;
}

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

  // Get monthly hours from aggregated monthlyDistribution
  const getMonthlyHours = (month: string) => {
    // Use monthlyDistribution if available (new aggregated format)
    if (task.monthlyDistribution) {
      return task.monthlyDistribution[month] || 0;
    }
    // Fallback for backward compatibility
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
    <td className={`p-3 text-sm border-b border-border ${rowBg} text-${align} ${className} whitespace-nowrap`}>
      {children}
    </td>
  );

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      {/* Task Identification Columns */}
      <Cell align="left" className="font-medium min-w-[200px]">
        {task.taskName}
      </Cell>
      
      <Cell align="left" className="min-w-[150px]">
        {task.clientName}
      </Cell>
      
      <Cell className="min-w-[100px]">
        <Badge variant="outline" className="text-xs">
          {task.skillRequired}
        </Badge>
      </Cell>
      
      <Cell className="min-w-[80px]">
        <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
          {task.priority}
        </Badge>
      </Cell>
      
      <Cell className="min-w-[100px]">
        <Badge variant="secondary" className="text-xs">
          {task.category}
        </Badge>
      </Cell>
      
      <Cell className="min-w-[120px]">
        <span className="text-xs text-muted-foreground">
          {task.recurrencePattern}
        </span>
      </Cell>
      
      {/* Monthly Hour Columns */}
      {months.map((month) => {
        const hours = getMonthlyHours(month);
        return (
          <Cell key={month} className="font-mono min-w-[80px]">
            {hours > 0 ? formatHours(hours, 1) : '-'}
          </Cell>
        );
      })}
      
      {/* Revenue Calculation Columns with Enhanced Error Handling */}
      <Cell className="bg-slate-50 border-l-2 border-slate-300 font-semibold min-w-[100px]">
        {task.totalHours ? formatHoursValue(task.totalHours) : <span className="text-muted-foreground">-</span>}
      </Cell>
      
      <Cell className="bg-green-50 border-l-2 border-green-300 font-semibold min-w-[150px]">
        {revenueData ? formatRevenueValue(revenueData.totalExpectedRevenue, false, true) : <span className="text-muted-foreground">-</span>}
      </Cell>
      
      <Cell className="bg-purple-50 border-l-2 border-purple-300 font-semibold min-w-[130px]">
        {revenueData ? formatRevenueValue(revenueData.expectedHourlyRate, false, true) : <span className="text-muted-foreground">-</span>}
      </Cell>
      
      <Cell className="bg-emerald-50 border-l-2 border-emerald-300 font-semibold min-w-[150px]">
        {revenueData ? formatRevenueValue(revenueData.totalSuggestedRevenue, false, true) : <span className="text-muted-foreground">-</span>}
      </Cell>
      
      <Cell className="bg-amber-50 border-l-2 border-amber-300 font-semibold min-w-[160px]">
        {revenueData ? formatRevenueValue(revenueData.expectedLessSuggested, true, false) : <span className="text-muted-foreground">-</span>}
      </Cell>
    </tr>
  );
};