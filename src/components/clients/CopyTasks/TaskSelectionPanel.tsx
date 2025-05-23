
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TaskSelectionList } from './TaskSelectionList';
import { TaskInstance, RecurringTask } from '@/types/task';

interface TaskSelectionPanelProps {
  title: string;
  tasks: TaskInstance[] | RecurringTask[];
  selectedTaskIds: Set<string>;
  onToggleTask: (taskId: string) => void;
  onSelectAll: () => void;
  isLoading: boolean;
  error: unknown;
  emptyMessage: string;
  filteredPriorityMessage: string;
  allTasksLength: number;
  type: 'ad-hoc' | 'recurring';
}

/**
 * Renders a panel for selecting either ad-hoc or recurring tasks
 * Optimized for performance with large lists
 */
export const TaskSelectionPanel: React.FC<TaskSelectionPanelProps> = React.memo(({
  title,
  tasks,
  selectedTaskIds,
  onToggleTask,
  onSelectAll,
  isLoading,
  error,
  emptyMessage,
  filteredPriorityMessage,
  allTasksLength,
  type
}) => {
  // Check if all tasks are selected
  const isAllSelected = tasks.length > 0 && selectedTaskIds.size === tasks.length;
  
  // Check if there are available tasks but none match the current filter
  const noFilteredTasks = allTasksLength > 0 && tasks.length === 0;
  
  // Custom rendering for different states
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-md">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-md">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-600 rounded-md text-center">
            Failed to load tasks. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md">{title}</CardTitle>
          {allTasksLength > 0 && (
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
        {allTasksLength > 0 && (
          <div className="text-xs text-muted-foreground">
            {selectedTaskIds.size} of {tasks.length} selected
          </div>
        )}
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <TaskSelectionList
            tasks={tasks}
            selectedTaskIds={selectedTaskIds}
            onToggleTask={onToggleTask}
            type={type}
          />
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            {noFilteredTasks ? filteredPriorityMessage : emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TaskSelectionPanel.displayName = 'TaskSelectionPanel';
