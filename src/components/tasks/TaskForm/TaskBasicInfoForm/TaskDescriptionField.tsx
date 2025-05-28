
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TaskDescriptionFieldProps {
  description: string;
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * Task Description Field Component
 * 
 * Handles the task description textarea input
 */
const TaskDescriptionField: React.FC<TaskDescriptionFieldProps> = ({
  description,
  isSubmitting,
  onInputChange
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="description" className="text-sm font-medium">
        Description
      </label>
      <Textarea
        id="description"
        name="description"
        value={description}
        onChange={onInputChange}
        placeholder="Describe the task"
        rows={2}
        disabled={isSubmitting}
      />
    </div>
  );
};

export default TaskDescriptionField;
