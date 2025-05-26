
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RecurringTaskDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string | null;
  onConfirm: () => void;
}

const RecurringTaskDeleteDialog: React.FC<RecurringTaskDeleteDialogProps> = ({
  open,
  onOpenChange,
  taskName,
  onConfirm
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task Assignment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the assignment "{taskName}"? 
            This will permanently remove the recurring task assignment from this client. 
            The task template will remain available for other clients.
            <br /><br />
            <strong>This action cannot be undone.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Assignment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RecurringTaskDeleteDialog;
