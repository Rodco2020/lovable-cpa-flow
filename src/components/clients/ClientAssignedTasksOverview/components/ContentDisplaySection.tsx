
import React from 'react';
import { MetricsDashboard } from './MetricsDashboard';
import { TaskMetricsPanel } from './TaskMetricsPanel';
import { TaskContentArea } from './TaskContentArea';
import { FormattedTask } from '../types';

interface ContentDisplaySectionProps {
  activeView: 'tasks' | 'dashboard';
  tasksForMetrics: FormattedTask[];
  isLoading: boolean;
  error: string | null;
  formattedTasks: FormattedTask[];
  onResetFilters: () => void;
  onEditTask: (taskId: string, taskType: 'Ad-hoc' | 'Recurring') => void;
  onDeleteTask: (taskId: string, taskType: 'Ad-hoc' | 'Recurring', taskName: string) => void;
}

/**
 * ContentDisplaySection Component
 * 
 * Conditionally renders either the Dashboard view or the Tasks view
 * based on the current view selection.
 */
export const ContentDisplaySection: React.FC<ContentDisplaySectionProps> = ({
  activeView,
  tasksForMetrics,
  isLoading,
  error,
  formattedTasks,
  onResetFilters,
  onEditTask,
  onDeleteTask
}) => {
  if (activeView === 'dashboard') {
    return (
      <MetricsDashboard
        tasks={tasksForMetrics}
        isLoading={isLoading}
      />
    );
  }

  return (
    <>
      <TaskMetricsPanel
        tasks={tasksForMetrics}
        isLoading={isLoading}
      />
      
      <TaskContentArea
        isLoading={isLoading}
        error={error}
        filteredTasks={tasksForMetrics}
        totalTasks={formattedTasks}
        onResetFilters={onResetFilters}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    </>
  );
};
