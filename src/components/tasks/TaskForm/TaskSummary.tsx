
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaskCategory } from '@/types/task';

interface TaskSummaryProps {
  isRecurring: boolean;
  category: TaskCategory;
  dueDate: string;
  recurrenceType?: string;
  endDate?: string;
}

const TaskSummary: React.FC<TaskSummaryProps> = ({
  isRecurring,
  category,
  dueDate,
  recurrenceType,
  endDate
}) => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <AlertDescription>
        {isRecurring ? (
          <div className="text-sm">
            <span className="font-medium">Summary:</span> Creating a recurring {category} task
            {dueDate && <span> starting on <span className="font-semibold">{new Date(dueDate).toLocaleDateString()}</span></span>}
            {recurrenceType && <span> that repeats <span className="font-semibold">{recurrenceType.toLowerCase()}</span></span>}
            {endDate && <span> until <span className="font-semibold">{new Date(endDate).toLocaleDateString()}</span></span>}
          </div>
        ) : (
          <div className="text-sm">
            <span className="font-medium">Summary:</span> Creating a single {category} task
            {dueDate && <span> due on <span className="font-semibold">{new Date(dueDate).toLocaleDateString()}</span></span>}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default TaskSummary;
