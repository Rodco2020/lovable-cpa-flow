
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
  TrendingUp
} from 'lucide-react';
import ClientTaskTable from './ClientTaskTable';
import ClientTaskFilters from './ClientTaskFilters';
import ClientMonthlyBreakdown from './ClientMonthlyBreakdown';
import ClientSummaryStats from './ClientSummaryStats';
import TaskDetailsModal from './TaskDetailsModal';
import { useClientFiltering } from '../matrix/hooks/useClientFiltering';

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

  // Use client filtering hook for performance monitoring
  const { 
    clientMatrixData, 
    isLoading: clientDataLoading,
    error: clientDataError 
  } = useClientFiltering({
    forecastType: 'virtual',
    dateRange: filters.dateRange || undefined
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

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <ClientTaskFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isCollapsed={filtersCollapsed}
        onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Task Table</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Monthly View</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <ClientSummaryStats 
            clientId={clientId} 
            dateRange={filters.dateRange || undefined}
          />
        </TabsContent>

        {/* Task Table Tab */}
        <TabsContent value="table" className="space-y-6">
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
        <TabsContent value="monthly" className="space-y-6">
          <ClientMonthlyBreakdown
            clientId={clientId}
            dateRange={filters.dateRange || getDefaultDateRange()}
            skillFilter={filters.skills.length > 0 ? filters.skills : undefined}
          />
        </TabsContent>

        {/* Trends Tab - Placeholder for future enhancement */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Task Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Trends Analysis Coming Soon</h3>
                <p>Advanced trend analysis and predictive insights for client task patterns.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      {/* Performance Monitoring (Development Only) */}
      {process.env.NODE_ENV === 'development' && clientDataLoading && (
        <Card className="border-blue-200">
          <CardContent className="py-4">
            <div className="text-sm text-blue-600">
              Loading client-specific data... (Performance monitoring active)
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
