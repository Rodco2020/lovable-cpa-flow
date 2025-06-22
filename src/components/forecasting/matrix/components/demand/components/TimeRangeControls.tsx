
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface TimeRangeControlsProps {
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  monthNames: string[];
}

/**
 * Time Range Controls Component
 * Handles month range selection with dual sliders
 */
export const TimeRangeControls: React.FC<TimeRangeControlsProps> = ({
  monthRange,
  onMonthRangeChange,
  monthNames
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Time Range</label>
        <Badge variant="outline" className="text-xs">
          {monthNames[monthRange.start]} - {monthNames[monthRange.end]}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Start Month: {monthNames[monthRange.start]}
          </label>
          <Slider
            value={[monthRange.start]}
            onValueChange={([start]) => onMonthRangeChange({ start, end: Math.max(start, monthRange.end) })}
            max={11}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            End Month: {monthNames[monthRange.end]}
          </label>
          <Slider
            value={[monthRange.end]}
            onValueChange={([end]) => onMonthRangeChange({ start: Math.min(monthRange.start, end), end })}
            max={11}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
