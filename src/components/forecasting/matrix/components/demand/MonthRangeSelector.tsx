
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthRangeSelectorProps {
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthRangeSelector: React.FC<MonthRangeSelectorProps> = ({
  monthRange,
  onMonthRangeChange
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="start-month" className="text-sm font-medium">
            Start Month
          </Label>
          <Select
            value={monthRange.start.toString()}
            onValueChange={(value) => 
              onMonthRangeChange({ ...monthRange, start: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select start month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="end-month" className="text-sm font-medium">
            End Month
          </Label>
          <Select
            value={monthRange.end.toString()}
            onValueChange={(value) => 
              onMonthRangeChange({ ...monthRange, end: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select end month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Range: {MONTHS[monthRange.start]} - {MONTHS[monthRange.end]}
      </div>
    </div>
  );
};
