
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from '@/components/export/ExportButton';
import { PrintView } from '@/components/export/PrintView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Printer, 
  FileText, 
  FileSpreadsheet,
  Eye,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { ExportService, ExportOptions, TaskExportData } from '@/services/export/exportService';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';

interface ClientExportManagerProps {
  clientId: string;
  filters?: {
    dateRange?: { start: Date; end: Date };
    status?: string[];
    skills?: string[];
    categories?: string[];
    priorities?: string[];
    taskType?: 'all' | 'recurring' | 'instances';
  };
}

interface ExportData {
  client: {
    id: string;
    legalName: string;
    primaryContact: string;
    email: string;
    phone: string;
    industry: string;
    status: string;
    expectedMonthlyRevenue: number;
  };
  tasks: TaskExportData[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    totalHours: number;
    skillBreakdown: Record<string, number>;
  };
}

const ClientExportManager: React.FC<ClientExportManagerProps> = ({
  clientId,
  filters
}) => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);

  // Fetch client data for export
  const { data: clientData, isLoading: clientLoading } = useQuery({
    queryKey: ['client-export-data', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch tasks data for export
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['client-tasks-export', clientId, filters],
    queryFn: async () => {
      // Fetch recurring tasks
      const { data: recurringTasks, error: recurringError } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('client_id', clientId);

      if (recurringError) throw recurringError;

      // Fetch task instances
      let instancesQuery = supabase
        .from('task_instances')
        .select('*')
        .eq('client_id', clientId);

      if (filters?.dateRange) {
        instancesQuery = instancesQuery
          .gte('due_date', filters.dateRange.start.toISOString())
          .lte('due_date', filters.dateRange.end.toISOString());
      }

      const { data: taskInstances, error: instancesError } = await instancesQuery;

      if (instancesError) throw instancesError;

      return {
        recurring: recurringTasks || [],
        instances: taskInstances || []
      };
    }
  });

  // Prepare export data
  React.useEffect(() => {
    if (clientData && tasksData) {
      const allTasks: TaskExportData[] = [
        ...tasksData.recurring.map(task => ({
          id: task.id,
          clientName: clientData.legal_name,
          taskName: task.name,
          taskType: 'Recurring' as const,
          status: task.status,
          priority: task.priority,
          estimatedHours: Number(task.estimated_hours),
          requiredSkills: task.required_skills || [],
          nextDueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : undefined,
          recurrencePattern: task.recurrence_type
        })),
        ...tasksData.instances.map(task => ({
          id: task.id,
          clientName: clientData.legal_name,
          taskName: task.name,
          taskType: 'Ad-hoc' as const,
          status: task.status,
          priority: task.priority,
          estimatedHours: Number(task.estimated_hours),
          requiredSkills: task.required_skills || [],
          nextDueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : undefined
        }))
      ];

      // Apply filters
      let filteredTasks = allTasks;
      
      if (filters?.taskType && filters.taskType !== 'all') {
        filteredTasks = filteredTasks.filter(task => 
          filters.taskType === 'recurring' ? task.taskType === 'Recurring' : task.taskType === 'Ad-hoc'
        );
      }

      if (filters?.status?.length) {
        filteredTasks = filteredTasks.filter(task => filters.status!.includes(task.status));
      }

      if (filters?.skills?.length) {
        filteredTasks = filteredTasks.filter(task => 
          filters.skills!.some(skill => task.requiredSkills.includes(skill))
        );
      }

      if (filters?.priorities?.length) {
        filteredTasks = filteredTasks.filter(task => filters.priorities!.includes(task.priority));
      }

      // Calculate summary
      const summary = {
        totalTasks: filteredTasks.length,
        completedTasks: filteredTasks.filter(t => t.status === 'Completed').length,
        activeTasks: filteredTasks.filter(t => t.status === 'Active' || t.status === 'In Progress').length,
        totalHours: filteredTasks.reduce((sum, task) => sum + task.estimatedHours, 0),
        skillBreakdown: filteredTasks.reduce((acc, task) => {
          task.requiredSkills.forEach(skill => {
            acc[skill] = (acc[skill] || 0) + task.estimatedHours;
          });
          return acc;
        }, {} as Record<string, number>)
      };

      setExportData({
        client: {
          id: clientData.id,
          legalName: clientData.legal_name,
          primaryContact: clientData.primary_contact,
          email: clientData.email,
          phone: clientData.phone,
          industry: clientData.industry,
          status: clientData.status,
          expectedMonthlyRevenue: Number(clientData.expected_monthly_revenue)
        },
        tasks: filteredTasks,
        summary
      });
    }
  }, [clientData, tasksData, filters]);

  const handleExport = async (options: ExportOptions) => {
    if (!exportData) {
      toast.error('Export data not ready');
      return;
    }

    try {
      setIsExporting(true);
      
      const appliedFilters = getAppliedFilters();
      await ExportService.exportTasks(exportData.tasks, options, appliedFilters);
      
      toast.success(`Client report exported successfully as ${options.format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export client report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPreview = () => {
    if (!exportData) {
      toast.error('Print data not ready');
      return;
    }
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    window.print();
    setShowPrintPreview(false);
  };

  const getAppliedFilters = () => {
    const appliedFilters: Record<string, any> = {};
    
    if (filters?.taskType && filters.taskType !== 'all') {
      appliedFilters['Task Type'] = filters.taskType === 'recurring' ? 'Recurring' : 'Ad-hoc';
    }
    
    if (filters?.status?.length) {
      appliedFilters['Status'] = filters.status.join(', ');
    }
    
    if (filters?.skills?.length) {
      appliedFilters['Skills'] = filters.skills.join(', ');
    }
    
    if (filters?.priorities?.length) {
      appliedFilters['Priority'] = filters.priorities.join(', ');
    }

    if (filters?.dateRange) {
      appliedFilters['Date Range'] = `${formatDate(filters.dateRange.start)} - ${formatDate(filters.dateRange.end)}`;
    }
    
    return appliedFilters;
  };

  const isLoading = clientLoading || tasksLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading export data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!exportData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Export data not available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export & Print Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{exportData.summary.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{exportData.summary.completedTasks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{exportData.summary.activeTasks}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{exportData.summary.totalHours}h</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.keys(getAppliedFilters()).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(getAppliedFilters()).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="flex flex-wrap gap-3">
            <ExportButton
              onExport={handleExport}
              dataType="tasks"
              isLoading={isExporting}
              className="flex-1 min-w-fit"
            />
            
            <Button
              variant="outline"
              onClick={handlePrintPreview}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Print Preview
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Quick Print
            </Button>
          </div>

          {/* Client Information Preview */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Report Will Include:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>• Client: {exportData.client.legalName}</div>
              <div>• Industry: {exportData.client.industry}</div>
              <div>• Tasks: {exportData.summary.totalTasks} items</div>
              <div>• Skills: {Object.keys(exportData.summary.skillBreakdown).length} types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Preview Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Print Preview - {exportData.client.legalName}
            </DialogTitle>
          </DialogHeader>
          <PrintView
            title={`Client Task Report - ${exportData.client.legalName}`}
            data={exportData.tasks}
            dataType="tasks"
            appliedFilters={getAppliedFilters()}
            onPrint={handlePrint}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientExportManager;
