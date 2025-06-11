
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

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: string[];
  selectedClients: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (client: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  onPrintExport?: () => void; // NEW: Optional print/export handler
}

export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = ({
  isControlsExpanded,
  onToggleControls,
  selectedSkills,
  selectedClients,
  onSkillToggle,
  onClientToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  groupingMode,
  availableSkills,
  availableClients,
  onPrintExport // NEW: Print/export handler
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const isAllSkillsSelected = selectedSkills.length === 0 || selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = selectedClients.length === 0 || selectedClients.length === availableClients.length;

  const handleSkillSelectAll = () => {
    if (isAllSkillsSelected) {
      // If all are selected, deselect all (empty array means "all selected" in our logic)
      availableSkills.forEach(skill => onSkillToggle(skill));
    } else {
      // If not all are selected, select all remaining
      availableSkills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          onSkillToggle(skill);
        }
      });
    }
  };

  const handleClientSelectAll = () => {
    if (isAllClientsSelected) {
      // If all are selected, deselect all
      availableClients.forEach(client => onClientToggle(client.name));
    } else {
      // If not all are selected, select all remaining
      availableClients.forEach(client => {
        if (!selectedClients.includes(client.name)) {
          onClientToggle(client.name);
        }
      });
    }
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
              onClick={handleSkillSelectAll}
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
              onClick={handleClientSelectAll}
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

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* NEW: Print/Export Button */}
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
              {isAllClientsSelected ? 'All clients' : `${selectedClients.length} clients`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
