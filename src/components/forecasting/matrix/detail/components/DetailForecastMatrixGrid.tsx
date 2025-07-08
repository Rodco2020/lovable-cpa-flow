import React from 'react';
import { TaskRevenueResult } from '@/services/forecasting/demand/calculators/detailTaskRevenueCalculator';
import { DetailForecastMatrixHeader } from './DetailForecastMatrixHeader';
import { DetailForecastMatrixRow } from './DetailForecastMatrixRow';

// Use the aggregated Task interface from Detail Matrix
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
  monthlyDistribution: Record<string, number>; // New aggregated format
  totalHours: number; // Sum of all monthly hours
  recurringTaskId: string; // For unique identification
  totalExpectedRevenue?: number;
  expectedHourlyRate?: number;
  totalSuggestedRevenue?: number;
  expectedLessSuggested?: number;
}

interface DetailForecastMatrixGridProps {
  tasks: Task[];
  totalTaskCount: number;
  currentPage: number;
  totalPages: number;
  months: string[];
  monthLabels: string[];
  revenueData: Map<string, TaskRevenueResult>;
  isLoading?: boolean;
}

export const DetailForecastMatrixGrid: React.FC<DetailForecastMatrixGridProps> = ({
  tasks,
  totalTaskCount,
  currentPage,
  totalPages,
  months,
  monthLabels,
  revenueData,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-muted rounded mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks found for the selected criteria.</p>
        <p className="text-sm mt-2">Try adjusting your filters or date range.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full border-collapse">
        <DetailForecastMatrixHeader months={months} monthLabels={monthLabels} />
        <tbody>
          {tasks.map((task, index) => (
            <DetailForecastMatrixRow
              key={task.id}
              task={task}
              months={months}
              monthLabels={monthLabels}
              revenueData={revenueData.get(task.id)}
              isEvenRow={index % 2 === 0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};