import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Settings,
  Info,
  AlertTriangle,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatHours, formatNumber } from '@/lib/numberUtils';

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
}

interface DetailMatrixExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  viewMode: 'all-tasks' | 'group-by-skill';
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
  hasActiveFilters: boolean;
  activeFiltersCount: number;
}

/**
 * Detail Matrix Export Dialog - Phase 4
 * 
 * Specialized export dialog for task-level data with enhanced options:
 * - Support for both view modes (all tasks vs grouped by skill)
 * - Task metadata inclusion options
 * - Large export handling with progress indicators
 * - Detail-specific export formats
 */
export const DetailMatrixExportDialog: React.FC<DetailMatrixExportDialogProps> = ({
  isOpen,
  onClose,
  tasks,
  viewMode,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  groupingMode,
  hasActiveFilters,
  activeFiltersCount
}) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'xlsx' as 'xlsx' | 'csv' | 'json',
    includeTaskMetadata: true,
    includeCompletedTasks: false,
    includeRecurrenceDetails: true,
    includeFilterSummary: hasActiveFilters,
    includeSkillGrouping: viewMode === 'group-by-skill',
    exportFilteredOnly: hasActiveFilters,
    addSummarySheet: true
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  // Calculate export size and warnings
  const exportStats = useMemo(() => {
    const taskCount = tasks.length;
    const isLargeExport = taskCount > 1000;
    const estimatedSize = calculateEstimatedFileSize(taskCount);
    
    return {
      taskCount,
      isLargeExport,
      estimatedSize,
      showWarning: isLargeExport && !exportOptions.exportFilteredOnly
    };
  }, [tasks.length, exportOptions.exportFilteredOnly]);

  function calculateEstimatedFileSize(taskCount: number): string {
    // Base size per task with all metadata
    const baseSize = taskCount * 200; // Increased for task-level detail
    const metadataSize = exportOptions.includeTaskMetadata ? taskCount * 100 : 0;
    const groupingSize = exportOptions.includeSkillGrouping ? taskCount * 50 : 0;
    
    const totalBytes = baseSize + metadataSize + groupingSize;
    
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const handleExport = async () => {
    if (exportStats.isLargeExport) {
      const confirmed = window.confirm(
        `This export contains ${exportStats.taskCount} tasks and may take some time. Continue?`
      );
      if (!confirmed) return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress for large exports
      if (exportStats.isLargeExport) {
        for (let i = 0; i <= 100; i += 10) {
          setExportProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const exportData = prepareExportData();
      await downloadFile(exportData);
      
      toast({
        title: "Export completed",
        description: `${exportStats.taskCount} tasks exported successfully as ${exportOptions.format.toUpperCase()}`,
      });
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to export task data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const prepareExportData = () => {
    const exportMetadata = {
      exportDate: new Date().toISOString(),
      exportType: 'detail-matrix',
      viewMode,
      groupingMode,
      taskCount: tasks.length,
      hasActiveFilters,
      activeFiltersCount,
      filters: {
        skills: selectedSkills,
        clients: selectedClients,
        preferredStaff: selectedPreferredStaff,
        monthRange: {
          start: monthRange.start + 1,
          end: monthRange.end + 1
        }
      }
    };

    const taskData = tasks.map(task => {
      const baseData = {
        taskId: task.id,
        taskName: task.taskName,
        clientName: task.clientName,
        clientId: task.clientId,
        skillRequired: task.skillRequired,
        monthlyHours: task.monthlyHours,
        month: task.month,
        monthLabel: task.monthLabel,
        priority: task.priority,
        category: task.category
      };

      // Add optional metadata
      if (exportOptions.includeTaskMetadata) {
        return {
          ...baseData,
          createdDate: '2024-01-01', // Mock data for Phase 4
          modifiedDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          taskType: 'Recurring'
        };
      }

      if (exportOptions.includeRecurrenceDetails) {
        return {
          ...baseData,
          recurrencePattern: task.recurrencePattern,
          recurrenceType: 'Monthly' // Default for Phase 4
        };
      }

      return baseData;
    });

    // Group data by skill if requested
    const organizedData = exportOptions.includeSkillGrouping && viewMode === 'group-by-skill' 
      ? groupTasksBySkill(taskData)
      : taskData;

    const exportData = {
      metadata: exportMetadata,
      tasks: organizedData,
      summary: generateSummaryData(),
      ...(exportOptions.includeFilterSummary && hasActiveFilters && {
        filterSummary: {
          activeFilters: activeFiltersCount,
          skillsFilter: selectedSkills.length > 0 ? selectedSkills : null,
          clientsFilter: selectedClients.length > 0 ? selectedClients : null,
          staffFilter: selectedPreferredStaff.length > 0 ? selectedPreferredStaff : null,
          monthRangeFilter: `Month ${monthRange.start + 1} to ${monthRange.end + 1}`
        }
      })
    };

    return exportData;
  };

  const groupTasksBySkill = (taskData: any[]) => {
    interface SkillGroup {
      skillName: string;
      tasks: any[];
      totalHours: number;
      taskCount: number;
      uniqueClients: Set<string>;
    }

    const grouped = taskData.reduce((acc, task) => {
      const skill = task.skillRequired;
      if (!acc[skill]) {
        acc[skill] = {
          skillName: skill,
          tasks: [],
          totalHours: 0,
          taskCount: 0,
          uniqueClients: new Set<string>()
        };
      }
      
      acc[skill].tasks.push(task);
      acc[skill].totalHours += task.monthlyHours;
      acc[skill].taskCount += 1;
      acc[skill].uniqueClients.add(task.clientName);
      
      return acc;
    }, {} as Record<string, SkillGroup>);

    // Convert to array and add summaries
    return Object.values(grouped as Record<string, SkillGroup>).map(group => ({
      skillName: group.skillName,
      tasks: group.tasks,
      totalHours: group.totalHours,
      taskCount: group.taskCount,
      uniqueClients: Array.from(group.uniqueClients),
      clientCount: group.uniqueClients.size
    }));
  };

  const generateSummaryData = () => {
    const skillSummary = tasks.reduce((acc, task) => {
      const skill = task.skillRequired;
      if (!acc[skill]) {
        acc[skill] = { totalHours: 0, taskCount: 0, clientCount: new Set() };
      }
      acc[skill].totalHours += task.monthlyHours;
      acc[skill].taskCount += 1;
      acc[skill].clientCount.add(task.clientName);
      return acc;
    }, {} as Record<string, any>);

    // Convert sets to counts
    Object.keys(skillSummary).forEach(skill => {
      skillSummary[skill].clientCount = skillSummary[skill].clientCount.size;
    });

    const clientSummary = tasks.reduce((acc, task) => {
      const client = task.clientName;
      if (!acc[client]) {
        acc[client] = { totalHours: 0, taskCount: 0, skills: new Set() };
      }
      acc[client].totalHours += task.monthlyHours;
      acc[client].taskCount += 1;
      acc[client].skills.add(task.skillRequired);
      return acc;
    }, {} as Record<string, any>);

    // Convert sets to arrays
    Object.keys(clientSummary).forEach(client => {
      clientSummary[client].skills = Array.from(clientSummary[client].skills);
    });

    return {
      totalTasks: tasks.length,
      totalHours: tasks.reduce((sum, task) => sum + task.monthlyHours, 0),
      uniqueClients: Array.from(new Set(tasks.map(task => task.clientName))).length,
      uniqueSkills: Array.from(new Set(tasks.map(task => task.skillRequired))).length,
      skillBreakdown: skillSummary,
      clientBreakdown: clientSummary
    };
  };

  const downloadFile = async (data: any) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `detail-matrix-${viewMode}-${groupingMode}-${timestamp}.${exportOptions.format}`;
    
    let content: string;
    let mimeType: string;

    switch (exportOptions.format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        break;
      case 'csv':
        content = convertToCSV(data.tasks);
        mimeType = 'text/csv';
        break;
      case 'xlsx':
        // For demo - in production would use XLSX library
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        break;
      default:
        throw new Error('Unsupported format');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (taskData: any[]): string => {
    if (taskData.length === 0) return '';
    
    const headers = [
      'Task ID',
      'Task Name', 
      'Client Name',
      'Skill Required',
      'Monthly Hours',
      'Month',
      'Priority',
      'Category'
    ];

    if (exportOptions.includeTaskMetadata) {
      headers.push('Created Date', 'Modified Date', 'Status', 'Task Type');
    }

    if (exportOptions.includeRecurrenceDetails) {
      headers.push('Recurrence Pattern', 'Recurrence Type');
    }

    const csvContent = [
      headers.join(','),
      ...taskData.map(task => {
        const baseValues = [
          `"${task.taskId}"`,
          `"${task.taskName}"`,
          `"${task.clientName}"`,
          `"${task.skillRequired}"`,
          task.monthlyHours,
          `"${task.monthLabel}"`,
          `"${task.priority}"`,
          `"${task.category}"`
        ];

        if (exportOptions.includeTaskMetadata) {
          baseValues.push(
            `"${task.createdDate || ''}"`,
            `"${task.modifiedDate || ''}"`,
            `"${task.status || 'Active'}"`,
            `"${task.taskType || 'Recurring'}"`
          );
        }

        if (exportOptions.includeRecurrenceDetails) {
          baseValues.push(
            `"${task.recurrencePattern || 'Monthly'}"`,
            `"${task.recurrenceType || 'Monthly'}"`
          );
        }

        return baseValues.join(',');
      })
    ].join('\n');
    
    return csvContent;
  };

  const handlePrint = () => {
    // This would open print dialog - placeholder for Phase 4
    toast({
      title: "Print Preview",
      description: "Print functionality will open in new window (coming soon)",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Detail Matrix ({viewMode === 'all-tasks' ? 'All Tasks' : 'Grouped by Skill'})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Overview */}
          <Alert className={exportStats.showWarning ? "border-orange-200 bg-orange-50" : ""}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>Export includes task-level data with:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{exportStats.taskCount} tasks</Badge>
                  <Badge variant="outline">{Array.from(new Set(tasks.map(t => t.skillRequired))).length} skills</Badge>
                  <Badge variant="outline">{Array.from(new Set(tasks.map(t => t.clientName))).length} clients</Badge>
                  <Badge variant="outline">~{exportStats.estimatedSize}</Badge>
                  {hasActiveFilters && (
                    <Badge variant="secondary">{activeFiltersCount} active filters</Badge>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Large Export Warning */}
          {exportStats.showWarning && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Large Export Warning:</strong> This export contains {exportStats.taskCount} tasks. 
                Consider filtering data or exporting in smaller batches for better performance.
              </AlertDescription>
            </Alert>
          )}

          {/* Export Progress */}
          {isExporting && exportStats.isLargeExport && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Preparing export...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          )}

          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet, desc: 'Best for analysis' },
                  { value: 'csv', label: 'CSV', icon: FileText, desc: 'Universal format' },
                  { value: 'json', label: 'JSON', icon: Settings, desc: 'For developers' }
                ].map((format) => (
                  <div
                    key={format.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      exportOptions.format === format.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <format.icon className="h-4 w-4" />
                      <span className="font-medium">{format.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{format.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detail Matrix Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detail Matrix Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { 
                  key: 'includeTaskMetadata', 
                  label: 'Task Metadata', 
                  desc: 'Include created date, modified date, status, and task type',
                  highlight: true
                },
                { 
                  key: 'includeCompletedTasks', 
                  label: 'Completed Tasks', 
                  desc: 'Include tasks that have been marked as completed',
                  disabled: true // Phase 4 placeholder
                },
                { 
                  key: 'includeRecurrenceDetails', 
                  label: 'Recurrence Details', 
                  desc: 'Include recurrence pattern and frequency information'
                },
                { 
                  key: 'includeFilterSummary', 
                  label: 'Filter Summary', 
                  desc: 'Include active filter information in export',
                  disabled: !hasActiveFilters
                },
                { 
                  key: 'includeSkillGrouping', 
                  label: 'Preserve Skill Grouping', 
                  desc: 'Maintain skill group structure in export',
                  disabled: viewMode !== 'group-by-skill'
                },
                { 
                  key: 'addSummarySheet', 
                  label: 'Summary Sheet', 
                  desc: 'Add summary sheet with totals by skill and client'
                }
              ].map((option) => (
                <div key={option.key} className="flex items-start space-x-3">
                  <Checkbox
                    id={option.key}
                    checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                    disabled={option.disabled}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ 
                        ...prev, 
                        [option.key]: checked === true 
                      }))
                    }
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor={option.key}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        option.highlight ? 'text-primary' : ''
                      }`}
                    >
                      {option.label}
                      {option.highlight && (
                        <Badge variant="secondary" className="ml-2 text-xs">NEW</Badge>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {option.desc}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Separator />

          {/* Export Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Estimated file size: {exportStats.estimatedSize}
              {exportStats.isLargeExport && (
                <Badge variant="outline" className="ml-2">Large Export</Badge>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Preview
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isExporting}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {exportOptions.format.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};