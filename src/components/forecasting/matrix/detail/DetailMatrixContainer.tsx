import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DetailMatrixStateProvider } from './DetailMatrixStateProvider';
import { DetailMatrixHeader } from './components/DetailMatrixHeader';
import { DetailMatrixGrid } from './components/DetailMatrixGrid';
import { SkillGroupView } from './components/SkillGroupView';
import { DetailMatrixExportDialog } from './components/DetailMatrixExportDialog';
import { DemandMatrixControls } from '../components/demand/DemandMatrixControls';
import { useDetailMatrixState } from './DetailMatrixStateProvider';
import { useDetailMatrixData } from './hooks/useDetailMatrixData';
import { useDetailMatrixFilters } from './hooks/useDetailMatrixFilters';
import { useDetailMatrixHandlers } from './hooks/useDetailMatrixHandlers';
import { usePerformanceMonitoring, usePerformanceAlerts } from '../hooks/usePerformanceMonitoring';
import { useLocalStoragePersistence, useKeyboardNavigation } from '../hooks/useLocalStoragePersistence';
import { Loader2, Filter, X, Zap, AlertCircle } from 'lucide-react';
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
 * Detail Matrix Content - Refactored Step 5
 * 
 * Thin orchestration layer using extracted hooks and utilities.
 * Under 100 lines, maintains exact same functionality and behavior.
 */
const DetailMatrixContent: React.FC<DetailMatrixContentProps> = memo(({
  groupingMode,
  className
}) => {
  const { viewMode } = useDetailMatrixState();
  
  // Step 5: Use extracted hooks
  const { data, loading, error, demandMatrixControls, months } = useDetailMatrixData({ groupingMode });
  const handlers = useDetailMatrixHandlers();
  
  // Handle loading state - show loading until both data and controls are ready
  if (loading || !demandMatrixControls) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading Detail Matrix...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Apply filters using extracted hook
  const {
    filteredTasks,
    filterStats,
    hasActiveFilters,
    activeFiltersCount
  } = useDetailMatrixFilters({
    tasks: data,
    selectedSkills: demandMatrixControls.selectedSkills,
    selectedClients: demandMatrixControls.selectedClients,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    monthRange: demandMatrixControls.monthRange,
    groupingMode,
    months // Pass months array for proper filtering
  });

  // Performance monitoring and preferences
  const performanceData = usePerformanceMonitoring(data.length, filteredTasks.length, { enabled: true, sampleRate: 3 });
  const performanceAlerts = usePerformanceAlerts(performanceData);
  const { preferences, toggleSkillGroupExpansion } = useLocalStoragePersistence();
  const keyboardNav = useKeyboardNavigation(filteredTasks, preferences.expandedSkillGroups, toggleSkillGroupExpansion);

  // Loading state is now handled above before we get here

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading task data: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No task data available</p>
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
            onExport={handlers.handleOpenExportDialog}
            onPrintExport={handlers.handleOpenPrintDialog}
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
            <DetailMatrixHeader taskCount={filteredTasks.length} selectedCount={0} />
            
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
                        Showing {filteredTasks.length} of {data.length} tasks
                      </span>
                      <Button variant="ghost" size="sm" onClick={demandMatrixControls.handleReset} className="text-xs">
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Conditional View Rendering */}
          <div className="animate-fade-in" tabIndex={0}>
            {viewMode === 'all-tasks' ? (
              <DetailMatrixGrid tasks={filteredTasks} groupingMode={groupingMode} performanceData={performanceData} />
            ) : (
              <SkillGroupView 
                tasks={filteredTasks}
                groupingMode={groupingMode}
                expandedGroups={preferences.expandedSkillGroups}
                onToggleExpansion={toggleSkillGroupExpansion}
              />
            )}
          </div>
        </div>

        {/* Export Dialog */}
        <DetailMatrixExportDialog
          isOpen={handlers.showExportDialog}
          onClose={handlers.handleCloseExportDialog}
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
 * Detail Matrix Container - Refactored Step 5
 * 
 * Clean container with state provider wrapper.
 * Maintains exact same external API and functionality.
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