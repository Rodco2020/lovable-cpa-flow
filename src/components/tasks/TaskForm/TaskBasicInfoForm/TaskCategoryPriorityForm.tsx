
import React from 'react';
import { TaskPriority, TaskCategory } from '@/types/task';

interface TaskCategoryPriorityFormProps {
  priority: TaskPriority;
  category: TaskCategory;
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Task Category and Priority Form Component
 * 
 * Handles priority and category selection dropdowns
 */
const TaskCategoryPriorityForm: React.FC<TaskCategoryPriorityFormProps> = ({
  priority,
  category,
  isSubmitting,
  onInputChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={priority}
          onChange={onInputChange}
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          disabled={isSubmitting}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={onInputChange}
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          disabled={isSubmitting}
        >
          <option value="Tax">Tax</option>
          <option value="Audit">Audit</option>
          <option value="Advisory">Advisory</option>
          <option value="Compliance">Compliance</option>
          <option value="Bookkeeping">Bookkeeping</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCategoryPriorityForm;
