
import React, { useState } from 'react';
import { TaskInstance, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ClipboardList } from 'lucide-react';

interface ClientAdHocTaskListProps {
  tasks: TaskInstance[];
  onViewTask?: (taskId: string) => void;
}

const ClientAdHocTaskList: React.FC<ClientAdHocTaskListProps> = ({
  tasks,
  onViewTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'dueDate' | 'status' | 'priority' | 'hours'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  // Filter tasks by search term and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'dueDate') {
      // Handle null due dates
      if (!a.dueDate) return sortOrder === 'asc' ? 1 : -1;
      if (!b.dueDate) return sortOrder === 'asc' ? -1 : 1;
      
      return sortOrder === 'asc' 
        ? a.dueDate.getTime() - b.dueDate.getTime() 
        : b.dueDate.getTime() - a.dueDate.getTime();
    } else if (sortBy === 'status') {
      const statusOrder = { 
        'Unscheduled': 0, 
        'Scheduled': 1, 
        'In Progress': 2, 
        'Completed': 3, 
        'Canceled': 4 
      };
      return sortOrder === 'asc'
        ? statusOrder[a.status] - statusOrder[b.status]
        : statusOrder[b.status] - statusOrder[a.status];
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'Low': 0, 'Medium': 1, 'High': 2, 'Urgent': 3 };
      return sortOrder === 'asc'
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === 'hours') {
      return sortOrder === 'asc'
        ? a.estimatedHours - b.estimatedHours
        : b.estimatedHours - a.estimatedHours;
    }
    return 0;
  });

  // Toggle sort direction
  const toggleSort = (field: 'name' | 'dueDate' | 'status' | 'priority' | 'hours') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'Unscheduled': return 'outline';
      case 'Scheduled': return 'secondary';
      case 'In Progress': return 'default';
      case 'Completed': return { variant: 'outline', className: 'bg-green-100 text-green-800 hover:bg-green-200' };
      case 'Canceled': return 'destructive';
      default: return 'default';
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Low': return 'outline';
      case 'Medium': return 'secondary';
      case 'High': return 'default';
      case 'Urgent': return 'destructive';
      default: return 'default';
    }
  };

  // Format date function
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not set';
    return format(date, 'MMM d, yyyy');
  };

  // Render empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-muted/20">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
        <h3 className="font-medium">No Ad-hoc Tasks</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This client doesn't have any ad-hoc tasks assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Status:</span>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Unscheduled">Unscheduled</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select 
              value={sortBy} 
              onValueChange={(value) => setSortBy(value as any)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
            </Button>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">No tasks match your search criteria</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('name')}
                >
                  Task Name
                  {sortBy === 'name' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('dueDate')}
                >
                  Due Date
                  {sortBy === 'dueDate' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead>Skills</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('status')}
                >
                  Status
                  {sortBy === 'status' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('priority')}
                >
                  Priority
                  {sortBy === 'priority' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer"
                  onClick={() => toggleSort('hours')}
                >
                  Hours
                  {sortBy === 'hours' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className={onViewTask ? "cursor-pointer hover:bg-muted" : ""}
                  onClick={() => onViewTask && onViewTask(task.id)}
                >
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="bg-slate-100 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeof getStatusBadgeVariant(task.status) === 'string' ? (
                      <Badge variant={getStatusBadgeVariant(task.status) as any}>
                        {task.status}
                      </Badge>
                    ) : (
                      <Badge 
                        variant={(getStatusBadgeVariant(task.status) as any).variant}
                        className={(getStatusBadgeVariant(task.status) as any).className}
                      >
                        {task.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{task.estimatedHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ClientAdHocTaskList;
