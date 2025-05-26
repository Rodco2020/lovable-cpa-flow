
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, RefreshCw } from 'lucide-react';
import TaskListPagination from './TaskListPagination';
import { EditRecurringTaskContainer } from './EditRecurringTaskContainer';
import { useSkillNames } from '@/hooks/useSkillNames';
import { useRecurringTaskOperations } from './hooks/useRecurringTaskOperations';
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

const ClientRecurringTaskList: React.FC<ClientRecurringTaskListProps> = ({ 
  clientId, 
  onRefreshNeeded,
  onViewTask 
}) => {
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

  const [currentPage, setCurrentPage] = useState(1);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const tasksPerPage = 5;
  
  // Get all skill IDs from all tasks to fetch their names
  const allSkillIds = tasks.flatMap(task => task.requiredSkills);
  const { skillsMap, isLoading: loadingSkills } = useSkillNames(allSkillIds);

  const handleEditClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(taskId);
    setIsEditDialogOpen(true);
  };

  const handleSaveComplete = async () => {
    await refetch();
    if (onRefreshNeeded) onRefreshNeeded();
    setEditingTaskId(undefined);
  };

  // Get current tasks for pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

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
