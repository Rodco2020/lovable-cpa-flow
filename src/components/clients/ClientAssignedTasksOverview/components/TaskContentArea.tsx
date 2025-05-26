
import React from 'react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { TaskTable } from './TaskTable';
import { TaskSummaryStats } from './TaskSummaryStats';
import { FormattedTask } from '../types';

interface TaskContentAreaProps {
  isLoading: boolean;
  error: string | null;
  filteredTasks: FormattedTask[];
  totalTasks: FormattedTask[];
  onResetFilters: () => void;
  onEditTask: (taskId: string, taskType: 'Ad-hoc' | 'Recurring') => void;
}

export const TaskContentArea: React.FC<TaskContentAreaProps> = ({
  isLoading,
  error,
  filteredTasks,
  totalTasks,
  onResetFilters,
  onEditTask
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load tasks</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No tasks match your filters</AlertTitle>
        <AlertDescription>
          Try changing your filter criteria or {" "}
          <Button 
            variant="link" 
            onClick={onResetFilters}
            className="p-0 h-auto"
          >
            reset all filters
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <TaskTable tasks={filteredTasks} onEditTask={onEditTask} />
      <TaskSummaryStats filteredTasks={filteredTasks} totalTasks={totalTasks} />
    </>
  );
};
