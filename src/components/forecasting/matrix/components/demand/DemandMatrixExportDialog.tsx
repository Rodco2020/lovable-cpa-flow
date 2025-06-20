
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
  CheckCircle 
} from 'lucide-react';

interface ExportConfiguration {
  format: 'csv' | 'json';
  includeMetadata: boolean;
  includeTaskBreakdown: boolean;
  includePreferredStaffInfo: boolean;
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
  children?: React.ReactNode;
}

/**
 * Demand Matrix Export Dialog Component
 * 
 * Provides export configuration options with context about current filters,
 * including preferred staff filtering information.
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
  children
}) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ExportConfiguration>({
    format: 'csv',
    includeMetadata: true,
    includeTaskBreakdown: true,
    includePreferredStaffInfo: true
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleExport = () => {
    onExport(config);
    setOpen(false);
  };

  // Calculate filter summary
  const skillsText = isAllSkillsSelected ? `All ${availableSkills.length} skills` : `${selectedSkills.length} of ${availableSkills.length} skills`;
  const clientsText = isAllClientsSelected ? `All ${availableClients.length} clients` : `${selectedClients.length} of ${availableClients.length} clients`;
  const preferredStaffText = availablePreferredStaff.length > 0 
    ? (isAllPreferredStaffSelected ? `All ${availablePreferredStaff.length} preferred staff` : `${selectedPreferredStaff.length} of ${availablePreferredStaff.length} preferred staff`)
    : 'No preferred staff available';

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
            Configure your export settings and review current filter context
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Filter Context */}
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
                    Spreadsheet-compatible format
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex-1 cursor-pointer">
                  <div className="font-medium">JSON Format</div>
                  <div className="text-xs text-muted-foreground">
                    Structured data format
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Options */}
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
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleExport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Data
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
