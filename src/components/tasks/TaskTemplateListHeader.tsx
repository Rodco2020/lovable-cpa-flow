
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface TaskTemplateListHeaderProps {
  showArchived: boolean;
  onToggleArchived: () => void;
  onCreateTemplate: () => void;
}

/**
 * Header component for the Task Template List
 * Contains the title, archived toggle, and create button
 */
const TaskTemplateListHeader: React.FC<TaskTemplateListHeaderProps> = ({
  showArchived,
  onToggleArchived,
  onCreateTemplate
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Task Templates</h2>
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-archived"
            checked={showArchived}
            onCheckedChange={onToggleArchived}
          />
          <label htmlFor="show-archived" className="text-sm font-medium">
            Show Archived
          </label>
        </div>
        <Button onClick={onCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>
    </div>
  );
};

export default TaskTemplateListHeader;
