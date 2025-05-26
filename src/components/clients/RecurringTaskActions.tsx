
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface RecurringTaskActionsProps {
  taskId: string;
  taskName: string;
  isActive: boolean;
  onEdit: (taskId: string, e: React.MouseEvent) => void;
  onDeactivate: (taskId: string) => void;
  onDelete: (taskId: string, taskName: string, e: React.MouseEvent) => void;
}

const RecurringTaskActions: React.FC<RecurringTaskActionsProps> = ({
  taskId,
  taskName,
  isActive,
  onEdit,
  onDeactivate,
  onDelete
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={(e) => onEdit(taskId, e)}
      >
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
      {isActive && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDeactivate(taskId);
          }}
        >
          Deactivate
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm"
        onClick={(e) => onDelete(taskId, taskName, e)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
};

export default RecurringTaskActions;
