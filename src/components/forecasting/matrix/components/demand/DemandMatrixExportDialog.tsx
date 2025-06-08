
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Printer,
  Settings
} from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

interface DemandMatrixExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  demandData: DemandMatrixData;
  selectedSkills: SkillType[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
}

interface ExportOptions {
  format: 'csv' | 'pdf' | 'print';
  includeMetrics: boolean;
  includeTaskBreakdown: boolean;
  includeClientDetails: boolean;
  includeRecurrencePatterns: boolean;
  groupBy: 'skill' | 'client' | 'both';
  timeGranularity: 'monthly' | 'quarterly';
}

export const DemandMatrixExportDialog: React.FC<DemandMatrixExportDialogProps> = ({
  isOpen,
  onClose,
  demandData,
  selectedSkills,
  selectedClients,
  monthRange
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeMetrics: true,
    includeTaskBreakdown: true,
    includeClientDetails: true,
    includeRecurrencePatterns: false,
    groupBy: 'skill',
    timeGranularity: 'monthly'
  });

  const handleExport = () => {
    switch (exportOptions.format) {
      case 'csv':
        generateCSVExport();
        break;
      case 'pdf':
        generatePDFExport();
        break;
      case 'print':
        generatePrintView();
        break;
    }
    onClose();
  };

  const generateCSVExport = () => {
    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    
    let csvContent = '';
    
    // Header information
    csvContent += 'Demand Matrix Export\n';
    csvContent += `Generated: ${new Date().toISOString()}\n`;
    csvContent += `Time Period: ${filteredMonths[0]?.label} - ${filteredMonths[filteredMonths.length - 1]?.label}\n`;
    csvContent += `Skills: ${selectedSkills.join(', ')}\n`;
    csvContent += `Clients: ${selectedClients.length} selected\n\n`;

    // Summary metrics if included
    if (exportOptions.includeMetrics) {
      csvContent += 'Summary Metrics\n';
      csvContent += `Total Demand Hours,${demandData.totalDemand}\n`;
      csvContent += `Total Tasks,${demandData.totalTasks}\n`;
      csvContent += `Total Clients,${demandData.totalClients}\n\n`;
    }

    // Main data table
    if (exportOptions.groupBy === 'skill') {
      csvContent += 'Skill,Month,Demand Hours,Task Count,Client Count\n';
      
      selectedSkills.forEach(skill => {
        filteredMonths.forEach(month => {
          const dataPoint = demandData.dataPoints.find(
            point => point.skillType === skill && point.month === month.key
          );
          
          if (dataPoint) {
            csvContent += `"${skill}","${month.label}",${dataPoint.demandHours},${dataPoint.taskCount},${dataPoint.clientCount}\n`;
          }
        });
      });
    }

    // Task breakdown if included
    if (exportOptions.includeTaskBreakdown) {
      csvContent += '\nTask Breakdown\n';
      csvContent += 'Task Name,Client,Skill,Monthly Hours,Recurrence Type\n';
      
      demandData.dataPoints.forEach(point => {
        if (selectedSkills.includes(point.skillType)) {
          point.taskBreakdown.forEach(task => {
            if (selectedClients.includes(task.clientId)) {
              csvContent += `"${task.taskName}","${task.clientName}","${task.skillType}",${task.monthlyHours},"${task.recurrencePattern?.type || 'Ad-hoc'}"\n`;
            }
          });
        }
      });
    }

    // Download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `demand-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generatePDFExport = () => {
    // For now, open print dialog - in production would use PDF library
    window.print();
  };

  const generatePrintView = () => {
    const printContent = generatePrintHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintHTML = () => {
    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Demand Matrix Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
            .metric-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
            .matrix-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .matrix-table th, .matrix-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .matrix-table th { background-color: #f5f5f5; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Demand Matrix Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            <p>Period: ${filteredMonths[0]?.label} - ${filteredMonths[filteredMonths.length - 1]?.label}</p>
          </div>
          
          ${exportOptions.includeMetrics ? `
          <div class="metrics">
            <div class="metric-card">
              <h3>${demandData.totalDemand.toFixed(0)}</h3>
              <p>Total Demand Hours</p>
            </div>
            <div class="metric-card">
              <h3>${demandData.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
            <div class="metric-card">
              <h3>${demandData.totalClients}</h3>
              <p>Total Clients</p>
            </div>
          </div>
          ` : ''}
          
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Skill</th>
                ${filteredMonths.map(month => `<th>${month.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${selectedSkills.map(skill => `
                <tr>
                  <td><strong>${skill}</strong></td>
                  ${filteredMonths.map(month => {
                    const dataPoint = demandData.dataPoints.find(
                      point => point.skillType === skill && point.month === month.key
                    );
                    return `<td>${dataPoint ? dataPoint.demandHours.toFixed(1) + 'h' : '0h'}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Demand Matrix
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export Format</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={exportOptions.format}
                onValueChange={(value: 'csv' | 'pdf' | 'print') => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel compatible)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="print" id="print" />
                  <Label htmlFor="print" className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print View
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Include in Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metrics"
                  checked={exportOptions.includeMetrics}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeMetrics: !!checked }))
                  }
                />
                <Label htmlFor="metrics">Summary metrics</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taskBreakdown"
                  checked={exportOptions.includeTaskBreakdown}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeTaskBreakdown: !!checked }))
                  }
                />
                <Label htmlFor="taskBreakdown">Task breakdown details</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clientDetails"
                  checked={exportOptions.includeClientDetails}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeClientDetails: !!checked }))
                  }
                />
                <Label htmlFor="clientDetails">Client information</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurrencePatterns"
                  checked={exportOptions.includeRecurrencePatterns}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeRecurrencePatterns: !!checked }))
                  }
                />
                <Label htmlFor="recurrencePatterns">Recurrence pattern analysis</Label>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
