
import React from 'react';
import { Button } from '@/components/ui/button';
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
 * Component that wraps the TaskSelectionList with a header and select all button
 */
export const TaskSelectionPanel: React.FC<TaskSelectionPanelProps> = ({
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
  return (
    <div className={type === 'ad-hoc' ? "mb-4" : ""}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSelectAll}
          disabled={!tasks || tasks.length === 0}
        >
          {tasks && selectedTaskIds.size === tasks.length 
            ? 'Deselect All' 
            : 'Select All'}
        </Button>
      </div>
      
      <TaskSelectionList
        tasks={tasks}
        selectedTaskIds={selectedTaskIds}
        onToggleTask={onToggleTask}
        onSelectAll={onSelectAll}
        isLoading={isLoading}
        error={error}
        emptyMessage={emptyMessage}
        filteredPriorityMessage={filteredPriorityMessage}
        allTasksLength={allTasksLength}
        type={type}
      />
    </div>
  );
};
