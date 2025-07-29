
import React from 'react';
import { MonthInfo } from '@/types/demand';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SortField = 'staffName' | 'utilizationPercentage' | 'totalHours' | 'totalExpectedRevenue';
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
        gridTemplateColumns: `200px repeat(${months.length}, 1fr) 180px 140px 120px 140px 160px`
      }}
    >
      {/* Staff Information Column */}
      <SortableHeader
        field="staffName"
        tooltip="Click to sort by staff member name"
      >
        Staff Member
      </SortableHeader>
      
      {/* Monthly Headers - Consolidated View */}
      {months.map((month) => (
        <RegularHeader 
          key={month.key}
          tooltip="Monthly demand/capacity breakdown with gap analysis and utilization"
        >
          {month.label}
        </RegularHeader>
      ))}
      
      {/* Consolidated Summary Header */}
      <SortableHeader
        field="utilizationPercentage"
        className="border-l-2 border-slate-300"
        tooltip="Total summary: demand/capacity hours, gap, and utilization percentage"
      >
        Total Summary
      </SortableHeader>
      
      <SortableHeader
        field="totalExpectedRevenue"
        className="border-l-2 border-green-300"
        tooltip="Total expected revenue based on assigned tasks and rates"
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
        tooltip="Total suggested revenue based on cost plus markup"
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
