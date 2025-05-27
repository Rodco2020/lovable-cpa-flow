
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClientDetailReportData, ReportCustomization } from "@/types/clientReporting";
import { formatDate } from "@/lib/utils";

interface ClientTaskBreakdownProps {
  data: ClientDetailReportData;
  customization: ReportCustomization;
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'default';
    case 'in progress':
      return 'secondary';
    case 'scheduled':
      return 'outline';
    case 'unscheduled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const ClientTaskBreakdown: React.FC<ClientTaskBreakdownProps> = ({
  data,
  customization
}) => {
  const { taskBreakdown } = data;

  const groupTasks = (tasks: any[], groupBy: string) => {
    if (groupBy === 'none') return { 'All Tasks': tasks };
    
    return tasks.reduce((groups, task) => {
      const key = task[groupBy] || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
      return groups;
    }, {} as Record<string, any[]>);
  };

  const recurringGroups = groupTasks(taskBreakdown.recurring || [], customization.groupTasksBy);
  const adhocGroups = groupTasks(taskBreakdown.adhoc || [], customization.groupTasksBy);

  const TaskTable = ({ tasks, title }: { tasks: any[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Est. Hours</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned Staff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.taskId}>
                <TableCell className="font-medium">{task.taskName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{task.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{task.estimatedHours}</TableCell>
                <TableCell>
                  {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                </TableCell>
                <TableCell>
                  {task.assignedStaffName || 'Unassigned'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Recurring Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recurring Tasks</h3>
        {Object.entries(recurringGroups).map(([groupName, tasks]) => (
          <TaskTable 
            key={groupName} 
            tasks={tasks} 
            title={customization.groupTasksBy === 'none' ? 'Recurring Tasks' : `${groupName} - Recurring`}
          />
        ))}
      </div>

      {/* Ad-hoc Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ad-hoc Tasks</h3>
        {Object.entries(adhocGroups).map(([groupName, tasks]) => (
          <TaskTable 
            key={groupName} 
            tasks={tasks} 
            title={customization.groupTasksBy === 'none' ? 'Ad-hoc Tasks' : `${groupName} - Ad-hoc`}
          />
        ))}
      </div>

      {/* Task Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Task Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(taskBreakdown.recurring || []).length}
              </div>
              <p className="text-sm text-muted-foreground">Recurring Tasks</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(taskBreakdown.adhoc || []).length}
              </div>
              <p className="text-sm text-muted-foreground">Ad-hoc Tasks</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(taskBreakdown.recurring || []).length + (taskBreakdown.adhoc || []).length}
              </div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
