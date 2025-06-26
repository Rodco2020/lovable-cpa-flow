
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, AlertTriangle, Info } from 'lucide-react';
import { format, differenceInDays, addMonths, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // Enhanced validation with better feedback
  const validateDateRange = (range?: { start: Date; end: Date }) => {
    if (!range) return { isValid: true, message: '', severity: 'info' as const };

    const daysDiff = differenceInDays(range.end, range.start);
    
    if (daysDiff < 0) {
      return { 
        isValid: false, 
        message: 'End date must be after start date', 
        severity: 'error' as const 
      };
    }
    
    if (daysDiff === 0) {
      return { 
        isValid: false, 
        message: 'Single-day ranges will be automatically expanded to monthly boundaries for better data matching.', 
        severity: 'warning' as const 
      };
    }
    
    if (daysDiff < 7) {
      return { 
        isValid: false, 
        message: 'Very short ranges (less than a week) will be automatically expanded for meaningful forecasting.', 
        severity: 'warning' as const 
      };
    }

    if (daysDiff > 365) {
      return { 
        isValid: true, 
        message: 'Long time ranges may impact performance but are supported.', 
        severity: 'info' as const 
      };
    }

    return { isValid: true, message: '', severity: 'info' as const };
  };

  const dateRangeValidation = validateDateRange(customDateRange);

  // Enhanced date change handler with automatic expansion
  const handleDateChange = (field: 'start' | 'end', date: Date | undefined) => {
    if (!date || !customDateRange) return;

    let newRange = {
      ...customDateRange,
      [field]: date
    };

    // Auto-expand to monthly boundaries for better data matching
    if (field === 'start') {
      newRange.start = startOfMonth(date);
    } else {
      newRange.end = endOfMonth(date);
    }

    // Handle problematic ranges automatically
    const daysDiff = differenceInDays(newRange.end, newRange.start);
    
    if (daysDiff === 0) {
      console.log(`📅 [TIME CONTROLS] Single-day range detected, expanding to monthly boundaries`);
      newRange = {
        start: startOfMonth(newRange.start),
        end: endOfMonth(newRange.start)
      };
    } else if (daysDiff < 7 && daysDiff > 0) {
      console.log(`📅 [TIME CONTROLS] Short range detected (${daysDiff} days), expanding for better coverage`);
      newRange = {
        start: startOfMonth(newRange.start),
        end: endOfMonth(addDays(newRange.start, 30))
      };
    }

    onCustomDateRangeChange(newRange);
    console.log(`✅ [TIME CONTROLS] Updated ${field} date to:`, newRange[field].toISOString());
  };

  // Quick preset handlers
  const handleQuickPreset = (preset: 'thisMonth' | 'nextMonth' | 'thisQuarter' | 'nextQuarter') => {
    const now = new Date();
    let newRange: { start: Date; end: Date };

    switch (preset) {
      case 'thisMonth':
        newRange = {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
        break;
      case 'nextMonth':
        const nextMonth = addMonths(now, 1);
        newRange = {
          start: startOfMonth(nextMonth),
          end: endOfMonth(nextMonth)
        };
        break;
      case 'thisQuarter':
        newRange = {
          start: startOfMonth(now),
          end: endOfMonth(addMonths(now, 2))
        };
        break;
      case 'nextQuarter':
        newRange = {
          start: startOfMonth(addMonths(now, 1)),
          end: endOfMonth(addMonths(now, 3))
        };
        break;
    }

    onCustomDateRangeChange(newRange);
    onTimeHorizonChange('custom');
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
            
            {/* Enhanced Validation Alert */}
            {customDateRange && dateRangeValidation.message && (
              <Alert variant={dateRangeValidation.severity === 'error' ? 'destructive' : 'default'}>
                {dateRangeValidation.severity === 'error' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                <AlertDescription>
                  {dateRangeValidation.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPreset('thisMonth')}
                  className="text-xs"
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPreset('nextMonth')}
                  className="text-xs"
                >
                  Next Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPreset('thisQuarter')}
                  className="text-xs"
                >
                  This Quarter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPreset('nextQuarter')}
                  className="text-xs"
                >
                  Next Quarter
                </Button>
              </div>
            </div>
            
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
                    onSelect={(date) => handleDateChange('start', date)}
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
                    onSelect={(date) => handleDateChange('end', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Enhanced Helper Text */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Dates will be automatically expanded to month boundaries</div>
              <div>• Short ranges will be expanded for meaningful forecasting</div>
              <div>• Use monthly ranges for best results</div>
              <div>• Matrix will recalculate automatically when range changes</div>
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {customDateRange && dateRangeValidation.isValid && (
              <>Range covers {differenceInDays(customDateRange.end, customDateRange.start)} days</>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
