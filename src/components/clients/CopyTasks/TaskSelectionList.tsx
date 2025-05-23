
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { TaskInstance, RecurringTask } from '@/types/task';

interface TaskSelectionListProps {
  tasks: (TaskInstance | RecurringTask)[];
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
 * Component for displaying and selecting tasks from a list
 * Used in the copy client tasks dialog for both ad-hoc and recurring tasks
 */
export const TaskSelectionList: React.FC<TaskSelectionListProps> = ({
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
}: TaskSelectionListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Loading {type === 'ad-hoc' ? 'ad-hoc' : 'recurring'} tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <AlertCircle className="h-4 w-4 mx-auto mb-2" />
        Error loading {type === 'ad-hoc' ? 'ad-hoc' : 'recurring'} tasks.
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        {allTasksLength > 0 ? filteredPriorityMessage : emptyMessage}
      </div>
    );
  }

  return (
    <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className="flex items-center p-3 hover:bg-gray-50"
        >
          <Checkbox 
            id={`${type}-${task.id}`}
            checked={selectedTaskIds.has(task.id)}
            onCheckedChange={() => onToggleTask(task.id)}
            className="mr-3"
          />
          <div className="flex-1">
            <label 
              htmlFor={`${type}-${task.id}`} 
              className="font-medium cursor-pointer"
            >
              {task.name}
            </label>
            <div className="text-xs text-gray-500 mt-1">
              {task.description && <p>{task.description}</p>}
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {task.estimatedHours}h
                </Badge>
                <Badge variant={`${task.priority?.toLowerCase() === 'high' ? 'destructive' : 'outline'}`} className="text-xs">
                  {task.priority}
                </Badge>
                {type === 'recurring' && ('recurrencePattern' in task) && (
                  <Badge variant="outline" className="text-xs">
                    {task.recurrencePattern?.type}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
