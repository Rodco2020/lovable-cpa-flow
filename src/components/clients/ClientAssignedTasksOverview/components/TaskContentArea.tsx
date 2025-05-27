
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
  onDeleteTask: (taskId: string, taskType: 'Ad-hoc' | 'Recurring', taskName: string) => void;
}

export const TaskContentArea: React.FC<TaskContentAreaProps> = ({
  isLoading,
  error,
  filteredTasks,
  totalTasks,
  onResetFilters,
  onEditTask,
  onDeleteTask
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (totalTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No client tasks found.</p>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No tasks match your current filters.
        </p>
        <Button variant="outline" onClick={onResetFilters}>
          Reset Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TaskSummaryStats 
        filteredTasks={filteredTasks} 
        totalTasks={totalTasks} 
      />
      <TaskTable 
        tasks={filteredTasks} 
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};
