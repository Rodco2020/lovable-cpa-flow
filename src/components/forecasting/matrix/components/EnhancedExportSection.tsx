
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer, FileText, FileSpreadsheet, Settings } from 'lucide-react';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';

interface EnhancedExportSectionProps {
  matrixData: MatrixData;
  selectedSkills: SkillType[];
  selectedClientIds: string[];
  monthRange: { start: number; end: number };
  onExport: (format: 'csv' | 'json', options: ExportOptions) => void;
  onPrint: (options: PrintOptions) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface ExportOptions {
  includeAnalytics: boolean;
  includeClientFilter: boolean;
  clientIds: string[];
  format: 'summary' | 'detailed';
}

interface PrintOptions {
  includeCharts: boolean;
  includeClientFilter: boolean;
  clientIds: string[];
  orientation: 'portrait' | 'landscape';
}

export const EnhancedExportSection: React.FC<EnhancedExportSectionProps> = ({
  matrixData,
  selectedSkills,
  selectedClientIds,
  monthRange,
  onExport,
  onPrint,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [exportFormat, setExportFormat] = useState<'summary' | 'detailed'>('summary');
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeClientFilter, setIncludeClientFilter] = useState(true);
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [includeCharts, setIncludeCharts] = useState(true);
  const { toast } = useToast();

  const handleExport = (format: 'csv' | 'json') => {
    const options: ExportOptions = {
      includeAnalytics,
      includeClientFilter,
      clientIds: selectedClientIds,
      format: exportFormat
    };
    
    onExport(format, options);
    
    toast({
      title: "Export started",
      description: `Generating ${format.toUpperCase()} export with your selected options.`
    });
  };

  const handlePrint = () => {
    const options: PrintOptions = {
      includeCharts,
      includeClientFilter,
      clientIds: selectedClientIds,
      orientation: printOrientation
    };
    
    onPrint(options);
    
    toast({
      title: "Print preview generated",
      description: "Opening print preview with your selected options."
    });
  };

  const getFilterSummary = () => {
    const parts = [];
    if (selectedSkills.length > 0) {
      parts.push(`${selectedSkills.length} skills`);
    }
    if (selectedClientIds.length > 0) {
      parts.push(`${selectedClientIds.length} clients`);
    }
    const monthCount = monthRange.end - monthRange.start + 1;
    parts.push(`${monthCount} months`);
    
    return parts.join(', ');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export & Print
          </CardTitle>
          {onToggleCollapse && (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              {isCollapsed ? 'Show' : 'Hide'}
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Current filter: {getFilterSummary()}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Export Options */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Export Options</div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={includeAnalytics}
                  onCheckedChange={setIncludeAnalytics}
                />
                <label className="text-sm">Include analytics & trends</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={includeClientFilter}
                  onCheckedChange={setIncludeClientFilter}
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
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <FileText className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>

          {/* Print Options */}
          <div className="pt-3 border-t space-y-3">
            <div className="text-sm font-medium">Print Options</div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
                <label className="text-sm">Include charts</label>
              </div>
              
              <Select value={printOrientation} onValueChange={(value: 'portrait' | 'landscape') => setPrintOrientation(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" onClick={handlePrint} className="w-full">
              <Printer className="h-4 w-4 mr-1" />
              Print Preview
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
