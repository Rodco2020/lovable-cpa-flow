import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Calendar, 
  Filter, 
  Table as TableIcon,
  PieChart,
  TrendingUp,
  Download,
  ArrowLeft,
  Settings
} from 'lucide-react';
import ClientTaskTable from './ClientTaskTable';
import ClientTaskFilters from './ClientTaskFilters';
import ClientMonthlyBreakdown from './ClientMonthlyBreakdown';
import ClientSummaryStats from './ClientSummaryStats';
import ClientExportManager from './ClientExportManager';
import TaskDetailsModal from './TaskDetailsModal';
import { EnhancedLoadingState } from '@/components/common/EnhancedLoadingState';
import { useClientFiltering } from '../matrix/hooks/useClientFiltering';
import { useEnhancedTabNavigation } from '@/hooks/useEnhancedTabNavigation';
import { useForecastingKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAccessibility } from '@/components/common/AccessibilityEnhancements';
import { enhancedPerformanceMonitor } from '@/services/performance/enhancedPerformanceMonitor';

interface ClientTaskDetailsProps {
  clientId: string;
}

interface FilterState {
  dateRange: { start: Date; end: Date } | null;
  status: string[];
  skills: string[];
  categories: string[];
  priorities: string[];
  taskType: 'all' | 'recurring' | 'instances';
}

interface TaskData {
  id: string;
  name: string;
  description?: string;
  estimated_hours: number;
  priority: string;
  category: string;
  status: string;
  due_date?: string;
  required_skills: string[];
  is_active?: boolean;
  recurrence_type?: string;
}

const ClientTaskDetails: React.FC<ClientTaskDetailsProps> = ({ clientId }) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: null,
    status: [],
    skills: [],
    categories: [],
    priorities: [],
    taskType: 'all'
  });

  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  // Enhanced navigation and accessibility hooks
  const { navigateToMatrix, getCurrentContext } = useEnhancedTabNavigation();
  const { announceToScreenReader } = useAccessibility();

  // Keyboard shortcuts for power users
  useForecastingKeyboardShortcuts({
    exportData: () => setActiveTab('export'),
    showHelp: () => announceToScreenReader('Available tabs: Summary, Task Table, Monthly View, Trends, Export. Use arrow keys to navigate.'),
    refreshData: () => {
      // Trigger data refresh
      announceToScreenReader('Data refreshed');
    }
  });

  // Use client filtering hook with performance monitoring
  const { 
    clientMatrixData, 
    isLoading: clientDataLoading,
    error: clientDataError 
  } = useClientFiltering({
    forecastType: 'virtual',
    dateRange: filters.dateRange ? {
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end
    } : undefined
  });

  const handleTaskSelect = (task: TaskData) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDrillDown = (taskId: string, skill: string) => {
    console.log('Drill down to matrix:', { taskId, skill, clientId });
    // This would trigger navigation to matrix tab with specific filters
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Get default date range for monthly breakdown (last 12 months)
  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 12);
    return { start, end };
  };

  // Enhanced loading state with progress
  if (clientDataLoading) {
    return (
      <EnhancedLoadingState
        type="loading"
        title="Loading Client Details"
        message="Fetching comprehensive task data and analytics..."
        showProgress={true}
        progress={75} // Mock progress for demo
      />
    );
  }

  // Enhanced error state with message
  if (clientDataError) {
    return (
      <EnhancedLoadingState
        type="error"
        title="Failed to Load Client Data"
        message={clientDataError}
        onRetry={() => window.location.reload()}
        onCancel={handleBackToMatrix}
      />
    );
  }

  const handleBackToMatrix = () => {
    const context = getCurrentContext();
    navigateToMatrix({
      matrixFilters: {
        forecastType: context.matrixFilters?.forecastType || 'virtual'
      }
    });
    announceToScreenReader('Navigated back to Matrix view');
  };

  const handleTabChange = (newTab: string) => {
    enhancedPerformanceMonitor.timeSync(
      'tab-change',
      'rendering',
      () => {
        setActiveTab(newTab);
        announceToScreenReader(`Switched to ${newTab} tab`);
      },
      { fromTab: activeTab, toTab: newTab, clientId }
    );
  };

  return (
    <div className="space-y-6" id="main-content">
      {/* Enhanced Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToMatrix}
            className="flex items-center gap-2"
            aria-label="Back to Matrix view"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Matrix
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-2xl font-semibold">Client Task Details</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => announceToScreenReader('Use Ctrl+H for help, Ctrl+E to export, or arrow keys to navigate tabs')}
            aria-label="Accessibility help"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Section with Enhanced Accessibility */}
      <ClientTaskFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isCollapsed={filtersCollapsed}
        onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
      />

      {/* Main Content Tabs with Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5" role="tablist" aria-label="Client details navigation">
          <TabsTrigger value="summary" className="flex items-center gap-2" role="tab" aria-controls="summary-panel">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2" role="tab" aria-controls="table-panel">
            <TableIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Task Table</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2" role="tab" aria-controls="monthly-panel">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Monthly View</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2" role="tab" aria-controls="trends-panel">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2" role="tab" aria-controls="export-panel">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6" role="tabpanel" id="summary-panel" aria-labelledby="summary-tab">
          <ClientSummaryStats 
            clientId={clientId} 
            dateRange={filters.dateRange || undefined}
          />
        </TabsContent>

        {/* Task Table Tab */}
        <TabsContent value="table" className="space-y-6" role="tabpanel" id="table-panel" aria-labelledby="table-tab">
          <ClientTaskTable
            clientId={clientId}
            taskType={filters.taskType}
            filters={{
              status: filters.status,
              skills: filters.skills,
              categories: filters.categories,
              priorities: filters.priorities,
              dateRange: filters.dateRange || undefined
            }}
            onTaskSelect={handleTaskSelect}
            onDrillDown={handleDrillDown}
          />
        </TabsContent>

        {/* Monthly Breakdown Tab */}
        <TabsContent value="monthly" className="space-y-6" role="tabpanel" id="monthly-panel" aria-labelledby="monthly-tab">
          <ClientMonthlyBreakdown
            clientId={clientId}
            dateRange={filters.dateRange || getDefaultDateRange()}
            skillFilter={filters.skills.length > 0 ? filters.skills : undefined}
          />
        </TabsContent>

        {/* Trends Tab - Enhanced placeholder */}
        <TabsContent value="trends" className="space-y-6" role="tabpanel" id="trends-panel" aria-labelledby="trends-tab">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Task Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="py-12 text-center">
              <EnhancedLoadingState
                type="empty"
                title="Trends Analysis Coming Soon"
                message="Advanced trend analysis and predictive insights for client task patterns will be available in the next update."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6" role="tabpanel" id="export-panel" aria-labelledby="export-tab">
          <ClientExportManager
            clientId={clientId}
            filters={filters}
          />
        </TabsContent>
      </Tabs>

      {/* Task Details Modal with Enhanced Accessibility */}
      <TaskDetailsModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
          announceToScreenReader('Task details modal closed');
        }}
        task={selectedTask}
      />

      {/* Performance Monitoring (Development Only) */}
      {process.env.NODE_ENV === 'development' && clientDataLoading && (
        <Card className="border-blue-200">
          <CardContent className="py-4">
            <div className="text-sm text-blue-600">
              Performance monitoring active: {enhancedPerformanceMonitor.getPerformanceInsights().cacheStats.hitRate}% cache hit rate
            </div>
          </CardContent>
        </Card>
      )}

      {process.env.NODE_ENV === 'development' && clientDataError && (
        <Card className="border-red-200">
          <CardContent className="py-4">
            <div className="text-sm text-red-600">
              Client data error: {clientDataError}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientTaskDetails;
