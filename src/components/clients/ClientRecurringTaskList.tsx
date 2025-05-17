
import React, { useState, useEffect } from 'react';
import { getRecurringTasks, deactivateRecurringTask } from '@/services/taskService';
import { RecurringTask } from '@/types/task';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import TaskListPagination from './TaskListPagination';

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
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const loadTasks = async () => {
    setLoading(true);
    try {
      const allTasks = await getRecurringTasks(false);
      const clientTasks = allTasks.filter(task => task.clientId === clientId);
      setTasks(clientTasks);
    } catch (error) {
      console.error("Error loading recurring tasks:", error);
      toast.error("Failed to load recurring tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [clientId]);

  const handleDeactivate = async (taskId: string) => {
    try {
      const success = await deactivateRecurringTask(taskId);
      if (success) {
        toast.success("Task deactivated successfully");
        loadTasks();
        if (onRefreshNeeded) onRefreshNeeded();
      } else {
        toast.error("Failed to deactivate task");
      }
    } catch (error) {
      console.error("Error deactivating task:", error);
      toast.error("An error occurred while deactivating the task");
    }
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
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Recurring Tasks ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Recurrence</TableHead>
              <TableHead>Next Due</TableHead>
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
                  {task.isActive ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <CheckCircle className="mr-1 h-3 w-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4">
            <TaskListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientRecurringTaskList;
