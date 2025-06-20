
import React from 'react';
import { MonthRangeSelector } from '../MonthRangeSelector';

interface TimeRangeControlsProps {
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
}

/**
 * Refactored Time Range Controls Component
 * 
 * FUNCTIONALITY PRESERVED:
 * - Month range selection via MonthRangeSelector
 * - Consistent header styling
 * - Exact same interaction patterns
 */
export const TimeRangeControls: React.FC<TimeRangeControlsProps> = ({
  monthRange,
  onMonthRangeChange
}) => {
  return (
    <div>
      <h4 className="font-medium mb-3">Time Range</h4>
      <MonthRangeSelector
        monthRange={monthRange}
        onMonthRangeChange={onMonthRangeChange}
      />
    </div>
  );
};
