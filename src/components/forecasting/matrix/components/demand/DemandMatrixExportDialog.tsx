
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
import { 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  Building2, 
  Briefcase,
  CheckCircle,
  Target,
  Globe,
  UserX
} from 'lucide-react';

interface ExportConfiguration {
  format: 'csv' | 'json';
  includeMetadata: boolean;
  includeTaskBreakdown: boolean;
  includePreferredStaffInfo: boolean;
  // Phase 4: Enhanced export configuration with filtering mode details
  includeFilteringModeInfo: boolean;
  includeFilteringSummary: boolean;
}

interface DemandMatrixExportDialogProps {
  onExport: (config: ExportConfiguration) => void;
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
  // Phase 4: Enhanced props for three-mode filtering export
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  children?: React.ReactNode;
}

/**
 * Phase 4: Enhanced Demand Matrix Export Dialog Component
 * 
 * PHASE 4 ENHANCEMENTS:
 * - Added preferredStaffFilterMode context in export configuration
 * - Enhanced metadata to include three-mode filtering information
 * - Added filter mode summary and detailed breakdown options
 * - Maintained all existing export functionality
 * - Enhanced UI to show three-mode context clearly
 */
export const DemandMatrixExportDialog: React.FC<DemandMatrixExportDialogProps> = ({
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
  preferredStaffFilterMode,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ExportConfiguration>({
    format: 'csv',
    includeMetadata: true,
    includeTaskBreakdown: true,
    includePreferredStaffInfo: true,
    // Phase 4: Default enhanced export options
    includeFilteringModeInfo: true,
    includeFilteringSummary: true
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleExport = () => {
    console.log(`📤 [PHASE 4 EXPORT] Exporting with three-mode filtering configuration:`, {
      preferredStaffFilterMode,
      selectedStaffCount: selectedPreferredStaff.length,
      includeFilteringModeInfo: config.includeFilteringModeInfo,
      includeFilteringSummary: config.includeFilteringSummary
    });

    onExport(config);
    setOpen(false);
  };

  // Phase 4: Enhanced filter summary calculations
  const skillsText = isAllSkillsSelected ? `All ${availableSkills.length} skills` : `${selectedSkills.length} of ${availableSkills.length} skills`;
  const clientsText = isAllClientsSelected ? `All ${availableClients.length} clients` : `${selectedClients.length} of ${availableClients.length} clients`;
  
  // Phase 4: Three-mode specific summary text
  const getPreferredStaffSummary = () => {
    switch (preferredStaffFilterMode) {
      case 'all':
        return `All tasks (${availablePreferredStaff.length} staff available)`;
      case 'specific':
        return `${selectedPreferredStaff.length} of ${availablePreferredStaff.length} preferred staff selected`;
      case 'none':
        return 'Unassigned tasks only';
      default:
        return 'Unknown filtering mode';
    }
  };

  // Phase 4: Get mode icon and description
  const getModeInfo = () => {
    switch (preferredStaffFilterMode) {
      case 'all':
        return {
          icon: <Globe className="h-4 w-4 text-green-600" />,
          label: 'All Tasks Mode',
          description: 'Includes all tasks regardless of staff assignment'
        };
      case 'specific':
        return {
          icon: <Target className="h-4 w-4 text-blue-600" />,
          label: 'Specific Staff Mode',
          description: 'Only tasks assigned to selected staff members'
        };
      case 'none':
        return {
          icon: <UserX className="h-4 w-4 text-orange-600" />,
          label: 'Unassigned Tasks Mode',
          description: 'Only tasks without preferred staff assignments'
        };
    }
  };

  const modeInfo = getModeInfo();

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
            Export Demand Matrix Data
          </DialogTitle>
          <DialogDescription>
            Configure your export settings and review current filter context including three-mode filtering
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Filter Context - Enhanced with Three-Mode Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Current Filter Context
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

                {/* Phase 4: Enhanced Three-Mode Display */}
                <div className="flex items-center gap-2">
                  {modeInfo.icon}
                  <span className="font-medium">Filter Mode:</span>
                  <Badge variant="default" className="text-xs">
                    {modeInfo.label}
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

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Staff Filter:</span>
                  <Badge variant="outline" className="text-xs">
                    {getPreferredStaffSummary()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Phase 4: Three-Mode Description */}
            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                {modeInfo.icon}
                <span className="font-medium">{modeInfo.label}:</span>
                <span>{modeInfo.description}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Export Format Selection */}
          <div>
            <h4 className="font-medium mb-3">Export Format</h4>
            <RadioGroup 
              value={config.format} 
              onValueChange={(value: 'csv' | 'json') => setConfig(prev => ({ ...prev, format: value }))}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex-1 cursor-pointer">
                  <div className="font-medium">CSV Format</div>
                  <div className="text-xs text-muted-foreground">
                    Spreadsheet-compatible format with filtering metadata
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex-1 cursor-pointer">
                  <div className="font-medium">JSON Format</div>
                  <div className="text-xs text-muted-foreground">
                    Structured data format with complete filter context
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Options - Enhanced with Phase 4 Options */}
          <div>
            <h4 className="font-medium mb-3">Export Options</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={config.includeMetadata}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeMetadata: !!checked }))}
                />
                <Label htmlFor="metadata" className="flex-1 cursor-pointer">
                  <div className="font-medium">Include Metadata</div>
                  <div className="text-xs text-muted-foreground">
                    Export settings, timestamps, and filter context
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
                    <div className="font-medium">Include Preferred Staff Information</div>
                    <div className="text-xs text-muted-foreground">
                      Staff assignments and preferences per task
                    </div>
                  </Label>
                </div>
              )}

              {/* Phase 4: New Enhanced Export Options */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filteringMode"
                  checked={config.includeFilteringModeInfo}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeFilteringModeInfo: !!checked }))}
                />
                <Label htmlFor="filteringMode" className="flex-1 cursor-pointer">
                  <div className="font-medium">Include Three-Mode Filtering Information</div>
                  <div className="text-xs text-muted-foreground">
                    Current filtering mode and applied criteria details
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filteringSummary"
                  checked={config.includeFilteringSummary}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeFilteringSummary: !!checked }))}
                />
                <Label htmlFor="filteringSummary" className="flex-1 cursor-pointer">
                  <div className="font-medium">Include Filtering Summary</div>
                  <div className="text-xs text-muted-foreground">
                    Summary of what data is included/excluded by current filters
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleExport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Data with Filter Context
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemandMatrixExportDialog;
