
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface ExportOptionsSectionProps {
  exportFormat: 'summary' | 'detailed';
  setExportFormat: (format: 'summary' | 'detailed') => void;
  includeAnalytics: boolean;
  includeClientFilter: boolean;
  handleIncludeAnalyticsChange: (checked: boolean | "indeterminate") => void;
  handleIncludeClientFilterChange: (checked: boolean | "indeterminate") => void;
  onExport: (format: 'csv' | 'json') => void;
}

export const ExportOptionsSection: React.FC<ExportOptionsSectionProps> = ({
  exportFormat,
  setExportFormat,
  includeAnalytics,
  includeClientFilter,
  handleIncludeAnalyticsChange,
  handleIncludeClientFilterChange,
  onExport
}) => {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Export Options</div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={includeAnalytics}
            onCheckedChange={handleIncludeAnalyticsChange}
          />
          <label className="text-sm">Include analytics & trends</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={includeClientFilter}
            onCheckedChange={handleIncludeClientFilterChange}
          />
          <label className="text-sm">Apply client filter</label>
        </div>
      </div>

      <Select value={exportFormat} onValueChange={(value: 'summary' | 'detailed') => setExportFormat(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Export format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="summary">Summary format</SelectItem>
          <SelectItem value="detailed">Detailed format</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => onExport('json')}>
          <FileText className="h-4 w-4 mr-1" />
          JSON
        </Button>
      </div>
    </div>
  );
};
