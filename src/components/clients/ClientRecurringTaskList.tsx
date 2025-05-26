
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, RefreshCw } from 'lucide-react';
import TaskListPagination from './TaskListPagination';
import { EditRecurringTaskContainer } from './EditRecurringTaskContainer';
import { useSkillNames } from '@/hooks/useSkillNames';
import { useRecurringTaskOperations } from './hooks/useRecurringTaskOperations';
import { usePagination } from './hooks/usePagination';
import RecurringTaskTable from './RecurringTaskTable';
import RecurringTaskDeleteDialog from './RecurringTaskDeleteDialog';
import { 
  RecurringTaskLoadingState, 
  RecurringTaskErrorState, 
  RecurringTaskEmptyState 
} from './RecurringTaskStates';

interface ClientRecurringTaskListProps {
  clientId: string;
  onRefreshNeeded?: () => void;
  onViewTask?: (taskId: string) => void;
}

/**
 * ClientRecurringTaskList Component
 * 
 * Displays a paginated list of recurring tasks for a specific client.
 * Provides functionality to:
 * - View task details
 * - Edit task assignments
 * - Deactivate active tasks
 * - Delete task assignments with confirmation
 * - Handle loading, error, and empty states
 * 
 * @param clientId - The ID of the client whose tasks to display
 * @param onRefreshNeeded - Optional callback triggered when data needs to be refreshed
 * @param onViewTask - Optional callback triggered when a task is clicked for viewing
 */
const ClientRecurringTaskList: React.FC<ClientRecurringTaskListProps> = ({ 
  clientId, 
  onRefreshNeeded,
  onViewTask 
}) => {
  // Task operations and data management
  const {
    tasks,
    loading,
    error,
    isRefreshing,
    deleteDialogOpen,
    taskToDelete,
    setDeleteDialogOpen,
    handleDeactivate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleRetryLoad,
    refetch
  } = useRecurringTaskOperations({ clientId, onRefreshNeeded });

  // Pagination management
  const {
    currentPage,
    totalPages,
    currentItems: currentTasks,
    setCurrentPage
  } = usePagination({
    items: tasks,
    itemsPerPage: 5
  });

  // Edit dialog state
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Get all skill IDs from all tasks to fetch their names
  const allSkillIds = tasks.flatMap(task => task.requiredSkills);
  const { skillsMap, isLoading: loadingSkills } = useSkillNames(allSkillIds);

  /**
   * Handles the edit button click for a task
   * Prevents event propagation to avoid triggering row click
   */
  const handleEditClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(taskId);
    setIsEditDialogOpen(true);
  };

  /**
   * Handles successful save completion
   * Refreshes the task list and notifies parent if needed
   */
  const handleSaveComplete = async () => {
    await refetch();
    if (onRefreshNeeded) onRefreshNeeded();
    setEditingTaskId(undefined);
  };

  // Handle different states
  if (loading) {
    return <RecurringTaskLoadingState />;
  }

  if (error) {
    return <RecurringTaskErrorState error={error} onRetry={handleRetryLoad} />;
  }

  if (tasks.length === 0) {
    return <RecurringTaskEmptyState />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recurring Tasks ({tasks.length})
          </CardTitle>
          {isRefreshing && (
            <div className="flex items-center text-sm text-muted-foreground">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </div>
          )}
        </CardHeader>
        <CardContent>
          <RecurringTaskTable
            tasks={currentTasks}
            onViewTask={onViewTask}
            onEdit={handleEditClick}
            onDeactivate={handleDeactivate}
            onDelete={handleDeleteClick}
          />

          {totalPages > 1 && (
            <div className="mt-4">
              <TaskListPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
          
          {/* Edit Task Dialog */}
          <EditRecurringTaskContainer
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            taskId={editingTaskId}
            onSaveComplete={handleSaveComplete}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <RecurringTaskDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        taskName={taskToDelete?.name || null}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ClientRecurringTaskList;
