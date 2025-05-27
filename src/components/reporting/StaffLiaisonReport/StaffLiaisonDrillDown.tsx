
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText } from "lucide-react";
import { getClientTasksByLiaison } from "@/services/reporting/staffLiaisonReportService";
import { ReportFilters } from "@/types/reporting";
import { formatCurrency, formatDate } from "@/lib/utils";

interface StaffLiaisonDrillDownProps {
  selectedLiaisonId: string | null;
  filters: ReportFilters;
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

export const StaffLiaisonDrillDown: React.FC<StaffLiaisonDrillDownProps> = ({
  selectedLiaisonId,
  filters
}) => {
  const { 
    data: tasks, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["liaison-tasks", selectedLiaisonId, filters],
    queryFn: () => selectedLiaisonId ? getClientTasksByLiaison(selectedLiaisonId, filters) : Promise.resolve([]),
    enabled: !!selectedLiaisonId,
    refetchOnWindowFocus: false
  });

  if (!selectedLiaisonId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Select a Staff Liaison</h3>
            <p className="text-muted-foreground">
              Choose a liaison from the summary table to view detailed task information
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Failed to load task details</h3>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedTasks = tasks?.reduce((acc, task) => {
    if (!acc[task.clientName]) {
      acc[task.clientName] = [];
    }
    acc[task.clientName].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>) || {};

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([clientName, clientTasks]) => (
        <Card key={clientName}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {clientName}
              <Badge variant="outline">
                {clientTasks.length} task{clientTasks.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <CardDescription>
              Expected Revenue: {formatCurrency(clientTasks[0]?.expectedRevenue || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Est. Hours</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientTasks.map((task) => (
                  <TableRow key={task.taskId}>
                    <TableCell className="font-medium">{task.taskName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {task.taskType}
                      </Badge>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedTasks).length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No tasks found for this liaison</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
