
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Archive, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskTemplateActionsProps {
  templateId: string;
  templateName: string;
  isArchived: boolean;
  onEdit: (templateId: string, e: React.MouseEvent) => void;
  onArchive: (templateId: string) => void;
  onDelete: (templateId: string, templateName: string, e: React.MouseEvent) => void;
}

/**
 * Component for displaying action buttons for task templates
 * Provides edit, archive, and delete functionality with proper event handling
 */
const TaskTemplateActions: React.FC<TaskTemplateActionsProps> = ({
  templateId,
  templateName,
  isArchived,
  onEdit,
  onArchive,
  onDelete
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(templateId, e);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive(templateId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(templateId, templateName, e);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isArchived && (
          <>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskTemplateActions;
