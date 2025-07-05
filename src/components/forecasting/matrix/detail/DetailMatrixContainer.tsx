import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemandMatrixControls } from '../hooks/useDemandMatrixControls';
import { useDemandMatrixData } from '../hooks/useDemandMatrixData';
import { DetailMatrixGrid } from './components/DetailMatrixGrid';
import { Loader2 } from 'lucide-react';

interface DetailMatrixContainerProps {
  groupingMode: 'skill' | 'client';
  className?: string;
}

/**
 * Detail Matrix Container - Phase 1
 * 
 * Uses existing infrastructure but transforms data to show individual tasks
 * instead of aggregated demand data.
 */
export const DetailMatrixContainer: React.FC<DetailMatrixContainerProps> = ({
  groupingMode,
  className
}) => {
  // Use existing demand matrix controls hook
  const demandMatrixControls = useDemandMatrixControls({
    demandData: null, // Will be populated after data loading
    groupingMode
  });

  // Create stable active filters
  const activeFilters = useMemo(() => ({
    preferredStaff: demandMatrixControls.selectedPreferredStaff,
    skills: demandMatrixControls.selectedSkills,
    clients: demandMatrixControls.selectedClients
  }), [
    JSON.stringify(demandMatrixControls.selectedPreferredStaff),
    JSON.stringify(demandMatrixControls.selectedSkills),
    JSON.stringify(demandMatrixControls.selectedClients)
  ]);

  // Use existing data loading hook
  const { demandData, isLoading, error } = useDemandMatrixData(
    groupingMode, 
    activeFilters
  );

  // Transform demand data to task-level data
  const taskLevelData = useMemo(() => {
    if (!demandData?.dataPoints) return [];

    const tasks = [];
    
    // Extract individual tasks from the demand data points
    demandData.dataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach(task => {
          tasks.push({
            id: `${task.taskName}-${task.clientName}-${point.month}`,
            taskName: task.taskName,
            clientName: task.clientName,
            clientId: task.clientId,
            skillRequired: point.skillType,
            monthlyHours: task.monthlyHours,
            month: point.month,
            monthLabel: demandData.months.find(m => m.key === point.month)?.label || point.month,
            recurrencePattern: task.recurrencePattern || 'Monthly',
            priority: 'Medium', // Default value since not available in data
            category: 'General' // Default value since not available in data
          });
        });
      }
    });

    return tasks;
  }, [demandData]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading task details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading task data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Controls Panel - reuse existing controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Filters & Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Filter controls will be integrated in Phase 2. 
              Currently showing {taskLevelData.length} recurring tasks.
            </div>
          </CardContent>
        </Card>

        {/* Detail Grid */}
        <DetailMatrixGrid 
          tasks={taskLevelData}
          groupingMode={groupingMode}
        />
      </div>
    </div>
  );
};