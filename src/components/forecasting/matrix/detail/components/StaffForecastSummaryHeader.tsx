
import React from 'react';
import { MonthInfo } from '@/types/demand';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SortField = 'name' | 'utilization' | 'totalHours' | 'totalExpectedRevenue';
type SortDirection = 'asc' | 'desc';

interface StaffForecastSummaryHeaderProps {
  months: MonthInfo[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const StaffForecastSummaryHeader: React.FC<StaffForecastSummaryHeaderProps> = ({
  months,
  sortField,
  sortDirection,
  onSort
}) => {
  const SortableHeader = ({ 
    children, 
    field,
    className = "",
    tooltip
  }: { 
    children: React.ReactNode;
    field: SortField;
    className?: string;
    tooltip?: string;
  }) => {
    const isActive = sortField === field;
    const SortIcon = sortDirection === 'asc' ? ChevronUp : ChevronDown;

    const header = (
      <div className={`text-center ${className}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onSort(field)}
          className="h-auto p-1 font-semibold text-sm hover:bg-muted/70"
        >
          <div className="flex items-center gap-1">
            {children}
            {isActive && <SortIcon className="h-3 w-3" />}
          </div>
        </Button>
      </div>
    );

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {header}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return header;
  };

  const RegularHeader = ({ 
    children, 
    className = "",
    tooltip
  }: { 
    children: React.ReactNode;
    className?: string;
    tooltip?: string;
  }) => {
    const header = (
      <div className={`text-center font-semibold text-sm ${className}`}>
        <div className="flex items-center justify-center gap-1">
          {children}
          {tooltip && <HelpCircle className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>
    );

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {header}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return header;
  };

  return (
    <div 
      className="grid gap-1 p-2 bg-muted/50 border-b font-semibold text-sm"
      style={{
        gridTemplateColumns: `200px repeat(${months.length}, 1fr) 120px 100px 120px 120px`
      }}
    >
      {/* Staff Information Column */}
      <SortableHeader field="name">
        Staff Member
      </SortableHeader>
      
      {/* Monthly Columns - Single consolidated header per month */}
      {months.map((month) => (
        <RegularHeader 
          key={month.key}
          tooltip={`Consolidated view: demand/capacity with gap and utilization for ${month.label}`}
        >
          {month.label}
        </RegularHeader>
      ))}
      
      {/* Summary Columns */}
      <SortableHeader 
        field="utilization"
        className="border-l-2 border-slate-300"
        tooltip="Total demand/capacity with gap and overall utilization across all months"
      >
        Total Summary
      </SortableHeader>
      
      <SortableHeader 
        field="totalExpectedRevenue"
        className="border-l-2 border-green-300"
        tooltip="Expected revenue based on client assignments"
      >
        Total Expected Revenue
      </SortableHeader>
      
      <RegularHeader 
        className="border-l-2 border-purple-300"
        tooltip="Expected hourly rate for this staff member"
      >
        Expected Hourly Rate
      </RegularHeader>
      
      <RegularHeader 
        className="border-l-2 border-emerald-300"
        tooltip="Suggested revenue based on staff cost rates"
      >
        Total Suggested Revenue
      </RegularHeader>
      
      <RegularHeader 
        className="border-l-2 border-amber-300"
        tooltip="Difference between expected and suggested revenue"
      >
        Expected Less Suggested
      </RegularHeader>
    </div>
  );
};
