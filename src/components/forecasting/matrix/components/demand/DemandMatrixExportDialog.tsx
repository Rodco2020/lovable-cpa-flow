
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { EnhancedExportService, EnhancedExportOptions } from '@/services/forecasting/export/enhancedExportService';

interface DemandMatrixExportDialogProps {
  demandData: DemandMatrixData;
  currentFilters: DemandFilters;
  onExport?: (config: any) => void;
  groupingMode: 'skill' | 'client';
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  availableSkills: string[];
  availableClients: { id: string; name: string }[];
  availablePreferredStaff: { id: string; name: string }[];
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  children?: React.ReactNode;
}

export const DemandMatrixExportDialog: React.FC<DemandMatrixExportDialogProps> = ({
  demandData,
  currentFilters,
  onExport,
  groupingMode,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  availableSkills,
  availableClients,
  availablePreferredStaff,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportOptions, setExportOptions] = useState<EnhancedExportOptions>({
    format: 'csv',
    includeMetadata: true,
    includeTaskBreakdown: true,
    includePreferredStaffInfo: true,
    includeFilteringModeDetails: true,
    validateDataIntegrity: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const detectFilteringMode = () => {
    if (selectedPreferredStaff.length === 0 && currentFilters.preferredStaff?.showOnlyPreferred) {
      return 'Unassigned Only Mode';
    } else if (selectedPreferredStaff.length > 0) {
      return `Specific Staff Mode (${selectedPreferredStaff.length} staff)`;
    } else {
      return 'All Staff Mode';
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const result = await EnhancedExportService.exportWithFilteringContext(
        demandData,
        currentFilters,
        selectedSkills,
        selectedClients,
        monthRange,
        {
          ...exportOptions,
          format: exportFormat
        }
      );

      if (result.success) {
        console.log('✅ [EXPORT] Successfully exported:', result.exportedFileName);
        setIsOpen(false);
        if (onExport) {
          onExport(result);
        }
      } else {
        setExportError(result.errors?.join(', ') || 'Export failed');
      }
    } catch (error) {
      console.error('❌ [EXPORT] Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (key: keyof EnhancedExportOptions, value: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Export Matrix Data</Button>}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Demand Matrix Data (Phase 5 Enhanced)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Filter Context */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Current Filter Context & Mode Detection</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{detectFilteringMode()}</Badge>
              <Badge variant="secondary">
                Skills: {isAllSkillsSelected ? 'All' : `${selectedSkills.length} selected`}
              </Badge>
              <Badge variant="secondary">
                Clients: {isAllClientsSelected ? 'All' : `${selectedClients.length} selected`}
              </Badge>
              <Badge variant="secondary">
                Grouping: {groupingMode}
              </Badge>
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Export Format</h3>
            <RadioGroup value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Phase 5 Enhanced Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Phase 5 Enhanced Options</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) => handleOptionChange('includeMetadata', checked as boolean)}
                />
                <Label htmlFor="includeMetadata">Include Filtering Metadata</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTaskBreakdown"
                  checked={exportOptions.includeTaskBreakdown}
                  onCheckedChange={(checked) => handleOptionChange('includeTaskBreakdown', checked as boolean)}
                />
                <Label htmlFor="includeTaskBreakdown">Include Task Breakdown</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePreferredStaffInfo"
                  checked={exportOptions.includePreferredStaffInfo}
                  onCheckedChange={(checked) => handleOptionChange('includePreferredStaffInfo', checked as boolean)}
                />
                <Label htmlFor="includePreferredStaffInfo">Include Preferred Staff Details</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFilteringModeDetails"
                  checked={exportOptions.includeFilteringModeDetails}
                  onCheckedChange={(checked) => handleOptionChange('includeFilteringModeDetails', checked as boolean)}
                />
                <Label htmlFor="includeFilteringModeDetails">Include Three-Mode Filter Analysis</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validateDataIntegrity"
                  checked={exportOptions.validateDataIntegrity}
                  onCheckedChange={(checked) => handleOptionChange('validateDataIntegrity', checked as boolean)}
                />
                <Label htmlFor="validateDataIntegrity">Validate Data Integrity</Label>
              </div>
            </div>
          </div>

          {/* Export Error */}
          {exportError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                <strong>Export failed:</strong> {exportError}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export with Phase 5 Enhancements'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
