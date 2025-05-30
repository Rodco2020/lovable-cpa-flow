
import React, { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedTask } from '../types';
import { TaskMetricsService } from '../services/taskMetricsService';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { MetricsErrorBoundary } from './MetricsErrorBoundary';
import { ChartSkeleton } from './LoadingSkeletons';
import { getChartAccessibility, createScreenReaderAnnouncement } from '../utils/accessibilityUtils';

interface MetricsChartsEnhancedProps {
  tasks: FormattedTask[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Enhanced MetricsCharts Component with Performance Optimization and Accessibility
 * 
 * Features:
 * - Memoized calculations for better performance
 * - Accessibility support with ARIA labels and screen reader announcements
 * - Error boundary protection
 * - Performance monitoring
 * - Responsive design
 */
const MetricsChartsEnhanced: React.FC<MetricsChartsEnhancedProps> = memo(({
  tasks,
  isLoading = false,
  className = ''
}) => {
  // Performance monitoring
  const { startCalculationMonitoring, endCalculationMonitoring } = usePerformanceMonitoring(tasks);

  // Memoized metrics calculation with performance monitoring
  const metrics = useMemo(() => {
    startCalculationMonitoring();
    
    try {
      if (isLoading || tasks.length === 0) {
        return null;
      }
      const result = TaskMetricsService.calculateTaskMetrics(tasks);
      return result;
    } finally {
      endCalculationMonitoring();
    }
  }, [tasks, isLoading, startCalculationMonitoring, endCalculationMonitoring]);

  // Color palette for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Memoized chart data
  const chartData = useMemo(() => {
    if (!metrics) return null;

    return {
      skillsData: metrics.requiredHoursBySkill.slice(0, 8),
      priorityData: metrics.tasksByPriority,
      clientData: metrics.taskDistributionByClient.slice(0, 10),
      taskTypeData: [
        { name: 'Recurring', value: metrics.recurringVsAdHoc.recurring },
        { name: 'Ad-hoc', value: metrics.recurringVsAdHoc.adHoc }
      ]
    };
  }, [metrics]);

  // Custom tooltip for accessibility
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const message = `${label}: ${data.value}${data.unit || ''}`;
      
      // Announce to screen readers
      if (active) {
        createScreenReaderAnnouncement(message, 'polite');
      }
      
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="font-medium">{message}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`} {...getChartAccessibility('loading', 'metrics data')}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics || !chartData || tasks.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <p>No data available for charts</p>
      </div>
    );
  }

  return (
    <MetricsErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Hours by Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <div {...getChartAccessibility('bar chart', `required hours by skill for ${chartData.skillsData.length} skills`)}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.skillsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="skill" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      content={<CustomTooltip />}
                      formatter={(value) => [`${Number(value).toFixed(1)}h`, 'Hours']}
                    />
                    <Bar 
                      dataKey="hours" 
                      fill="#3B82F6"
                      aria-label="Hours by skill"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div {...getChartAccessibility('pie chart', `task distribution by priority for ${chartData.priorityData.length} priority levels`)}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ priority, percent }) => `${priority} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData.priorityData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          aria-label={`${entry.priority} priority: ${entry.count} tasks`}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Client Task Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks per Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div {...getChartAccessibility('bar chart', `tasks per client for ${chartData.clientData.length} clients`)}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.clientData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="clientName" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      content={<CustomTooltip />}
                      formatter={(value) => [value, 'Tasks']}
                    />
                    <Bar 
                      dataKey="taskCount" 
                      fill="#10B981"
                      aria-label="Tasks per client"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Task Type Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recurring vs Ad-hoc Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div {...getChartAccessibility('pie chart', 'comparison of recurring versus ad-hoc tasks')}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.taskTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3B82F6" aria-label={`Recurring tasks: ${chartData.taskTypeData[0].value}`} />
                      <Cell fill="#F59E0B" aria-label={`Ad-hoc tasks: ${chartData.taskTypeData[1].value}`} />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MetricsErrorBoundary>
  );
});

MetricsChartsEnhanced.displayName = 'MetricsChartsEnhanced';

export default MetricsChartsEnhanced;
