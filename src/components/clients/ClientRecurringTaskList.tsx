
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deactivateRecurringTask } from '@/services/taskService';
import { getClientRecurringTasks } from '@/services/clientService';
import { RecurringTask } from '@/types/task';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, Pencil, RefreshCw } from 'lucide-react';
import TaskListPagination from './TaskListPagination';
import { EditRecurringTaskContainer } from './EditRecurringTaskContainer';
import { useSkillNames } from '@/hooks/useSkillNames';

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
    data: tasks = [],
    isLoading: loading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['client', clientId, 'recurring-tasks'],
    queryFn: () => getClientRecurringTasks(clientId),
  });

  const isRefreshing = isFetching && !loading;

  const [currentPage, setCurrentPage] = useState(1);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const tasksPerPage = 5;
  
  // Get all skill IDs from all tasks to fetch their names
  const allSkillIds = tasks.flatMap(task => task.requiredSkills);
  const { skillsMap, isLoading: loadingSkills } = useSkillNames(allSkillIds);


  const handleDeactivate = async (taskId: string) => {
    try {
      const success = await deactivateRecurringTask(taskId);
      if (success) {
        toast.success("Task deactivated successfully");
        await refetch();
        if (onRefreshNeeded) onRefreshNeeded();
      } else {
        toast.error("Failed to deactivate task");
      }
    } catch (error) {
      console.error("Error deactivating task:", error);
      toast.error("An error occurred while deactivating the task");
    }
  };

  const handleRetryLoad = () => {
    refetch();
  };

  const handleEditClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
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

  function formatRecurrencePattern(pattern: RecurringTask['recurrencePattern']): string {
    switch (pattern.type) {
      case 'Daily':
        return `Daily${pattern.interval ? ` every ${pattern.interval} day(s)` : ''}`;
      case 'Weekly':
        return `Weekly${pattern.interval ? ` every ${pattern.interval} week(s)` : ''}${
          pattern.weekdays ? ` on days ${pattern.weekdays.join(', ')}` : ''
        }`;
      case 'Monthly':
        return `Monthly${pattern.interval ? ` every ${pattern.interval} month(s)` : ''}${
          pattern.dayOfMonth ? ` on day ${pattern.dayOfMonth}` : ''
        }`;
      case 'Quarterly':
        return `Quarterly${pattern.dayOfMonth ? ` on day ${pattern.dayOfMonth}` : ''}`;
      case 'Annually':
        return `Annually${pattern.monthOfYear ? ` in month ${pattern.monthOfYear}` : ''}${
          pattern.dayOfMonth ? ` on day ${pattern.dayOfMonth}` : ''
        }`;
      default:
        return `${pattern.type}`;
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recurring Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading recurring tasks...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recurring Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold text-destructive">Error Loading Tasks</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetryLoad} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recurring Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-semibold">No recurring tasks</p>
            <p className="text-muted-foreground">This client doesn't have any recurring tasks set up yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Recurrence</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTasks.map(task => (
                <TableRow 
                  key={task.id} 
                  className={onViewTask ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onViewTask ? onViewTask(task.id) : null}
                >
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{formatRecurrencePattern(task.recurrencePattern)}</TableCell>
                  <TableCell>
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Not set'}
                  </TableCell>
                  <TableCell>
                    {task.estimatedHours}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.requiredSkills && task.requiredSkills.length > 0 ? (
                        task.requiredSkills.map((skillId, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skillId}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handleEditClick(task.id, e)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {task.isActive && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivate(task.id);
                          }}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

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
  );
};

export default ClientRecurringTaskList;
