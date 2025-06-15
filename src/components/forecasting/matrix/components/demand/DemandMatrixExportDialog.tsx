
import React, { useState } from 'react';
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
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Settings,
  Info,
  CheckCircle2
} from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatHours, formatNumber } from '@/lib/numberUtils';

interface DemandMatrixExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  demandData: DemandMatrixData;
  selectedSkills: string[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixExportDialog: React.FC<DemandMatrixExportDialogProps> = ({
  isOpen,
  onClose,
  demandData,
  selectedSkills,
  selectedClients,
  monthRange,
  groupingMode
}) => {
  const [exportOptions, setExportOptions] = useState({
    includeTaskBreakdown: true,
    includeClientSummary: groupingMode === 'client',
    includeRecurrencePatterns: true,
    includeRevenueColumns: groupingMode === 'client',
    includeTrendAnalysis: false,
    format: 'xlsx' as 'xlsx' | 'csv' | 'json'
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
  const estimatedFileSize = calculateEstimatedFileSize();

  function calculateEstimatedFileSize(): string {
    const baseSize = demandData.dataPoints.length * 100; // Increased base size for revenue columns
    const taskBreakdownSize = exportOptions.includeTaskBreakdown ? 
      demandData.dataPoints.reduce((sum, point) => sum + (point.taskBreakdown?.length || 0), 0) * 150 : 0;
    const revenueColumnsSize = exportOptions.includeRevenueColumns && groupingMode === 'client' ? 
      demandData.dataPoints.length * 50 : 0; // Additional size for revenue columns
    
    const totalBytes = baseSize + taskBreakdownSize + revenueColumnsSize;
    
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const exportData = prepareExportData();
      await downloadFile(exportData);
      
      toast({
        title: "Export completed",
        description: `Demand matrix exported successfully as ${exportOptions.format.toUpperCase()}`,
      });
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to export demand matrix data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const prepareExportData = () => {
    const filteredData = demandData.dataPoints.filter(
      point => 
        selectedSkills.includes(point.skillType) &&
        filteredMonths.some(month => month.key === point.month)
    );

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        groupingMode,
        skillsIncluded: selectedSkills.length,
        clientsIncluded: selectedClients.length,
        monthsIncluded: filteredMonths.length,
        totalDataPoints: filteredData.length,
        includeRevenueColumns: exportOptions.includeRevenueColumns && groupingMode === 'client'
      },
      matrixData: filteredData.map(point => ({
        skill: point.skillType,
        month: point.month,
        monthLabel: point.monthLabel || point.month,
        demandHours: point.demandHours,
        taskCount: point.taskCount,
        clientCount: point.clientCount,
        // NEW: Include revenue columns for client grouping mode
        ...(exportOptions.includeRevenueColumns && groupingMode === 'client' && {
          suggestedRevenue: point.suggestedRevenue || 0,
          expectedLessSuggested: point.expectedLessSuggested || 0
        }),
        ...(exportOptions.includeTaskBreakdown && {
          taskBreakdown: point.taskBreakdown
        })
      })),
      // NEW: Include client revenue summaries for client mode
      ...(exportOptions.includeClientSummary && groupingMode === 'client' && {
        clientSummary: generateClientSummaryWithRevenue(filteredData)
      }),
      // NEW: Include revenue totals
      ...(exportOptions.includeRevenueColumns && groupingMode === 'client' && demandData.revenueTotals && {
        revenueTotals: demandData.revenueTotals
      }),
      ...(exportOptions.includeRecurrencePatterns && {
        recurrencePatterns: generateRecurrencePatterns(filteredData)
      })
    };

    return exportData;
  };

  // NEW: Enhanced client summary with revenue information
  const generateClientSummaryWithRevenue = (data: any[]) => {
    const clientMap = new Map();
    
    data.forEach(point => {
      point.taskBreakdown?.forEach((task: any) => {
        const existing = clientMap.get(task.clientId);
        if (existing) {
          existing.totalHours += task.monthlyHours;
          existing.taskCount += 1;
        } else {
          clientMap.set(task.clientId, {
            clientId: task.clientId,
            clientName: task.clientName,
            totalHours: task.monthlyHours,
            taskCount: 1,
            // NEW: Include revenue information
            expectedRevenue: demandData.clientRevenue?.get(task.clientName) || 0,
            suggestedRevenue: demandData.clientSuggestedRevenue?.get(task.clientName) || 0,
            expectedLessSuggested: demandData.clientExpectedLessSuggested?.get(task.clientName) || 0,
            hourlyRate: demandData.clientHourlyRates?.get(task.clientName) || 0
          });
        }
      });
    });

    return Array.from(clientMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  };

  const generateRecurrencePatterns = (data: any[]) => {
    const patternMap = new Map();
    
    data.forEach(point => {
      point.taskBreakdown?.forEach((task: any) => {
        const pattern = task.recurrencePattern?.type || 'Ad-hoc';
        const existing = patternMap.get(pattern);
        
        if (existing) {
          existing.count += 1;
          existing.totalHours += task.monthlyHours;
        } else {
          patternMap.set(pattern, {
            pattern,
            count: 1,
            totalHours: task.monthlyHours
          });
        }
      });
    });

    return Array.from(patternMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  };

  const downloadFile = async (data: any) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `demand-matrix-${groupingMode}-${timestamp}.${exportOptions.format}`;
    
    let content: string;
    let mimeType: string;

    switch (exportOptions.format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        break;
      case 'csv':
        content = convertToEnhancedCSV(data.matrixData);
        mimeType = 'text/csv';
        break;
      case 'xlsx':
        // In a real implementation, you would use a library like xlsx to create Excel files
        // For now, we'll create a structured JSON that could be converted to Excel
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

  // NEW: Enhanced CSV conversion with revenue columns
  const convertToEnhancedCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    // Build headers based on grouping mode and options
    const baseHeaders = [
      groupingMode === 'skill' ? 'Skill Type' : 'Client Name',
      'Month',
      'Month Label',
      'Demand Hours',
      'Task Count',
      'Client Count'
    ];

    // NEW: Add revenue headers for client mode
    const revenueHeaders = exportOptions.includeRevenueColumns && groupingMode === 'client' ? [
      'Suggested Revenue',
      'Expected Less Suggested'
    ] : [];

    const headers = [...baseHeaders, ...revenueHeaders];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        const baseValues = [
          `"${row.skill || row.clientName}"`,
          `"${row.month}"`,
          `"${row.monthLabel}"`,
          formatHours(row.demandHours, 1),
          row.taskCount,
          row.clientCount
        ];

        // NEW: Add revenue values for client mode
        const revenueValues = exportOptions.includeRevenueColumns && groupingMode === 'client' ? [
          row.suggestedRevenue || 0,
          row.expectedLessSuggested || 0
        ] : [];

        return [...baseValues, ...revenueValues].join(',');
      })
    ].join('\n');
    
    return csvContent;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Demand Matrix ({groupingMode === 'skill' ? 'Skill View' : 'Client View'})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Overview */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>Export includes filtered data with:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{selectedSkills.length} skills</Badge>
                  <Badge variant="outline">{selectedClients.length} clients</Badge>
                  <Badge variant="outline">{filteredMonths.length} months</Badge>
                  <Badge variant="outline">~{estimatedFileSize}</Badge>
                  {exportOptions.includeRevenueColumns && groupingMode === 'client' && (
                    <Badge variant="secondary">Revenue Columns</Badge>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>

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

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Include in Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { 
                  key: 'includeTaskBreakdown', 
                  label: 'Task Breakdown Details', 
                  desc: 'Individual task information for each matrix cell' 
                },
                { 
                  key: 'includeClientSummary', 
                  label: 'Client Summary', 
                  desc: 'Aggregated client demand and revenue statistics',
                  disabled: groupingMode !== 'client'
                },
                { 
                  key: 'includeRevenueColumns', 
                  label: 'Revenue Columns', 
                  desc: 'Suggested Revenue and Expected Less Suggested columns',
                  disabled: groupingMode !== 'client',
                  highlight: groupingMode === 'client'
                },
                { 
                  key: 'includeRecurrencePatterns', 
                  label: 'Recurrence Patterns', 
                  desc: 'Summary of task recurrence types and frequencies' 
                },
                { 
                  key: 'includeTrendAnalysis', 
                  label: 'Trend Analysis', 
                  desc: 'Month-over-month growth metrics (experimental)' 
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
              Estimated file size: {estimatedFileSize}
            </div>
            
            <div className="flex gap-3">
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
