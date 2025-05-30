
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormattedTask } from '../types';
import { MetricsCharts } from './MetricsCharts';
import { TaskMetricsPanel } from './TaskMetricsPanel';
import { EnhancedMetricsService, TrendMetrics } from '../services/enhancedMetricsService';
import { MetricCard } from './MetricCard';

interface MetricsDashboardProps {
  tasks: FormattedTask[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Metrics Dashboard Component
 * 
 * Comprehensive dashboard-style view combining charts, metrics, and trend analysis
 * Provides tabbed interface for different metric perspectives
 */
export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  tasks,
  isLoading = false,
  className = ''
}) => {
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Calculate trend metrics
  const trendMetrics: TrendMetrics = React.useMemo(() => {
    if (isLoading || tasks.length === 0) {
      return {
        skillTrends: [],
        clientTrends: [],
        priorityTrends: [],
        monthlyDistribution: []
      };
    }
    return EnhancedMetricsService.calculateTrendMetrics(tasks);
  }, [tasks, isLoading]);

  // Top performers and insights
  const insights = React.useMemo(() => {
    if (!trendMetrics.skillTrends.length) return null;

    const topSkill = trendMetrics.skillTrends[0];
    const topClient = trendMetrics.clientTrends[0];
    const mostUtilizedSkill = trendMetrics.skillTrends.reduce((prev, current) => 
      prev.utilizationScore > current.utilizationScore ? prev : current
    );

    return {
      topSkill,
      topClient,
      mostUtilizedSkill,
      totalSkillTypes: trendMetrics.skillTrends.length,
      totalClients: trendMetrics.clientTrends.length
    };
  }, [trendMetrics]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Tasks Available</h3>
        <p>Add some tasks to see metrics and visualizations</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Metrics Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive analytics and visualizations for {tasks.length} tasks
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
          className="flex items-center gap-2"
        >
          {showAdvancedMetrics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced Metrics
        </Button>
      </div>

      {/* Key Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Top Skill"
            value={insights.topSkill.skill}
            subtitle={`${insights.topSkill.totalHours.toFixed(1)}h total`}
            icon={TrendingUp}
            variant="primary"
          />
          <MetricCard
            title="Most Active Client"
            value={insights.topClient.clientName}
            subtitle={`${insights.topClient.taskCount} tasks`}
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Most Utilized Skill"
            value={insights.mostUtilizedSkill.skill}
            subtitle={`${insights.mostUtilizedSkill.utilizationScore.toFixed(0)}% utilization`}
            icon={TrendingUp}
            variant="warning"
          />
          <MetricCard
            title="Skill Diversity"
            value={insights.totalSkillTypes}
            subtitle="unique skills required"
            icon={TrendingUp}
            variant="default"
          />
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <TaskMetricsPanel tasks={tasks} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <MetricsCharts tasks={tasks} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Utilization Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Utilization Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendMetrics.skillTrends.slice(0, 8).map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <span className="text-xs text-muted-foreground">
                            {skill.utilizationScore.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, skill.utilizationScore)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Client Engagement Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Client Engagement Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendMetrics.clientTrends.slice(0, 8).map((client, index) => (
                    <div key={client.clientName} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{client.clientName}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{client.taskCount} tasks</span>
                            <span>•</span>
                            <span>{client.skillDiversity} skills</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {showAdvancedMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Priority Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Priority Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendMetrics.priorityTrends.map((priority, index) => (
                      <div key={priority.priority} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{priority.priority}</span>
                          <span className="text-muted-foreground">{priority.count} tasks</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {priority.avgHoursPerTask.toFixed(1)}h per task
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendMetrics.monthlyDistribution.slice(0, 6).map((month, index) => (
                      <div key={month.month} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{month.month}</span>
                          <span className="text-muted-foreground">
                            {month.recurringTasks + month.adHocTasks} tasks
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {month.recurringTasks} recurring • {month.adHocTasks} ad-hoc
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Efficiency Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Avg Hours/Task:</span>
                          <span className="font-medium">
                            {(tasks.reduce((sum, task) => sum + task.estimatedHours, 0) / tasks.length).toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Skills per Task:</span>
                          <span className="font-medium">
                            {(tasks.reduce((sum, task) => sum + task.requiredSkills.length, 0) / tasks.length).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Task Complexity:</span>
                          <span className="font-medium">
                            {tasks.filter(task => task.requiredSkills.length > 2).length > tasks.length / 2 ? 'High' : 'Medium'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsDashboard;
