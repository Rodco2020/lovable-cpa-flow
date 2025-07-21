import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface DetailForecastMatrixHeaderProps {
  months: string[];
  monthLabels: string[];
}

export const DetailForecastMatrixHeader: React.FC<DetailForecastMatrixHeaderProps> = ({
  months,
  monthLabels
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

  const RegularHeader = ({ 
    children, 
    className = "" 
  }: { 
    children: React.ReactNode;
    className?: string;
  }) => (
    <th className={`p-3 font-semibold text-center text-sm border-b border-border bg-muted/50 ${className}`}>
      {children}
    </th>
  );

  return (
    <thead>
      <tr>
        {/* Task Identification Columns */}
        <RegularHeader className="min-w-[200px]">Task Name</RegularHeader>
        <RegularHeader className="min-w-[150px]">Client Name</RegularHeader>
        <RegularHeader className="min-w-[100px]">Skill Required</RegularHeader>
        <RegularHeader className="min-w-[80px]">Priority</RegularHeader>
        <RegularHeader className="min-w-[100px]">Category</RegularHeader>
        <RegularHeader className="min-w-[120px]">Recurrence Pattern</RegularHeader>
        
        {/* Monthly Hour Columns */}
        {monthLabels.map((monthLabel, index) => (
          <RegularHeader key={months[index]} className="min-w-[80px]">
            {monthLabel}
          </RegularHeader>
        ))}
        
        {/* Revenue Calculation Columns */}
        <RegularHeader className="bg-slate-200 border-l-2 border-slate-300 min-w-[100px]">
          Total Hours
        </RegularHeader>
        
        <RegularHeader className="bg-green-200 border-l-2 border-green-300 min-w-[150px]">
          Total Expected Revenue
        </RegularHeader>
        
        <RegularHeader className="bg-purple-200 border-l-2 border-purple-300 min-w-[130px]">
          Expected Hourly Rate
        </RegularHeader>
        
        <TooltipHeader 
          className="bg-emerald-200 border-l-2 border-emerald-300 min-w-[150px]"
          tooltip="Revenue calculated using skill-based fee rates multiplied by total hours"
        >
          Total Suggested Revenue
        </TooltipHeader>
        
        <TooltipHeader 
          className="bg-amber-200 border-l-2 border-amber-300 min-w-[160px]"
          tooltip="Difference between Expected Revenue (apportioned from client revenue) and Suggested Revenue (skill-based rates). Positive values indicate higher profitability."
        >
          Expected Less Suggested
        </TooltipHeader>
      </tr>
    </thead>
  );
};