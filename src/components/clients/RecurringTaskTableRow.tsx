
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { RecurringTask, RecurrencePattern } from '@/types/task';
import RecurringTaskActions from './RecurringTaskActions';

interface RecurringTaskTableRowProps {
  task: RecurringTask;
  onViewTask?: (taskId: string) => void;
  onEdit: (taskId: string, e: React.MouseEvent) => void;
  onDeactivate: (taskId: string) => void;
  onDelete: (taskId: string, taskName: string, e: React.MouseEvent) => void;
}

const RecurringTaskTableRow: React.FC<RecurringTaskTableRowProps> = ({
  task,
  onViewTask,
  onEdit,
  onDeactivate,
  onDelete
}) => {
  const formatRecurrencePattern = (pattern: RecurrencePattern): string => {
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
  };

  return (
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
        <RecurringTaskActions
          taskId={task.id}
          taskName={task.name}
          isActive={task.isActive}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default RecurringTaskTableRow;
