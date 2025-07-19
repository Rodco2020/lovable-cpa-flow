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
  const TooltipHeader = ({ 
    children, 
    tooltip, 
    className = "" 
  }: { 
    children: React.ReactNode; 
    tooltip: string;
    className?: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <th className={`p-3 font-semibold text-center text-sm border-b border-border bg-muted/50 ${className}`}>
            <div className="flex items-center justify-center gap-1">
              {children}
              <HelpCircle className="h-3 w-3 text-muted-foreground" />
            </div>
          </th>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

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
      <th className={`p-3 font-semibold text-center text-sm border-b border-border bg-muted/50 ${className}`}>
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
      </th>
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
      <th className={`p-3 font-semibold text-center text-sm border-b border-border bg-muted/50 ${className}`}>
        <div className="flex items-center justify-center gap-1">
          {children}
          {tooltip && <HelpCircle className="h-3 w-3 text-muted-foreground" />}
        </div>
      </th>
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
    <thead>
      <tr>
        {/* Staff Information Column */}
        <SortableHeader 
          field="name"
          className="min-w-[150px]"
        >
          Staff Member
        </SortableHeader>
        
        {/* Monthly Columns - showing all 4 metrics per month */}
        {months.map((month) => (
          <React.Fragment key={month.key}>
            <RegularHeader 
              className="min-w-[80px] bg-blue-50"
              tooltip="Total demand hours for this staff member in this month"
            >
              <div className="text-xs">
                <div>{month.label}</div>
                <div className="text-muted-foreground">Demand</div>
              </div>
            </RegularHeader>
            
            <RegularHeader 
              className="min-w-[80px] bg-green-50"
              tooltip="Available capacity hours for this staff member in this month"
            >
              <div className="text-xs">
                <div>{month.label}</div>
                <div className="text-muted-foreground">Capacity</div>
              </div>
            </RegularHeader>
            
            <RegularHeader 
              className="min-w-[80px] bg-orange-50"
              tooltip="Gap between capacity and demand (positive = surplus, negative = shortage)"
            >
              <div className="text-xs">
                <div>{month.label}</div>
                <div className="text-muted-foreground">Gap</div>
              </div>
            </RegularHeader>
            
            <RegularHeader 
              className="min-w-[80px] bg-purple-50"
              tooltip="Utilization percentage (Demand ÷ Capacity × 100)"
            >
              <div className="text-xs">
                <div>{month.label}</div>
                <div className="text-muted-foreground">Util %</div>
              </div>
            </RegularHeader>
          </React.Fragment>
        ))}
        
        {/* Summary Columns */}
        <SortableHeader 
          field="totalHours"
          className="bg-slate-100 border-l-2 border-slate-300 min-w-[100px]"
          tooltip="Total demand hours across all months"
        >
          Total Hours
        </SortableHeader>
        
        <SortableHeader 
          field="utilization"
          className="bg-slate-100 border-l-2 border-slate-300 min-w-[100px]"
          tooltip="Overall utilization percentage across all months"
        >
          Overall Utilization %
        </SortableHeader>
        
        <SortableHeader 
          field="totalExpectedRevenue"
          className="bg-green-100 border-l-2 border-green-300 min-w-[120px]"
          tooltip="Expected revenue based on client assignments"
        >
          Total Expected Revenue
        </SortableHeader>
        
        <RegularHeader 
          className="bg-purple-100 border-l-2 border-purple-300 min-w-[120px]"
          tooltip="Expected hourly rate for this staff member"
        >
          Expected Hourly Rate
        </RegularHeader>
        
        <RegularHeader 
          className="bg-emerald-100 border-l-2 border-emerald-300 min-w-[120px]"
          tooltip="Suggested revenue based on staff cost rates"
        >
          Total Suggested Revenue
        </RegularHeader>
        
        <RegularHeader 
          className="bg-amber-100 border-l-2 border-amber-300 min-w-[120px]"
          tooltip="Difference between expected and suggested revenue"
        >
          Expected Less Suggested
        </RegularHeader>
      </tr>
    </thead>
  );
};