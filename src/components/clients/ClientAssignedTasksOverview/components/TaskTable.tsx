
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Clock, Pencil, Trash2 } from 'lucide-react';
import { FormattedTask } from '../types';
import { formatRecurrencePattern, formatDate } from '../utils';

interface TaskTableProps {
  tasks: FormattedTask[];
  onEditTask: (taskId: string, taskType: 'Ad-hoc' | 'Recurring') => void;
  onDeleteTask: (taskId: string, taskType: 'Ad-hoc' | 'Recurring', taskName: string) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEditTask, onDeleteTask }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Task Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="hidden md:table-cell">Recurrence</TableHead>
            <TableHead className="hidden md:table-cell">Est. Hours</TableHead>
            <TableHead className="hidden md:table-cell">Required Skill</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={`${task.taskType}-${task.id}`}>
              <TableCell>{task.clientName}</TableCell>
              <TableCell>{task.taskName}</TableCell>
              <TableCell>
                <Badge variant={task.taskType === 'Recurring' ? 'default' : 'outline'}>
                  {task.taskType}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(task.dueDate)}</TableCell>
              <TableCell className="hidden md:table-cell">
                {task.taskType === 'Recurring' && task.recurrencePattern ? (
                  <span className="text-xs text-muted-foreground">
                    {formatRecurrencePattern(task.recurrencePattern)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                  {task.estimatedHours}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {task.requiredSkills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    task.priority === 'High' || task.priority === 'Urgent' 
                      ? 'bg-red-500'
                      : task.priority === 'Medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }
                >
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {task.taskType === 'Recurring' ? (
                  <Badge 
                    variant={task.isActive ? 'default' : 'secondary'}
                    className={task.isActive ? 'bg-green-500' : ''}
                  >
                    {task.isActive ? 'Active' : 'Paused'}
                  </Badge>
                ) : (
                  <Badge 
                    variant={task.status === 'Canceled' ? 'secondary' : 'default'}
                    className={
                      task.status === 'Completed' ? 'bg-green-500' :
                      task.status === 'In Progress' ? 'bg-blue-500' :
                      task.status === 'Scheduled' ? 'bg-purple-500' :
                      task.status === 'Unscheduled' ? 'bg-amber-500' :
                      ''
                    }
                  >
                    {task.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditTask(task.id, task.taskType)}
                    title={`Edit ${task.taskType} Task`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDeleteTask(task.id, task.taskType, task.taskName)}
                    title={`Delete ${task.taskType} Task`}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
