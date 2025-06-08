
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface DemandMatrixTimeControlsProps {
  timeHorizon: 'quarter' | 'half-year' | 'year' | 'custom';
  customDateRange?: { start: Date; end: Date };
  onTimeHorizonChange: (horizon: 'quarter' | 'half-year' | 'year' | 'custom') => void;
  onCustomDateRangeChange: (range: { start: Date; end: Date }) => void;
  className?: string;
}

export const DemandMatrixTimeControls: React.FC<DemandMatrixTimeControlsProps> = ({
  timeHorizon,
  customDateRange,
  onTimeHorizonChange,
  onCustomDateRangeChange,
  className
}) => {
  const getHorizonLabel = (horizon: string) => {
    switch (horizon) {
      case 'quarter': return '3 Months';
      case 'half-year': return '6 Months';
      case 'year': return '12 Months';
      case 'custom': return 'Custom Range';
      default: return horizon;
    }
  };

  const getHorizonDescription = (horizon: string) => {
    switch (horizon) {
      case 'quarter': return 'Next 3 months';
      case 'half-year': return 'Next 6 months';
      case 'year': return 'Next 12 months';
      case 'custom': return customDateRange 
        ? `${format(customDateRange.start, 'MMM dd')} - ${format(customDateRange.end, 'MMM dd, yyyy')}`
        : 'Select date range';
      default: return '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Horizon
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Horizon Buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Forecast Period</label>
          <div className="grid grid-cols-1 gap-2">
            {(['quarter', 'half-year', 'year', 'custom'] as const).map((horizon) => (
              <Button
                key={horizon}
                variant={timeHorizon === horizon ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeHorizonChange(horizon)}
                className="justify-start"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{getHorizonLabel(horizon)}</span>
                  {timeHorizon === horizon && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Selection Display */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium">Current Selection</div>
          <div className="text-sm text-muted-foreground">
            {getHorizonDescription(timeHorizon)}
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {timeHorizon === 'custom' && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Custom Date Range</label>
            
            <div className="grid grid-cols-1 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {customDateRange?.start 
                      ? format(customDateRange.start, 'MMM dd, yyyy')
                      : 'Start date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateRange?.start}
                    onSelect={(date) => {
                      if (date && customDateRange?.end) {
                        onCustomDateRangeChange({
                          start: date,
                          end: customDateRange.end
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {customDateRange?.end 
                      ? format(customDateRange.end, 'MMM dd, yyyy')
                      : 'End date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateRange?.end}
                    onSelect={(date) => {
                      if (date && customDateRange?.start) {
                        onCustomDateRangeChange({
                          start: customDateRange.start,
                          end: date
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Matrix will automatically recalculate when horizon changes
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
