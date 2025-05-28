
import React from 'react';
import { TaskTemplate } from '@/types/task';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  editingTemplate: TaskTemplate | null;
  isSubmitting: boolean;
}

/**
 * Component for form action buttons (Cancel and Submit)
 * Handles the submit button text and loading state based on editing mode
 */
const FormActions: React.FC<FormActionsProps> = ({
  editingTemplate,
  isSubmitting
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <DialogClose asChild>
        <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
      </DialogClose>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {editingTemplate ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          editingTemplate ? 'Update Template' : 'Create Template'
        )}
      </Button>
    </div>
  );
};

export default FormActions;
