
import React from 'react';
import { Clock, Users, BarChart3, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { FormattedTask } from '../types';
import { EnhancedTaskMetricsService } from '../services/enhancedTaskMetricsService';
import { MetricCard } from './MetricCard';

interface TaskMetricsPanelProps {
  tasks: FormattedTask[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Task Metrics Panel Component
 * 
 * Displays comprehensive task-based statistics and metrics
 * Now uses EnhancedTaskMetricsService for proper skill aggregation
 */
export const TaskMetricsPanel: React.FC<TaskMetricsPanelProps> = ({
  tasks,
  isLoading = false,
  className = ''
}) => {
  // Calculate metrics using the enhanced service with proper skill aggregation
  const metrics = React.useMemo(() => {
    if (isLoading || tasks.length === 0) {
      return null;
    }
    return EnhancedTaskMetricsService.calculateTaskMetrics(tasks);
  }, [tasks, isLoading]);

  // Helper function to format hours
  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics || tasks.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No tasks available for metrics</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tasks"
          value={metrics.totalTasks}
          subtitle={`${metrics.recurringVsAdHoc.recurring} recurring, ${metrics.recurringVsAdHoc.adHoc} ad-hoc`}
          icon={CheckCircle}
          variant="primary"
        />
        
        <MetricCard
          title="Total Est. Hours"
          value={formatHours(metrics.totalEstimatedHours)}
          subtitle={`Avg: ${formatHours(metrics.averageHoursPerTask)} per task`}
          icon={Clock}
          variant="success"
        />
        
        <MetricCard
          title="Active Clients"
          value={metrics.taskDistributionByClient.length}
          subtitle="with assigned tasks"
          icon={Users}
          variant="default"
        />
        
        <MetricCard
          title="Skills Required"
          value={metrics.requiredHoursBySkill.length}
          subtitle="unique skill types"
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Skills by Hours - Now properly aggregated */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Top Skills by Hours
            {/* Show count of unique skills for verification */}
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {metrics.requiredHoursBySkill.length} skills
            </span>
          </h4>
          <div className="space-y-2">
            {metrics.requiredHoursBySkill.slice(0, 5).map((skill, index) => (
              <div key={skill.skill} className="flex justify-between items-center text-sm">
                <span className="truncate" title={skill.skill}>{skill.skill}</span>
                <span className="font-medium">{formatHours(skill.hours)}</span>
              </div>
            ))}
            {metrics.requiredHoursBySkill.length === 0 && (
              <div className="text-xs text-muted-foreground italic">
                No skills data available
              </div>
            )}
          </div>
        </div>

        {/* Top Clients by Tasks */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Top Clients by Tasks</h4>
          <div className="space-y-2">
            {metrics.taskDistributionByClient.slice(0, 5).map((client, index) => (
              <div key={client.clientName} className="flex justify-between items-center text-sm">
                <span className="truncate" title={client.clientName}>{client.clientName}</span>
                <span className="font-medium">{client.taskCount} tasks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Priority Distribution</h4>
          <div className="space-y-2">
            {metrics.tasksByPriority.map((priority, index) => (
              <div key={priority.priority} className="flex justify-between items-center text-sm">
                <span className="truncate">{priority.priority}</span>
                <span className="font-medium">{priority.count} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskMetricsPanel;
