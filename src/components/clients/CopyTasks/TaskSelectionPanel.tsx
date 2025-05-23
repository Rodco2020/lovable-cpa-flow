
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecurringTask, TaskInstance } from '@/types/task';
import { TaskSelectionPanelProps } from './types';
import { TaskSelectionList } from './TaskSelectionList';

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

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {type === 'ad-hoc' ? (
          <TaskSelectionList<TaskInstance>
            tasks={typedTasks as TaskInstance[]}
            selectedTaskIds={selectedTaskIds}
            onToggleTask={onToggleTask}
            type={type}
            // Fix the type error by properly typing the onSelectAll function
            onSelectAll={() => onSelectAll(typedTasks)}
            isLoading={isLoading}
            error={error}
            emptyMessage={emptyMessage}
          />
        ) : (
          <TaskSelectionList<RecurringTask>
            tasks={typedTasks as RecurringTask[]}
            selectedTaskIds={selectedTaskIds}
            onToggleTask={onToggleTask}
            type={type}
            // Fix the type error by properly typing the onSelectAll function
            onSelectAll={() => onSelectAll(typedTasks)}
            isLoading={isLoading}
            error={error}
            emptyMessage={emptyMessage}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TaskSelectionPanel;
