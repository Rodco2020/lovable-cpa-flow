import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
}

interface DetailMatrixGridProps {
  tasks: Task[];
  groupingMode: 'skill' | 'client';
}

type SortField = 'taskName' | 'clientName' | 'skillRequired' | 'monthlyHours' | 'monthLabel' | 'priority';
type SortDirection = 'asc' | 'desc' | null;

/**
 * Detail Matrix Grid - Phase 1
 * 
 * Simple table showing task-level data from recurring tasks.
 * Basic sorting functionality included.
 */
export const DetailMatrixGrid: React.FC<DetailMatrixGridProps> = ({
  tasks,
  groupingMode
}) => {
  const [sortField, setSortField] = useState<SortField>('taskName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = useMemo(() => {
    if (!sortDirection || !sortField) return tasks;

    return [...tasks].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Task Details ({sortedTasks.length} tasks)</span>
          <Badge variant="outline">
            Grouped by {groupingMode}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('taskName')}
                    className="h-auto p-0 font-semibold"
                  >
                    Task Name {getSortIcon('taskName')}
                  </Button>
                </TableHead>
                <TableHead className="w-[200px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('clientName')}
                    className="h-auto p-0 font-semibold"
                  >
                    Client {getSortIcon('clientName')}
                  </Button>
                </TableHead>
                <TableHead className="w-[150px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('skillRequired')}
                    className="h-auto p-0 font-semibold"
                  >
                    Skill Required {getSortIcon('skillRequired')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('monthlyHours')}
                    className="h-auto p-0 font-semibold"
                  >
                    Monthly Hours {getSortIcon('monthlyHours')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('monthLabel')}
                    className="h-auto p-0 font-semibold"
                  >
                    Month {getSortIcon('monthLabel')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('priority')}
                    className="h-auto p-0 font-semibold"
                  >
                    Priority {getSortIcon('priority')}
                  </Button>
                </TableHead>
                <TableHead>Recurrence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    {task.taskName}
                  </TableCell>
                  <TableCell>
                    {task.clientName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {task.skillRequired}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {task.monthlyHours.toFixed(1)}h
                  </TableCell>
                  <TableCell>
                    {task.monthLabel}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {task.recurrencePattern}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No recurring tasks found. Please check your data or adjust filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};