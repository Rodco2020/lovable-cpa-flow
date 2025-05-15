
import React, { useState } from 'react';
import { RecurringTask } from '@/types/task';
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
import { Search, Clock, CalendarClock } from 'lucide-react';

interface ClientRecurringTaskListProps {
  tasks: RecurringTask[];
  onViewTask?: (taskId: string) => void;
}

const ClientRecurringTaskList: React.FC<ClientRecurringTaskListProps> = ({
  tasks,
  onViewTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'hours'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter tasks by search term
  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
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
  const toggleSort = (field: 'name' | 'priority' | 'hours') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Format recurrence pattern for display
  const formatRecurrencePattern = (task: RecurringTask): string => {
    const pattern = task.recurrencePattern;
    switch (pattern.type) {
      case 'Daily':
        return `Daily${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} days)` : ''}`;
      case 'Weekly':
        if (pattern.weekdays && pattern.weekdays.length) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return `Weekly on ${pattern.weekdays.map(d => days[d]).join(', ')}`;
        }
        return `Weekly${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} weeks)` : ''}`;
      case 'Monthly':
        return `Monthly on day ${pattern.dayOfMonth || 1}${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} months)` : ''}`;
      case 'Quarterly':
        return 'Quarterly';
      case 'Annually':
        return 'Annually';
      case 'Custom':
        return 'Custom schedule';
      default:
        return 'Unknown schedule';
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

  // Render empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-muted/20">
        <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
        <h3 className="font-medium">No Recurring Tasks</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This client doesn't have any recurring tasks set up yet.
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
          </Button>
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
                <TableHead>Schedule</TableHead>
                <TableHead>Skills</TableHead>
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
                  <TableCell className="flex items-center">
                    <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                    {formatRecurrencePattern(task)}
                  </TableCell>
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

export default ClientRecurringTaskList;
