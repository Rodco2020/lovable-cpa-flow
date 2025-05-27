
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClientDetailReportData, ReportCustomization } from "@/types/clientReporting";
import { formatCurrency } from "@/lib/utils";
import { Users, DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

interface ClientReportOverviewProps {
  data: ClientDetailReportData;
  customization: ReportCustomization;
}

export const ClientReportOverview: React.FC<ClientReportOverviewProps> = ({
  data,
  customization
}) => {
  const { client, taskMetrics, revenueMetrics } = data;

  const getColorScheme = () => {
    switch (customization.colorScheme) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Client Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Legal Name</p>
              <p className="text-lg font-semibold">{client.legalName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Contact</p>
              <p>{client.primaryContact}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Industry</p>
              <Badge variant="outline">{client.industry}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{client.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{client.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                {client.status}
              </Badge>
            </div>
            {client.staffLiaisonName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Liaison</p>
                <p>{client.staffLiaisonName}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {customization.showMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Clock className={`h-4 w-4 ${getColorScheme()}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getColorScheme()}`}>
                {taskMetrics.totalTasks}
              </div>
              <p className="text-xs text-muted-foreground">
                {taskMetrics.totalEstimatedHours} total hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {taskMetrics.completedTasks}
              </div>
              <p className="text-xs text-muted-foreground">
                {taskMetrics.completedHours} hours completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {taskMetrics.activeTasks}
              </div>
              <p className="text-xs text-muted-foreground">
                {taskMetrics.remainingHours} hours remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {taskMetrics.completionRate.toFixed(1)}%
              </div>
              <Progress 
                value={taskMetrics.completionRate} 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Revenue Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expected Monthly Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.expectedMonthlyRevenue)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">YTD Projected Revenue</p>
              <p className="text-xl font-semibold">{formatCurrency(revenueMetrics.ytdProjectedRevenue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Task Status Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">{taskMetrics.completedTasks}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{taskMetrics.activeTasks}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Overdue</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-600">{taskMetrics.overdueTasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown by Category</CardTitle>
          <CardDescription>
            Estimated and completed revenue by task category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueMetrics.taskValueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{item.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {((item.completedValue / item.estimatedValue) * 100).toFixed(1)}% completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(item.estimatedValue)}</p>
                  <p className="text-sm text-green-600">{formatCurrency(item.completedValue)} completed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
