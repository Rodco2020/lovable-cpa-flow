import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemandMatrixControls } from '../hooks/useDemandMatrixControls';
import { useDemandMatrixData } from '../hooks/useDemandMatrixData';
import { DetailMatrixStateProvider } from './DetailMatrixStateProvider';
import { DetailMatrixHeader } from './components/DetailMatrixHeader';
import { DetailMatrixGrid } from './components/DetailMatrixGrid';
import { SkillGroupView } from './components/SkillGroupView';
import { useDetailMatrixState } from './DetailMatrixStateProvider';
import { Loader2 } from 'lucide-react';

interface DetailMatrixContainerProps {
  groupingMode: 'skill' | 'client';
  className?: string;
}

interface DetailMatrixContentProps {
  groupingMode: 'skill' | 'client';
  className?: string;
}

/**
 * Detail Matrix Content - Phase 2
 * 
 * Inner component that uses DetailMatrixState context.
 * Separated to properly consume context from DetailMatrixStateProvider.
 */
const DetailMatrixContent: React.FC<DetailMatrixContentProps> = ({
  groupingMode,
  className
}) => {
  const { viewMode } = useDetailMatrixState();

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
        {/* Enhanced Header with View Mode Toggle */}
        <DetailMatrixHeader 
          taskCount={taskLevelData.length}
          selectedCount={0}
        />

        {/* Conditional View Rendering */}
        <div className="animate-fade-in">
          {viewMode === 'all-tasks' ? (
            <DetailMatrixGrid 
              tasks={taskLevelData}
              groupingMode={groupingMode}
            />
          ) : (
            <SkillGroupView 
              tasks={taskLevelData}
              groupingMode={groupingMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Detail Matrix Container - Phase 2
 * 
 * Enhanced container with state provider and view mode management.
 * Uses existing infrastructure while providing new view capabilities.
 */
export const DetailMatrixContainer: React.FC<DetailMatrixContainerProps> = ({
  groupingMode,
  className
}) => {
  return (
    <DetailMatrixStateProvider>
      <DetailMatrixContent 
        groupingMode={groupingMode}
        className={className}
      />
    </DetailMatrixStateProvider>
  );
};