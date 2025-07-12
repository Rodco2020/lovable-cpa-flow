import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DetailMatrixStateProvider } from './DetailMatrixStateProvider';
import { DetailMatrixHeader } from './components/DetailMatrixHeader';
import { DetailMatrixGrid } from './components/DetailMatrixGrid';
import { SkillGroupView } from './components/SkillGroupView';
import { DetailMatrixExportDialog } from './components/DetailMatrixExportDialog';
import { DetailForecastMatrixGrid } from './components/DetailForecastMatrixGrid';
import { DemandMatrixControls } from '../components/demand/DemandMatrixControls';
import { useDetailMatrixData } from './hooks/useDetailMatrixData';
import { useDetailMatrixFilters } from './hooks/useDetailMatrixFilters';
import { useDetailMatrixHandlers } from './hooks/useDetailMatrixHandlers';
import { DetailTaskRevenueCalculator } from '@/services/forecasting/demand/calculators/detailTaskRevenueCalculator';
import { getAllClients } from '@/services/clientService';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';
import { usePerformanceMonitoring, usePerformanceAlerts } from '../hooks/usePerformanceMonitoring';
import { useLocalStoragePersistence, useKeyboardNavigation } from '../hooks/useLocalStoragePersistence';
import { Loader2, Filter, X, Zap, AlertCircle, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DetailMatrixContainerProps {
  groupingMode: 'skill' | 'client';
  viewMode?: 'all-tasks' | 'group-by-skill' | 'detail-forecast-matrix';
  className?: string;
}

interface DetailMatrixContentProps {
  groupingMode: 'skill' | 'client';
  viewMode?: 'all-tasks' | 'group-by-skill' | 'detail-forecast-matrix';
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
  viewMode: initialViewMode = 'all-tasks',
  className
}) => {
  // STEP 1: Revenue calculation state
  const [revenueData, setRevenueData] = useState(new Map());
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // STEP 1.5: Pagination state for detail-forecast-matrix view
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  // STEP 2: Call ALL hooks FIRST (no conditions!) - Fixed Rules of Hooks violation
  const viewMode = initialViewMode; // Use prop instead of hook
  const { data, loading, error, demandMatrixControls, months } = useDetailMatrixData({ groupingMode });
  const handlers = useDetailMatrixHandlers();
  
  // All remaining hooks called unconditionally with safe defaults
  const {
    filteredTasks,
    tasksForRevenue,
    filterStats,
    hasActiveFilters,
    activeFiltersCount
  } = useDetailMatrixFilters({
    tasks: data || [], // Safe default when loading/error
    selectedSkills: demandMatrixControls?.selectedSkills || [],
    selectedClients: demandMatrixControls?.selectedClients || [],
    selectedPreferredStaff: demandMatrixControls?.selectedPreferredStaff || [],
    monthRange: demandMatrixControls?.monthRange || { start: 0, end: 11 },
    groupingMode,
    months: months || [] // Safe default
  });

  // Calculate pagination values
  const totalPages = Math.ceil((filteredTasks?.length || 0) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTasks = React.useMemo(() => {
    return filteredTasks?.slice(startIndex, endIndex) || [];
  }, [filteredTasks, startIndex, endIndex]);

  // When filters change, reset to page 1
  React.useEffect(() => {
    setCurrentPage(1);
  }, [demandMatrixControls?.selectedSkills, demandMatrixControls?.selectedClients, demandMatrixControls?.selectedPreferredStaff]);

  // Performance monitoring and preferences with safe defaults
  const performanceData = usePerformanceMonitoring((data || []).length, (filteredTasks || []).length, { enabled: true, sampleRate: 3 });
  const performanceAlerts = usePerformanceAlerts(performanceData);
  const { preferences, toggleSkillGroupExpansion } = useLocalStoragePersistence();
  const keyboardNav = useKeyboardNavigation(filteredTasks || [], preferences.expandedSkillGroups, toggleSkillGroupExpansion);

  // STEP 3: Revenue calculation effect for detail-forecast-matrix view
  useEffect(() => {
    if (viewMode === 'detail-forecast-matrix' && filteredTasks && filteredTasks.length > 0 && !loading) {
      calculateTaskRevenue();
    }
  }, [viewMode, JSON.stringify(filteredTasks), loading]);

  const calculateTaskRevenue = async () => {
    if (!filteredTasks || filteredTasks.length === 0) return;

    // Revenue calculation for detail-forecast-matrix view
    setRevenueLoading(true);
    setRevenueError(null);

    try {
      // Fetch client data with expected monthly revenue
      const clientsData = await getAllClients();

      // Get skill fee rates
      const skillFeeRates = await getSkillFeeRatesMap();

      // Calculate the month count for the period
      const monthCount = months ? months.length : 12;

      // Build client revenue data
      const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
        clientsData.map(client => ({
          id: client.id,
          legal_name: client.legalName,
          expected_monthly_revenue: client.expectedMonthlyRevenue
        })),
        tasksForRevenue,
        monthCount
      );

      // Calculate revenue for all tasks
      const taskRevenueResults = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
        tasksForRevenue,
        clientRevenueData,
        skillFeeRates
      );

      setRevenueData(taskRevenueResults);
      setRevenueError(null);
    } catch (err) {
      console.error('❌ [DETAIL MATRIX] Revenue calculation error:', err);
      setRevenueError(err instanceof Error ? err.message : 'Revenue calculation failed');
    } finally {
      setRevenueLoading(false);
    }
  };

  // STEP 4: Handle loading state with conditional RENDERING (not early returns!)
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

  // Revenue loading state for detail-forecast-matrix view
  if (viewMode === 'detail-forecast-matrix' && revenueLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Calculating task revenue...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state is now handled above before we get here

  // Error state
  if (error || revenueError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error ? `Error loading task data: ${error}` : `Error calculating revenue: ${revenueError}`}
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
            {viewMode === 'detail-forecast-matrix' ? (
              <div className="space-y-4">
                {/* Pagination Controls - Only show if more than one page */}
                {totalPages > 1 && (
                <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg border">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredTasks.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} tasks
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Rows per page:</label>
                      <select 
                        value={rowsPerPage} 
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-input rounded px-2 py-1 text-sm bg-background"
                      >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                        <option value={500}>500</option>
                      </select>
                    </div>
                    
                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                        title="First page"
                      >
                        <ChevronFirst className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                        title="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <span className="px-3 py-1 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                        title="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                        title="Last page"
                      >
                        <ChevronLast className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                )}

                <DetailForecastMatrixGrid
                  tasks={paginatedTasks}
                  tasksForRevenue={tasksForRevenue}
                  totalTaskCount={filteredTasks?.length || 0}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  months={months?.map(m => m.key) || []}
                  monthLabels={months?.map(m => m.label) || []}
                  revenueData={revenueData}
                  isLoading={revenueLoading}
                />
              </div>
            ) : viewMode === 'all-tasks' ? (
              <DetailMatrixGrid tasks={filteredTasks} groupingMode={groupingMode} performanceData={performanceData} />
            ) : viewMode === 'group-by-skill' ? (
              <SkillGroupView 
                tasks={filteredTasks}
                groupingMode={groupingMode}
                expandedGroups={preferences.expandedSkillGroups}
                onToggleExpansion={toggleSkillGroupExpansion}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Unknown view mode: {viewMode}</p>
              </div>
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
          revenueData={revenueData}
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
  viewMode,
  className
}) => {
  return (
    <DetailMatrixStateProvider>
      <DetailMatrixContent 
        groupingMode={groupingMode}
        viewMode={viewMode}
        className={className}
      />
    </DetailMatrixStateProvider>
  );
};