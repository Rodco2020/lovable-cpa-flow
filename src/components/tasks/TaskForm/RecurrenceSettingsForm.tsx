
import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface RecurrenceSettingsFormProps {
  taskForm: {
    recurrenceType: string;
    interval: number;
    weekdays: number[];
    dayOfMonth: number;
    monthOfYear: number;
    endDate: string;
    customOffsetDays: number;
  };
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleWeekdayChange: (day: number, checked: boolean) => void;
}

/**
 * RecurrenceSettingsForm Component
 * 
 * This component renders recurrence-specific form fields based on the selected recurrence type.
 * It adapts to show relevant controls for daily, weekly, monthly, annual, and custom recurrence patterns.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.taskForm - Task form state values related to recurrence
 * @param {Object} props.formErrors - Form validation errors
 * @param {boolean} props.isSubmitting - Whether the form is currently submitting
 * @param {Function} props.onInputChange - Handler for input field changes
 * @param {Function} props.handleWeekdayChange - Handler for weekday checkbox changes
 */
const RecurrenceSettingsForm: React.FC<RecurrenceSettingsFormProps> = ({
  taskForm,
  formErrors,
  isSubmitting,
  onInputChange,
  handleWeekdayChange
}) => {
  // Array of weekday names for labels
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Determine units label based on recurrence type
  const getIntervalUnitsLabel = () => {
    switch (taskForm.recurrenceType) {
      case 'Daily': return 'day(s)';
      case 'Weekly': return 'week(s)';
      case 'Monthly': return 'month(s)';
      case 'Quarterly': return 'quarter(s)';
      case 'Annually': return 'year(s)';
      default: return 'interval';
    }
  };
  
  return (
    <div className="border p-4 rounded-md space-y-4 bg-gray-50" role="region" aria-label="Recurrence Settings">
      <h4 className="text-sm font-medium">Recurrence Settings</h4>
      
      {/* Interval setting for standard recurrence types */}
      {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'].includes(taskForm.recurrenceType)) && (
        <div className="space-y-2">
          <label htmlFor="interval" className="text-sm font-medium">
            Interval
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Every</span>
            <Input
              id="interval"
              name="interval"
              type="number"
              min="1"
              value={taskForm.interval}
              onChange={onInputChange}
              className="w-20"
              disabled={isSubmitting}
              aria-label={`Recurrence interval in ${getIntervalUnitsLabel()}`}
            />
            <span className="text-sm">{getIntervalUnitsLabel()}</span>
          </div>
        </div>
      )}
      
      {/* Weekly recurrence specific settings */}
      {taskForm.recurrenceType === 'Weekly' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">On which days</label>
          <div className="grid grid-cols-7 gap-2" role="group" aria-label="Weekday selection">
            {weekdayNames.map((day, index) => (
              <div key={day} className="flex flex-col items-center">
                <input
                  type="checkbox"
                  id={`day-${index}`}
                  checked={taskForm.weekdays.includes(index)}
                  onChange={(e) => handleWeekdayChange(index, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={isSubmitting}
                  aria-label={`Repeat on ${day}`}
                />
                <label htmlFor={`day-${index}`} className="text-xs mt-1">
                  {day}
                </label>
              </div>
            ))}
          </div>
          {formErrors.weekdays && (
            <p className="text-sm font-medium text-destructive" role="alert">{formErrors.weekdays}</p>
          )}
        </div>
      )}
      
      {/* Monthly and Annually recurrence settings */}
      {['Monthly', 'Annually'].includes(taskForm.recurrenceType) && (
        <div className="space-y-2">
          <label htmlFor="dayOfMonth" className="text-sm font-medium">
            Day of Month
          </label>
          <Input
            id="dayOfMonth"
            name="dayOfMonth"
            type="number"
            min="1"
            max="31"
            value={taskForm.dayOfMonth}
            onChange={onInputChange}
            disabled={isSubmitting}
            aria-label="Day of month for recurrence"
          />
        </div>
      )}
      
      {/* Annually specific settings */}
      {taskForm.recurrenceType === 'Annually' && (
        <div className="space-y-2">
          <label htmlFor="monthOfYear" className="text-sm font-medium">
            Month
          </label>
          <select
            id="monthOfYear"
            name="monthOfYear"
            value={taskForm.monthOfYear}
            onChange={onInputChange}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isSubmitting}
            aria-label="Month for annual recurrence"
          >
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      )}
      
      {/* Custom recurrence settings */}
      {taskForm.recurrenceType === 'Custom' && (
        <div className="space-y-2">
          <label htmlFor="customOffsetDays" className="text-sm font-medium">
            Days Offset
          </label>
          <div className="flex items-center space-x-2">
            <Input
              id="customOffsetDays"
              name="customOffsetDays"
              type="number"
              value={taskForm.customOffsetDays}
              onChange={onInputChange}
              className="w-20"
              disabled={isSubmitting}
              aria-label="Days after month-end"
            />
            <span className="text-sm">days after month-end</span>
          </div>
        </div>
      )}
      
      {/* End date setting for all recurrence types */}
      <div className="space-y-2">
        <label htmlFor="endDate" className="text-sm font-medium">
          End Date (Optional)
        </label>
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" aria-hidden="true" />
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={taskForm.endDate}
            onChange={onInputChange}
            className="pl-8"
            disabled={isSubmitting}
            aria-label="End date for recurring task"
          />
        </div>
        <p className="text-xs text-gray-500">
          Leave empty for no end date
        </p>
      </div>
    </div>
  );
};

export default RecurrenceSettingsForm;
