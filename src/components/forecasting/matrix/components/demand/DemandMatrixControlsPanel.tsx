
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  FileText, 
  Printer 
} from 'lucide-react';
import { PreferredStaffFilterSection } from './components/PreferredStaffFilterSection';

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (client: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  onPrintExport?: () => void;
}

export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = ({
  isControlsExpanded,
  onToggleControls,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  onSkillToggle,
  onClientToggle,
  onPreferredStaffToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  groupingMode,
  availableSkills,
  availableClients,
  availablePreferredStaff,
  onPrintExport
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const isAllSkillsSelected = selectedSkills.length === 0 || selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = selectedClients.length === 0 || selectedClients.length === availableClients.length;
  const isAllPreferredStaffSelected = selectedPreferredStaff.length === 0 || selectedPreferredStaff.length === availablePreferredStaff.length;

  // Convert toggle function to setter function for PreferredStaffFilterSection
  const handlePreferredStaffChange = (staffIds: string[]) => {
    // Calculate which items to toggle based on the difference
    const currentSet = new Set(selectedPreferredStaff);
    const newSet = new Set(staffIds);
    
    // Find items that were added or removed
    const toAdd = staffIds.filter(id => !currentSet.has(id));
    const toRemove = selectedPreferredStaff.filter(id => !newSet.has(id));
    
    // Apply toggles for added items
    toAdd.forEach(staffId => onPreferredStaffToggle(staffId));
    // Apply toggles for removed items
    toRemove.forEach(staffId => onPreferredStaffToggle(staffId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Matrix Controls</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleControls}
              className="flex items-center gap-1"
            >
              {isControlsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isControlsExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Range Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Time Range</label>
            <Badge variant="outline" className="text-xs">
              {monthNames[monthRange.start]} - {monthNames[monthRange.end]}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Start Month: {monthNames[monthRange.start]}
              </label>
              <Slider
                value={[monthRange.start]}
                onValueChange={([start]) => onMonthRangeChange({ start, end: Math.max(start, monthRange.end) })}
                max={11}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                End Month: {monthNames[monthRange.end]}
              </label>
              <Slider
                value={[monthRange.end]}
                onValueChange={([end]) => onMonthRangeChange({ start: Math.min(monthRange.start, end), end })}
                max={11}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Skills Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Skills Filter</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isAllSkillsSelected) {
                  availableSkills.forEach(skill => onSkillToggle(skill));
                } else {
                  availableSkills.forEach(skill => {
                    if (!selectedSkills.includes(skill)) {
                      onSkillToggle(skill);
                    }
                  });
                }
              }}
              className="h-6 px-2 text-xs"
            >
              {isAllSkillsSelected ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide All
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show All
                </>
              )}
            </Button>
          </div>
          
          {isControlsExpanded && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableSkills.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={isAllSkillsSelected || selectedSkills.includes(skill)}
                    onCheckedChange={() => onSkillToggle(skill)}
                  />
                  <label 
                    htmlFor={`skill-${skill}`} 
                    className="text-sm cursor-pointer flex-1 truncate"
                    title={skill}
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {!isControlsExpanded && (
            <div className="text-xs text-muted-foreground">
              {isAllSkillsSelected ? 'All skills visible' : `${selectedSkills.length}/${availableSkills.length} skills selected`}
            </div>
          )}
        </div>

        <Separator />

        {/* Clients Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Clients Filter</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isAllClientsSelected) {
                  availableClients.forEach(client => onClientToggle(client.name));
                } else {
                  availableClients.forEach(client => {
                    if (!selectedClients.includes(client.name)) {
                      onClientToggle(client.name);
                    }
                  });
                }
              }}
              className="h-6 px-2 text-xs"
            >
              {isAllClientsSelected ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide All
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show All
                </>
              )}
            </Button>
          </div>
          
          {isControlsExpanded && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableClients.map((client) => (
                <div key={client.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`client-${client.id}`}
                    checked={isAllClientsSelected || selectedClients.includes(client.name)}
                    onCheckedChange={() => onClientToggle(client.name)}
                  />
                  <label 
                    htmlFor={`client-${client.id}`} 
                    className="text-sm cursor-pointer flex-1 truncate"
                    title={client.name}
                  >
                    {client.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {!isControlsExpanded && (
            <div className="text-xs text-muted-foreground">
              {isAllClientsSelected ? 'All clients visible' : `${selectedClients.length}/${availableClients.length} clients selected`}
            </div>
          )}
        </div>

        <Separator />

        {/* Preferred Staff Filter - Fixed prop to use setter function */}
        <PreferredStaffFilterSection
          selectedPreferredStaff={selectedPreferredStaff}
          setSelectedPreferredStaff={handlePreferredStaffChange}
          availablePreferredStaff={availablePreferredStaff}
          isControlsExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          {onPrintExport && (
            <Button 
              onClick={onPrintExport} 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print/Export Reports
            </Button>
          )}
          
          <Button 
            onClick={onExport} 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          
          <Button 
            onClick={onReset} 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        {/* Current Selection Summary */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Mode: {groupingMode === 'skill' ? 'Skills' : 'Clients'}</div>
            <div>Range: {monthNames[monthRange.start]} - {monthNames[monthRange.end]}</div>
            <div>
              Filters: {isAllSkillsSelected ? 'All skills' : `${selectedSkills.length} skills`}, {' '}
              {isAllClientsSelected ? 'All clients' : `${selectedClients.length} clients`}, {' '}
              {isAllPreferredStaffSelected ? 'All staff' : `${selectedPreferredStaff.length} staff`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
