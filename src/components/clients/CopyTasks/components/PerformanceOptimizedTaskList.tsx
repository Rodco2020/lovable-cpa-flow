
import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UnifiedTask } from '../hooks/useEnhancedTaskSelection';

interface PerformanceOptimizedTaskListProps {
  tasks: UnifiedTask[];
  selectedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  height?: number;
  itemHeight?: number;
}

interface TaskItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    tasks: UnifiedTask[];
    selectedTaskIds: string[];
    onToggleTask: (taskId: string) => void;
  };
}

const TaskItem: React.FC<TaskItemProps> = ({ index, style, data }) => {
  const { tasks, selectedTaskIds, onToggleTask } = data;
  const task = tasks[index];
  const isSelected = selectedTaskIds.includes(task.id);

  const handleToggle = useCallback(() => {
    onToggleTask(task.id);
  }, [task.id, onToggleTask]);

  return (
    <div style={style} className="px-2">
      <Card className={`p-3 ${isSelected ? 'ring-2 ring-primary' : ''} transition-all`}>
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleToggle}
            aria-label={`Select ${task.name}`}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-sm truncate">{task.name}</h4>
              <Badge 
                variant={task.taskType === 'recurring' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {task.taskType}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
              <span>Category: {task.category}</span>
              <span>Priority: {task.priority}</span>
              <span>Hours: {task.estimatedHours}</span>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export const PerformanceOptimizedTaskList: React.FC<PerformanceOptimizedTaskListProps> = ({
  tasks,
  selectedTaskIds,
  onToggleTask,
  height = 400,
  itemHeight = 80
}) => {
  const itemData = useMemo(() => ({
    tasks,
    selectedTaskIds,
    onToggleTask
  }), [tasks, selectedTaskIds, onToggleTask]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks found matching your criteria.
      </div>
    );
  }

  // Use virtualization for large lists (> 50 items)
  if (tasks.length > 50) {
    return (
      <div className="border rounded-md">
        <List
          height={height}
          itemCount={tasks.length}
          itemSize={itemHeight}
          itemData={itemData}
        >
          {TaskItem}
        </List>
      </div>
    );
  }

  // Render normally for smaller lists
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          index={index}
          style={{}}
          data={itemData}
        />
      ))}
    </div>
  );
};
