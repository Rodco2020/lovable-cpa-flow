
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
}

/**
 * TaskSelectionPanel Component 
 * 
 * Displays a panel for selecting tasks to copy, with separate handling for
 * ad-hoc and recurring task types.
 */
const TaskSelectionPanel: React.FC<TaskSelectionPanelProps> = ({
  tasks,
  selectedTaskIds,
  onToggleTask,
  type,
  onSelectAll,
  isLoading = false,
  error = null,
  emptyMessage = "No tasks available for selection"
}) => {
  const title = type === 'ad-hoc' ? 'Ad-Hoc Tasks' : 'Recurring Tasks';
  
  // We need to cast tasks to the correct type to satisfy TypeScript
  // This is safe because we know the actual task type based on the 'type' prop
  const typedTasks = type === 'ad-hoc' 
    ? tasks as TaskInstance[]
    : tasks as RecurringTask[];

  // Create a proper error object if error is null to satisfy TypeScript
  const errorObj = error ? error : { name: 'Error', message: '' };
  
  // Add missing props for TaskSelectionList
  const filteredPriorityMessage = '';
  const allTasksLength = tasks.length;

  return (
    <div className="h-full border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="text-md font-medium">{title}</h3>
      </div>
      <div className="p-6 pt-0">
        {type === 'ad-hoc' ? (
          <TaskSelectionList<TaskInstance>
            tasks={typedTasks as TaskInstance[]}
            selectedTaskIds={new Set(selectedTaskIds)}
            onToggleTask={onToggleTask}
            type={type}
            onSelectAll={() => onSelectAll(typedTasks)}
            isLoading={isLoading}
            error={errorObj}
            emptyMessage={emptyMessage}
            filteredPriorityMessage={filteredPriorityMessage}
            allTasksLength={allTasksLength}
          />
        ) : (
          <TaskSelectionList<RecurringTask>
            tasks={typedTasks as RecurringTask[]}
            selectedTaskIds={new Set(selectedTaskIds)}
            onToggleTask={onToggleTask}
            type={type}
            onSelectAll={() => onSelectAll(typedTasks)}
            isLoading={isLoading}
            error={errorObj}
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
