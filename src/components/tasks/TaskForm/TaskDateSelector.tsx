
import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface TaskDateSelectorProps {
  isRecurring: boolean;
  dueDate: string;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TaskDateSelector: React.FC<TaskDateSelectorProps> = ({
  isRecurring,
  dueDate,
  formErrors,
  isSubmitting,
  onInputChange
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="dueDate" className="text-sm font-medium">
        {isRecurring ? 'First Due Date' : 'Due Date'}
      </label>
      <div className="relative">
        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={onInputChange}
          className={`pl-8 ${formErrors.dueDate ? "border-destructive" : ""}`}
          required
          disabled={isSubmitting}
        />
        {formErrors.dueDate && (
          <p className="text-sm font-medium text-destructive">{formErrors.dueDate}</p>
        )}
      </div>
    </div>
  );
};

export default TaskDateSelector;
