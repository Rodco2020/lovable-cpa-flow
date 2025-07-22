
import React from 'react';
import { DetailMatrixGrid } from './components/DetailMatrixGrid';
import { SkillGroupView } from './components/SkillGroupView';
import { DetailForecastMatrixGrid } from './components/DetailForecastMatrixGrid';
import { useDetailMatrixRevenue } from './hooks/useDetailMatrixRevenue';
import { useDetailMatrixState } from './DetailMatrixStateProvider';

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
  monthlyDistribution?: Record<string, number>;
  totalHours?: number;
  recurringTaskId?: string;
  totalExpectedRevenue?: number;
  expectedHourlyRate?: number;
  totalSuggestedRevenue?: number;
  expectedLessSuggested?: number;
}

interface DetailMatrixViewProps {
  data: Task[];
  months: Array<{ key: string; label: string }>;
  isLoading: boolean;
  groupingMode: 'skill' | 'client';
}

export const DetailMatrixView: React.FC<DetailMatrixViewProps> = ({
  data,
  months,
  isLoading,
  groupingMode
}) => {
  const { viewMode } = useDetailMatrixState();
  console.log('DetailMatrixView - viewMode from context:', viewMode);

  // Add revenue hook for detail-forecast-matrix view
  const revenueHook = useDetailMatrixRevenue({
    tasks: data,
    months,
    enabled: viewMode === 'detail-forecast-matrix'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No tasks found</div>
      </div>
    );
  }

  // Add routing case for detail-forecast-matrix BEFORE group-by-skill check
  if (viewMode === 'detail-forecast-matrix') {
    return (
      <DetailForecastMatrixGrid
        tasks={data}
        tasksForRevenue={data}
        totalTaskCount={data.length}
        currentPage={1}
        totalPages={1}
        months={months.map(m => m.key)}
        monthLabels={months.map(m => m.label)}
        revenueData={revenueHook.revenueData}
        isLoading={isLoading || revenueHook.isLoading}
      />
    );
  }

  // Show skill group view when grouping by skill
  if (viewMode === 'group-by-skill') {
    return (
      <SkillGroupView
        tasks={data}
        groupingMode={groupingMode}
      />
    );
  }

  // Default to grid view
  return (
    <DetailMatrixGrid
      tasks={data}
      groupingMode={groupingMode}
    />
  );
};
