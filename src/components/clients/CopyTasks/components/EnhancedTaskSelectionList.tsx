
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, FileText, Clock, Star } from 'lucide-react';
import { UnifiedTask } from '../hooks/useEnhancedTaskSelection';

interface EnhancedTaskSelectionListProps {
  tasks: UnifiedTask[];
  selectedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  isLoading?: boolean;
}

export const EnhancedTaskSelectionList: React.FC<EnhancedTaskSelectionListProps> = ({
  tasks,
  selectedTaskIds,
  onToggleTask,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
          <p className="text-muted-foreground">
            No tasks match the current filter criteria. Try adjusting your filters or search term.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDueDate = (dueDate: Date | null) => {
    if (!dueDate) return 'No due date';
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {tasks.map((task) => {
        const isSelected = selectedTaskIds.includes(task.id);
        const isRecurring = task.taskType === 'recurring';
        
        return (
          <Card 
            key={task.id} 
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onToggleTask(task.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={isSelected}
                  onChange={() => onToggleTask(task.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {isRecurring ? (
                      <RotateCcw className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    <h4 className="font-medium text-sm truncate">{task.name}</h4>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimatedHours}h</span>
                    </div>
                    
                    <div>
                      <span>{task.category}</span>
                    </div>
                    
                    <div>
                      <span>{formatDueDate(task.dueDate)}</span>
                    </div>
                    
                    {isRecurring && 'recurrencePattern' in task && (
                      <div className="flex items-center space-x-1">
                        <RotateCcw className="h-3 w-3" />
                        <span>{task.recurrencePattern.type}</span>
                      </div>
                    )}
                  </div>
                  
                  {task.requiredSkills && task.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.requiredSkills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {task.requiredSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{task.requiredSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
