
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RecurrenceSettingsProps {
  form: any;
  recurrenceType: string | undefined;
}

export const RecurrenceSettings = ({ form, recurrenceType }: RecurrenceSettingsProps) => {
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      {/* Recurrence Type */}
      <FormField
        control={form.control}
        name="recurrenceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="recurrence-type">Recurrence Pattern</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger id="recurrence-type" aria-label="Select recurrence pattern">
                  <SelectValue placeholder="Select recurrence pattern" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Annually">Annually</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage role="alert" />
          </FormItem>
        )}
      />

      {/* Interval setting for standard recurrence types */}
      {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'].includes(recurrenceType || '') && (
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="interval">Interval</FormLabel>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Every</span>
                <FormControl>
                  <Input
                    id="interval"
                    type="number"
                    className="w-20"
                    min="1"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    aria-label={`Enter ${recurrenceType?.toLowerCase() || 'recurrence'} interval`}
                  />
                </FormControl>
                <span className="text-sm">
                  {recurrenceType === 'Daily' ? 'day(s)' :
                   recurrenceType === 'Weekly' ? 'week(s)' :
                   recurrenceType === 'Monthly' ? 'month(s)' :
                   recurrenceType === 'Quarterly' ? 'quarter(s)' :
                   recurrenceType === 'Annually' ? 'year(s)' : 'interval'}
                </span>
              </div>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />
      )}

      {/* Weekly recurrence specific settings */}
      {recurrenceType === 'Weekly' && (
        <FormField
          control={form.control}
          name="weekdays"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="weekdays-group-label">On which days</FormLabel>
              <div 
                className="grid grid-cols-7 gap-2" 
                role="group" 
                aria-labelledby="weekdays-group-label"
              >
                {weekdayNames.map((day, index) => (
                  <div key={day} className="flex flex-col items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(index)}
                        onCheckedChange={(checked) => {
                          const updatedWeekdays = checked
                            ? [...(field.value || []), index]
                            : (field.value || []).filter(d => d !== index);
                          field.onChange(updatedWeekdays);
                        }}
                        aria-label={day}
                        id={`weekday-${index}`}
                      />
                    </FormControl>
                    <label 
                      htmlFor={`weekday-${index}`}
                      className="text-xs mt-1 cursor-pointer"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />
      )}

      {/* Monthly and related recurrence settings */}
      {['Monthly', 'Quarterly', 'Annually'].includes(recurrenceType || '') && (
        <FormField
          control={form.control}
          name="dayOfMonth"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="day-of-month">Day of Month</FormLabel>
              <FormControl>
                <Input
                  id="day-of-month"
                  type="number"
                  min="1"
                  max="31"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                  aria-label="Enter day of month (1-31)"
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />
      )}

      {/* Annually specific settings */}
      {recurrenceType === 'Annually' && (
        <FormField
          control={form.control}
          name="monthOfYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="month-of-year">Month</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger id="month-of-year" aria-label="Select month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />
      )}

      {/* Custom recurrence settings */}
      {recurrenceType === 'Custom' && (
        <FormField
          control={form.control}
          name="customOffsetDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="custom-offset">Days Offset</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input
                    id="custom-offset"
                    type="number"
                    className="w-20"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    aria-label="Enter days offset from month-end"
                  />
                </FormControl>
                <span className="text-sm">days after month-end</span>
              </div>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />
      )}

      {/* End date setting for all recurrence types */}
      <FormField
        control={form.control}
        name="endDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>End Date (Optional)</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                    aria-label="Select end date (optional)"
                    aria-haspopup="dialog"
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>No end date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => field.onChange(null)}
                    className="mb-2"
                    aria-label="Clear end date"
                  >
                    Clear date
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              Leave empty for no end date
            </p>
            <FormMessage role="alert" />
          </FormItem>
        )}
      />
    </>
  );
};
