
import React from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface DateRangeSectionProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

/**
 * Date Range Section Component
 * Handles date range selection
 */
export const DateRangeSection: React.FC<DateRangeSectionProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Date Range</h4>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to
              }}
              onSelect={(range) => {
                onDateRangeChange({
                  from: range?.from,
                  to: range?.to
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        {(dateRange.from || dateRange.to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
