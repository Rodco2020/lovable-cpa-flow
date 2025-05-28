
import React from 'react';
import { Input } from '@/components/ui/input';

interface TaskDetailsFormProps {
  name: string;
  estimatedHours: number;
  isSubmitting: boolean;
  formErrors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Task Details Form Component
 * 
 * Handles task name and estimated hours input with validation
 */
const TaskDetailsForm: React.FC<TaskDetailsFormProps> = ({
  name,
  estimatedHours,
  isSubmitting,
  formErrors,
  onInputChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Task Name
        </label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={onInputChange}
          placeholder="Enter task name"
          required
          disabled={isSubmitting}
          className={formErrors.name ? "border-destructive" : ""}
        />
        {formErrors.name && (
          <p className="text-sm font-medium text-destructive">{formErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="estimatedHours" className="text-sm font-medium">
          Estimated Hours
        </label>
        <Input
          id="estimatedHours"
          name="estimatedHours"
          type="number"
          min="0.25"
          step="0.25"
          value={estimatedHours}
          onChange={onInputChange}
          required
          disabled={isSubmitting}
          className={formErrors.estimatedHours ? "border-destructive" : ""}
        />
        {formErrors.estimatedHours && (
          <p className="text-sm font-medium text-destructive">{formErrors.estimatedHours}</p>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsForm;
