
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffLiaisonSummaryData } from "@/types/reporting";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingUp, Users, DollarSign, CheckCircle, Clock } from "lucide-react";

interface StaffLiaisonSummaryProps {
  data: StaffLiaisonSummaryData[];
  onLiaisonSelect: (liaisonId: string) => void;
}

export const StaffLiaisonSummary: React.FC<StaffLiaisonSummaryProps> = ({
  data,
  onLiaisonSelect
}) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.expectedMonthlyRevenue, 0);
  const totalClients = data.reduce((sum, item) => sum + item.clientCount, 0);
  const totalTasks = data.reduce((sum, item) => sum + item.totalTasksCount, 0);
  const averageCompletionRate = data.length > 0 
    ? data.reduce((sum, item) => sum + item.taskCompletionRate, 0) / data.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Expected monthly revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active clients assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              All assigned tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(averageCompletionRate)}</div>
            <p className="text-xs text-muted-foreground">
              Task completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Liaison Revenue Breakdown</CardTitle>
          <CardDescription>
            Revenue and task metrics grouped by staff liaison assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Liaison</TableHead>
                <TableHead className="text-right">Clients</TableHead>
                <TableHead className="text-right">Expected Revenue</TableHead>
                <TableHead className="text-right">Avg Revenue/Client</TableHead>
                <TableHead className="text-right">Active Tasks</TableHead>
                <TableHead className="text-right">Completion Rate</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((liaison) => (
                <TableRow key={liaison.staffLiaisonId || 'unassigned'}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{liaison.staffLiaisonName}</span>
                      {!liaison.staffLiaisonId && (
                        <Badge variant="secondary">Unassigned</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{liaison.clientCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(liaison.expectedMonthlyRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(liaison.averageRevenuePerClient)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {liaison.activeTasksCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span>{formatPercentage(liaison.taskCompletionRate)}</span>
                      {liaison.taskCompletionRate >= 80 && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLiaisonSelect(liaison.staffLiaisonId || 'unassigned')}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
