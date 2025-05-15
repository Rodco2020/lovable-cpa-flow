
import React from 'react';
import { InfoCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ForecastInfoTooltipProps {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

const ForecastInfoTooltip: React.FC<ForecastInfoTooltipProps> = ({ 
  title, 
  content, 
  icon = <InfoCircle className="h-4 w-4" />
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help text-muted-foreground hover:text-foreground transition-colors ml-1">
            {icon}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <h4 className="font-medium">{title}</h4>
            <div className="text-sm text-muted-foreground">
              {content}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ForecastInfoTooltip;
