
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  Building2, 
  Briefcase,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { EnhancedExportService, EnhancedExportOptions } from '@/services/forecasting/export/enhancedExportService';
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { toast } from 'sonner';

interface DemandMatrixExportDialogProps {
  onExport?: (config: any) => void; // Legacy support
  demandData: DemandMatrixData;
  currentFilters: DemandFilters;
  groupingMode: 'skill' | 'client';
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  children?: React.ReactNode;
}

/**
 * Phase 5: Enhanced Demand Matrix Export Dialog
 * 
 * Integrates with the new three-mode filtering system and provides comprehensive
 * export functionality with filtering mode metadata and data integrity validation.
 */
export const DemandMatrixExportDialog: React.FC<DemandMatrixExportDialogProps> = ({
  onExport, // Legacy support
  demandData,
  currentFilters,
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
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [config, setConfig] = useState<EnhancedExportOptions>({
    format: 'csv',
    includeMetadata: true,
    includeTaskBreakdown: true,
    includePreferredStaffInfo: true,
    includeFilteringModeDetails: true,
    validateDataIntegrity: true
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Determine current filtering mode
  const getFilteringModeDescription = () => {
    if (!currentFilters.preferredStaff) return 'All Tasks Mode';
    
    const { staffIds = [], showOnlyPreferred = false } = currentFilters.preferredStaff;
    
    if (showOnlyPreferred && staffIds.length === 0) {
      return 'Unassigned Only Mode';
    } else if (staffIds.length > 0) {
      return `Specific Staff Mode (${staffIds.length} staff)`;
    }
    
    return 'All Tasks Mode';
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setExportError(null);

    try {
      console.log(`🚀 [PHASE 5 EXPORT DIALOG] Starting export:`, {
        format: config.format,
        filteringMode: getFilteringModeDescription(),
        selectedSkills: selectedSkills.length,
        selectedClients: selectedClients.length
      });

      // Use Phase 5 enhanced export service
      const result = await EnhancedExportService.exportWithFilteringContext(
        demandData,
        currentFilters,
        selectedSkills,
        selectedClients,
        monthRange,
        config
      );

      if (result.success) {
        toast.success(`Export completed successfully! File: ${result.exportedFileName}`, {
          description: `Format: ${config.format.toUpperCase()} | Mode: ${getFilteringModeDescription()}`
        });
        
        // Legacy callback support
        if (onExport) {
          onExport(config);
        }
        
        setOpen(false);
      } else {
        const errorMessage = result.errors?.join(', ') || 'Unknown export error';
        setExportError(errorMessage);
        toast.error('Export failed', {
          description: errorMessage
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown export error';
      setExportError(errorMessage);
      toast.error('Export failed', {
        description: errorMessage
      });
      console.error('❌ [PHASE 5 EXPORT DIALOG] Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate filter summary
  const skillsText = isAllSkillsSelected ? `All ${availableSkills.length} skills` : `${selectedSkills.length} of ${availableSkills.length} skills`;
  const clientsText = isAllClientsSelected ? `All ${availableClients.length} clients` : `${selectedClients.length} of ${availableClients.length} clients`;
  const preferredStaffText = availablePreferredStaff.length > 0 
    ? (isAllPreferredStaffSelected ? `All ${availablePreferredStaff.length} preferred staff` : `${selectedPreferredStaff.length} of ${availablePreferredStaff.length} preferred staff`)
    : 'No preferred staff available';

  const estimatedDataPoints = selectedSkills.length * (monthRange.end - monthRange.start + 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Matrix Data
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Demand Matrix Data (Phase 5 Enhanced)
          </DialogTitle>
          <DialogDescription>
            Configure export settings with comprehensive filtering mode support
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Filter Context */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Current Filter Context & Mode Detection
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Time Range:</span>
                  <Badge variant="outline">
                    {monthNames[monthRange.start]} - {monthNames[monthRange.end]}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Grouping:</span>
                  <Badge variant="secondary">
                    {groupingMode === 'skill' ? 'By Skills' : 'By Clients'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Filtering Mode:</span>
                  <Badge variant="outline" className="text-xs font-medium">
                    {getFilteringModeDescription()}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Skills:</span>
                  <Badge variant="outline" className="text-xs">
                    {skillsText}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Clients:</span>
                  <Badge variant="outline" className="text-xs">
                    {clientsText}
                  </Badge>
                </div>

                {availablePreferredStaff.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Preferred Staff:</span>
                    <Badge variant="outline" className="text-xs">
                      {preferredStaffText}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Data preview */}
            <div className="mt-3 p-2 bg-white rounded border text-xs">
              <span className="font-medium">Estimated Export Size:</span> ~{estimatedDataPoints} data points
              {config.validateDataIntegrity && (
                <span className="ml-2 text-green-600">• Data integrity validation enabled</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Export Format Selection */}
          <div>
            <h4 className="font-medium mb-3">Export Format</h4>
            <RadioGroup 
              value={config.format} 
              onValueChange={(value: 'csv' | 'json' | 'excel') => setConfig(prev => ({ ...prev, format: value }))}
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex-1 cursor-pointer">
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-muted-foreground">
                    Spreadsheet format
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex-1 cursor-pointer">
                  <div className="font-medium">JSON</div>
                  <div className="text-xs text-muted-foreground">
                    Structured data
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex-1 cursor-pointer">
                  <div className="font-medium">Excel</div>
                  <div className="text-xs text-muted-foreground">
                    Advanced format
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Phase 5 Enhanced Export Options */}
          <div>
            <h4 className="font-medium mb-3">Phase 5 Enhanced Options</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={config.includeMetadata}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeMetadata: !!checked }))}
                />
                <Label htmlFor="metadata" className="flex-1 cursor-pointer">
                  <div className="font-medium">Include Filtering Metadata</div>
                  <div className="text-xs text-muted-foreground">
                    Export timestamps, filter modes, performance metrics
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="breakdown"
                  checked={config.includeTaskBreakdown}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeTaskBreakdown: !!checked }))}
                />
                <Label htmlFor="breakdown" className="flex-1 cursor-pointer">
                  <div className="font-medium">Include Task Breakdown</div>
                  <div className="text-xs text-muted-foreground">
                    Detailed task information per data point
                  </div>
                </Label>
              </div>

              {availablePreferredStaff.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="staffInfo"
                    checked={config.includePreferredStaffInfo}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includePreferredStaffInfo: !!checked }))}
                  />
                  <Label htmlFor="staffInfo" className="flex-1 cursor-pointer">
                    <div className="font-medium">Include Preferred Staff Details</div>
                    <div className="text-xs text-muted-foreground">
                      Staff assignments, filtering mode analysis
                    </div>
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filteringDetails"
                  checked={config.includeFilteringModeDetails}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeFilteringModeDetails: !!checked }))}
                />
                <Label htmlFor="filteringDetails" className="flex-1 cursor-pointer">
                  <div className="font-medium">Include Three-Mode Filter Analysis</div>
                  <div className="text-xs text-muted-foreground">
                    Detailed breakdown of filtering mode impact
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validation"
                  checked={config.validateDataIntegrity}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, validateDataIntegrity: !!checked }))}
                />
                <Label htmlFor="validation" className="flex-1 cursor-pointer">
                  <div className="font-medium">Validate Data Integrity</div>
                  <div className="text-xs text-muted-foreground">
                    Run Phase 4 validation checks before export
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {exportError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Export failed: {exportError}
              </AlertDescription>
            </Alert>
          )}

          {/* Export Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleExport} 
              className="flex-1"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export with Phase 5 Enhancements
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemandMatrixExportDialog;
