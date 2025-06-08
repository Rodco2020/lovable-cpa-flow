
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ExportOptionsSection } from './ExportOptionsSection';
import { PrintOptionsSection } from './PrintOptionsSection';
import { useExportState } from './useExportState';
import { getFilterSummary } from './utils';
import { EnhancedExportSectionProps, ExportOptions, PrintOptions } from './types';

/**
 * Enhanced Export Section Component
 * 
 * Provides comprehensive export and print functionality for the capacity matrix.
 * Features include:
 * - CSV and JSON export with configurable options
 * - Print preview with orientation and content options
 * - Client filtering integration
 * - Analytics inclusion toggle
 * - Collapsible interface for space efficiency
 */
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
  const { toast } = useToast();
  
  const {
    exportFormat,
    setExportFormat,
    includeAnalytics,
    includeClientFilter,
    printOrientation,
    setPrintOrientation,
    includeCharts,
    handleIncludeAnalyticsChange,
    handleIncludeClientFilterChange,
    handleIncludeChartsChange
  } = useExportState();

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

  const filterSummary = getFilterSummary(selectedSkills, selectedClientIds, monthRange);

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
          Current filter: {filterSummary}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          <ExportOptionsSection
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            includeAnalytics={includeAnalytics}
            includeClientFilter={includeClientFilter}
            handleIncludeAnalyticsChange={handleIncludeAnalyticsChange}
            handleIncludeClientFilterChange={handleIncludeClientFilterChange}
            onExport={handleExport}
          />

          <PrintOptionsSection
            includeCharts={includeCharts}
            printOrientation={printOrientation}
            setPrintOrientation={setPrintOrientation}
            handleIncludeChartsChange={handleIncludeChartsChange}
            onPrint={handlePrint}
          />
        </CardContent>
      )}
    </Card>
  );
};
