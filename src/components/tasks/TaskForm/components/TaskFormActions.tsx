
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface TaskFormActionsProps {
  isSubmitting: boolean;
  isRecurring: boolean;
  selectedTemplate: any;
  taskForm: any;
  onClose: () => void;
  onSubmit: () => void;
}

/**
 * Component for form action buttons (Cancel and Submit)
 */
const TaskFormActions: React.FC<TaskFormActionsProps> = ({
  isSubmitting,
  isRecurring,
  selectedTemplate,
  taskForm,
  onClose,
  onSubmit
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onClose}
        disabled={isSubmitting}
        aria-label="Cancel task creation"
      >
        Cancel
      </Button>
      <Button 
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || !selectedTemplate || !taskForm.clientId}
        aria-label={isRecurring ? "Create recurring task" : "Create ad-hoc task"}
      >
        {isSubmitting ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            {isRecurring ? 'Creating Recurring Task...' : 'Creating Ad-hoc Task...'}
          </>
        ) : (
          isRecurring ? 'Create Recurring Task' : 'Create Ad-hoc Task'
        )}
      </Button>
    </div>
  );
};

export default TaskFormActions;
