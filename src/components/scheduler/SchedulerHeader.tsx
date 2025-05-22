
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '@/components/ui/tooltip';

interface SchedulerHeaderProps {
  title: string;
  subtitle?: string;
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onRefreshAll: () => void;
  onToggleMetrics: () => void;
  showMetrics: boolean;
  onShowKeyboardHelp: () => void;
}

const SchedulerHeader: React.FC<SchedulerHeaderProps> = ({
  title,
  subtitle,
  currentDate,
  onPrevDay,
  onNextDay,
  onRefreshAll,
  onToggleMetrics,
  showMetrics,
  onShowKeyboardHelp
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevDay}
          className="h-8 w-8"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="bg-slate-100 px-3 py-1.5 rounded font-medium min-w-32 text-center">
          {format(currentDate, "EEEE, MMM d, yyyy")}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNextDay}
          className="h-8 w-8"
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefreshAll}
                className="h-8 w-8 ml-2"
                aria-label="Refresh all data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Refresh all data (Press R)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={onToggleMetrics}
          className="ml-2"
          aria-pressed={showMetrics}
          aria-label={showMetrics ? "Hide metrics" : "Show metrics"}
        >
          {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
        </Button>
      </div>
    </div>
  );
};

export default SchedulerHeader;
