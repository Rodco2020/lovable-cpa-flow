
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Pause,
  Play
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskData {
  id: string;
  name: string;
  description?: string;
  estimated_hours: number;
  priority: string;
  category: string;
  status: string;
  due_date?: string;
  required_skills: string[];
  is_active?: boolean;
  recurrence_type?: string;
}

interface ClientTaskTableProps {
  clientId: string;
  taskType: 'recurring' | 'instances' | 'all';
  filters: {
    status?: string[];
    skills?: string[];
    categories?: string[];
    priorities?: string[];
    dateRange?: { start: Date; end: Date };
  };
  onTaskSelect: (task: TaskData) => void;
  onDrillDown?: (taskId: string, skill: string) => void;
}

const getStatusIcon = (status: string, isActive?: boolean) => {
  if (status === 'Completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (status === 'In Progress') return <Play className="h-4 w-4 text-blue-600" />;
  if (isActive === false) return <Pause className="h-4 w-4 text-gray-600" />;
  return <AlertCircle className="h-4 w-4 text-orange-600" />;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'destructive';
    case 'Medium': return 'default';
    case 'Low': return 'secondary';
    default: return 'outline';
  }
};

const ClientTaskTable: React.FC<ClientTaskTableProps> = ({
  clientId,
  taskType,
  filters,
  onTaskSelect,
  onDrillDown
}) => {
  const [sortField, setSortField] = useState<keyof TaskData>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch data based on task type
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['client-tasks', clientId, taskType, filters],
    queryFn: async () => {
      let query;
      
      if (taskType === 'recurring' || taskType === 'all') {
        const recurringQuery = supabase
          .from('recurring_tasks')
          .select(`
            id,
            name,
            description,
            estimated_hours,
            priority,
            category,
            status,
            due_date,
            required_skills,
            is_active,
            recurrence_type
          `)
          .eq('client_id', clientId);

        if (taskType === 'recurring') {
          const { data: recurringData, error: recurringError } = await recurringQuery;
          if (recurringError) throw recurringError;
          return recurringData || [];
        }
      }

      if (taskType === 'instances' || taskType === 'all') {
        const instancesQuery = supabase
          .from('task_instances')
          .select(`
            id,
            name,
            description,
            estimated_hours,
            priority,
            category,
            status,
            due_date,
            required_skills
          `)
          .eq('client_id', clientId);

        if (filters.dateRange) {
          instancesQuery
            .gte('due_date', filters.dateRange.start.toISOString())
            .lte('due_date', filters.dateRange.end.toISOString());
        }

        if (taskType === 'instances') {
          const { data: instancesData, error: instancesError } = await instancesQuery;
          if (instancesError) throw instancesError;
          return instancesData || [];
        }
      }

      // For 'all' type, combine both
      if (taskType === 'all') {
        const [recurringResult, instancesResult] = await Promise.all([
          supabase
            .from('recurring_tasks')
            .select(`
              id,
              name,
              description,
              estimated_hours,
              priority,
              category,
              status,
              due_date,
              required_skills,
              is_active,
              recurrence_type
            `)
            .eq('client_id', clientId),
          supabase
            .from('task_instances')
            .select(`
              id,
              name,
              description,
              estimated_hours,
              priority,
              category,
              status,
              due_date,
              required_skills
            `)
            .eq('client_id', clientId)
        ]);

        if (recurringResult.error) throw recurringResult.error;
        if (instancesResult.error) throw instancesResult.error;

        return [
          ...(recurringResult.data || []),
          ...(instancesResult.data || [])
        ];
      }

      return [];
    },
    enabled: !!clientId
  });

  // Apply filters and sorting
  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];

    let filtered = tasks.filter(task => {
      // Status filter
      if (filters.status?.length && !filters.status.includes(task.status)) {
        return false;
      }

      // Skills filter
      if (filters.skills?.length && 
          !filters.skills.some(skill => task.required_skills.includes(skill))) {
        return false;
      }

      // Category filter
      if (filters.categories?.length && !filters.categories.includes(task.category)) {
        return false;
      }

      // Priority filter
      if (filters.priorities?.length && !filters.priorities.includes(task.priority)) {
        return false;
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [tasks, filters, sortField, sortDirection]);

  const handleSort = (field: keyof TaskData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSkillDrillDown = (taskId: string, skill: string) => {
    onDrillDown?.(taskId, skill);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">Error loading tasks</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Task Details ({filteredAndSortedTasks.length})</span>
          <Badge variant="outline">
            {taskType === 'all' ? 'All Tasks' : 
             taskType === 'recurring' ? 'Recurring Tasks' : 'Task Instances'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  Task Name
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('required_skills')}
                >
                  Skills Required
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('estimated_hours')}
                >
                  Hours
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('due_date')}
                >
                  Due Date
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('priority')}
                >
                  Priority
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{task.name}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                        {task.recurrence_type && (
                          <Badge variant="secondary" className="text-xs">
                            {task.recurrence_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.required_skills.map((skill) => (
                        <Button
                          key={skill}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs hover:bg-primary/10"
                          onClick={() => handleSkillDrillDown(task.id, skill)}
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-sm">{task.estimated_hours}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No due date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(task.priority) as any}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status, task.is_active)}
                      <span className="text-sm">{task.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskSelect(task)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAndSortedTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found matching the current filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientTaskTable;
