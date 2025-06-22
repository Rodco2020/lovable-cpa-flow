
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface MonthRangeSelectorProps {
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
}

export const MonthRangeSelector: React.FC<MonthRangeSelectorProps> = ({
  monthRange,
  onMonthRangeChange
}) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleRangeChange = (values: number[]) => {
    onMonthRangeChange({
      start: values[0],
      end: values[1]
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Month Range</h4>
        <Badge variant="outline">
          {months[monthRange.start]} - {months[monthRange.end]}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <Slider
          value={[monthRange.start, monthRange.end]}
          onValueChange={handleRangeChange}
          min={0}
          max={11}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{months[monthRange.start]}</span>
          <span>{months[monthRange.end]}</span>
        </div>
      </div>
    </div>
  );
};
