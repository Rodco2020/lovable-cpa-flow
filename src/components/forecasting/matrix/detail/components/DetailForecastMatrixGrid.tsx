import React, { useMemo } from 'react';
import { TaskRevenueResult } from '@/services/forecasting/demand/calculators/detailTaskRevenueCalculator';
import { DetailForecastMatrixHeader } from './DetailForecastMatrixHeader';
import { DetailForecastMatrixRow } from './DetailForecastMatrixRow';
import { DetailMatrixTotalsCalculator } from '@/services/forecasting/detail/detailMatrixTotalsCalculator';
import { DetailMatrixTotalsRow } from './DetailMatrixTotalsRow';

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
  monthlyDistribution?: Record<string, number>; // New aggregated format (optional for compatibility)
  totalHours?: number; // Sum of all monthly hours (optional for compatibility)
  recurringTaskId?: string; // For unique identification (optional for compatibility)
  totalExpectedRevenue?: number;
  expectedHourlyRate?: number;
  totalSuggestedRevenue?: number;
  expectedLessSuggested?: number;
}

interface DetailForecastMatrixGridProps {
  tasks: Task[];                // Display tasks (filtered for UI)
  tasksForRevenue?: Task[];     // Revenue calculation tasks (client + date filters only)
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
  tasksForRevenue,
  totalTaskCount,
  currentPage,
  totalPages,
  months,
  monthLabels,
  revenueData,
  isLoading = false
}) => {
  // Transform months data for totals calculator
  const monthsData = useMemo(() => {
    return months.map((month, index) => ({
      key: month,
      label: monthLabels[index] || month
    }));
  }, [months, monthLabels]);

  // Use tasksForRevenue for consistent totals calculation
  // This ensures totals reflect the revenue calculation base, not just display filtering
  const revenueTasksForTotals = tasksForRevenue || tasks;
  
  // Merge revenue tasks with their revenue data for totals calculation
  const enhancedTasksForRevenue = useMemo(() => {
    // If no revenue data, return revenue tasks
    if (!revenueData || revenueData.size === 0) return revenueTasksForTotals;
    
    // Merge revenue data into each revenue task
    return revenueTasksForTotals.map(task => {
      const taskRevenue = revenueData.get(task.id);
      
      if (taskRevenue) {
        return {
          ...task,
          totalExpectedRevenue: taskRevenue.totalExpectedRevenue,
          expectedHourlyRate: taskRevenue.expectedHourlyRate,
          totalSuggestedRevenue: taskRevenue.totalSuggestedRevenue,
          expectedLessSuggested: taskRevenue.expectedLessSuggested
        };
      }
      
      return task;
    });
  }, [revenueTasksForTotals, revenueData]); // Use revenue tasks for consistent totals

  // Calculate totals from revenue-consistent data
  const totals = useMemo(() => {
    if (!enhancedTasksForRevenue || enhancedTasksForRevenue.length === 0) return null;
    
    return DetailMatrixTotalsCalculator.calculateDetailMatrixTotals(
      enhancedTasksForRevenue,  // Use revenue tasks for consistent totals
      monthsData
    );
  }, [enhancedTasksForRevenue, monthsData]);
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
          {totals && tasks.length > 0 && (
            <DetailMatrixTotalsRow totals={totals} months={monthsData} />
          )}
        </tbody>
      </table>
    </div>
  );
};