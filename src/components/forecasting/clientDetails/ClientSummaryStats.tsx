
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';

interface ClientSummaryStatsProps {
  clientId: string;
  dateRange?: { start: Date; end: Date };
}

interface TaskSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  upcomingTasks: number;
  totalEstimatedHours: number;
  completedHours: number;
  averageTaskHours: number;
  skillDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

const ClientSummaryStats: React.FC<ClientSummaryStatsProps> = ({
  clientId,
  dateRange
}) => {
  // Fetch client basic information
  const { data: clientInfo } = useQuery({
    queryKey: ['client-info', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('legal_name, expected_monthly_revenue, status')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });

  // Fetch task instances
  const { data: taskInstances, isLoading: loadingInstances } = useQuery({
    queryKey: ['client-task-instances-summary', clientId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('task_instances')
        .select(`
          id,
          estimated_hours,
          status,
          priority,
          category,
          required_skills,
          completed_at,
          due_date
        `)
        .eq('client_id', clientId);

      if (dateRange) {
        query = query
          .gte('due_date', dateRange.start.toISOString())
          .lte('due_date', dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId
  });

  // Fetch recurring tasks
  const { data: recurringTasks, isLoading: loadingRecurring } = useQuery({
    queryKey: ['client-recurring-tasks-summary', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          id,
          estimated_hours,
          priority,
          category,
          required_skills,
          is_active,
          status
        `)
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId
  });

  // Calculate summary statistics
  const summaryStats = useMemo((): TaskSummary => {
    if (!taskInstances) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        upcomingTasks: 0,
        totalEstimatedHours: 0,
        completedHours: 0,
        averageTaskHours: 0,
        skillDistribution: {},
        categoryDistribution: {},
        priorityDistribution: {}
      };
    }

    const skillDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};

    let completedTasks = 0;
    let inProgressTasks = 0;
    let upcomingTasks = 0;
    let totalEstimatedHours = 0;
    let completedHours = 0;

    taskInstances.forEach(task => {
      const hours = Number(task.estimated_hours);
      totalEstimatedHours += hours;

      // Status counts
      switch (task.status) {
        case 'Completed':
          completedTasks++;
          completedHours += hours;
          break;
        case 'In Progress':
          inProgressTasks++;
          break;
        default:
          upcomingTasks++;
          break;
      }

      // Skill distribution
      task.required_skills.forEach(skill => {
        skillDistribution[skill] = (skillDistribution[skill] || 0) + hours;
      });

      // Category distribution
      categoryDistribution[task.category] = (categoryDistribution[task.category] || 0) + hours;

      // Priority distribution
      priorityDistribution[task.priority] = (priorityDistribution[task.priority] || 0) + 1;
    });

    const averageTaskHours = taskInstances.length > 0 ? totalEstimatedHours / taskInstances.length : 0;

    return {
      totalTasks: taskInstances.length,
      completedTasks,
      inProgressTasks,
      upcomingTasks,
      totalEstimatedHours,
      completedHours,
      averageTaskHours,
      skillDistribution,
      categoryDistribution,
      priorityDistribution
    };
  }, [taskInstances]);

  const isLoading = loadingInstances || loadingRecurring;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading summary statistics...</div>
        </CardContent>
      </Card>
    );
  }

  const completionRate = summaryStats.totalTasks > 0 
    ? (summaryStats.completedTasks / summaryStats.totalTasks) * 100 
    : 0;

  const hoursCompletionRate = summaryStats.totalEstimatedHours > 0 
    ? (summaryStats.completedHours / summaryStats.totalEstimatedHours) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Client Overview */}
      {clientInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Client Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Expected Monthly Revenue</div>
                <div className="text-2xl font-bold">
                  ${clientInfo.expected_monthly_revenue?.toLocaleString() || '0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant={clientInfo.status === 'Active' ? 'default' : 'secondary'}>
                  {clientInfo.status}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Recurring Tasks</div>
                <div className="text-2xl font-bold">{recurringTasks?.length || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{summaryStats.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{summaryStats.completedTasks}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{summaryStats.totalEstimatedHours.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{summaryStats.averageTaskHours.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Hours/Task</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Task Completion Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span>{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {summaryStats.completedTasks} of {summaryStats.totalTasks} tasks completed
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hours Completed</span>
                <span>{hoursCompletionRate.toFixed(1)}%</span>
              </div>
              <Progress value={hoursCompletionRate} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {summaryStats.completedHours.toFixed(1)} of {summaryStats.totalEstimatedHours.toFixed(1)} hours completed
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Task Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <Badge variant="secondary">{summaryStats.completedTasks}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <Badge variant="secondary">{summaryStats.inProgressTasks}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Upcoming</span>
                </div>
                <Badge variant="secondary">{summaryStats.upcomingTasks}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill and Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skill Distribution (Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summaryStats.skillDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([skill, hours]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <span className="text-sm">{skill}</span>
                    <Badge variant="outline">{hours.toFixed(1)}h</Badge>
                  </div>
                ))}
              {Object.keys(summaryStats.skillDistribution).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No skill data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution (Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summaryStats.categoryDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, hours]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm">{category}</span>
                    <Badge variant="outline">{hours.toFixed(1)}h</Badge>
                  </div>
                ))}
              {Object.keys(summaryStats.categoryDistribution).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No category data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSummaryStats;
