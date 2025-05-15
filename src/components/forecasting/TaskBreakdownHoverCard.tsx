
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface TaskBreakdownItem {
  id: string;
  name: string;
  clientName: string;
  hours: number;
  dueDate?: string;
}

interface TaskBreakdownHoverCardProps {
  children: React.ReactNode;
  tasks: TaskBreakdownItem[];
  title: string;
}

const TaskBreakdownHoverCard: React.FC<TaskBreakdownHoverCardProps> = ({ 
  children, 
  tasks, 
  title 
}) => {
  if (!tasks || tasks.length === 0) {
    return <>{children}</>;
  }
  
  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        <span className="cursor-help">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} contributing to forecast
          </p>
        </div>
        <div className="max-h-[300px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Task</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="py-2">
                    <div className="font-medium text-xs">{task.name}</div>
                    <div className="text-xs text-muted-foreground">{task.clientName}</div>
                    {task.dueDate && (
                      <div className="text-xs text-muted-foreground">Due: {task.dueDate}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs py-2">
                    {task.hours}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default TaskBreakdownHoverCard;
