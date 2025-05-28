
import React from 'react';

interface RecurringTaskToggleProps {
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  isSubmitting: boolean;
}

/**
 * Component for toggling between ad-hoc and recurring task modes
 */
const RecurringTaskToggle: React.FC<RecurringTaskToggleProps> = ({
  isRecurring,
  setIsRecurring,
  isSubmitting
}) => {
  return (
    <div className="border-t pt-4 space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isRecurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          disabled={isSubmitting}
          aria-label="Enable recurring task"
        />
        <label htmlFor="isRecurring" className="text-sm font-medium">
          This is a recurring task
        </label>
      </div>
    </div>
  );
};

export default RecurringTaskToggle;
