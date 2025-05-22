
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './dndTypes';
import { TaskInstance } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';
import { useSkillNames } from '@/hooks/useSkillNames';

interface DraggableTaskItemProps {
  task: TaskInstance;
  getClientName: (clientId: string) => string;
  onClick?: () => void;
  children?: React.ReactNode; // Added children prop
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

  // Extract skills for display
  const { skillsMap } = useSkillNames(task.requiredSkills || []);
  
  // Get skill name by ID
  const getSkillName = (skillId: string): string => {
    return skillsMap[skillId]?.name || skillId;
  };

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

  // If children are provided, use them, otherwise render the default content
  if (children) {
    return (
      <div
        ref={drag}
        onClick={onClick}
        className={`${isDragging ? 'opacity-50' : 'hover:bg-slate-50'} 
          cursor-move transition-opacity duration-200`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {children}
      </div>
    );
  }

  // Default rendering
  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`flex justify-between items-center p-3 border rounded-lg 
        ${isDragging ? 'opacity-50' : 'hover:bg-slate-50'} 
        cursor-move transition-opacity duration-200`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
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
                {getSkillName(skillId)}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className={`px-2 py-1 text-xs rounded-full ${getPriorityStyles()}`}>
        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
      </div>
    </div>
  );
};

export default DraggableTaskItem;
