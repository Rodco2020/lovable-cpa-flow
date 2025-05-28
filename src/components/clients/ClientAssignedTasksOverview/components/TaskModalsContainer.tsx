
import React from 'react';
import { EditRecurringTaskContainer } from '../../EditRecurringTaskContainer';
import { EditAdHocTaskContainer } from '../../EditAdHocTaskContainer';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import ClientTaskManagementDialog from '../../ClientTaskManagementDialog';

interface TaskModalsContainerProps {
  // Edit task modal props
  editRecurringTaskDialogOpen: boolean;
  setEditRecurringTaskDialogOpen: (open: boolean) => void;
  editAdHocTaskDialogOpen: boolean;
  setEditAdHocTaskDialogOpen: (open: boolean) => void;
  selectedTaskId: string | undefined;
  handleEditComplete: () => void;

  // Delete task modal props
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  taskToDelete: {
    id: string;
    name: string;
    type: 'Ad-hoc' | 'Recurring';
  } | null;
  isDeleting: boolean;
  handleDeleteConfirm: () => void;

  // Task management dialog props
  taskManagementDialogOpen: boolean;
  setTaskManagementDialogOpen: (open: boolean) => void;
  handleTasksRefresh: () => void;
}

/**
 * Container component that manages all modal dialogs for the Client Assigned Tasks Overview
 * Centralizes modal management to reduce clutter in the main component
 */
export const TaskModalsContainer: React.FC<TaskModalsContainerProps> = ({
  editRecurringTaskDialogOpen,
  setEditRecurringTaskDialogOpen,
  editAdHocTaskDialogOpen,
  setEditAdHocTaskDialogOpen,
  selectedTaskId,
  handleEditComplete,
  deleteDialogOpen,
  setDeleteDialogOpen,
  taskToDelete,
  isDeleting,
  handleDeleteConfirm,
  taskManagementDialogOpen,
  setTaskManagementDialogOpen,
  handleTasksRefresh
}) => {
  return (
    <>
      {/* Edit Task Dialogs */}
      <EditRecurringTaskContainer
        open={editRecurringTaskDialogOpen}
        onOpenChange={setEditRecurringTaskDialogOpen}
        taskId={selectedTaskId}
        onSaveComplete={handleEditComplete}
      />
      
      <EditAdHocTaskContainer
        open={editAdHocTaskDialogOpen}
        onOpenChange={setEditAdHocTaskDialogOpen}
        taskId={selectedTaskId}
        onSaveComplete={handleEditComplete}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        taskName={taskToDelete?.name || null}
        taskType={taskToDelete?.type || null}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Task Management Dialog */}
      <ClientTaskManagementDialog
        open={taskManagementDialogOpen}
        onOpenChange={setTaskManagementDialogOpen}
        onTasksRefresh={handleTasksRefresh}
      />
    </>
  );
};
