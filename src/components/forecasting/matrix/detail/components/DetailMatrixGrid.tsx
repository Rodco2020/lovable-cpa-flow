import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar, Clock, User } from 'lucide-react';
import { useDetailMatrixState } from '../DetailMatrixStateProvider';

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

type SortField = 'taskName' | 'clientName' | 'skillRequired' | 'monthlyHours' | 'monthLabel' | 'priority' | 'status' | 'createdDate';

/**
 * Enhanced Detail Matrix Grid - Phase 2
 * 
 * Enhanced table with additional columns, row selection, and improved sorting.
 * Integrates with DetailMatrixState for view mode management.
 */
export const DetailMatrixGrid: React.FC<DetailMatrixGridProps> = ({
  tasks,
  groupingMode
}) => {
  const { 
    sortConfig, 
    setSortConfig, 
    selectedTasks, 
    toggleTaskSelection,
    selectAllTasks,
    clearSelectedTasks
  } = useDetailMatrixState();

  const handleSort = (field: SortField) => {
    if (sortConfig.field === field) {
      setSortConfig({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({ field, direction: 'asc' });
    }
  };

  const sortedTasks = useMemo(() => {
    if (!sortConfig.field) return tasks;

    return [...tasks].sort((a, b) => {
      let aValue = a[sortConfig.field as keyof Task];
      let bValue = b[sortConfig.field as keyof Task];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortConfig]);

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllTasks(sortedTasks.map(task => task.id));
    } else {
      clearSelectedTasks();
    }
  };

  const isAllSelected = sortedTasks.length > 0 && sortedTasks.every(task => selectedTasks.has(task.id));
  const isIndeterminate = sortedTasks.some(task => selectedTasks.has(task.id)) && !isAllSelected;

  // Enhanced task data with additional computed fields
  const enhancedTasks = useMemo(() => {
    return sortedTasks.map(task => ({
      ...task,
      status: 'Active', // All recurring tasks are active
      createdDate: '2024-01-01', // Mock date for Phase 2
      dueDate: task.monthLabel,
      taskType: 'Recurring'
    }));
  }, [sortedTasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>All Tasks View ({enhancedTasks.length} tasks)</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              Grouped by {groupingMode}
            </Badge>
            {selectedTasks.size > 0 && (
              <Badge variant="secondary">
                {selectedTasks.size} selected
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    {...(isIndeterminate && { 'data-indeterminate': true })}
                  />
                </TableHead>
                <TableHead className="w-[200px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('taskName')}
                    className="h-auto p-0 font-semibold"
                  >
                    Task Name {getSortIcon('taskName')}
                  </Button>
                </TableHead>
                <TableHead className="w-[150px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('clientName')}
                    className="h-auto p-0 font-semibold"
                  >
                    Client {getSortIcon('clientName')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('skillRequired')}
                    className="h-auto p-0 font-semibold"
                  >
                    Skill Required {getSortIcon('skillRequired')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('monthlyHours')}
                    className="h-auto p-0 font-semibold"
                  >
                    Hours {getSortIcon('monthlyHours')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('monthLabel')}
                    className="h-auto p-0 font-semibold"
                  >
                    Due Date {getSortIcon('monthLabel')}
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('priority')}
                    className="h-auto p-0 font-semibold"
                  >
                    Priority {getSortIcon('priority')}
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-semibold"
                  >
                    Status {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enhancedTasks.map((task) => (
                <TableRow 
                  key={task.id}
                  className={`${selectedTasks.has(task.id) ? 'bg-muted/50' : ''} hover:bg-muted/30 transition-colors`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={() => toggleTaskSelection(task.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{task.taskName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{task.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {task.skillRequired}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{task.monthlyHours.toFixed(1)}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{task.monthLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="bg-green-100 text-green-800">
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {task.taskType}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {enhancedTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No recurring tasks found</h3>
                <p className="text-sm">
                  Please check your data or adjust filters to see tasks.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};