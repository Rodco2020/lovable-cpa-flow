
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  type?: 'info' | 'warning' | 'tip' | 'help';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const TOOLTIP_CONFIG = {
  info: {
    icon: Info,
    className: 'text-blue-500',
    contentClassName: 'bg-blue-50 text-blue-900 border-blue-200'
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-yellow-500',
    contentClassName: 'bg-yellow-50 text-yellow-900 border-yellow-200'
  },
  tip: {
    icon: Lightbulb,
    className: 'text-green-500',
    contentClassName: 'bg-green-50 text-green-900 border-green-200'
  },
  help: {
    icon: HelpCircle,
    className: 'text-gray-500',
    contentClassName: 'bg-gray-50 text-gray-900 border-gray-200'
  }
} as const;

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  type = 'help',
  side = 'top',
  className = ''
}) => {
  const config = TOOLTIP_CONFIG[type];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className={`h-4 w-4 cursor-help transition-colors hover:opacity-70 ${config.className} ${className}`} />
        </TooltipTrigger>
        <TooltipContent side={side} className={`max-w-xs ${config.contentClassName}`}>
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
