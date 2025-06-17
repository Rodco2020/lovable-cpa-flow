
import React from 'react';
import { RecurringTask } from '@/types/task';

export interface FormHeaderProps {
  task: RecurringTask | null;
  open: boolean;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ task, open }) => {
  if (!task || !open) return null;
  
  return (
    <div className="mb-4 p-4 bg-muted/50 rounded-lg">
      <h3 className="font-semibold text-lg mb-2">Task Information</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Current Status:</span> {task.isActive ? 'Active' : 'Inactive'}
        </div>
        <div>
          <span className="font-medium">Last Updated:</span> {task.updatedAt.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
