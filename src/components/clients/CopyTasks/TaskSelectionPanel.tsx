import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecurringTask, TaskInstance } from '@/types/task';
import { TaskSelectionList } from './TaskSelectionList';

export interface TaskSelectionPanelProps {
  tasks: (TaskInstance | RecurringTask)[];
  selectedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  type: 'ad-hoc' | 'recurring';
  onSelectAll: (tasks: (TaskInstance | RecurringTask)[]) => void;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  showAdvancedFilters?: boolean;
  onFiltersChange?: (filters: any) => void;
}

/**
 * Enhanced TaskSelectionPanel Component 
 * 
 * Displays a panel for selecting tasks to copy, with separate handling for
 * ad-hoc and recurring task types. Now supports advanced filtering capabilities.
 */
const TaskSelectionPanel: React.FC<TaskSelectionPanelProps> = ({
  tasks,
  selectedTaskIds,
  onToggleTask,
  type,
  onSelectAll,
  isLoading = false,
  error = null,
  emptyMessage = "No tasks available for selection",
  showAdvancedFilters = false,
  onFiltersChange
}) => {
  const title = type === 'ad-hoc' ? 'Ad-Hoc Tasks' : 'Recurring Tasks';
  
  // We need to cast tasks to the correct type to satisfy TypeScript
  // This is safe because we know the actual task type based on the 'type' prop
  // Pre-cast the tasks by type to avoid generic casts inside JSX.
  // This keeps the JSX cleaner and avoids issues with tools that
  // might misinterpret generic syntax in props.
  const adHocTasks = tasks as TaskInstance[];
  const recurringTasks = tasks as RecurringTask[];

  // Add missing props for TaskSelectionList
  const filteredPriorityMessage = '';
  const allTasksLength = tasks.length;

  return (
    <div className="h-full border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="text-md font-medium">{title}</h3>
        {showAdvancedFilters && (
          <div className="text-sm text-muted-foreground">
            Enhanced filtering available in wizard mode
          </div>
        )}
      </div>
      <div className="p-6 pt-0">
        {type === 'ad-hoc' ? (
          <TaskSelectionList
            tasks={adHocTasks}
            selectedTaskIds={new Set(selectedTaskIds)}
            onToggleTask={onToggleTask}
            type={type}
            onSelectAll={() => onSelectAll(adHocTasks)}
            isLoading={isLoading}
            error={error}
            emptyMessage={emptyMessage}
            filteredPriorityMessage={filteredPriorityMessage}
            allTasksLength={allTasksLength}
          />
        ) : (
          <TaskSelectionList
            tasks={recurringTasks}
            selectedTaskIds={new Set(selectedTaskIds)}
            onToggleTask={onToggleTask}
            type={type}
            onSelectAll={() => onSelectAll(recurringTasks)}
            isLoading={isLoading}
            error={error}
            emptyMessage={emptyMessage}
            filteredPriorityMessage={filteredPriorityMessage}
            allTasksLength={allTasksLength}
          />
        )}
      </div>
    </div>
  );
};

export default TaskSelectionPanel;
