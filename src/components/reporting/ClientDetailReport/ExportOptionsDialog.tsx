
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ExportOptions } from "@/types/clientReporting";
import { FileText, File, Table } from "lucide-react";

interface ExportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => void;
}

export const ExportOptionsDialog: React.FC<ExportOptionsDialogProps> = ({
  open,
  onOpenChange,
  onExport
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeTaskDetails: true,
    includeTimeline: true,
    customFields: []
  });

  const handleChange = (field: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = () => {
    onExport(options);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Options</DialogTitle>
          <DialogDescription>
            Choose your export format and what to include in the report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Format */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup 
              value={options.format} 
              onValueChange={(value) => handleChange('format', value as ExportOptions['format'])}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <FileText className="h-4 w-4" />
                <Label htmlFor="pdf">PDF - Print ready document</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Table className="h-4 w-4" />
                <Label htmlFor="excel">Excel - Spreadsheet format</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <File className="h-4 w-4" />
                <Label htmlFor="csv">CSV - Data only</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-charts">Charts and Visualizations</Label>
              <Switch
                id="include-charts"
                checked={options.includeCharts}
                onCheckedChange={(checked) => handleChange('includeCharts', checked)}
                disabled={options.format === 'csv'}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-task-details">Task Details</Label>
              <Switch
                id="include-task-details"
                checked={options.includeTaskDetails}
                onCheckedChange={(checked) => handleChange('includeTaskDetails', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-timeline">Timeline Data</Label>
              <Switch
                id="include-timeline"
                checked={options.includeTimeline}
                onCheckedChange={(checked) => handleChange('includeTimeline', checked)}
              />
            </div>
          </div>

          {options.format === 'csv' && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                CSV exports include data only. Charts and formatting are not available in this format.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
