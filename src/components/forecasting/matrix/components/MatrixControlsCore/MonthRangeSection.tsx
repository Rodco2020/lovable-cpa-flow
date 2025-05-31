
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MONTH_RANGES, MonthRange } from './types';

interface MonthRangeSectionProps {
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
}

/**
 * Month Range Selection Component
 * Handles selection of time periods for matrix display
 */
export const MonthRangeSection: React.FC<MonthRangeSectionProps> = ({
  monthRange,
  onMonthRangeChange
}) => {
  const getCurrentRangeLabel = (): string => {
    const range = MONTH_RANGES.find(r => r.start === monthRange.start && r.end === monthRange.end);
    return range ? range.label : 'Custom Range';
  };

  const handleRangeChange = (value: string): void => {
    const [start, end] = value.split('-').map(Number);
    onMonthRangeChange({ start, end });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">Month Range</Label>
      <Select 
        value={`${monthRange.start}-${monthRange.end}`} 
        onValueChange={handleRangeChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={getCurrentRangeLabel()} />
        </SelectTrigger>
        <SelectContent>
          {MONTH_RANGES.map((range: MonthRange) => (
            <SelectItem 
              key={`${range.start}-${range.end}`} 
              value={`${range.start}-${range.end}`}
            >
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
