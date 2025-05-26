
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RecurringTask } from '@/types/task';
import RecurringTaskTableRow from './RecurringTaskTableRow';

interface RecurringTaskTableProps {
  tasks: RecurringTask[];
  onViewTask?: (taskId: string) => void;
  onEdit: (taskId: string, e: React.MouseEvent) => void;
  onDeactivate: (taskId: string) => void;
  onDelete: (taskId: string, taskName: string, e: React.MouseEvent) => void;
}

const RecurringTaskTable: React.FC<RecurringTaskTableProps> = ({
  tasks,
  onViewTask,
  onEdit,
  onDeactivate,
  onDelete
}) => {
  return (
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
          {tasks.map(task => (
            <RecurringTaskTableRow
              key={task.id}
              task={task}
              onViewTask={onViewTask}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecurringTaskTable;
