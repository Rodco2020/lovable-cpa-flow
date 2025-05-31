
import { useRef, useEffect } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RecurringTask } from '@/types/task';

interface FormHeaderProps {
  task: RecurringTask | null;
  open: boolean;
}

export const FormHeader = ({ task, open }: FormHeaderProps) => {
  const formTitleRef = useRef<HTMLHeadingElement>(null);

  // Focus on title when dialog opens
  useEffect(() => {
    if (open && formTitleRef.current) {
      setTimeout(() => {
        formTitleRef.current?.focus();
      }, 100);
    }
  }, [open]);

  return (
    <DialogHeader>
      <DialogTitle id="edit-task-title" ref={formTitleRef} tabIndex={-1}>
        Edit Recurring Task {task?.isActive === false && <span className="ml-2 text-sm text-muted-foreground">(Inactive)</span>}
      </DialogTitle>
    </DialogHeader>
  );
};
