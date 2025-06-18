
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Edit, Trash2, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RecurringTask } from '@/types/task';
import { getClientRecurringTasks, updateRecurringTask, deactivateRecurringTask } from '@/services/taskService/recurringTaskService';
import { EditRecurringTaskDialog } from './EditRecurringTaskDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ClientRecurringTaskListProps {
  clientId: string;
  onViewTask?: (taskId: string) => void;
  onRefreshNeeded?: () => void;
}

const ClientRecurringTaskList: React.FC<ClientRecurringTaskListProps> = ({ 
  clientId, 
  onViewTask,
  onRefreshNeeded 
}) => {
  const [selectedTask, setSelectedTask] = useState<RecurringTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskLoadError, setTaskLoadError] = useState<string | null>(null);
  const [attemptedTaskLoad, setAttemptedTaskLoad] = useState(false);
  
  const queryClient = useQueryClient();

  // Query for recurring tasks
  const {
    data: recurringTasks,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['client-recurring-tasks', clientId],
    queryFn: () => getClientRecurringTasks(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes (renamed from cacheTime)
  });

  const handleEditTask = (task: RecurringTask) => {
    console.log('[ClientRecurringTaskList] ============= EDIT TASK START =============');
    console.log('[ClientRecurringTaskList] Opening edit dialog for task:', JSON.stringify(task, null, 2));
    console.log('[ClientRecurringTaskList] Task preferredStaffId:', task.preferredStaffId);
    
    setSelectedTask(task);
    setTaskLoadError(null);
    setAttemptedTaskLoad(true);
    setIsEditDialogOpen(true);
    
    console.log('[ClientRecurringTaskList] Edit dialog opened, selectedTask set');
    console.log('[ClientRecurringTaskList] ============= EDIT TASK END =============');
  };

  const handleSaveTask = async (updates: Partial<RecurringTask>) => {
    if (!selectedTask) {
      console.error('[ClientRecurringTaskList] No selected task for update');
      return;
    }

    console.log('[ClientRecurringTaskList] ============= SAVE TASK START =============');
    console.log('[ClientRecurringTaskList] Saving task updates:', JSON.stringify(updates, null, 2));
    console.log('[ClientRecurringTaskList] Selected task ID:', selectedTask.id);
    console.log('[ClientRecurringTaskList] Updates preferredStaffId:', updates.preferredStaffId);

    try {
      const updatedTask = await updateRecurringTask(selectedTask.id, updates);
      
      console.log('[ClientRecurringTaskList] Task update successful, returned task:', JSON.stringify(updatedTask, null, 2));
      console.log('[ClientRecurringTaskList] Returned task preferredStaffId:', updatedTask?.preferredStaffId);
      
      // Invalidate and refetch queries to ensure fresh data
      await queryClient.invalidateQueries({ 
        queryKey: ['client-recurring-tasks', clientId],
        exact: true 
      });
      
      // Also invalidate any other related queries that might cache this task
      await queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey.includes('recurring-tasks') || 
          query.queryKey.includes(selectedTask.id)
      });
      
      console.log('[ClientRecurringTaskList] Queries invalidated, triggering refetch');
      
      // Force refetch to get the latest data
      await refetch();
      
      // Trigger external refresh if provided
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
      
      toast.success('Task updated successfully');
      console.log('[ClientRecurringTaskList] ============= SAVE TASK END =============');
    } catch (error) {
      console.error('[ClientRecurringTaskList] Error saving task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      toast.error(errorMessage);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const handleDeactivateTask = async (task: RecurringTask) => {
    console.log('[ClientRecurringTaskList] Deactivating task:', task.id);
    
    try {
      await deactivateRecurringTask(task.id);
      
      // Invalidate queries and refetch
      await queryClient.invalidateQueries({ 
        queryKey: ['client-recurring-tasks', clientId] 
      });
      await refetch();
      
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
      
      toast.success('Task deactivated successfully');
    } catch (error) {
      console.error('[ClientRecurringTaskList] Error deactivating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate task';
      toast.error(errorMessage);
    }
  };

  const handleRowClick = (task: RecurringTask) => {
    if (onViewTask) {
      onViewTask(task.id);
    }
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedTask(null);
    setTaskLoadError(null);
    setAttemptedTaskLoad(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Tasks</CardTitle>
          <CardDescription>Loading recurring tasks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load recurring tasks. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!recurringTasks || recurringTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Tasks</CardTitle>
          <CardDescription>No recurring tasks found for this client</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recurring tasks</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recurring Tasks ({recurringTasks.length})
          </CardTitle>
          <CardDescription>
            Manage recurring tasks assigned to this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Estimated Hours</TableHead>
                <TableHead>Preferred Staff</TableHead>
                <TableHead>Recurrence</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(task)}
                >
                  <TableCell className="font-medium">
                    {task.name}
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      task.priority === 'High' ? 'destructive' :
                      task.priority === 'Medium' ? 'default' : 'secondary'
                    }>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {task.estimatedHours} hours
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {task.preferredStaffId ? (
                        <span className="text-sm">Staff Assigned</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No preference</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {task.recurrencePattern.type}
                      {task.recurrencePattern.interval && task.recurrencePattern.interval > 1 && 
                        ` (${task.recurrencePattern.interval}x)`
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      format(task.dueDate, 'MMM dd, yyyy')
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.isActive ? 'default' : 'secondary'}>
                      {task.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeactivateTask(task);
                        }}
                        disabled={!task.isActive}
                      >
                        <Trash2 className="h-4 w-4" />
                        Deactivate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditRecurringTaskDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        task={selectedTask}
        onSave={handleSaveTask}
        isLoading={false}
        loadError={taskLoadError}
        attemptedLoad={attemptedTaskLoad}
      />
    </>
  );
};

export default ClientRecurringTaskList;
