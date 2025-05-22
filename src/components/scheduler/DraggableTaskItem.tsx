
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './dndTypes';
import { TaskInstance } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface DraggableTaskItemProps {
  task: TaskInstance;
  getClientName: (clientId: string) => string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({ 
  task, 
  getClientName, 
  onClick,
  children
}) => {
  // Set up the drag source
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { 
      type: ItemTypes.TASK,
      taskId: task.id,
      task: task
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // If children are provided, use them, otherwise render the default content
  if (children) {
    return (
      <div
        ref={drag}
        onClick={onClick}
        className={`${isDragging ? 'opacity-50' : 'hover:bg-slate-50'} 
          cursor-move transition-opacity duration-200`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        role="button"
        tabIndex={0}
        aria-label={`Drag task: ${task.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {children}
      </div>
    );
  }

  // Get styling based on priority
  const getPriorityStyles = () => {
    switch(task.priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Default rendering
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={drag}
            onClick={onClick}
            className={`flex justify-between items-center p-3 border rounded-lg 
              ${isDragging ? 'opacity-50' : 'hover:bg-slate-50'} 
              cursor-move transition-opacity duration-200`}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            role="button"
            tabIndex={0}
            aria-label={`Drag task: ${task.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }}
            data-testid="draggable-task-item"
          >
            <div className="flex-1">
              <h4 className="font-medium">{task.name}</h4>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>{getClientName(task.clientId)}</span>
                <span>•</span>
                <span>{task.estimatedHours} hours</span>
              </div>
              {task.requiredSkills && task.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {task.requiredSkills.map((skillId, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skillId}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className={`px-2 py-1 text-xs rounded-full ${getPriorityStyles()}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Drag this task to schedule it</p>
          <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DraggableTaskItem;
