import React, { useMemo, useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemandMatrixControls } from '../hooks/useDemandMatrixControls';
import { useDemandMatrixData } from '../hooks/useDemandMatrixData';
import { DemandMatrixControls } from '../components/demand/DemandMatrixControls';
import { DetailMatrixStateProvider } from './DetailMatrixStateProvider';
import { DetailMatrixHeader } from './components/DetailMatrixHeader';
import { DetailMatrixGrid } from './components/DetailMatrixGrid';
import { SkillGroupView } from './components/SkillGroupView';
import { DetailMatrixExportDialog } from './components/DetailMatrixExportDialog';
import { openDetailMatrixPrint } from './components/DetailMatrixPrintView';
import { useDetailMatrixState } from './DetailMatrixStateProvider';
import { useDetailMatrixFiltering } from './hooks/useDetailMatrixFiltering';
import { usePerformanceMonitoring, usePerformanceAlerts } from '../hooks/usePerformanceMonitoring';
import { useLocalStoragePersistence, useKeyboardNavigation } from '../hooks/useLocalStoragePersistence';
import { Loader2, Filter, X, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DetailMatrixContainerProps {
  groupingMode: 'skill' | 'client';
  className?: string;
}

interface DetailMatrixContentProps {
  groupingMode: 'skill' | 'client';
  className?: string;
}

/**
 * Detail Matrix Content - Phase 5 Enhanced
 * 
 * Inner component with performance monitoring, keyboard navigation,
 * and localStorage persistence integrated.
 */
const DetailMatrixContent: React.FC<DetailMatrixContentProps> = memo(({
  groupingMode,
  className
}) => {
  const { viewMode } = useDetailMatrixState();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // Phase 5: localStorage persistence
  const {
    preferences,
    setViewMode: persistedSetViewMode,
    toggleSkillGroupExpansion,
    setSortConfig: persistedSetSortConfig
  } = useLocalStoragePersistence();

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

  // Apply filters to task-level data
  const {
    filteredTasks,
    filterStats,
    hasActiveFilters,
    activeFiltersCount
  } = useDetailMatrixFiltering({
    tasks: taskLevelData,
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode
  });

  // Phase 5: Performance monitoring
  const performanceData = usePerformanceMonitoring(
    taskLevelData.length,
    filteredTasks.length,
    { enabled: true, sampleRate: 3 }
  );
  const performanceAlerts = usePerformanceAlerts(performanceData);

  // Phase 5: Keyboard navigation
  const keyboardNav = useKeyboardNavigation(
    filteredTasks,
    preferences.expandedSkillGroups,
    toggleSkillGroupExpansion
  );

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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Controls Panel */}
          <div className="lg:col-span-1">
            <DemandMatrixControls
              selectedSkills={demandMatrixControls.selectedSkills}
              selectedClients={demandMatrixControls.selectedClients}
              selectedPreferredStaff={demandMatrixControls.selectedPreferredStaff}  
              onSkillToggle={demandMatrixControls.handleSkillToggle}
              onClientToggle={demandMatrixControls.handleClientToggle}
              onPreferredStaffToggle={demandMatrixControls.handlePreferredStaffToggle}
              monthRange={demandMatrixControls.monthRange}
              onMonthRangeChange={demandMatrixControls.handleMonthRangeChange}
              onExport={() => setShowExportDialog(true)}
              onPrintExport={() => setShowPrintDialog(true)}
              onReset={demandMatrixControls.handleReset}
              groupingMode={groupingMode}
              availableSkills={demandMatrixControls.availableSkills}
              availableClients={demandMatrixControls.availableClients}
              availablePreferredStaff={demandMatrixControls.availablePreferredStaff}
              preferredStaffLoading={demandMatrixControls.preferredStaffLoading}
              preferredStaffError={demandMatrixControls.preferredStaffError?.message || null}
              isAllPreferredStaffSelected={demandMatrixControls.isAllPreferredStaffSelected}
              onRetryPreferredStaff={demandMatrixControls.refetchPreferredStaff}
            />
          </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Performance Alerts */}
          {performanceAlerts.length > 0 && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <Zap className="h-4 w-4" />
              <AlertDescription className="text-yellow-700">
                <div className="space-y-1">
                  {performanceAlerts.map((alert, index) => (
                    <p key={index} className="text-xs">{alert}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Header with Filter State */}
          <div className="flex flex-col space-y-4">
            <DetailMatrixHeader 
              taskCount={filteredTasks.length}
              selectedCount={0}
            />
            
            {/* Filter State Indicators */}
            {hasActiveFilters && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Active Filters</span>
                      <Badge variant="secondary">{activeFiltersCount}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Showing {filteredTasks.length} of {taskLevelData.length} tasks
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={demandMatrixControls.handleReset}
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Conditional View Rendering with Performance Monitoring */}
          <div className="animate-fade-in" tabIndex={0}>
            {viewMode === 'all-tasks' ? (
              <DetailMatrixGrid 
                tasks={filteredTasks}
                groupingMode={groupingMode}
                performanceData={performanceData}
              />
            ) : (
              <SkillGroupView 
                tasks={filteredTasks}
                groupingMode={groupingMode}
                expandedGroups={preferences.expandedSkillGroups}
                onToggleExpansion={toggleSkillGroupExpansion}
              />
            )}
            
            {/* Performance Debug Info (dev mode) */}
            {process.env.NODE_ENV === 'development' && performanceData.analysis.performanceGrade === 'D' && (
              <Card className="mt-4 bg-red-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="text-xs text-red-700 space-y-1">
                    <p><strong>Performance Warning:</strong> Grade {performanceData.analysis.performanceGrade}</p>
                    <p>Avg Render: {performanceData.analysis.averageRenderTime.toFixed(1)}ms</p>
                    <p>Max Render: {performanceData.analysis.maxRenderTime.toFixed(1)}ms</p>
                    <div className="space-y-1">
                      {performanceData.recommendations.map((rec, i) => (
                        <p key={i}>• {rec}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Export Dialogs */}
        <DetailMatrixExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          tasks={filteredTasks}
          viewMode={viewMode}
          selectedSkills={demandMatrixControls.selectedSkills}
          selectedClients={demandMatrixControls.selectedClients}
          selectedPreferredStaff={demandMatrixControls.selectedPreferredStaff}
          monthRange={demandMatrixControls.monthRange}
          groupingMode={groupingMode}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
        />
      </div>
    </div>
  );
});

/**
 * Detail Matrix Container - Phase 5 Enhanced
 * 
 * Enhanced container with state provider, performance monitoring,
 * and persistence capabilities integrated.
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